import { TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";
import { Dispatcher } from "../events/dispatcher.js";

type TikTokConnection = TikTokLiveConnection & {
  on(event: string, callback: (data: any) => void): void;
};

export interface TikTokServiceOptions {
  enableExtendedGiftInfo?: boolean;
  signApiKey?: string;
}

export class TikTokService {
  private connection?: TikTokConnection;
  private currentUsername: string | null = null;
  private isConnected = false;
  public onComment?: (username: string, text: string) => void;

  constructor(private readonly dispatcher: Dispatcher) {}

  public getStatus() {
    return {
      connected: this.isConnected,
      username: this.currentUsername,
    };
  }

  public disconnect() {
    if (this.connection) {
      try {
        this.connection.disconnect();
      } catch (err) {
        console.warn("Failed to disconnect TikTok connection:", err);
      }
    }
    this.isConnected = false;
    this.currentUsername = null;
  }

  async connect(username: string, options?: TikTokServiceOptions) {
    if (this.connection && this.isConnected) {
      this.disconnect();
    }

    const signApiKey =
      options?.signApiKey ??
      process.env.EULER_SIGN_API_KEY ??
      process.env.SIGN_API_KEY;

    // EulerStream signature service requires a Business plan for signing Webcast API requests.
    // enableExtendedGiftInfo triggers signed requests; default to false unless signApiKey is provided.
    const enableExtendedGiftInfo =
      options?.enableExtendedGiftInfo ?? Boolean(signApiKey);

    const connectionOptions: Record<string, any> = {
      enableExtendedGiftInfo,
    };

    if (signApiKey) {
      connectionOptions.signApiKey = signApiKey;
    }

    this.connection = new TikTokLiveConnection(
      username,
      connectionOptions,
    ) as TikTokConnection;

    this.connection.on(WebcastEvent.GIFT, (data: any) => {
      const giftType =
        data?.giftType ?? data?.gift_type ?? data?.gift?.type ?? 0;
      const isStreak = giftType === 1;
      const rawRepeatEnd =
        data?.repeatEnd ?? data?.repeat_end ?? data?.gift?.repeat_end;
      const isStreakEnd =
        rawRepeatEnd === true ||
        rawRepeatEnd === 1 ||
        rawRepeatEnd === "true" ||
        rawRepeatEnd === "1";

      // Bỏ qua các sự kiện trung gian trong chuỗi tặng quà (gift streak)
      if (isStreak && !isStreakEnd) {
        return;
      }

      const giftName = data?.gift?.name ?? data?.giftName ?? "";
      const rawCount =
        data?.repeatCount ??
        data?.repeat_count ??
        data?.comboCount ??
        data?.combo_count ??
        data?.groupCount ??
        data?.group_count ??
        data?.gift?.repeat_count ??
        data?.gift?.combo_count ??
        data?.gift?.count ??
        data?.count ??
        1;

      const count = Math.max(1, Number(rawCount));
      const username =
        data?.user?.uniqueId ??
        data?.user?.nickname ??
        data?.nickname ??
        "unknown";

      if (giftName) {
        void this.dispatcher.dispatch({
          type: "gift",
          giftName,
          count,
          username,
        });
      }
    });

    this.connection.on(WebcastEvent.LIKE, (data: any) => {
      const username =
        data?.user?.uniqueId ??
        data?.user?.nickname ??
        data?.nickname ??
        "unknown";
      const count = Number(data?.likeCount ?? data?.totalLikeCount ?? 1);

      if (count > 0) {
        void this.dispatcher.dispatch({ type: "like", count, username });
      }
    });

    this.connection.on(WebcastEvent.CHAT, (data: any) => {
      const username =
        data?.user?.uniqueId ??
        data?.user?.nickname ??
        data?.nickname ??
        "unknown";
      const commentText = String(data?.comment ?? data?.text ?? "").trim();

      if (commentText && this.onComment) {
        this.onComment(username, commentText);
      }
    });

    try {
      await this.connection.connect();
      this.isConnected = true;
      this.currentUsername = username;
      console.log(`TikTok connected to @${username}`);
    } catch (err) {
      this.isConnected = false;
      this.currentUsername = null;
      throw err;
    }
  }

  async fetchAvailableGifts() {
    if (!this.connection) {
      throw new Error("TikTok connection not initialized");
    }
    return this.connection.fetchAvailableGifts();
  }
}

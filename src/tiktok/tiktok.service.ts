import { TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";
import { Dispatcher } from "../events/dispatcher.js";

type TikTokConnection = TikTokLiveConnection & {
  on(event: string, callback: (data: any) => void): void;
};

export class TikTokService {
  private connection!: TikTokConnection;

  constructor(private readonly dispatcher: Dispatcher) {}

  async connect(username: string) {
    this.connection = new TikTokLiveConnection(
      username,
      {},
    ) as TikTokConnection;

    this.connection.on(WebcastEvent.GIFT, (data: any) => {
      const giftName = data?.gift?.name ?? data?.giftName ?? "";
      const count = Number(data?.gift?.count ?? data?.count ?? 1);
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

    this.connection.on(WebcastEvent.CHAT, (data: any) => {
      const username =
        data?.user?.uniqueId ??
        data?.user?.nickname ??
        data?.nickname ??
        "unknown";
      const count = Number(data?.likeCount ?? 1);

      if (count > 0) {
        void this.dispatcher.dispatch({ type: "like", count, username });
      }
    });

    await this.connection.connect();

    console.log("TikTok connected");
  }

  async fetchAvailableGifts() {
    return this.connection.fetchAvailableGifts();
  }
}

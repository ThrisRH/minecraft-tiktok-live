import { TikTokLiveConnection, WebcastEvent } from "tiktok-live-connector";

type TikTokConnection = TikTokLiveConnection & {
  on(event: string, callback: (data: any) => void): void;
};

export class TikTokService {
  private connection!: TikTokConnection;

  async connect(username: string) {
    this.connection = new TikTokLiveConnection(
      username,
      {},
    ) as TikTokConnection;

    this.connection.on(WebcastEvent.GIFT, (data: any) => {
      console.log("Gift:", data);
    });

    this.connection.on(WebcastEvent.CHAT, (data: any) => {
      console.log("Chat:", data);
    });

    await this.connection.connect();

    console.log("TikTok connected");
  }
}

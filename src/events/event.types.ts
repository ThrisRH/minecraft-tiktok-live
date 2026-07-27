export type GameEvent =
  | {
      type: "gift";
      giftName: string;
      count: number;
      username: string;
    }
  | {
      type: "like";
      count: number;
      username: string;
    };

export interface Gift {
  username: string;
  count: number;
}

export interface GiftEvent extends Gift {
  giftName?: string;
}

import { GameActionService } from "../game/game-action.service.js";
import { GameEvent, Gift } from "./event.types.js";
import {
  createGiftActionRegistry,
  normalizeGiftName,
} from "./gift-registry.js";

export class Dispatcher {
  private readonly giftActions: Map<string, (gift: Gift) => Promise<void>>;

  constructor(private game: GameActionService) {
    this.giftActions = createGiftActionRegistry(this.game);
  }

  getRegisteredGiftNames(): string[] {
    return Array.from(this.giftActions.keys()).filter(
      (name) => name !== "Default",
    );
  }

  async testAllGifts(options?: {
    count?: number;
    delayMs?: number;
    username?: string;
    onGiftStart?: (giftName: string, index: number, total: number) => void;
  }): Promise<void> {
    const giftNames = this.getRegisteredGiftNames();
    const count = options?.count ?? 1;
    const delayMs = options?.delayMs ?? 1000;
    const username = options?.username ?? "test-user";

    console.log(
      `🚀 Bắt đầu test lần lượt ${giftNames.length} quà có trong hệ thống...`,
    );

    for (let i = 0; i < giftNames.length; i++) {
      const giftName = giftNames[i];
      console.log(
        `[${i + 1}/${giftNames.length}] 🎁 Testing gift: ${giftName} (x${count})`,
      );
      if (options?.onGiftStart) {
        options.onGiftStart(giftName, i, giftNames.length);
      }

      await this.dispatch({
        type: "gift",
        giftName,
        count,
        username,
      });

      if (i < giftNames.length - 1 && delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    console.log("✅ Đã test xong toàn bộ danh sách quà trong hệ thống!");
  }

  async dispatch(event: GameEvent) {
    switch (event.type) {
      case "gift": {
        let action = this.giftActions.get(event.giftName);

        if (!action) {
          const normalizedInput = normalizeGiftName(event.giftName);
          const matchedKey = Array.from(this.giftActions.keys()).find(
            (key) => normalizeGiftName(key) === normalizedInput,
          );
          if (matchedKey) {
            action = this.giftActions.get(matchedKey);
          }
        }

        if (!action) {
          action = this.giftActions.get("Default");
        }

        if (action) {
          await action({
            username: event.username,
            count: event.count,
          });
        }

        break;
      }

      case "like":
        await this.game.like(event.count, event.username);
        break;
    }
  }
}

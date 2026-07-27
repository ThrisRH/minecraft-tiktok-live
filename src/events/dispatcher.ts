import { GameActionService } from "../game/game-action.service.js";
import { GameEvent, Gift } from "./event.types.js";
import { createGiftActionRegistry } from "./gift-registry.js";

export class Dispatcher {
  private readonly giftActions: Map<string, (gift: Gift) => Promise<void>>;

  constructor(private game: GameActionService) {
    this.giftActions = createGiftActionRegistry(this.game);
  }

  async dispatch(event: GameEvent) {
    switch (event.type) {
      case "gift": {
        const action =
          this.giftActions.get(event.giftName) ??
          this.giftActions.get("Default");

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

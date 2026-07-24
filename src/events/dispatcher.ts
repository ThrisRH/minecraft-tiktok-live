import { GameActionService } from "../game/game-action.service.js";
import { GameEvent, Gift } from "./event.types.js";

export class Dispatcher {
  constructor(private game: GameActionService) {}

  private giftActions = new Map<string, (gift: Gift) => Promise<void>>([
    ["Rose", (gift) => this.game.roseGift(gift)],
  ]);

  async dispatch(event: GameEvent) {
    switch (event.type) {
      case "gift": {
        const action = this.giftActions.get(event.giftName);

        if (action) {
          await action({
            username: event.username,
            count: event.count,
          });
        }

        break;
      }

      case "like":
        await this.game.like();
        break;
    }
  }
}

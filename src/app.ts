import { MinecraftService } from "./minecraft/minecraft.service.js";
import { Dispatcher } from "./events/dispatcher.js";
import { GameActionService } from "./game/game-action.service.js";

async function bootstrap() {
  const mc = new MinecraftService();

  try {
    await mc.connect();

    console.log("Connected to MC");

    const game = new GameActionService(mc);

    const dispatcher = new Dispatcher(game);

    await dispatcher.dispatch({
      type: "gift",
      giftName: "Rose",
      count: 10,
      username: "torilatoiday",
    });
  } catch (error) {
    console.error(error);
  } finally {
    await mc.disconnect();
  }
}

bootstrap();

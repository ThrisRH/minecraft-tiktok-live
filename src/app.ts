import { MinecraftService } from "./minecraft/minecraft.service.js";
import { Dispatcher } from "./events/dispatcher.js";
import { GameActionService } from "./game/game-action.service.js";
import { SandService } from "./game/sand.service.js";

async function bootstrap() {
  const mc = new MinecraftService();

  try {
    await mc.connect();

    console.log("Connected to MC");

    const game = new GameActionService(mc);

    // const dispatcher = new Dispatcher(game);

    const sand = new SandService(mc);

    // await sand.createSandTower(-560, 63, 259);

    await game.rosaGift({ username: "Ada", count: 2 });
  } catch (error) {
    console.error(error);
  } finally {
    await mc.disconnect();
  }
}

bootstrap();

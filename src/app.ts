import { MinecraftService } from "./minecraft/minecraft.service.js";
import { Dispatcher } from "./events/dispatcher.js";
import { GameActionService } from "./game/game-action.service.js";
import { SandService } from "./game/sand.service.js";

async function bootstrap() {
  const mc = new MinecraftService();

  try {
    await mc.connect();

    console.log("Connected to MC");

    const sand = new SandService(mc);
    const game = new GameActionService(mc, sand);

    // const dispatcher = new Dispatcher(game);

    await sand.createSandTower(-560, 63, 259);
    await game.startBackgroundCountdown(-560, 63, 259);
  } catch (error) {
    console.error(error);
  } finally {
    await mc.disconnect();
  }
}

bootstrap();

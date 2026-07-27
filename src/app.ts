import { MinecraftService } from "./minecraft/minecraft.service.js";
import { Dispatcher } from "./events/dispatcher.js";
import { GameActionService } from "./game/game-action.service.js";
import { SandService } from "./game/sand.service.js";
import { TikTokService } from "./tiktok/tiktok.service.js";

async function bootstrap() {
  const mc = new MinecraftService();

  try {
    await mc.connect();

    console.log("Connected to MC");

    const sand = new SandService(mc);
    const game = new GameActionService(mc, sand);
    const dispatcher = new Dispatcher(game);
    const tikTok = new TikTokService(dispatcher);

    await sand.createSandTower(-560, 63, 259);
    await game.startBackgroundCountdown(-560, 63, 259);

    const username = process.env.TIKTOK_USERNAME ?? process.argv[2];

    if (username) {
      await tikTok.connect(username);
    } else {
      console.log(
        "No TikTok username provided. Pass it as TIKTOK_USERNAME or as the first CLI argument.",
      );
    }
  } catch (error) {
    console.error(error);
  }
}

bootstrap();

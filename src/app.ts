import { MinecraftService } from "./minecraft/minecraft.service.js";
import { Dispatcher } from "./events/dispatcher.js";
import { GameActionService } from "./game/game-action.service.js";
import { TikTokService } from "./tiktok/tiktok.service.js";

async function bootstrap() {
  const mc = new MinecraftService();

  try {
    await mc.connect();

    console.log("Connected to MC");

    const game = new GameActionService(mc);
    const dispatcher = new Dispatcher(game);
    const tikTok = new TikTokService(dispatcher);

    const mode = process.argv[2];
    const giftName = process.argv[3];
    const count = Number(process.argv[4] ?? 1);
    const username = process.argv[5] ?? "local-test";

    if (mode === "gifts") {
      const username = process.env.TIKTOK_USERNAME ?? process.argv[3];

      if (!username) {
        throw new Error("TikTok username is required");
      }

      await tikTok.connect(username);

      const gifts = await tikTok.fetchAvailableGifts();

      console.table(
        gifts.map((g: any) => ({
          id: g.id,
          name: g.name,
          diamonds: g.diamond_count,
        })),
      );

      return;
    }

    if (mode === "gift") {
      await dispatcher.dispatch({
        type: "gift",
        giftName: giftName ?? "Heart",
        count,
        username,
      });
      return;
    }

    if (mode === "like") {
      await game.like(count, username);
      return;
    }

    const tikTokUsername = process.env.TIKTOK_USERNAME ?? process.argv[2];

    if (tikTokUsername) {
      await tikTok.connect(tikTokUsername);
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

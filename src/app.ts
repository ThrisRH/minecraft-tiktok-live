import dotenv from "dotenv";
dotenv.config();

import { exec } from "child_process";
import { MinecraftService } from "./minecraft/minecraft.service.js";
import { Dispatcher } from "./events/dispatcher.js";
import { GameActionService } from "./game/game-action.service.js";
import { TikTokService } from "./tiktok/tiktok.service.js";
import { ControlPanelServer } from "./server.js";

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

    // Desktop GUI / Web Control Panel Mode
    if (mode === "gui" || mode === "server" || !mode) {
      const port = Number(process.env.PORT ?? 3050);
      const server = new ControlPanelServer(dispatcher, game, port, tikTok);
      const url = await server.start();

      console.log(`\n==================================================`);
      console.log(`🖥️ DESKTOP CONTROL PANEL LIVE: ${url}`);
      console.log(`==================================================\n`);

      // Tự động mở trình duyệt trên Windows
      if (process.platform === "win32") {
        exec(`start ${url}`);
      } else if (process.platform === "darwin") {
        exec(`open ${url}`);
      } else {
        exec(`xdg-open ${url}`);
      }

      const tikTokUsername = process.env.TIKTOK_USERNAME;
      if (tikTokUsername) {
        console.log(`📱 Đang kết nối TikTok Live của: ${tikTokUsername}`);
        try {
          await tikTok.connect(tikTokUsername);
          server.addLog(
            "system",
            `✅ Tự động kết nối thành công TikTok Live của: @${tikTokUsername}`,
          );
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          server.addLog(
            "error",
            `❌ Lỗi tự động kết nối TikTok Live (@${tikTokUsername}): ${errMsg}`,
          );
        }
      }
      return;
    }

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

    if (mode === "sim-gacha") {
      console.log("⚡ Mô phỏng User1 và User2 tặng quà Gacha cùng lúc trong 1 process...");
      const p1 = dispatcher.dispatch({
        type: "gift",
        giftName: "Heart",
        count: 1,
        username: "User1",
      });
      const p2 = dispatcher.dispatch({
        type: "gift",
        giftName: "Shamrock",
        count: 1,
        username: "User2",
      });
      await Promise.all([p1, p2]);
      return;
    }

    if (mode === "sim-all" || mode === "test-all") {
      console.log("⚡ Mô phỏng lần lượt tất cả các gift có trong hệ thống...");
      const delayMs = Number(process.argv[4] ?? 1000);
      await dispatcher.testAllGifts({ count, delayMs, username });
      return;
    }

    if (mode === "sim-bulk") {
      console.log("⚡ Mô phỏng User1 tặng Rose x50 và User2 tặng TikTok x20 cùng lúc...");
      const p1 = dispatcher.dispatch({
        type: "gift",
        giftName: "Rose",
        count: 50,
        username: "Viewer1_Rose50",
      });
      const p2 = dispatcher.dispatch({
        type: "gift",
        giftName: "TikTok",
        count: 20,
        username: "Viewer2_TikTok20",
      });
      await Promise.all([p1, p2]);
      console.log("✅ Đã phát xong toàn bộ sự kiện quà bulk vào Minecraft!");
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
    }
  } catch (error) {
    console.error(error);
  }
}

bootstrap();

import dotenv from "dotenv";
dotenv.config();

import { MinecraftService } from "../src/minecraft/minecraft.service.js";
import { DefenseActionService } from "../src/gameplay/defense/index.js";

async function main() {
  const count = Number(process.argv[2] ?? 1);
  const username = process.argv[3] ?? "LiveTester";

  console.log(`🔌 Connecting to Minecraft RCON...`);
  const mc = new MinecraftService();

  try {
    await mc.connect();
    console.log(`✅ Connected to Minecraft successfully!`);

    const defense = new DefenseActionService(mc);
    console.log(`🌹 Sending gift: Rose x${count} for player '${username}'...`);

    await defense.handleGift({
      giftName: "Rose",
      count,
      username,
    });

    console.log(`🧟 Zombie(s) spawned in Minecraft at >= 50 blocks distance!`);
  } catch (error) {
    console.error(`❌ Failed to send command to Minecraft:`, error);
  } finally {
    await mc.disconnect();
  }
}

main();

import test from "node:test";
import assert from "node:assert/strict";
import { BossbarTimerService } from "../src/game/bossbar-timer.service.js";
import { MinecraftService } from "../src/minecraft/minecraft.service.js";

test("BossbarTimerService initializes bossbar and ticks down time", async () => {
  const commands: string[] = [];
  const minecraft = {
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const timerService = new BossbarTimerService(minecraft, 10);

  await timerService.start();

  assert.ok(commands.some((cmd) => cmd.includes("bossbar add minecraft:live_timer")));
  assert.ok(commands.some((cmd) => cmd.includes("bossbar set minecraft:live_timer max 10")));
  assert.ok(commands.some((cmd) => cmd.includes("00:00:10")));

  timerService.stop();
});

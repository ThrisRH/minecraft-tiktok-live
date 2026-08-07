import test from "node:test";
import assert from "node:assert/strict";
import { DefenseActionService } from "../src/gameplay/defense/defense-action.service.js";
import {
  getDefenseSpawnOffset,
  buildDefenseSummonCommand,
  DEFAULT_MIN_SPAWN_DISTANCE,
} from "../src/gameplay/defense/defense-config.js";

test("getDefenseSpawnOffset guarantees minimum spawn distance of 50 blocks", () => {
  for (let i = 0; i < 100; i++) {
    const { x, z } = getDefenseSpawnOffset(50);
    const dist = Math.hypot(x, z);
    assert.ok(
      dist >= 50,
      `Calculated spawn distance ${dist} must be >= 50 blocks (x: ${x}, z: ${z})`,
    );
  }
});

test("Rose gift spawns 1 zombie at distance >= 50 blocks", async () => {
  const commands: string[] = [];
  const mockMinecraft = {
    execute: async (cmd: string) => {
      commands.push(cmd);
      return undefined;
    },
    say: async (_msg: string) => undefined,
  } as any;

  const service = new DefenseActionService(mockMinecraft);

  await service.handleGift({
    giftName: "Rose",
    count: 1,
    username: "TestUser",
  });

  const summonCmds = commands.filter((c) => c.includes("summon zombie"));
  assert.equal(summonCmds.length, 1, "Should execute exactly 1 summon zombie command for Rose x1");

  const cmd = summonCmds[0];
  const match = cmd.match(/summon zombie ~(-?\d+) ~ ~(-?\d+)/);
  assert.ok(match, "Command should match relative spawn coordinates ~X ~ ~Z");

  const x = parseInt(match[1], 10);
  const z = parseInt(match[2], 10);
  const dist = Math.hypot(x, z);

  assert.ok(
    dist >= DEFAULT_MIN_SPAWN_DISTANCE,
    `Zombie spawn distance (${dist}) must be >= 50 blocks from player`,
  );
});

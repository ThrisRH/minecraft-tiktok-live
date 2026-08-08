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

  assert.ok(cmd.includes("HandItems:[{},{}]"), "Zombie must have empty hands");
  assert.ok(cmd.includes("leather_helmet"), "Zombie must wear a leather helmet");
  assert.ok(cmd.includes("Base:0.345f"), "Zombie speed must be 1.5x base speed (0.345)");
  assert.ok(cmd.includes("CanPickUpLoot:0b"), "Zombie must not pick up loot");
});

test("TikTok gift gives 10x 9mm ammo to player", async () => {
  const commands: string[] = [];
  const mockMinecraft = {
    execute: async (cmd: string) => {
      commands.push(cmd);
      return undefined;
    },
    say: async (_msg: string) => undefined,
  } as any;

  const service = new DefenseActionService(mockMinecraft);
  service.setTargetPlayerName("Thrisx0310");

  await service.handleGift({
    giftName: "TikTok",
    count: 1,
    username: "TestUser",
  });

  const ammoCmd = commands.find((c) => c.includes('give Thrisx0310 tacz:ammo{AmmoId:"tacz:9mm"} 10'));
  assert.ok(ammoCmd, "TikTok gift should give 10x 9mm ammo to Thrisx0310");
});

test("Overreact gift spawns Creeper at distance >= 50 blocks", async () => {
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
    giftName: "Overreact",
    count: 1,
    username: "TestUser",
  });

  const creeperCmds = commands.filter((c) => c.includes("summon creeper"));
  assert.equal(creeperCmds.length, 1, "Should execute 1 summon creeper command for Overreact");

  const cmd = creeperCmds[0];
  const match = cmd.match(/summon creeper ~(-?\d+) ~ ~(-?\d+)/);
  assert.ok(match, "Command should match relative spawn coordinates ~X ~ ~Z");

  const x = parseInt(match[1], 10);
  const z = parseInt(match[2], 10);
  const dist = Math.hypot(x, z);

  assert.ok(
    dist >= DEFAULT_MIN_SPAWN_DISTANCE,
    `Creeper spawn distance (${dist}) must be >= 50 blocks from player`,
  );
});

test("Perfume gift triggers Perfume Gacha options at distance >= 50 blocks", async () => {
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
    giftName: "Perfume",
    count: 1,
    username: "TestUser",
  });

  const spawnCmds = commands.filter(
    (cmd) => cmd.includes("summon ") || cmd.includes("summongroup "),
  );
  assert.ok(spawnCmds.length >= 1, "Should execute Gacha spawn command");

  const cmd = spawnCmds[spawnCmds.length - 1];
  const match = cmd.match(/~(-?\d+) ~ ~(-?\d+)/);
  assert.ok(match, "Command should match relative coordinates ~X ~ ~Z");

  const x = parseInt(match[1], 10);
  const z = parseInt(match[2], 10);
  const dist = Math.hypot(x, z);

  assert.ok(
    dist >= DEFAULT_MIN_SPAWN_DISTANCE,
    `Perfume Gacha spawn distance (${dist}) must be >= 50 blocks from player`,
  );
});

test("recordPlayerDeath tracks deaths, gives respawn kit when alive, and triggers base reset & mob kill on 5 deaths", async () => {
  const commands: string[] = [];
  const mockMinecraft = {
    execute: async (cmd: string) => {
      commands.push(cmd);
      if (cmd.includes("data get entity")) {
        return "Thrisx0310 has the following entity data: 20.0f";
      }
      return undefined;
    },
    say: async (_msg: string) => undefined,
  } as any;

  const service = new DefenseActionService(mockMinecraft);
  service.setTargetPlayerName("Thrisx0310");

  assert.equal(service.getTargetPlayerName(), "Thrisx0310");
  assert.equal(service.getPlayerDeaths(), 0);

  // 1st death for Thrisx0310
  await service.recordPlayerDeath("Thrisx0310");
  assert.equal(service.getPlayerDeaths(), 1);

  // Give small delay for async giveRespawnKitWhenAlive to run
  await new Promise((resolve) => setTimeout(resolve, 50));

  const kitCmds = commands.filter(
    (c) => c.includes("give Thrisx0310 tacz:modern_kinetic_gun") || c.includes("give Thrisx0310 lrtactical:melee"),
  );
  assert.equal(kitCmds.length, 2, "Should give Glock-17 and Dagger kit specifically to Thrisx0310 after respawn");

  // Record 4 more deaths (total 5)
  await service.recordPlayerDeath("Thrisx0310");
  await service.recordPlayerDeath("Thrisx0310");
  await service.recordPlayerDeath("Thrisx0310");
  await service.recordPlayerDeath("Thrisx0310");

  const placeBaseCmd = commands.find((c) => c.includes("place template minecraft:base 363 62 373"));
  assert.ok(placeBaseCmd, "Should execute place template minecraft:base 363 62 373 on 5th death");

  const mobKillCmd = commands.find((c) => c.includes("kill @e[type=!minecraft:player"));
  assert.ok(mobKillCmd, "Should execute mob kill command on 5th death");

  // Death count should reset back to 0
  assert.equal(service.getPlayerDeaths(), 0);
});

test("giveRespawnKitWhenAlive waits until isPlayerAlive is true before executing give commands", async () => {
  const commands: string[] = [];
  let isAlive = false;

  const mockMinecraft = {
    execute: async (cmd: string) => {
      commands.push(cmd);
      if (cmd.includes("data get entity Thrisx0310 Health")) {
        return isAlive ? "Thrisx0310 has the following entity data: 20.0f" : "Thrisx0310 has the following entity data: 0.0f";
      }
      return undefined;
    },
    say: async (_msg: string) => undefined,
  } as any;

  const service = new DefenseActionService(mockMinecraft);
  service.setTargetPlayerName("Thrisx0310");

  // Start waiting for respawn while dead (isAlive = false)
  void service.giveRespawnKitWhenAlive("Thrisx0310", 5000);
  await new Promise((r) => setTimeout(r, 100));

  let kitCmds = commands.filter((c) => c.includes("give Thrisx0310"));
  assert.equal(kitCmds.length, 0, "Should NOT give kit while player is still dead on death screen");

  // Player clicks Respawn in game (isAlive becomes true)
  isAlive = true;
  await new Promise((r) => setTimeout(r, 600));

  kitCmds = commands.filter((c) => c.includes("give Thrisx0310"));
  assert.equal(kitCmds.length, 2, "Should give Glock-17 and Dagger kit AFTER player respawns alive");
});

test("tickAmmoCountdown decrements countdown, updates Bossbar, and gives 9mm ammo every 10 seconds", async () => {
  const commands: string[] = [];
  const mockMinecraft = {
    execute: async (cmd: string) => {
      commands.push(cmd);
      if (cmd.includes("data get entity")) {
        return "Thrisx0310 has the following entity data: 20.0f";
      }
      return undefined;
    },
    say: async (_msg: string) => undefined,
  } as any;

  const service = new DefenseActionService(mockMinecraft);
  service.setTargetPlayerName("Thrisx0310");

  assert.equal(service.getAmmoCountdown(), 10);

  // Tick 9 times (countdown goes from 10 down to 1)
  for (let i = 0; i < 9; i++) {
    await service.tickAmmoCountdown();
  }
  assert.equal(service.getAmmoCountdown(), 1);

  // 10th tick (countdown hits 0 -> gives 9mm ammo & resets to 10)
  await service.tickAmmoCountdown();
  assert.equal(service.getAmmoCountdown(), 10, "Countdown should reset to 10 after 10th tick");

  const ammoGiveCmd = commands.find((c) => c.includes('give Thrisx0310 tacz:ammo{AmmoId:"tacz:9mm"} 1'));
  assert.ok(ammoGiveCmd, "Should give 9mm ammo to Thrisx0310 on 10s countdown expiry");

  const bossbarValCmd = commands.find((c) => c.includes("bossbar set ammo_countdown value"));
  assert.ok(bossbarValCmd, "Should update Bossbar value");
});

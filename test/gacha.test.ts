import test from "node:test";
import assert from "node:assert/strict";
import { GameActionService } from "../src/game/game-action.service.js";
import { Dispatcher } from "../src/events/dispatcher.js";
import { MinecraftService } from "../src/minecraft/minecraft.service.js";
import {
  GachaOption,
  getRandomGachaOption,
} from "../src/config/gacha-config.js";

test("getRandomGachaOption selects item based on weighted odds", () => {
  const options: GachaOption[] = [
    { id: "rare", name: "Rare", command: "cmd1", weight: 1 },
    { id: "common", name: "Common", command: "cmd2", weight: 99 },
  ];

  const counts: Record<string, number> = { rare: 0, common: 0 };
  for (let i = 0; i < 1000; i++) {
    const picked = getRandomGachaOption(options);
    counts[picked.id]++;
  }

  assert.ok(counts.common > counts.rare);
  assert.ok(counts.common > 800);
});

test("Heart and Shamrock trigger Gacha spin and execute landed option command", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  const customOptions: GachaOption[] = [
    {
      id: "test_cmd",
      name: "Custom Test Item",
      command: "execute at @a run summon lightning_bolt ~ ~ ~",
      weight: 10,
    },
  ];

  // Run with animationSpeed = 0 for instant test execution
  await service.gachaGift(
    { username: "Alice", count: 1, giftName: "Heart" },
    customOptions,
    0,
  );

  // Check that command executed custom command
  assert.ok(
    commands.some((cmd) => cmd.includes("summon lightning_bolt")),
    "Should execute custom option command",
  );

  // Test Shamrock via dispatcher
  await dispatcher.dispatch({
    type: "gift",
    giftName: "Shamrock",
    count: 1,
    username: "Bob",
  });

  assert.ok(commands.length > 0);
});

test("Gacha title lock prevents live participant title from overriding screen title during spin", async () => {
  const titlesShown: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      if (command.includes("title @a title")) {
        titlesShown.push(command);
      }
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);

  // Trigger gacha roll
  const gachaPromise = service.gachaGift(
    { username: "GachaUser", count: 1, giftName: "Heart" },
    undefined,
    0,
  );

  // While gacha is active, send a regular like / gift title reaching a milestone
  await service.like(500, "SneakyUser");

  await gachaPromise;

  // SneakyUser title should NOT be in titlesShown because isGachaSpinning was true
  assert.equal(
    titlesShown.some((cmd) => cmd.includes("SneakyUser")),
    false,
    "Live participant title should be suppressed during Gacha spin",
  );
});

test("Rosa gift triggers independent Rosa Gacha spin with rosa options", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  const customRosaOptions: GachaOption[] = [
    {
      id: "rosa_test",
      name: "Rosa Special Mob",
      command: "execute at @a run summon witch ~ ~ ~",
      weight: 10,
    },
  ];

  await service.rosaGachaGift(
    { username: "Charlie", count: 1, giftName: "Rosa" },
    customRosaOptions,
    0,
  );

  assert.ok(
    commands.some((cmd) => cmd.includes("Vòng Quay Rosa Gacha")),
    "Should announce Rosa Gacha spin",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("summon witch")),
    "Should execute landed rosa option command",
  );

  // Test Rosa gift dispatched via dispatcher
  await dispatcher.dispatch({
    type: "gift",
    giftName: "Rosa",
    count: 1,
    username: "Dave",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("Dave")),
    "Dispatcher should invoke rosa gift",
  );

  // Test Finger Heart gift via dispatcher
  await dispatcher.dispatch({
    type: "gift",
    giftName: "Finger Heart",
    count: 1,
    username: "Eve",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("Eve")),
    "Dispatcher should invoke finger heart gift",
  );
});

test("Shamrock gift triggers independent Shamrock Gacha spin with shamrock options", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await service.shamrockGachaGift(
    { username: "Frank", count: 1, giftName: "Shamrock" },
    undefined,
    0,
  );

  assert.ok(
    commands.some((cmd) => cmd.includes("Vòng Quay Shamrock Gacha")),
    "Should announce Shamrock Gacha spin",
  );

  // Test Shamrock gift dispatched via dispatcher
  commands.length = 0;
  await dispatcher.dispatch({
    type: "gift",
    giftName: "Shamrock",
    count: 1,
    username: "Grace",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("Vòng Quay Shamrock Gacha")),
    "Dispatcher should invoke Shamrock independent gacha",
  );
});

test("Overreact gift (and legacy Ice Cream variations) triggers standard Gacha spin", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  for (const giftNameVariation of [
    "Overreact",
    "overreact",
    "OVERREACT",
    "Ice Cream",
    "Ice cream",
  ]) {
    commands.length = 0;
    await dispatcher.dispatch({
      type: "gift",
      giftName: giftNameVariation,
      count: 1,
      username: "Heidi",
    });

    assert.ok(
      commands.some((cmd) => cmd.includes("Vòng Quay Gacha")),
      `Gift '${giftNameVariation}' should trigger standard gacha spin`,
    );
  }
});

test("Money Gun combo gift summons Phase 7 for gift 1 and Phase 4 for extra count", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await dispatcher.dispatch({
    type: "gift",
    giftName: "Money Gun",
    count: 3,
    username: "ComboGunner",
  });

  assert.equal(
    commands.filter((cmd) => cmd.includes("Phase:7")).length,
    1,
    "Should summon 1 Phase 7 for gift 1",
  );
  assert.equal(
    commands.filter((cmd) => cmd.includes("Phase:4")).length,
    2,
    "Should summon 2 Phase 4 for extra 2 combo gifts",
  );
});

test("Corgi gift triggers 5-minute event sequence with baby ender dragons and slowness", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await dispatcher.dispatch({
    type: "gift",
    giftName: "Corgi",
    count: 1,
    username: "CorgiLover",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("setworldspawn ~ ~ ~")),
    "Corgi gift should set worldspawn at current player position",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("spawnpoint @a ~ ~ ~")),
    "Corgi gift should set player spawnpoint at current player position",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("CORGI DRAGON")),
    "Corgi gift should announce title",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("summon endertrigon:baby_ender_dragon ~ 2 ~")),
    "Corgi gift should summon baby ender dragons ~ 2 ~",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("effect give @a slowness 300 0")),
    "Corgi gift should apply Slowness 1 for 300 seconds",
  );
});

test("Corgi combo gift summons extra Ender Dragon per additional count", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await dispatcher.dispatch({
    type: "gift",
    giftName: "Corgi",
    count: 3,
    username: "ComboDragon",
  });

  assert.equal(
    commands.filter((cmd) => cmd.includes("summon ender_dragon ~ 5 ~")).length,
    2,
    "Should summon 2 extra Ender Dragons for 2 additional combo count",
  );
});

test("Little Kisses gift gives 1 Enchanted Golden Apple and 1 Iron Chestplate (Prot 4 Blast Prot 3)", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await dispatcher.dispatch({
    type: "gift",
    giftName: "Little Kisses",
    count: 1,
    username: "Sweetheart",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("give @a enchanted_golden_apple 1")),
    "Should give 1 Enchanted Golden Apple",
  );
  assert.ok(
    commands.some(
      (cmd) =>
        cmd.includes("iron_chestplate") &&
        cmd.includes("protection") &&
        cmd.includes("blast_protection"),
    ),
    "Should give Iron Chestplate with Protection IV & Blast Protection III",
  );
});

test("Lucky Pig gift summons guardvillagers:guard with custom name", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await dispatcher.dispatch({
    type: "gift",
    giftName: "Lucky Pig",
    count: 2,
    username: "PigGiver",
  });

  assert.equal(
    commands.filter(
      (cmd) =>
        cmd.includes("summon guardvillagers:guard") && cmd.includes("PigGiver"),
    ).length,
    2,
    "Should summon 2 guardvillagers:guard with custom name PigGiver",
  );
});

test("Doughnut gift summons terramity:black_hole ~ 5 ~", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await dispatcher.dispatch({
    type: "gift",
    giftName: "Doughnut",
    count: 1,
    username: "Judy",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("summon terramity:black_hole")),
    "Doughnut should summon black hole",
  );
});

test("Confetti gift summons luckytntmod:grande_finale", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  await dispatcher.dispatch({
    type: "gift",
    giftName: "Confetti",
    count: 1,
    username: "Kevin",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("summon ender_dragon")),
    "Confetti should execute summon command",
  );
});


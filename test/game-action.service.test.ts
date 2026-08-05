import test from "node:test";
import assert from "node:assert/strict";
import { GameActionService } from "../src/game/game-action.service.js";
import { Dispatcher } from "../src/events/dispatcher.js";
import { MinecraftService } from "../src/minecraft/minecraft.service.js";

test("summons guardvillagers:guard and shows title/chat per 500-like per-user milestone", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);

  await service.like(499, "User1");
  assert.equal(
    commands.filter((command) => command.includes("summon guardvillagers:guard")).length,
    0,
  );
  assert.equal(
    commands.length,
    0,
    "No chat or title commands should be executed before hitting 500-like milestone",
  );

  await service.like(1, "User1");
  assert.equal(
    commands.filter((command) => command.includes("summon guardvillagers:guard")).length,
    1,
  );
  assert.ok(
    commands.some((command) => command.includes("tellraw")),
    "Chat message should be sent on hitting 500 milestone",
  );
  assert.ok(
    commands.some((command) => command.includes("User1")),
    "Participant name should be displayed on hitting 500 milestone",
  );

  commands.length = 0;
  await service.like(500, "User2");
  assert.equal(
    commands.filter((command) => command.includes("summon guardvillagers:guard")).length,
    1,
  );
  assert.ok(
    commands.some((command) => command.includes("User2")),
    "User2 should independently trigger 500-like milestone guard",
  );
});

test("spawns rose gift zombies and triggers rosa gacha", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);

  await service.roseGift({ username: "Ada", count: 2 });
  await service.rosaGift({ username: "Grace", count: 1 }, undefined, 0);

  assert.equal(
    commands.filter((command) => command.includes("summon zombie")).length,
    2,
  );
  assert.ok(
    commands.some((command) => command.includes("Vòng Quay Rosa Gacha")),
    "Rosa gift should trigger Rosa Gacha",
  );
});

test("dispatches supported gifts from the documented list", async () => {
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
    giftName: "Heart",
    count: 1,
    username: "Ada",
  });

  assert.equal(
    commands.filter((command) => command.includes("tellraw")).length,
    2,
  );
});

test("continues spawning after a transient execute failure", async () => {
  const commands: string[] = [];
  let attempt = 0;
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      attempt += 1;
      if (attempt === 2) {
        throw new Error("transient failure");
      }
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);

  await service.roseGift({ username: "Ada", count: 2 });

  assert.equal(commands.length, 3);
});

test("routes perfume gift to its dedicated handler and executes trapped sequence", async () => {
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
    giftName: "Perfume",
    count: 1,
    username: "Ada",
  });

  const bedrockPillars = commands.filter((cmd) =>
    cmd.includes("fill") && cmd.includes("bedrock") && !cmd.includes("air replace"),
  );
  assert.equal(bedrockPillars.length, 4, "Should build 4 bedrock pillars");

  const tntSummon = commands.filter((cmd) => cmd.includes("summon luckytntmod:gravity_tnt"));
  assert.equal(tntSummon.length, 1, "Should summon gravity_tnt");

  const clearBedrock = commands.filter((cmd) => cmd.includes("fill") && cmd.includes("air replace bedrock"));
  assert.equal(clearBedrock.length, 1, "Should clear bedrock pillars after 1s");
});

test("executes give item commands with exact item counts for instant and tap combos", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  // Finger Heart x50 instant/tap combo
  await dispatcher.dispatch({
    type: "gift",
    giftName: "Finger Heart",
    count: 50,
    username: "ComboUser",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("give @a golden_apple 50")),
    "Finger Heart x50 should give 50 golden apples",
  );

  // GG x20 instant/tap combo
  commands.length = 0;
  await dispatcher.dispatch({
    type: "gift",
    giftName: "GG",
    count: 20,
    username: "ComboUser",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("give @a bread 20")),
    "GG x20 should give 20 bread",
  );

  // Journey Pass x5 instant/tap combo
  commands.length = 0;
  await dispatcher.dispatch({
    type: "gift",
    giftName: "Journey Pass",
    count: 5,
    username: "ComboUser",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("give @a leather_helmet 5")),
    "Journey Pass x5 should give 5 leather helmets",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("give @a leather_chestplate 5")),
    "Journey Pass x5 should give 5 leather chestplates",
  );
});

test("finishes a round with countdown and reset", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  let resetCalls = 0;
  const sandService = {
    reset: async () => {
      resetCalls += 1;
    },
  };

  const service = new GameActionService(minecraft, sandService as never);

  await service.startRound(-560, 63, 259);

  for (let i = 0; i < 64; i++) {
    await service.handleSandMined();
  }

  assert.equal(resetCalls, 1);
  assert.equal(
    commands.filter((command) => command.includes("title @a title")).length,
    6,
  );
});

test("spawns exactly 50 zombies when receiving a bulk Rose x50 gift event", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);

  await service.roseGift({ username: "BulkTester", count: 50 });

  const zombieSpawns = commands.filter((command) =>
    command.includes("summon zombie"),
  );
  assert.equal(zombieSpawns.length, 50);
});

test("testAllGifts dispatches all registered gifts sequentially", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);
  const dispatcher = new Dispatcher(service);

  const testedGifts: string[] = [];
  await dispatcher.testAllGifts({
    count: 1,
    delayMs: 0,
    username: "TestRunner",
    onGiftStart: (giftName) => testedGifts.push(giftName),
  });

  const registeredGifts = dispatcher.getRegisteredGiftNames();
  assert.equal(testedGifts.length, registeredGifts.length);
  assert.deepEqual(testedGifts, registeredGifts);
  assert.ok(commands.length > 0, "Commands should have been executed during testAllGifts");
});


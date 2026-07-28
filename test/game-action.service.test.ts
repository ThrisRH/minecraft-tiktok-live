import test from "node:test";
import assert from "node:assert/strict";
import { GameActionService } from "../src/game/game-action.service.js";
import { Dispatcher } from "../src/events/dispatcher.js";
import { MinecraftService } from "../src/minecraft/minecraft.service.js";

test("spawns zombies once per 50-like milestone", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);

  await service.like(49);
  assert.equal(
    commands.filter((command) => command.includes("summon zombie")).length,
    0,
  );

  await service.like(1);
  assert.equal(
    commands.filter((command) => command.includes("summon zombie")).length,
    1,
  );

  await service.like(50);
  assert.equal(
    commands.filter((command) => command.includes("summon zombie")).length,
    2,
  );
});

test("spawns a rose and armored zombie gift events", async () => {
  const commands: string[] = [];
  const minecraft = {
    say: async (_message: string) => undefined,
    execute: async (command: string) => {
      commands.push(command);
    },
  } as unknown as MinecraftService;

  const service = new GameActionService(minecraft);

  await service.roseGift({ username: "Ada", count: 2 });
  await service.rosaGift({ username: "Grace", count: 1 });

  assert.equal(
    commands.filter((command) => command.includes("summon zombie")).length,
    7,
  );
  assert.equal(
    commands.filter(
      (command) =>
        command.includes("summon zombie") && command.includes("iron_helmet"),
    ).length,
    5,
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

test("routes perfume gift to its dedicated handler", async () => {
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

  assert.equal(
    commands.filter((command) => command.includes("summon pillager")).length,
    2,
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

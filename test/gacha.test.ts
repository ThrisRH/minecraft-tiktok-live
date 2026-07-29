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

  // While gacha is active, send a regular like / gift title
  await service.like(1, "SneakyUser");

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

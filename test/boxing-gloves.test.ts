import test from "node:test";
import assert from "node:assert/strict";
import { BoxingGlovesEvent } from "../src/game/events/boxing-gloves-event.js";
import { GameActionService } from "../src/game/game-action.service.js";
import { Dispatcher } from "../src/events/dispatcher.js";
import { MinecraftService } from "../src/minecraft/minecraft.service.js";

test("BoxingGlovesEvent triggers 5-min ĐÁY BIỂN SÂU event, locates ocean, teleports, applies effects, and cleans up on stop", async () => {
  const commands: string[] = [];
  const context = {
    execute: async (command: string) => {
      commands.push(command);
      if (command.includes("locate biome")) {
        return "The nearest #minecraft:is_ocean is at [2500, ~, -1800] (1200 blocks away)";
      }
      return undefined;
    },
    sendMessage: async (_text: string) => {},
    showLiveParticipant: async (_username: string, _giftName?: string, _count?: number) => {},
  };

  const event = new BoxingGlovesEvent(context, 300);

  // Trigger Boxing Gloves gift x1
  await event.trigger({ username: "Diver", count: 1 });

  assert.equal(event.isRunning(), true, "Boxing Gloves event should be running");
  assert.equal(event.getRemainingSeconds(), 300, "Initial remaining seconds should be 300");

  assert.ok(
    commands.some((cmd) => cmd.includes("ĐÁY BIỂN SÂU ĐÃ XUẤT HIỆN")),
    "Should announce ĐÁY BIỂN SÂU start",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("tp @a 2500 62 -1800")),
    "Should teleport player to located ocean coordinates",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("effect give @a minecraft:blindness")),
    "Should apply blindness effect",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("effect give @a minecraft:water_breathing")),
    "Should apply water breathing effect",
  );

  // Trigger combo x1
  commands.length = 0;
  await event.trigger({ username: "Diver", count: 1 });
  assert.equal(event.getRemainingSeconds(), 600, "Remaining seconds should increase by 300 (total 600)");

  // Stop event
  commands.length = 0;
  await event.stop();
  assert.equal(event.isRunning(), false, "Boxing Gloves event should be stopped");
  assert.ok(
    commands.some((cmd) => cmd.includes("effect clear @a minecraft:blindness")),
    "Should clear blindness effect on stop",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("effect clear @a minecraft:water_breathing")),
    "Should clear water breathing effect on stop",
  );
});

test("Dispatcher routes Boxing Gloves gift event to BoxingGlovesEvent", async () => {
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
    giftName: "Boxing Gloves",
    count: 1,
    username: "OceanBoxer",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("ĐÁY BIỂN SÂU")),
    "Dispatcher should trigger ĐÁY BIỂN SÂU event",
  );
});

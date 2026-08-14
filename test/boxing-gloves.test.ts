import test from "node:test";
import assert from "node:assert/strict";
import { BoxingGlovesEvent } from "../src/game/events/boxing-gloves-event.js";
import { GameActionService } from "../src/game/game-action.service.js";
import { Dispatcher } from "../src/events/dispatcher.js";
import { MinecraftService } from "../src/minecraft/minecraft.service.js";

test("BoxingGlovesEvent triggers 5-min ĐÁY BIỂN SÂU event, waits 5s in water to summon Leviathan, handles eerie sound, respawn, combos, and cleanup", async () => {
  const commands: string[] = [];
  let simulatedHp = "20.0f";
  let simulatedBlock = "minecraft:air";
  let simulatedLeviathanAlive = true;

  const context = {
    execute: async (command: string) => {
      commands.push(command);
      if (command.includes("locate biome minecraft:deep_ocean")) {
        return "The nearest minecraft:deep_ocean is at [3200, ~, -2400] (1500 blocks away)";
      }
      if (command.includes("data get entity @p Health")) {
        return simulatedHp;
      }
      if (command.includes("execute if block ~ ~ ~ minecraft:water")) {
        return simulatedBlock.includes("water") ? "in_water" : "";
      }
      if (command.includes("execute if entity @e[type=cataclysm:the_leviathan")) {
        return simulatedLeviathanAlive ? "Test passed" : "Test failed";
      }
      return undefined;
    },
    sendMessage: async (_text: string) => {},
    showLiveParticipant: async (_username: string, _giftName?: string, _count?: number) => {},
  };

  const event = new BoxingGlovesEvent(context, 180);

  // 1. Trigger Confetti gift x1
  await event.trigger({ username: "Diver", count: 1 });

  assert.equal(event.isRunning(), true, "Boxing Gloves event should be running");
  assert.ok(
    commands.some((cmd) => cmd.includes("tp @a 3200 42 -2400")),
    "Should teleport player 20 blocks underwater (Y=42)",
  );
  assert.equal(
    commands.some((cmd) => cmd.includes("effect give @a minecraft:blindness")),
    false,
    "Should NOT apply blindness effect",
  );
  assert.equal(
    commands.some((cmd) => cmd.includes("cataclysm:the_leviathan")),
    false,
    "Should NOT summon Leviathan immediately on start",
  );

  // 2. Simulate 5 ticks in water
  simulatedBlock = "minecraft:water";
  for (let i = 0; i < 5; i++) {
    // @ts-expect-error accessing protected onTick for test
    await event.onTick(300 - i, i);
  }

  assert.ok(
    commands.some((cmd) => cmd.includes("summon cataclysm:the_leviathan")),
    "Should summon cataclysm:the_leviathan after 5s in water",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("THỦY QUÁI ĐÃ TỚI")),
    "Should announce THỦY QUÁI ĐÃ TỚI title",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("elder_guardian.curse")),
    "Should play eerie sound",
  );

  // 3. Test Leviathan death and respawn (advance ticks for cooldown to expire)
  commands.length = 0;
  simulatedLeviathanAlive = false;
  for (let i = 0; i < 11; i++) {
    // @ts-expect-error accessing protected onTick for test
    await event.onTick(290 - i, 10 + i);
  }

  assert.ok(
    commands.some((cmd) => cmd.includes("summon cataclysm:the_leviathan")),
    "Should respawn Leviathan if killed",
  );

  // 4. Test combo (+2 Baby Leviathans per combo count)
  commands.length = 0;
  await event.trigger({ username: "Diver", count: 1 });
  assert.ok(
    commands.some((cmd) => cmd.includes("cataclysm:the_baby_leviathan")),
    "Combo gift should summon 2x Baby Leviathan",
  );

  // 5. Stop event
  commands.length = 0;
  await event.stop();
  assert.equal(event.isRunning(), false, "Boxing Gloves event should be stopped");
  assert.ok(
    commands.some((cmd) => cmd.includes("kill @e[type=cataclysm:the_leviathan,tag=boxing_gloves_boss]")),
    "Should kill Leviathan on stop",
  );
  assert.ok(
    commands.some((cmd) => cmd.includes("kill @e[type=cataclysm:the_baby_leviathan,tag=boxing_gloves_minion]")),
    "Should kill Baby Leviathans on stop",
  );
});

test("Dispatcher routes Confetti gift event to BoxingGlovesEvent", async () => {
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
    username: "OceanBoxer",
  });

  assert.ok(
    commands.some((cmd) => cmd.includes("ĐÁY BIỂN SÂU")),
    "Dispatcher should trigger ĐÁY BIỂN SÂU event for Confetti",
  );
});

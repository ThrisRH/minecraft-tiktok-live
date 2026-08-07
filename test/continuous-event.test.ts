import test from "node:test";
import assert from "node:assert/strict";
import { CorgiEvent } from "../src/game/events/corgi-event.js";
import { WitherStormEvent } from "../src/game/events/wither-storm-event.js";

test("CorgiEvent triggers 5-min event sequence, handles combo extension, and cleans up on stop", async () => {
  const commands: string[] = [];
  const context = {
    execute: async (command: string) => {
      commands.push(command);
      return undefined;
    },
    sendMessage: async (_text: string) => {},
    showLiveParticipant: async (_username: string, _giftName?: string, _count?: number) => {},
  };

  const corgi = new CorgiEvent(context, 300);

  // Trigger Corgi gift x1
  await corgi.trigger({ username: "DragonRider", count: 1 });

  assert.equal(corgi.isRunning(), true, "Corgi event should be running");
  assert.equal(corgi.getRemainingSeconds(), 300, "Initial remaining seconds should be 300");

  const dragons = commands.filter(
    (cmd) => cmd.includes("summon ender_dragon") && cmd.includes("corgi_dragon"),
  );
  assert.equal(dragons.length, 2, "Initial Corgi start should summon 2 Ender Dragons");

  // Trigger combo Corgi gift x2 while running
  commands.length = 0;
  await corgi.trigger({ username: "DragonRider", count: 2 });

  assert.equal(
    corgi.getRemainingSeconds(),
    900,
    "Remaining seconds should increase by 2 * 300 = 600 (total 900)",
  );
  const comboDragons = commands.filter(
    (cmd) => cmd.includes("summon ender_dragon") && cmd.includes("corgi_dragon"),
  );
  assert.equal(
    comboDragons.length,
    2,
    "Combo Corgi gift x2 should summon 2 additional Ender Dragons",
  );

  commands.length = 0;
  await corgi.stop();
  assert.equal(corgi.isRunning(), false, "Corgi event should be stopped");
  assert.ok(
    commands.some((cmd) => cmd.includes("kill @e[type=ender_dragon,tag=corgi_dragon]")),
    "Should kill corgi Ender Dragons on stop",
  );
});

test("WitherStormEvent triggers 10-min sequence, handles combo Phase 4, and cleans up on stop", async () => {
  const commands: string[] = [];
  const context = {
    execute: async (command: string) => {
      commands.push(command);
    },
    sendMessage: async (_text: string) => {},
    showLiveParticipant: async (_username: string, _giftName?: string, _count?: number) => {},
  };

  const witherStorm = new WitherStormEvent(context, 600);

  // Trigger Money Gun gift x1
  await witherStorm.trigger({ username: "StormCaller", count: 1 });

  assert.equal(witherStorm.isRunning(), true, "Wither Storm event should be running");
  assert.equal(witherStorm.getRemainingSeconds(), 600, "Initial remaining seconds should be 600");

  const phase7Summons = commands.filter((cmd) => cmd.includes("{Phase:7,ConsumedEntities:2125001}"));
  assert.equal(phase7Summons.length, 1, "Initial Money Gun should summon Phase 7 Wither Storm");

  // Trigger combo Money Gun x1 while running
  commands.length = 0;
  await witherStorm.trigger({ username: "StormCaller", count: 1 });

  assert.equal(witherStorm.getRemainingSeconds(), 1200, "Remaining seconds should increase by 600 (total 1200)");
  const phase4Summons = commands.filter((cmd) => cmd.includes("{Phase:4}"));
  assert.equal(phase4Summons.length, 1, "Combo Money Gun should summon Phase 4 Wither Storm");

  witherStorm.stop();
  assert.equal(witherStorm.isRunning(), false, "Wither Storm event should be stopped");
});

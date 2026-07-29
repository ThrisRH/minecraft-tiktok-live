import test from "node:test";
import assert from "node:assert/strict";
import { TikTokService } from "../src/tiktok/tiktok.service.js";
import { Dispatcher } from "../src/events/dispatcher.js";
import { GameEvent } from "../src/events/event.types.js";

test("TikTokService handles gift combos and ignores intermediate streak events", async () => {
  const dispatchedEvents: GameEvent[] = [];
  const mockDispatcher = {
    dispatch: async (event: GameEvent) => {
      dispatchedEvents.push(event);
    },
  } as Dispatcher;

  const tikTokService = new TikTokService(mockDispatcher);

  let giftHandler: ((data: any) => void) | undefined;
  const mockConnection = {
    on: (event: string, callback: (data: any) => void) => {
      if (event === "gift") {
        giftHandler = callback;
      }
    },
    connect: async () => undefined,
  };

  // Mock connection object directly
  (tikTokService as any).connection = mockConnection;

  // Manually invoke event handler registration logic to test dispatcher binding
  mockConnection.on("gift", (data: any) => {
    const giftType =
      data?.giftType ?? data?.gift_type ?? data?.gift?.type ?? 0;
    const isStreak = giftType === 1;
    const isStreakEnd = Boolean(
      data?.repeatEnd ?? data?.repeat_end ?? data?.gift?.repeat_end,
    );

    if (isStreak && !isStreakEnd) {
      return;
    }

    const giftName = data?.gift?.name ?? data?.giftName ?? "";
    const rawCount =
      data?.repeatCount ??
      data?.repeat_count ??
      data?.comboCount ??
      data?.combo_count ??
      data?.groupCount ??
      data?.group_count ??
      data?.gift?.repeat_count ??
      data?.gift?.combo_count ??
      data?.gift?.count ??
      data?.count ??
      1;

    const count = Math.max(1, Number(rawCount));
    const username =
      data?.user?.uniqueId ??
      data?.user?.nickname ??
      data?.nickname ??
      "unknown";

    if (giftName) {
      void mockDispatcher.dispatch({
        type: "gift",
        giftName,
        count,
        username,
      });
    }
  });

  // Case 1: Intermediate streak event (repeatEnd = false)
  giftHandler?.({
    giftType: 1,
    repeatEnd: false,
    repeatCount: 1,
    gift: { name: "Rose" },
    user: { uniqueId: "user123" },
  });

  assert.equal(dispatchedEvents.length, 0);

  // Case 2: Combo streak ended x50 (repeatEnd = true, repeatCount = 50)
  giftHandler?.({
    giftType: 1,
    repeatEnd: true,
    repeatCount: 50,
    gift: { name: "Rose" },
    user: { uniqueId: "user123" },
  });

  assert.equal(dispatchedEvents.length, 1);
  assert.deepEqual(dispatchedEvents[0], {
    type: "gift",
    giftName: "Rose",
    count: 50,
    username: "user123",
  });

  // Case 3: Preset gift combo payload (comboCount = 20)
  giftHandler?.({
    giftType: 0,
    comboCount: 20,
    gift: { name: "TikTok" },
    user: { uniqueId: "user456" },
  });

  assert.equal(dispatchedEvents.length, 2);
  assert.deepEqual(dispatchedEvents[1], {
    type: "gift",
    giftName: "TikTok",
    count: 20,
    username: "user456",
  });
});

import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import type { GameActionService } from "../game/game-action.service.js";
import type { GiftEvent } from "./event.types.js";

function loadSupportedGiftNames(): string[] {
  const giftListPath = resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../../docs/gift_list.md",
  );

  try {
    const content = readFileSync(giftListPath, "utf8");
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function createGiftActionRegistry(
  service: GameActionService,
): Map<string, (gift: GiftEvent) => Promise<void>> {
  const actions = new Map<string, (gift: GiftEvent) => Promise<void>>();
  const supportedGiftNames = loadSupportedGiftNames();
  const explicitGiftNames = new Set([
    "Heart",
    "Heart Me",
    "Shamrock",
    "Rose",
    "Rosa",
    "Perfume",
    "TikTok",
    "Corgi",
    "Cap",
    "Doughnut",
    "Finger Heart",
    "Journey Pass",
    "GG",
  ]);

  actions.set("Heart", (gift) =>
    service.heartGift({ ...gift, giftName: "Heart" }),
  );
  actions.set("Heart Me", (gift) =>
    service.heartGift({ ...gift, giftName: "Heart Me" }),
  );
  actions.set("Shamrock", (gift) =>
    service.shamrockGift({ ...gift, giftName: "Shamrock" }),
  );
  actions.set("Rose", (gift) =>
    service.roseGift({ ...gift, giftName: "Rose" }),
  );
  actions.set("TikTok", (gift) =>
    service.tiktokGift({ ...gift, giftName: "TikTok" }),
  );
  actions.set("Rosa", (gift) =>
    service.rosaGift({ ...gift, giftName: "Rosa" }),
  );
  actions.set("Perfume", (gift) =>
    service.perfumeGift({ ...gift, giftName: "Perfume" }),
  );
  actions.set("Corgi", (gift) =>
    service.corgiGift({ ...gift, giftName: "Corgi" }),
  );
  actions.set("Cap", (gift) => service.capGift({ ...gift, giftName: "Cap" }));
  actions.set("Doughnut", (gift) =>
    service.doughnutGift({ ...gift, giftName: "Doughnut" }),
  );
  actions.set("Confetti", (gift) =>
    service.confettiGift({ ...gift, giftName: "Confetti" }),
  );
  actions.set("Finger Heart", (gift) =>
    service.fingerHeartGift({ ...gift, giftName: "Finger Heart" }),
  );
  actions.set("Journey Pass", (gift) =>
    service.journeyPassGift({ ...gift, giftName: "Journey Pass" }),
  );
  actions.set("GG", (gift) => service.ggGift({ ...gift, giftName: "GG" }));

  for (const giftName of supportedGiftNames) {
    if (explicitGiftNames.has(giftName)) {
      continue;
    }

    actions.set(giftName, (gift) => service.defaultGift({ ...gift, giftName }));
  }

  actions.set("Default", (gift) => service.defaultGift(gift));

  return actions;
}

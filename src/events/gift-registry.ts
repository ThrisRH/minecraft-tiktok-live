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

  actions.set("Rose", (gift) =>
    service.roseGift({ ...gift, giftName: "Rose" }),
  );
  actions.set("Rosa", (gift) =>
    service.rosaGift({ ...gift, giftName: "Rosa" }),
  );

  for (const giftName of supportedGiftNames) {
    if (giftName === "Rose" || giftName === "Rosa") {
      continue;
    }

    actions.set(giftName, (gift) => service.defaultGift({ ...gift, giftName }));
  }

  actions.set("Default", (gift) => service.defaultGift(gift));

  return actions;
}

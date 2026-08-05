import { GiftEvent } from "../events/event.types.js";
import { CorgiEvent } from "./events/corgi-event.js";
import { WitherStormEvent } from "./events/wither-storm-event.js";

export interface GiftActionContext {
  execute(command: string): Promise<unknown>;
  sendMessage(text: string): Promise<void>;
  showLiveParticipant(
    username: string,
    giftName?: string,
    count?: number,
  ): Promise<void>;
  gachaGift?(gift: GiftEvent): Promise<void>;
  rosaGachaGift?(gift: GiftEvent): Promise<void>;
  shamrockGachaGift?(gift: GiftEvent): Promise<void>;
}

export class GiftActionService {
  private readonly corgiEvent: CorgiEvent;
  private readonly witherStormEvent: WitherStormEvent;

  constructor(private readonly context: GiftActionContext) {
    this.corgiEvent = new CorgiEvent(this.context);
    this.witherStormEvent = new WitherStormEvent(this.context);
  }

  async defaultGift(gift: GiftEvent) {
    await this.context.sendMessage(
      `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "gift",
      gift.count,
    );
  }

  async handleGiftEffect(
    gift: GiftEvent,
    giftName: string,
    command: string,
    amount = 1,
    option?: string,
    skipPayload = false,
  ) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} ${giftName}!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? giftName,
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const total = gift.count * amount;
    const delayMs = 500;

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const taggedCommand = this.buildTaggedCommand(
      command,
      safeName,
      option,
      skipPayload,
    );

    for (let i = 0; i < total; i++) {
      await this.executeWithRetry(taggedCommand);
      if (i < total - 1) {
        await this.delay(delayMs);
      }
    }
  }

  private async executeWithRetry(command: string, attempt = 0): Promise<void> {
    const maxAttempts = 3;

    try {
      await this.context.execute(command);
      return;
    } catch (error) {
      const nextAttempt = attempt + 1;
      if (nextAttempt >= maxAttempts) {
        console.warn(
          `Gift command failed after ${maxAttempts} attempts:`,
          error,
        );
        return;
      }

      console.warn(
        `Gift command failed, retrying (${nextAttempt}/${maxAttempts}):`,
        error,
      );
      await this.delay(1000 * nextAttempt);
      return this.executeWithRetry(command, nextAttempt);
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildTaggedCommand(
    command: string,
    username: string,
    option?: string,
    skipPayload = false,
  ) {
    const hasCoordinates = command.includes("~");
    const baseCommand = hasCoordinates ? command : `${command} ~ ~ ~`;

    if (skipPayload) {
      return `execute at @a run ${baseCommand}`;
    }

    const safeName = username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const customNameTag = `CustomName:'{"text":"${safeName}"}'`;
    const payload = option
      ? option.startsWith("{")
        ? `{${customNameTag},${option.slice(1, -1)}}`
        : `{${customNameTag},${option}}`
      : `{${customNameTag}}`;

    return `execute at @a run ${baseCommand} ${payload}`;
  }

  async heartGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      return this.context.gachaGift({ ...gift, giftName: "Heart" });
    }
    return this.defaultGift(gift);
  }

  // rose zombie thuong
  async roseGift(gift: GiftEvent) {
    const command = "summon zombie" as const;
    await this.handleGiftEffect(gift, "Rose", command, 1);
  }

  // tiktok creeper
  async tiktokGift(gift: GiftEvent) {
    const command = "summon creeper" as const;
    await this.handleGiftEffect(gift, "TikTok", command);
  }

  // rosa Gacha độc lập
  async rosaGift(gift: GiftEvent) {
    if (this.context.rosaGachaGift) {
      return this.context.rosaGachaGift({ ...gift, giftName: "Rosa" });
    }
    return this.defaultGift(gift);
  }

  // perfume: 4 cột bedrock 5 block nhốt người chơi + summon gravity_tnt, sau 1s xóa bedrock
  async perfumeGift(gift: GiftEvent) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} Perfume!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? "Perfume",
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const count = Math.max(1, gift.count ?? 1);

    for (let i = 0; i < count; i++) {
      await this.executeWithRetry(
        "execute at @a run fill ~1 ~ ~ ~1 ~4 ~ bedrock",
      );
      await this.executeWithRetry(
        "execute at @a run fill ~-1 ~ ~ ~-1 ~4 ~ bedrock",
      );
      await this.executeWithRetry(
        "execute at @a run fill ~ ~ ~1 ~ ~4 ~1 bedrock",
      );
      await this.executeWithRetry(
        "execute at @a run fill ~ ~ ~-1 ~ ~4 ~-1 bedrock",
      );

      await this.delay(2000);

      await this.executeWithRetry(
        "execute at @a run summon luckytntmod:gravity_tnt ~ ~ ~",
      );

      await this.delay(1000);

      await this.executeWithRetry(
        "execute at @a run fill ~-1 ~ ~-1 ~1 ~4 ~1 air replace bedrock",
      );

      if (i < count - 1) {
        await this.delay(500);
      }
    }
  }

  async handleGiveItemEffect(
    gift: GiftEvent,
    giftName: string,
    items: string | string[],
  ) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} ${giftName}!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? giftName,
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const itemList = Array.isArray(items) ? items : [items];
    const count = Math.max(1, gift.count ?? 1);

    for (const item of itemList) {
      const command = `execute at @a run give @a ${item} ${count}`;
      await this.executeWithRetry(command);
    }
  }

  // Finger Heart -> táo
  async fingerHeartGift(gift: GiftEvent) {
    await this.handleGiveItemEffect(gift, "Finger Heart", "golden_apple");
  }

  // Journey Pass -> Give người chơi full giáp da
  async journeyPassGift(gift: GiftEvent) {
    const armorItems = [
      "leather_helmet",
      "leather_chestplate",
      "leather_leggings",
      "leather_boots",
    ];
    await this.handleGiveItemEffect(gift, "Journey Pass", armorItems);
  }

  // GG -> Bánh mì
  async ggGift(gift: GiftEvent) {
    await this.handleGiveItemEffect(gift, "GG", "bread");
  }

  // Little Kisses -> Táo vàng phù phép + Áo sắt (Protection IV + Blast Protection III)
  async littleKissesGift(gift: GiftEvent) {
    const items = [
      "enchanted_golden_apple",
      'iron_chestplate{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:blast_protection",lvl:3s}]}',
    ];
    await this.handleGiveItemEffect(gift, "Little Kisses", items);
  }

  // Lucky Pig -> Summon guardvillagers:guard với tên username đã donate
  async luckyPigGift(gift: GiftEvent) {
    try {
      await this.context.sendMessage(`${gift.username} đã gửi tiếp viện!`);
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? "Lucky Pig",
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');
    const command = `execute at @a run summon guardvillagers:guard ~ ~ ~ {CustomName:'{"text":"${safeName}"}',HandItems:[{id:"minecraft:iron_sword",Count:1b},{id:"minecraft:shield",Count:1b}],ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}]}`;
    const count = Math.max(1, gift.count ?? 1);

    for (let i = 0; i < count; i++) {
      await this.executeWithRetry(command);
    }
  }

  // cap warden
  async capGift(gift: GiftEvent) {
    const command = "summon warden" as const;
    await this.handleGiftEffect(gift, "Cap", command);
  }

  async shamrockGift(gift: GiftEvent) {
    if (this.context.shamrockGachaGift) {
      return this.context.shamrockGachaGift({ ...gift, giftName: "Shamrock" });
    }
    return this.defaultGift(gift);
  }

  async overreactGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      return this.context.gachaGift({ ...gift, giftName: gift.giftName ?? "Overreact" });
    }
    return this.defaultGift(gift);
  }

  async iceCreamGift(gift: GiftEvent) {
    return this.overreactGift({ ...gift, giftName: gift.giftName ?? "Ice Cream" });
  }

  // Continuous event: Money Gun (Wither Storm 10-minute sequence)
  async moneyGunGift(gift: GiftEvent) {
    return this.witherStormEvent.trigger(gift);
  }

  // Continuous event: Corgi (Corgi Dragon 5-minute sequence)
  async corgiGift(gift: GiftEvent) {
    return this.corgiEvent.trigger(gift);
  }

  // Doughnut black hole
  async doughnutGift(gift: GiftEvent) {
    const command = "summon terramity:black_hole ~ ~ ~" as const;
    await this.handleGiftEffect(gift, "Doughnut", command, 1, undefined, true);
  }

  // Confetti grande_finale
  async confettiGift(gift: GiftEvent) {
    const command = "summon ender_dragon" as const;
    await this.handleGiftEffect(gift, "Confetti", command, 1, undefined, true);
  }
}

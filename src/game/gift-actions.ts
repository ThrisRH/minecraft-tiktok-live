import { GiftEvent } from "../events/event.types.js";

interface GiftActionContext {
  execute(command: string): Promise<unknown>;
  sendMessage(text: string): Promise<void>;
  showLiveParticipant(username: string): Promise<void>;
  gachaGift?(gift: GiftEvent): Promise<void>;
  rosaGachaGift?(gift: GiftEvent): Promise<void>;
}

export class GiftActionService {
  constructor(private readonly context: GiftActionContext) {}

  async defaultGift(gift: GiftEvent) {
    await this.context.sendMessage(
      `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
    );
    await this.context.showLiveParticipant(
      `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
    );
  }

  async handleGiftEffect(
    gift: GiftEvent,
    giftName: string,
    command: string,
    amount = 1,
    option?: string,
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
        `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const total = gift.count * amount;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const taggedCommand = this.buildTaggedCommand(command, safeName, option);

    // Delay cố định 500ms giữa mỗi con mob theo yêu cầu
    const delayMs = 500;

    for (let i = 0; i < total; i++) {
      await this.executeWithRetry(taggedCommand);
      if (i < total - 1) {
        await sleep(delayMs);
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
  ) {
    const safeName = username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const customNameTag = `CustomName:'{"text":"${safeName}"}'`;
    const payload = option
      ? `{${customNameTag},${option.slice(1, -1)}}`
      : `{${customNameTag}}`;

    return `execute at @a run ${command} ~ ~ ~ ${payload}`;
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

  // perfume 5 Pillager
  async perfumeGift(gift: GiftEvent) {
    const command = "summon luckytntmod:gravity_tnt" as const;

    await this.handleGiftEffect(gift, "Perfume", command);
  }

  // Finger Heart -> táo
  async fingerHeartGift(gift: GiftEvent) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} Finger Heart!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const item = "golden_apple";

    await this.context.execute(`execute at @a run give @a ${item}`);
  }

  // Journey Pass -> Give người chơi full giáp da
  async journeyPassGift(gift: GiftEvent) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} Journey Pass!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const armorItems = [
      "leather_helmet",
      "leather_chestplate",
      "leather_leggings",
      "leather_boots",
    ];

    for (let i = 0; i < gift.count; i++) {
      for (const item of armorItems) {
        await this.context.execute(`execute at @a run give @a ${item}`);
      }
    }
  }

  // GG -> Pháo hoa ăn mừng
  async ggGift(gift: GiftEvent) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} GG!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const item = "bread";

    await this.context.execute(`execute at @a run give @a ${item}`);
  }

  // cap warden
  async capGift(gift: GiftEvent) {
    const command = "summon warden" as const;

    await this.handleGiftEffect(gift, "Cap", command);
  }

  async shamrockGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      return this.context.gachaGift({ ...gift, giftName: "Shamrock" });
    }
    return this.defaultGift(gift);
  }

  // Doughnut phobos
  async doughnutGift(gift: GiftEvent) {
    const command = "summon luckytntmod:meteor_dynamite" as const;

    await this.handleGiftEffect(gift, "Doughnut", command);
  }

  // corgi phobos
  async corgiGift(gift: GiftEvent) {
    const command = "summon luckytntmod:phobos" as const;

    await this.handleGiftEffect(gift, "Corgi", command);
  }

  // Confetti grande_finale
  async confettiGift(gift: GiftEvent) {
    const command = "summon ender_dragon" as const;

    await this.handleGiftEffect(gift, "Confetti", command);
  }
}

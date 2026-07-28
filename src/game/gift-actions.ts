import { GiftEvent } from "../events/event.types.js";

interface GiftActionContext {
  execute(command: string): Promise<unknown>;
  sendMessage(text: string): Promise<void>;
  showLiveParticipant(username: string): Promise<void>;
  gachaGift?(gift: GiftEvent): Promise<void>;
}

export class GiftActionService {
  constructor(private readonly context: GiftActionContext) {}

  async defaultGift(gift: GiftEvent) {
    await this.context.sendMessage(
      `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
    );
    await this.context.showLiveParticipant(gift.username);
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
      await this.context.showLiveParticipant(gift.username);
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const total = gift.count * amount;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const taggedCommand = this.buildTaggedCommand(command, safeName, option);

    for (let i = 0; i < total; i++) {
      await this.executeWithRetry(taggedCommand);
      await sleep(500);
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

  // rosa zombie giáp 5 con
  async rosaGift(gift: GiftEvent) {
    const command = "summon zombie" as const;
    const option =
      '{ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}]}' as const;

    await this.handleGiftEffect(gift, "Rosa", command, 5, option);
  }

  // perfum 2 Pillager
  async perfumeGift(gift: GiftEvent) {
    const command = "summon pillager" as const;

    const option =
      Math.random() < 0.5
        ? "{HandItems:[{id:'minecraft:iron_axe',Count:1b},{}]}"
        : "{HandItems:[{id:'minecraft:crossbow',Count:1b},{}]}";

    await this.handleGiftEffect(gift, "Perfume", command, 5, option);
  }

  // cap wither
  async capGift(gift: GiftEvent) {
    const command = "summon wither" as const;

    await this.handleGiftEffect(gift, "Cap", command);
  }

  async shamrockGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      return this.context.gachaGift({ ...gift, giftName: "Shamrock" });
    }
    return this.defaultGift(gift);
  }

  // Doughnut ravager
  async doughnutGift(gift: GiftEvent) {
    const command = "summon ravager" as const;

    await this.handleGiftEffect(gift, "Doughnut", command);
  }

  // corgi phobos
  async corgiGift(gift: GiftEvent) {
    const command = "summon luckytntmod:phobos" as const;

    await this.handleGiftEffect(gift, "Corgi", command);
  }

  // Confetti grande_finale
  async confettiGift(gift: GiftEvent) {
    const command = "summon luckytntmod:compact_tnt" as const;

    await this.handleGiftEffect(gift, "Confetti", command);
  }
}

import { GiftEvent } from "../events/event.types.js";

interface GiftActionContext {
  execute(command: string): Promise<unknown>;
  sendMessage(text: string): Promise<void>;
  showLiveParticipant(username: string): Promise<void>;
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
    await this.context.sendMessage(
      `${gift.username} đã gửi x${gift.count} ${giftName}!`,
    );
    await this.context.showLiveParticipant(gift.username);

    const total = gift.count * amount;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const baseCommand = option
      ? `execute at @a run ${command} ~ ~ ~ ${option}`
      : `execute at @a run ${command} ~ ~ ~`;

    console.log(baseCommand);
    for (let i = 0; i < total; i++) {
      await this.context.execute(baseCommand);
      await sleep(500);
    }
  }

  async heartGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  // rose zombie thuong
  async roseGift(gift: GiftEvent) {
    const command = "summon zombie" as const;
    const option =
      '{ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}]}' as const;

    await this.handleGiftEffect(gift, "Rose", command, 1, option);
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

  // perfum sấm sét
  async perfumeGift(gift: GiftEvent) {
    const command = "summon lightning_bolt" as const;

    await this.handleGiftEffect(gift, "Perfume", command);
  }

  // cap wither
  async capGift(gift: GiftEvent) {
    const command = "summon wither" as const;

    await this.handleGiftEffect(gift, "Cap", command);
  }

  async shamrockGift(gift: GiftEvent) {
    const command = "summon creeper" as const;

    await this.handleGiftEffect(gift, "TikTok", command);
  }

  // Doughnut ravager
  async doughnutGift(gift: GiftEvent) {
    const command = "summon ravager" as const;

    await this.handleGiftEffect(gift, "Doughnut", command);
  }

  // corgi tnt rain
  async corgiGift(gift: GiftEvent) {
    const command = "summon luckytntmod:tnt_rain" as const;

    await this.handleGiftEffect(gift, "Corgi", command);
  }
}

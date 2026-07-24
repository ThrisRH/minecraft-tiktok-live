import { Gift } from "../events/event.types.js";
import { MinecraftService } from "../minecraft/minecraft.service.js";

interface GiftEvent extends Gift {
  giftName?: string;
}

export class GameActionService {
  private totalLikes = 0;
  private lastProcessedMilestone = 0;

  constructor(private readonly minecraft: MinecraftService) {}

  async roseGift(gift: GiftEvent) {
    if (gift.giftName === "Rosa") {
      await this.rosaGift(gift);
      return;
    }

    await this.minecraft.say(`${gift.username} đã gửi x${gift.count} Rose!`);
    const total = gift.count * 5;

    for (let i = 0; i < total; i++) {
      await this.minecraft.execute(
        'execute at @a run summon zombie ~ ~ ~ {ArmorItems:[{},{},{},{id:"minecraft:iron_helmet",Count:1b}]}',
      );
    }
  }

  async rosaGift(gift: GiftEvent) {
    await this.minecraft.say(`${gift.username} đã gửi x${gift.count} Rosa!`);

    const command =
      'execute at @a run summon zombie ~ ~ ~ {ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}]}';

    for (let i = 0; i < 3; i++) {
      await this.minecraft.execute(command);
    }
  }

  async like(count = 1) {
    this.totalLikes += count;

    const previousMilestone = Math.floor(this.lastProcessedMilestone / 50);
    const currentMilestone = Math.floor(this.totalLikes / 50);

    await this.minecraft.say("👍 Có người vừa Like!");

    for (
      let milestone = previousMilestone + 1;
      milestone <= currentMilestone;
      milestone++
    ) {
      await this.summonZombie();
      this.lastProcessedMilestone = milestone * 50;
    }
  }

  private async summonZombie() {
    if (typeof this.minecraft.summonZombie === "function") {
      await this.minecraft.summonZombie();
      return;
    }

    await this.minecraft.execute("execute at @a run summon zombie ~ ~ ~");
  }
}

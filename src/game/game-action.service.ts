import { Gift } from "../events/event.types.js";
import { MinecraftService } from "../minecraft/minecraft.service.js";

export class GameActionService {
  constructor(private readonly minecraft: MinecraftService) {}

  async roseGift(gift: Gift) {
    await this.minecraft.say(`${gift.username} đã gửi x${gift.count} Rose!`);

    for (let i = 0; i < gift.count; i++) {
      await this.minecraft.summonZombie();
    }

    await this.minecraft.summonZombie();
  }

  async like() {
    await this.minecraft.say("👍 Có người vừa Like!");
  }
}

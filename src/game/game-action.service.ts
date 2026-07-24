import { Gift } from "../events/event.types.js";
import { MinecraftService } from "../minecraft/minecraft.service.js";
import { SandService } from "./sand.service.js";

interface GiftEvent extends Gift {
  giftName?: string;
}

export class GameActionService {
  private totalLikes = 0;
  private lastProcessedMilestone = 0;
  private remainingSand = 0;
  private isRoundFinished = false;
  private roundPosition: { x: number; y: number; z: number } | null = null;

  constructor(
    private readonly minecraft: MinecraftService,
    private readonly sandService?: SandService,
  ) {}

  async roseGift(gift: GiftEvent) {
    if (gift.giftName === "Rosa") {
      await this.rosaGift(gift);
      return;
    }

    await this.minecraft.say(`${gift.username} đã gửi x${gift.count} Rose!`);
    await this.showLiveParticipant(gift.username);
    await this.minecraft.execute(
      "execute at @a run summon tnt ~ ~ ~ {Fuse:20}",
    );
  }

  async rosaGift(gift: GiftEvent) {
    await this.minecraft.say(`${gift.username} đã gửi x${gift.count} Rosa!`);
    await this.showLiveParticipant(gift.username);

    const command =
      'execute at @a run summon zombie ~ ~ ~ {ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}]}';

    for (let i = 0; i < 3; i++) {
      await this.minecraft.execute(command);
    }
  }

  async startRound(x: number, y: number, z: number) {
    this.roundPosition = { x, y, z };
    this.remainingSand = 64;
    this.isRoundFinished = false;
    this.totalLikes = 0;
    this.lastProcessedMilestone = 0;
  }

  async startBackgroundCountdown(x: number, y: number, z: number) {
    await this.startRound(x, y, z);

    for (let countdown = 10; countdown >= 0; countdown--) {
      if (countdown === 5) {
        await this.playCountdownSound();
        await this.showTitle(String(countdown));
        await this.handleSandMined(true);
        return;
      }

      if (countdown > 0) {
        await this.playCountdownSound();
        await this.showTitle(String(countdown));
        await this.delay(1000);
      }
    }
  }

  async handleSandMined(forceFinish = false) {
    if (this.isRoundFinished) {
      return;
    }

    if (!forceFinish) {
      this.remainingSand -= 1;

      if (this.remainingSand > 0) {
        return;
      }
    }

    this.isRoundFinished = true;

    for (let countdown = 5; countdown >= 1; countdown--) {
      await this.playCountdownSound();
      await this.showTitle(String(countdown));
      await this.delay(1000);
    }

    await this.showTitle("GO!");
    await this.delay(1000);

    if (this.sandService && this.roundPosition) {
      await this.sandService.reset(
        this.roundPosition.x,
        this.roundPosition.y,
        this.roundPosition.z,
      );
    }

    this.remainingSand = 0;
    this.totalLikes = 0;
    this.lastProcessedMilestone = 0;
  }

  async like(count = 1, username?: string) {
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

    if (username) {
      await this.showLiveParticipant(username);
    }
  }

  private async showTitle(text: string) {
    const safeText = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await this.minecraft.execute(
      `title @a title {"text":"${safeText}","color":"gold","bold":true}`,
    );
  }

  private async playCountdownSound() {
    await this.minecraft.execute(
      "playsound block.note_block.pling master @a ~ ~ ~ 1 1 1",
    );
  }

  private async showLiveParticipant(username: string) {
    const safeName = username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await this.minecraft.execute(
      `title @a title {"text":"${safeName}","color":"aqua","bold":true}`,
    );
  }

  private async summonZombie() {
    if (typeof this.minecraft.summonZombie === "function") {
      await this.minecraft.summonZombie();
      return;
    }

    await this.minecraft.execute("execute at @a run summon zombie ~ ~ ~");
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

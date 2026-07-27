import { GiftEvent } from "../events/event.types.js";
import { MinecraftService } from "../minecraft/minecraft.service.js";
import { SandService } from "./sand.service.js";

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

    await this.sendMessage(`${gift.username} đã gửi x${gift.count} Rose!`);
    await this.showLiveParticipant(gift.username);
    const command =
      'execute at @a run summon zombie ~ ~ ~ {ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}]}';

    for (let i = 0; i < gift.count; i++) {
      await this.minecraft.execute(command);
    }
  }

  async rosaGift(gift: GiftEvent) {
    await this.sendMessage(`${gift.username} đã gửi x${gift.count} Rosa!`);
    await this.showLiveParticipant(gift.username);

    await this.minecraft.execute("execute at @a run summon tnt ~ ~ ~ {Fuse:5}");
  }

  async defaultGift(gift: GiftEvent) {
    await this.sendMessage(
      `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
    );
    await this.showLiveParticipant(gift.username);
  }

  async micX10Gift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async heartGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async zombieGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async creeperGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async tikTokGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async ironGolemGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async lightningGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async perfumeGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async luckyBoxGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async capGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async batGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async ggCoinGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async cageGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async sunflowerGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async cakeGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async foxGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async steveGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async boxingGlovesGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async sandBlockGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async tntGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async iceGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async paintingsGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async origamiBirdGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async wolfGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async ggGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async bombGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async meatGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async goldenAppleGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async chipsGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async endPortalGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async fishGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async ironGolemStatueGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async strawHatGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async rifleGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async loveGlassesGift(gift: GiftEvent) {
    return this.defaultGift(gift);
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

    await this.sendMessage("👍 Có người vừa Like!");

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

  private async sendMessage(text: string) {
    const safeText = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await this.minecraft.execute(
      `tellraw @a {"text":"[Bề trên] ","color":"gold","bold":true,"extra":[{"text":"${safeText}","color":"white"}]}`,
    );
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

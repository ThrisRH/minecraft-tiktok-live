import { GiftEvent } from "../events/event.types.js";
import { MinecraftService } from "../minecraft/minecraft.service.js";
import { GiftActionService } from "./gift-actions.js";
import { SandService } from "./sand.service.js";

export class GameActionService {
  private totalLikes = 0;
  private lastProcessedMilestone = 0;
  private remainingSand = 0;
  private isRoundFinished = false;
  private roundPosition: { x: number; y: number; z: number } | null = null;
  private readonly giftActions: GiftActionService;

  constructor(
    private readonly minecraft: MinecraftService,
    private readonly sandService?: SandService,
  ) {
    this.giftActions = new GiftActionService({
      execute: (command: string) => this.minecraft.execute(command),
      sendMessage: (text: string) => this.sendMessage(text),
      showLiveParticipant: (username: string) =>
        this.showLiveParticipant(username),
    });
  }

  async defaultGift(gift: GiftEvent) {
    return this.giftActions.defaultGift(gift);
  }

  async heartGift(gift: GiftEvent) {
    return this.giftActions.heartGift(gift);
  }

  async roseGift(gift: GiftEvent) {
    return this.giftActions.roseGift(gift);
  }
  async tiktokGift(gift: GiftEvent) {
    return this.giftActions.tiktokGift(gift);
  }

  async rosaGift(gift: GiftEvent) {
    return this.giftActions.rosaGift(gift);
  }
  async perfumeGift(gift: GiftEvent) {
    return this.giftActions.perfumeGift(gift);
  }
  async corgiGift(gift: GiftEvent) {
    return this.giftActions.corgiGift(gift);
  }
  async capGift(gift: GiftEvent) {
    return this.giftActions.capGift(gift);
  }
  async doughnutGift(gift: GiftEvent) {
    return this.giftActions.doughnutGift(gift);
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

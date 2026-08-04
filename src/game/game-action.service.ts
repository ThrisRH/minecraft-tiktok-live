import { GiftEvent } from "../events/event.types.js";
import { MinecraftService } from "../minecraft/minecraft.service.js";
import { GiftActionService } from "./gift-actions.js";
import { SandService } from "./sand.service.js";
import {
  defaultGachaOptions,
  rosaGachaOptions,
  shamrockGachaOptions,
  GachaOption,
  getRandomGachaOption,
} from "../config/gacha-config.js";
import { sessionService } from "../db/session.service.js";

export class GameActionService {
  private totalLikes = 0;
  private lastProcessedMilestone = 0;
  private remainingSand = 0;
  private isRoundFinished = false;
  private roundPosition: { x: number; y: number; z: number } | null = null;
  private readonly giftActions: GiftActionService;

  private isGachaSpinning = false;
  private gachaQueue: Array<() => Promise<void>> = [];
  private isProcessingGachaQueue = false;

  private moneyGunRemainingSeconds = 0;
  private moneyGunTimerId?: NodeJS.Timeout;

  constructor(
    private readonly minecraft: MinecraftService,
    private readonly sandService?: SandService,
  ) {
    this.giftActions = new GiftActionService({
      execute: (command: string) => this.minecraft.execute(command),
      sendMessage: (text: string) => this.sendMessage(text),
      showLiveParticipant: (
        username: string,
        giftName?: string,
        count?: number,
      ) => this.showLiveParticipant(username, giftName, count),
      gachaGift: (gift: GiftEvent) => this.gachaGift(gift),
      rosaGachaGift: (gift: GiftEvent) => this.rosaGachaGift(gift),
      shamrockGachaGift: (gift: GiftEvent) => this.shamrockGachaGift(gift),
      moneyGunGift: (gift: GiftEvent) => this.moneyGunGift(gift),
    });
  }

  async defaultGift(gift: GiftEvent) {
    return this.giftActions.defaultGift(gift);
  }

  async heartGift(gift: GiftEvent) {
    return this.giftActions.heartGift(gift);
  }

  async shamrockGift(gift: GiftEvent) {
    return this.giftActions.shamrockGift(gift);
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
  async iceCreamGift(gift: GiftEvent) {
    return this.giftActions.iceCreamGift(gift);
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
  async confettiGift(gift: GiftEvent) {
    return this.giftActions.confettiGift(gift);
  }
  async fingerHeartGift(gift: GiftEvent) {
    return this.giftActions.fingerHeartGift(gift);
  }
  async journeyPassGift(gift: GiftEvent) {
    return this.giftActions.journeyPassGift(gift);
  }
  async ggGift(gift: GiftEvent) {
    return this.giftActions.ggGift(gift);
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

    if (currentMilestone > previousMilestone) {
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

  private async showLiveParticipant(
    username: string,
    giftName?: string,
    count?: number,
  ) {
    if (this.isGachaSpinning) {
      return;
    }
    const safeName = username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await this.minecraft.execute(
      `title @a title {"text":"${safeName}","color":"aqua","bold":true}`,
    );

    if (giftName) {
      const safeGift = giftName.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const giftText = count && count > 1 ? `x${count} ${safeGift}` : safeGift;
      await this.minecraft.execute(
        `title @a subtitle [{"text":"đã gửi ","color":"white"},{"text":"${giftText}","color":"yellow","bold":true}]`,
      );
    }
  }

  async gachaGift(
    gift: GiftEvent,
    customOptions?: GachaOption[],
    animationSpeed = 1,
  ) {
    const options = customOptions ?? defaultGachaOptions;

    return new Promise<void>((resolve, reject) => {
      this.gachaQueue.push(async () => {
        try {
          await this.executeGachaRolls(
            gift,
            options,
            animationSpeed,
            "🎲",
            "Vòng Quay Gacha",
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      void this.processGachaQueue();
    });
  }

  async rosaGachaGift(
    gift: GiftEvent,
    customOptions?: GachaOption[],
    animationSpeed = 1,
  ) {
    const options = customOptions ?? rosaGachaOptions;

    return new Promise<void>((resolve, reject) => {
      this.gachaQueue.push(async () => {
        try {
          await this.executeGachaRolls(
            gift,
            options,
            animationSpeed,
            "🌹",
            "Vòng Quay Rosa Gacha",
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      void this.processGachaQueue();
    });
  }

  async shamrockGachaGift(
    gift: GiftEvent,
    customOptions?: GachaOption[],
    animationSpeed = 1,
  ) {
    const options = customOptions ?? shamrockGachaOptions;

    return new Promise<void>((resolve, reject) => {
      this.gachaQueue.push(async () => {
        try {
          await this.executeGachaRolls(
            gift,
            options,
            animationSpeed,
            "☘️",
            "Vòng Quay Shamrock Gacha",
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      void this.processGachaQueue();
    });
  }

  async moneyGunGift(gift: GiftEvent, durationSeconds = 600) {
    try {
      await this.sendMessage(
        `${gift.username} đã gửi x${gift.count} Money Gun!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.showLiveParticipant(gift.username, "Money Gun", gift.count);
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await this.minecraft.execute(
      `title @a title {"text":"☠️ WITHER STORM ĐÃ XUẤT HIỆN! ☠️","color":"dark_red","bold":true}`,
    );
    await this.minecraft.execute(
      `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 10:00","color":"gold"}`,
    );
    await this.minecraft.execute(
      "playsound entity.wither.spawn master @a ~ ~ ~ 1 1 1",
    );

    const count = Math.max(1, gift.count ?? 1);
    for (let i = 0; i < count; i++) {
      await this.minecraft.execute(
        "execute at @a run summon witherstormmod:wither_storm ~ ~ ~ {Phase:7,ConsumedEntities:2125001}",
      );
    }

    this.startMoneyGunCountdown(durationSeconds);
  }

  private startMoneyGunCountdown(durationSeconds = 600) {
    this.moneyGunRemainingSeconds = durationSeconds;

    if (this.moneyGunTimerId) {
      return;
    }

    const tick = async () => {
      this.moneyGunRemainingSeconds -= 1;

      if (this.moneyGunRemainingSeconds <= 0) {
        if (this.moneyGunTimerId) {
          clearInterval(this.moneyGunTimerId);
          this.moneyGunTimerId = undefined;
        }

        try {
          await this.minecraft.execute(
            "execute at @a run kill @e[type=witherstormmod:wither_storm]",
          );
          await this.minecraft.execute(
            `title @a title {"text":"✨ WITHER STORM ĐÃ TAN BIẾN! ✨","color":"green","bold":true}`,
          );
          await this.minecraft.execute(
            "playsound entity.wither.death master @a ~ ~ ~ 1 1 1",
          );
          await this.minecraft.execute(
            `title @a actionbar {"text":"✨ WITHER STORM ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
          );
        } catch (error) {
          console.warn("Failed to finalize Money Gun countdown:", error);
        }
        return;
      }

      const remaining = this.moneyGunRemainingSeconds;
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const mm = String(minutes).padStart(2, "0");
      const ss = String(seconds).padStart(2, "0");

      const totalBars = 10;
      const filledBars = Math.max(
        0,
        Math.ceil((remaining / durationSeconds) * totalBars),
      );
      const barStr =
        "▰".repeat(filledBars) + "▱".repeat(totalBars - filledBars);

      let color = "#A855F7";
      if (remaining <= 120) {
        color = "red";
      } else if (remaining <= 300) {
        color = "yellow";
      }

      try {
        await this.minecraft.execute(
          `title @a actionbar {"text":"☠️ WITHER STORM ☠️  [${barStr}]  ⏱️ ${mm}:${ss}","color":"${color}","bold":true}`,
        );
      } catch (error) {
        console.warn("Failed to send Money Gun actionbar HUD:", error);
      }
    };

    const timer = setInterval(() => {
      void tick();
    }, 1000);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
    this.moneyGunTimerId = timer;
  }

  private async processGachaQueue() {
    if (this.isProcessingGachaQueue) return;
    this.isProcessingGachaQueue = true;

    while (this.gachaQueue.length > 0) {
      const task = this.gachaQueue.shift();
      if (task) {
        await task();
      }
    }

    this.isProcessingGachaQueue = false;
  }

  private async executeGachaRolls(
    gift: GiftEvent,
    options: GachaOption[],
    animationSpeed = 1,
    iconPrefix = "🎲",
    gachaName = "Vòng Quay Gacha",
  ) {
    this.isGachaSpinning = true;
    try {
      await this.sendMessage(
        `${iconPrefix} ${gift.username} đã kích hoạt ${gachaName} (x${gift.count})!`,
      );

      for (let i = 0; i < gift.count; i++) {
        const winningOption = getRandomGachaOption(options);
        const steps = 14;
        let delayMs = 60 * animationSpeed;

        for (let step = 0; step < steps; step++) {
          const displayOpt =
            step === steps - 1
              ? winningOption
              : options[Math.floor(Math.random() * options.length)];

          const color = displayOpt.color ?? "gold";
          const safeName = displayOpt.name
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');

          await this.minecraft.execute(
            `title @a title {"text":"${iconPrefix} ${safeName} ${iconPrefix}","color":"${color}","bold":true}`,
          );

          if (animationSpeed > 0) {
            await this.minecraft.execute(
              "playsound block.note_block.hat master @a ~ ~ ~ 1 1.5 1",
            );
            await this.delay(delayMs);
            delayMs = Math.min(350 * animationSpeed, delayMs * 1.2);
          }
        }

        const winColor = winningOption.color ?? "gold";
        const safeWinName = winningOption.name
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"');
        const safeUser = gift.username
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"');

        await this.minecraft.execute(
          `title @a title {"text":"🎉 TRÚNG: ${safeWinName} 🎉","color":"${winColor}","bold":true}`,
        );
        await this.minecraft.execute(
          `title @a subtitle {"text":"Người quay: ${safeUser}","color":"yellow"}`,
        );

        await this.sendMessage(
          `🎉 ${gift.username} đã quay Gacha trúng: ${winningOption.name}!`,
        );

        if (animationSpeed > 0) {
          await this.minecraft.execute(
            "playsound entity.player.levelup master @a ~ ~ ~ 1 1 1",
          );
          await this.delay(1200 * animationSpeed);
        }

        let command = winningOption.command;
        if (command.includes("{username}")) {
          command = command.replace(/\{username\}/g, safeUser);
        }

        const spawnCount = winningOption.count ?? 1;
        const subCommands = command
          .split(";")
          .map((cmd) => cmd.trim())
          .filter(Boolean);

        await sessionService.recordGachaLog({
          username: gift.username,
          poolId: gachaName.includes("Rosa")
            ? "rosa_gacha"
            : gachaName.includes("Shamrock")
            ? "shamrock_gacha"
            : "default_gacha",
          gachaItemId: winningOption.id,
          resultName: winningOption.name,
          commandExecuted: command,
        });

        for (let c = 0; c < spawnCount; c++) {
          for (const subCmd of subCommands) {
            await this.minecraft.execute(subCmd);
          }
          if (spawnCount > 1 && c < spawnCount - 1 && animationSpeed > 0) {
            await this.delay(300);
          }
        }
      }
    } finally {
      this.isGachaSpinning = false;
    }
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

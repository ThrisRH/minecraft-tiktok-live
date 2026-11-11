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
import { CorgiEvent } from "./events/corgi-event.js";
import { WitherStormEvent } from "./events/wither-storm-event.js";
import { BoxingGlovesEvent } from "./events/boxing-gloves-event.js";

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

  private readonly witherStormEvent: WitherStormEvent;
  private readonly corgiEvent: CorgiEvent;
  private readonly boxingGlovesEvent: BoxingGlovesEvent;

  // Quản lý cộng dồn tim cho combo người không phổi
  private extraHeartsBonus = 0;

  // Quản lý thời gian tồn tại của nỏ Apocalypse (Cầu nguyện đi Bro)
  private crossbowTimerId?: NodeJS.Timeout;
  private crossbowRemainingSeconds = 0;

  constructor(
    private readonly minecraft: MinecraftService,
    private readonly sandService?: SandService,
  ) {
    const eventContext = {
      execute: (command: string) => this.minecraft.execute(command),
      sendMessage: (text: string) => this.sendMessage(text),
      showLiveParticipant: (
        username: string,
        giftName?: string,
        count?: number,
      ) => this.showLiveParticipant(username, giftName, count),
    };

    this.witherStormEvent = new WitherStormEvent(eventContext);
    this.corgiEvent = new CorgiEvent(eventContext);
    this.boxingGlovesEvent = new BoxingGlovesEvent(eventContext);

    this.giftActions = new GiftActionService({
      ...eventContext,
      gachaGift: (gift: GiftEvent) => this.gachaGift(gift),
      rosaGachaGift: (gift: GiftEvent) => this.rosaGachaGift(gift),
      shamrockGachaGift: (gift: GiftEvent) => this.shamrockGachaGift(gift),
      moneyGunGift: (gift: GiftEvent) => this.moneyGunGift(gift),
      corgiGift: (gift: GiftEvent) => this.corgiGift(gift),
      boxingGlovesGift: (gift: GiftEvent) => this.boxingGlovesGift(gift),
      confettiGift: (gift: GiftEvent) => this.confettiGift(gift),
      nightStarGift: (gift: GiftEvent) => this.nightStarGift(gift),
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
  async perfumeGift(gift: GiftEvent) {
    return this.giftActions.perfumeGift(gift);
  }
  async capGift(gift: GiftEvent) {
    return this.giftActions.capGift(gift);
  }
  async doughnutGift(gift: GiftEvent) {
    return this.giftActions.doughnutGift(gift);
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
  async overreactGift(gift: GiftEvent) {
    return this.giftActions.overreactGift(gift);
  }
  async littleKissesGift(gift: GiftEvent) {
    return this.giftActions.littleKissesGift(gift);
  }
  async luckyPigGift(gift: GiftEvent) {
    return this.giftActions.luckyPigGift(gift);
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

  async moneyGunGift(gift: GiftEvent) {
    await this.witherStormEvent.trigger(gift);
  }

  // Corgi gift -> Leviathan event (BoxingGlovesEvent)
  async corgiGift(gift: GiftEvent) {
    await this.boxingGlovesEvent.trigger(gift);
  }

  async boxingGlovesGift(gift: GiftEvent) {
    return this.giftActions.boxingGlovesGift(gift);
  }

  // Confetti gift -> Summon cataclysm:ignis (xử lý trong gift-actions)
  async confettiGift(gift: GiftEvent) {
    return this.giftActions.confettiGift(gift);
  }

  // Night Star gift -> Đại Tiệc Nhà Rồng event (CorgiEvent)
  async nightStarGift(gift: GiftEvent) {
    await this.corgiEvent.trigger(gift);
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
          .map((cmd: string) => cmd.trim())
          .filter(Boolean);

        for (let c = 0; c < spawnCount; c++) {
          for (const subCmd of subCommands) {
            await this.minecraft.execute(subCmd);
          }
          if (spawnCount > 1 && c < spawnCount - 1 && animationSpeed > 0) {
            await this.delay(300);
          }
        }

        // Xử lý logic cộng dồn đặc biệt
        if (winningOption.id === "combo_nguoi_khong_phoi") {
          await this.handleStackingHearts();
        } else if (winningOption.id === "combo_cau_nguyen_di_bro") {
          await this.handleCrossbowTimer(45);
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

  /**
   * Cộng dồn 10 trái tim (+20 HP) mỗi lần trúng Combo Người Không Phổi
   */
  private async handleStackingHearts() {
    this.extraHeartsBonus += 10;
    // Cấp độ amplifier của health_boost = số tim / 2 - 1
    // 10 tim (20 HP) -> amplifier 4 (level 5)
    // 20 tim (40 HP) -> amplifier 9 (level 10)
    // n tim -> amplifier = (n / 2) - 1
    const amplifier = Math.max(0, Math.floor(this.extraHeartsBonus / 2) - 1);
    await this.minecraft.execute(
      `execute at @a run effect give @a minecraft:health_boost 999999 ${amplifier} true`,
    );

    // Chờ 100ms để Minecraft đồng bộ thanh máu tối đa mới, sau đó bơm đầy full máu
    await this.delay(100);

    // Bơm instant_health nhiều lần và cấp regeneration tức thời để đảm bảo hồi 100% full máu
    await this.minecraft.execute(
      "execute at @a run effect give @a minecraft:instant_health 1 255 true",
    );
    await this.minecraft.execute(
      "execute at @a run effect give @a minecraft:instant_health 1 255 true",
    );
    await this.minecraft.execute(
      "execute at @a run effect give @a minecraft:regeneration 1 255 true",
    );

    await this.sendMessage(
      `❤️ Đã cộng dồn +10 tim & hồi đầy máu! Tổng số tim cộng thêm hiện tại: +${this.extraHeartsBonus} tim (${this.extraHeartsBonus * 2} HP)`,
    );
  }

  /**
   * Quản lý thời gian tồn tại nỏ Apocalypse Crossbow (cộng dồn 45s mỗi lần)
   */
  private async handleCrossbowTimer(secondsToAdd: number) {
    this.crossbowRemainingSeconds += secondsToAdd;

    await this.sendMessage(
      `🏹 Cầu nguyện đi Bro: Nhận Nỏ Apocalypse! Thời gian nỏ còn lại: ${this.crossbowRemainingSeconds}s`,
    );

    if (this.crossbowTimerId) {
      // Đã có timer đang chạy, đã cộng dồn remainingSeconds
      return;
    }

    this.crossbowTimerId = setInterval(async () => {
      this.crossbowRemainingSeconds -= 1;

      if (this.crossbowRemainingSeconds <= 0) {
        if (this.crossbowTimerId) {
          clearInterval(this.crossbowTimerId);
          this.crossbowTimerId = undefined;
        }
        this.crossbowRemainingSeconds = 0;

        // Xóa cây nỏ khỏi túi đồ người chơi
        await this.minecraft.execute(
          "execute at @a run clear @a arcanevortex:apocalypse_crossbow",
        );
        await this.minecraft.execute(
          'title @a actionbar {"text":"⚠️ Nỏ Apocalypse Crossbow đã hết thời gian và biến mất!","color":"red","bold":true}',
        );
        await this.sendMessage(
          "⚠️ Nỏ Apocalypse Crossbow đã hết thời gian sử dụng và tự động biến mất!",
        );
      }
    }, 1000);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

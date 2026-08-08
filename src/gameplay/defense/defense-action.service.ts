import { GiftEvent } from "../../events/event.types.js";
import { MinecraftService } from "../../minecraft/minecraft.service.js";
import { DefenseGiftActionService } from "./defense-gift-actions.js";
import { defenseGiftMap, defaultDefenseConfig, DefenseModeConfig } from "./defense-config.js";
import { getRandomDefenseGachaOption, DefenseGachaOption } from "./defense-gacha-config.js";

export class DefenseActionService {
  private baseHealth: number;
  private currentWave: number;
  private totalLikes = 0;
  private lastProcessedMilestone = 0;
  private isDefenseFinished = false;
  private basePosition: { x: number; y: number; z: number } = { x: 363, y: 62, z: 373 };
  private playerDeaths = 0;
  public readonly maxDeaths = 5;

  private isGachaSpinning = false;
  private gachaQueue: Array<() => Promise<void>> = [];

  private readonly giftActions: DefenseGiftActionService;

  constructor(
    private readonly minecraft: MinecraftService,
    private readonly config: DefenseModeConfig = defaultDefenseConfig,
  ) {
    this.baseHealth = this.config.baseMaxHealth;
    this.currentWave = this.config.initialWave;

    this.giftActions = new DefenseGiftActionService({
      execute: (command: string) => this.minecraft.execute(command),
      sendMessage: (text: string) => this.sendMessage(text),
      showLiveParticipant: (
        username: string,
        giftName?: string,
        count?: number,
      ) => this.showLiveParticipant(username, giftName, count),
      setGachaSpinning: (spinning: boolean) => {
        this.isGachaSpinning = spinning;
      },
      getTargetPlayerName: () => this.getTargetPlayerName(),
      gachaGift: (gift: GiftEvent) => this.gachaGift(gift),
    });
  }

  private targetPlayerName = "Thrisx0310";
  private deathMonitorTimer?: NodeJS.Timeout;
  private lastKnownInGameDeaths = 0;

  private ammoCountdown = 10;
  private ammoTimer?: NodeJS.Timeout;

  // ==========================================
  // SCOREBOARD & DEATH MANAGEMENT
  // ==========================================

  setTargetPlayerName(name: string) {
    if (name && name.trim()) {
      this.targetPlayerName = name.trim();
    }
  }

  getTargetPlayerName(): string {
    return this.targetPlayerName;
  }

  async initScoreboard() {
    try {
      await this.minecraft.execute(
        `scoreboard objectives add deaths deathCount "Lần Chết"`,
      );
    } catch {
      // Ignored if already exists
    }
    try {
      await this.minecraft.execute(`scoreboard objectives setdisplay sidebar deaths`);
    } catch {}
  }

  // ==========================================
  // AMMO BOSSBAR 10S COUNTDOWN MECHANISM
  // ==========================================

  async initAmmoBossbar() {
    try {
      await this.minecraft.execute(
        `bossbar add ammo_countdown "Viện Trợ Đạn 9mm"`,
      );
    } catch {
      // Ignored if already exists
    }
    try {
      await this.minecraft.execute(`bossbar set ammo_countdown color yellow`);
      await this.minecraft.execute(`bossbar set ammo_countdown style progress`);
      await this.minecraft.execute(`bossbar set ammo_countdown max 10`);
      await this.minecraft.execute(`bossbar set ammo_countdown players @a`);
    } catch (err) {
      console.warn("[DEFENSE] Failed to setup ammo bossbar:", err);
    }
  }

  startAmmoTimer() {
    if (this.ammoTimer) return;
    void this.initAmmoBossbar();
    this.ammoTimer = setInterval(() => {
      void this.tickAmmoCountdown();
    }, 1000);
  }

  stopAmmoTimer() {
    if (this.ammoTimer) {
      clearInterval(this.ammoTimer);
      this.ammoTimer = undefined;
    }
  }

  getAmmoCountdown(): number {
    return this.ammoCountdown;
  }

  async tickAmmoCountdown() {
    this.ammoCountdown -= 1;

    if (this.ammoCountdown <= 0) {
      const player = this.targetPlayerName;
      const alive = await this.isPlayerAlive(player);

      if (alive) {
        try {
          await this.minecraft.execute(
            `give ${player} tacz:ammo{AmmoId:"tacz:9mm"} 1`,
          );
          await this.minecraft.execute(
            `playsound item.armor.equip_generic master @a ~ ~ ~ 0.5 1.5 1`,
          );
        } catch (err) {
          console.warn("[DEFENSE] Failed to give 9mm ammo:", err);
        }
      }

      this.ammoCountdown = 10;
    }

    // Update Bossbar name and value
    try {
      await this.minecraft.execute(
        `bossbar set ammo_countdown value ${this.ammoCountdown}`,
      );
      await this.minecraft.execute(
        `bossbar set ammo_countdown name {"text":"📦 Viện trợ đạn 9mm sau: ${this.ammoCountdown}s","color":"yellow","bold":true}`,
      );
    } catch {}
  }

  startDeathMonitor(intervalMs = 1500) {
    if (this.deathMonitorTimer) return;
    this.deathMonitorTimer = setInterval(() => {
      void this.checkInGameDeaths();
    }, intervalMs);
  }

  stopDeathMonitor() {
    if (this.deathMonitorTimer) {
      clearInterval(this.deathMonitorTimer);
      this.deathMonitorTimer = undefined;
    }
  }

  async checkInGameDeaths() {
    const player = this.targetPlayerName;
    try {
      const res = await this.minecraft.execute(
        `scoreboard players get ${player} deaths`,
      );

      if (typeof res === "string") {
        const match = res.match(/has (\d+)/i) || res.match(/:\s*(\d+)/);
        if (match) {
          const score = parseInt(match[1], 10);
          if (score > this.lastKnownInGameDeaths) {
            const deathDiff = score - this.lastKnownInGameDeaths;
            this.lastKnownInGameDeaths = score;
            for (let d = 0; d < deathDiff; d++) {
              await this.recordPlayerDeath(player);
            }
          } else if (score < this.lastKnownInGameDeaths) {
            this.lastKnownInGameDeaths = score;
          }
        }
      }
    } catch {
      // If score not set yet, initialize it
      try {
        await this.minecraft.execute(
          `scoreboard players set ${player} deaths 0`,
        );
      } catch {}
    }
  }

  getPlayerDeaths(): number {
    return this.playerDeaths;
  }

  async isPlayerAlive(targetPlayer = "Thrisx0310"): Promise<boolean> {
    const player = targetPlayer && targetPlayer.trim() ? targetPlayer.trim() : this.targetPlayerName;
    try {
      const res = await this.minecraft.execute(
        `data get entity ${player} Health`,
      );
      if (typeof res === "string") {
        const match = res.match(/:\s*([\d.]+)/) || res.match(/([\d.]+)f/i);
        if (match) {
          const health = parseFloat(match[1]);
          return health > 0;
        }
        if (res.includes("data") && !res.includes("found") && !res.includes("No entity")) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  async giveRespawnKitWhenAlive(targetPlayer = "Thrisx0310", maxWaitMs = 60000) {
    const player = targetPlayer && targetPlayer.trim() ? targetPlayer.trim() : this.targetPlayerName;
    const startTime = Date.now();
    const pollInterval = 500;

    await this.sendMessage(
      `💀 ${player} đã tử vong! Đang chờ bạn hồi sinh để tự động cấp Kit Glock-17 & Dagger...`,
    );

    const checkAliveAndGive = async () => {
      while (Date.now() - startTime < maxWaitMs) {
        const alive = await this.isPlayerAlive(player);
        if (alive) {
          // Player finished respawning! Give kit items
          await this.giveRespawnKit(player);
          await this.sendMessage(
            `🔫 ${player} đã hồi sinh! Đã cấp Kit Glock-17 & Dagger thành công!`,
          );
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      // Fallback if timeout reached
      console.warn(`[DEFENSE] Timeout waiting for ${player} to respawn. Attempting fallback give...`);
      await this.giveRespawnKit(player);
    };

    void checkAliveAndGive();
  }

  async giveRespawnKit(targetPlayer = "Thrisx0310") {
    const player = targetPlayer && targetPlayer.trim() ? targetPlayer.trim() : this.targetPlayerName;
    try {
      await this.minecraft.execute(
        `give ${player} tacz:modern_kinetic_gun{GunId:"tacz:glock_17",GunCurrentAmmoCount:17,HasBulletInBarrel:1b,GunFireMode:"SEMI",SceneCredits:0b} 1`,
      );
      await this.minecraft.execute(
        `give ${player} lrtactical:melee{MeleeWeaponId:"lrtactical:dagger"} 1`,
      );
    } catch (err) {
      console.warn("[DEFENSE] Failed to give respawn kit:", err);
    }
  }

  async recordPlayerDeath(username?: string) {
    const player = username && username.trim() ? username.trim() : this.targetPlayerName;
    this.playerDeaths += 1;
    const current = this.playerDeaths;

    try {
      await this.minecraft.execute(`scoreboard players set ${player} deaths ${current}`);
    } catch {}

    // Chờ player click Hồi sinh (Respawn) hoàn tất rồi mới /give Kit
    void this.giveRespawnKitWhenAlive(player);

    if (current >= this.maxDeaths) {
      await this.resetBaseAndClearMobs();
    }
  }

  async resetBaseAndClearMobs() {
    const { x, y, z } = this.basePosition;

    try {
      await this.minecraft.execute(
        `title @a title {"text":"🚨 ĐÃ ĐẠT 5 LẦN CHẾT 🚨","color":"red","bold":true}`,
      );
      await this.minecraft.execute(
        `title @a subtitle {"text":"Đang đặt lại Căn cứ tại (${x}, ${y}, ${z}) & làm sạch quái!","color":"yellow"}`,
      );
    } catch {}

    await this.sendMessage(
      `🚨 Đã đạt mốc 5 lần chết! Đang đặt lại Căn cứ minecraft:base tại (${x}, ${y}, ${z}) và quét sạch toàn bộ quái!`,
    );

    // 1. Rebuild base
    try {
      await this.minecraft.execute(`place template minecraft:base ${x} ${y} ${z}`);
    } catch (err) {
      console.warn("[DEFENSE] Failed to place base template:", err);
    }

    // 2. Clear all mobs on map
    try {
      await this.minecraft.execute(
        `kill @e[type=!minecraft:player,type=!minecraft:item,type=!minecraft:interaction,type=!minecraft:armor_stand]`,
      );
    } catch (err) {
      console.warn("[DEFENSE] Failed to clear mobs:", err);
    }

    // 3. Reset deaths count
    await this.resetDeaths(false);
  }

  async resetDeaths(notify = true) {
    this.playerDeaths = 0;
    this.lastKnownInGameDeaths = 0;
    const player = this.targetPlayerName;
    try {
      await this.minecraft.execute(`scoreboard players set ${player} deaths 0`);
      await this.minecraft.execute(`scoreboard players set @a deaths 0`);
    } catch {}

    if (notify) {
      await this.sendMessage(`🔄 Đã reset số lần chết của ${player} về 0!`);
    }
  }

  // ==========================================
  // BASE & STATE MANAGEMENT (STUBS)
  // ==========================================

  async setBasePosition(x: number, y: number, z: number) {
    this.basePosition = { x, y, z };
  }

  getBaseHealth(): number {
    return this.baseHealth;
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  isFinished(): boolean {
    return this.isDefenseFinished;
  }

  // ==========================================
  // GIFT & LIKE EVENT ROUTING (STUBS)
  // ==========================================

  async handleGift(gift: GiftEvent) {
    const giftName = gift.giftName ?? "";
    const actionKey = defenseGiftMap[giftName];

    if (actionKey && typeof (this.giftActions as any)[actionKey] === "function") {
      await (this.giftActions as any)[actionKey](gift);
      return;
    }

    // Direct method name match (e.g., Rose -> roseGift)
    const directMethodName = `${giftName.toLowerCase().replace(/\s+/g, "")}Gift`;
    if (typeof (this.giftActions as any)[directMethodName] === "function") {
      await (this.giftActions as any)[directMethodName](gift);
      return;
    }

    await this.giftActions.defaultGift(gift);
  }

  async handleLike(likeCount: number, username: string) {
    // TODO: Bổ sung logic tăng like và kích hoạt đợt quái tấn công theo mốc
    this.totalLikes += likeCount;
  }

  // ==========================================
  // GACHA WHEEL DEFENSE LOGIC (STUBS)
  // ==========================================

  async gachaGift(gift: GiftEvent) {
    // TODO: Bổ sung logic gacha spin trong defense mode sau
  }

  async spinGachaDefense(gift: GiftEvent): Promise<DefenseGachaOption | null> {
    // TODO: Bổ sung logic vòng quay gacha defense nhảy tên phần thưởng trên màn hình
    return getRandomDefenseGachaOption();
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private async sendMessage(message: string) {
    const safeText = message.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    await this.minecraft.execute(
      `tellraw @a {"text":"[DEFENSE] ","color":"red","bold":true,"extra":[{"text":"${safeText}","color":"white"}]}`,
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
}

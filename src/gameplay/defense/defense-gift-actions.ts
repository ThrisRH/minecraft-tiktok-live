import { GiftEvent } from "../../events/event.types.js";
import {
  DefenseGachaOption,
  defenseRosaGachaOptions,
  getRandomDefenseGachaOption,
} from "./defense-gacha-config.js";
import {
  buildDefenseSummonCommand,
  getDefenseSpawnOffset,
  DEFAULT_MIN_SPAWN_DISTANCE,
} from "./defense-config.js";

export interface DefenseGiftActionContext {
  execute(command: string): Promise<unknown>;
  sendMessage(text: string): Promise<void>;
  showLiveParticipant(
    username: string,
    giftName?: string,
    count?: number,
  ): Promise<void>;
  setGachaSpinning?(spinning: boolean): void;
  gachaGift?(gift: GiftEvent): Promise<void>;
}

export class DefenseGiftActionService {
  constructor(private readonly context: DefenseGiftActionContext) {}

  private getTargetPlayer(): string {
    if (this.context.getTargetPlayerName) {
      return this.context.getTargetPlayerName();
    }
    return "Thrisx0310";
  }

  // ==========================================
  // DEFAULT & CORE HANDLERS
  // ==========================================

  async defaultGift(gift: GiftEvent) {
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "gift",
      gift.count,
    );
  }

  async gachaGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      await this.context.gachaGift(gift);
    }
  }

  // ==========================================
  // DEFENSE INDIVIDUAL GIFT HANDLERS
  // ==========================================

  /**
   * Quà Rose: Mặc định spawn 1 zombie cách player >= 50 block.
   * Nếu gửi xN Rose thì sẽ spawn N zombie (mỗi con vị trí cách player >= 50 block).
   */
  async roseGift(gift: GiftEvent) {
    const giftName = "Rose";
    const count = gift.count || 1;

    try {
      await this.context.sendMessage(
        `[DEFENSE] ${gift.username} đã tặng x${count} ${giftName}! Spawn ${count} Zombie cách 50 block!`,
      );
    } catch (error) {
      console.warn("[DEFENSE] Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? giftName,
        count,
      );
    } catch (error) {
      console.warn("[DEFENSE] Failed to show live participant:", error);
    }

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    // Tag rose_zombie để lột sạch trang bị nếu mod tự động gán đồ khi spawn
    const customNameNbt = `{Tags:["rose_zombie"],CustomName:'{"text":"${safeName}"}',HandItems:[{},{}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",Count:1b}],Attributes:[{Name:"generic.movement_speed",Base:0.345f}],CanPickUpLoot:0b}`;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const delayMs = 300;

    for (let i = 0; i < count; i++) {
      // Spawn zombie tại vị trí ngẫu nhiên cách player >= 50 block
      const command = buildDefenseSummonCommand(
        "zombie",
        DEFAULT_MIN_SPAWN_DISTANCE,
        customNameNbt,
      );
      await this.executeWithRetry(command);

      // Tẩy sạch vũ khí / khiên nếu mod majruszsdifficulty tự gán vào khi spawn
      try {
        await this.context.execute(
          `execute at @a run item replace entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.mainhand with air`,
        );
        await this.context.execute(
          `execute at @a run item replace entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.offhand with air`,
        );
      } catch {
        // Tùy phiên bản MC có thể là replaceitem thay vì item replace
        try {
          await this.context.execute(
            `execute at @a run replaceitem entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.mainhand air`,
          );
          await this.context.execute(
            `execute at @a run replaceitem entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.offhand air`,
          );
        } catch {}
      }

      if (i < count - 1) {
        await sleep(delayMs);
      }
    }
  }
  async tiktokGift(gift: GiftEvent) {
    const count = gift.count || 1;
    const totalAmmo = count * 10;
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã tặng x${count} TikTok! Viện trợ x${totalAmmo} đạn 9mm!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "TikTok",
      count,
    );

    const player = this.getTargetPlayer();
    await this.executeWithRetry(`give ${player} tacz:ammo{AmmoId:"tacz:9mm"} ${totalAmmo}`);
  }

  /**
   * 2. Overreact Gift: Spawn Creeper cách player >= 50 block
   */
  async overreactGift(gift: GiftEvent) {
    const count = gift.count || 1;
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã tặng x${count} Overreact! Spawn ${count} Creeper cách 50m!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "Overreact",
      count,
    );

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const customNameNbt = `{CustomName:'{"text":"${safeName}"}'}`;

    for (let i = 0; i < count; i++) {
      const command = buildDefenseSummonCommand(
        "creeper",
        DEFAULT_MIN_SPAWN_DISTANCE,
        customNameNbt,
      );
      await this.executeWithRetry(command);

      if (i < count - 1) {
        await this.delay(300);
      }
    }
  }

  /**
   * 3. Perfume Gift: Quay Perfume Defense Gacha triệu hồi Mutants & Undead cách 50m
   */
  async perfumeGift(gift: GiftEvent) {
    await this.executeGachaRolls(
      gift,
      defenseRosaGachaOptions,
      "🧴",
      "Vòng Quay Perfume Gacha",
    );
  }

  async rosaGift(gift: GiftEvent) {
    await this.perfumeGift(gift);
  }

  /**
   * 4. GG Gift: Viện trợ 2 bánh mì cho Player
   */
  async ggGift(gift: GiftEvent) {
    const count = gift.count || 1;
    const breadAmount = count * 2;
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã tặng x${count} GG! Viện trợ ${breadAmount} ổ bánh mì!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "GG",
      count,
    );

    const player = this.getTargetPlayer();
    await this.executeWithRetry(`give ${player} bread ${breadAmount}`);
  }

  /**
   * 5. Finger Heart Gift / Heart: Viện trợ Táo Vàng
   */
  async fingerHeartGift(gift: GiftEvent) {
    const count = gift.count || 1;
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã tặng x${count} Finger Heart! Viện trợ ${count} Táo Vàng!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "Finger Heart",
      count,
    );

    const player = this.getTargetPlayer();
    await this.executeWithRetry(`give ${player} golden_apple ${count}`);
  }

  async heartGift(gift: GiftEvent) {
    await this.fingerHeartGift(gift);
  }

  /**
   * 6. Journey Pass Gift: Viện trợ Full bộ Giáp Lưới (Chainmail Armor)
   */
  async journeyPassGift(gift: GiftEvent) {
    const count = gift.count || 1;
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã tặng x${count} Journey Pass! Cấp Full bộ Giáp Lưới!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "Journey Pass",
      count,
    );

    const player = this.getTargetPlayer();
    for (let i = 0; i < count; i++) {
      await this.executeWithRetry(`give ${player} chainmail_helmet 1`);
      await this.executeWithRetry(`give ${player} chainmail_chestplate 1`);
      await this.executeWithRetry(`give ${player} chainmail_leggings 1`);
      await this.executeWithRetry(`give ${player} chainmail_boots 1`);
    }
  }

  /**
   * 7. Little Kisses Gift: Viện trợ Súng AUG & 60 hộp đạn 5.56x45
   */
  async littleKissesGift(gift: GiftEvent) {
    const count = gift.count || 1;
    const ammoAmount = count * 60;
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã tặng x${count} Little Kisses! Viện trợ Súng AUG & x${ammoAmount} đạn 5.56x45!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "Little Kisses",
      count,
    );

    const player = this.getTargetPlayer();
    for (let i = 0; i < count; i++) {
      await this.executeWithRetry(
        `give ${player} tacz:modern_kinetic_gun{GunId:"tacz:aug",GunCurrentAmmoCount:17,HasBulletInBarrel:1b,GunFireMode:"AUTO",SceneCredits:0b} 1`,
      );
    }
    await this.executeWithRetry(`give ${player} tacz:ammo{AmmoId:"tacz:556x45"} ${ammoAmount}`);
  }

  async kissesGift(gift: GiftEvent) {
    await this.littleKissesGift(gift);
  }

  /**
   * 8. Okay Gift: Viện trợ 10 hộp đạn 5.56x45
   */
  async okayGift(gift: GiftEvent) {
    const count = gift.count || 1;
    const totalAmmo = count * 10;
    await this.context.sendMessage(
      `[DEFENSE] ${gift.username} đã tặng x${count} Okay! Viện trợ x${totalAmmo} đạn 5.56x45!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "Okay",
      count,
    );

    const player = this.getTargetPlayer();
    await this.executeWithRetry(`give ${player} tacz:ammo{AmmoId:"tacz:556x45"} ${totalAmmo}`);
  }

  /**
   * 9. Doughnut Gift: Đại dịch summon 20 mutantszombies:crawler trong bán kính 50m
   */
  async doughnutGift(gift: GiftEvent) {
    const count = gift.count || 1;
    const totalCrawlers = count * 20;
    await this.context.sendMessage(
      `[DEFENSE] 🍩 ${gift.username} đã tặng x${count} Doughnut! Kích hoạt Đại dịch: Summon ${totalCrawlers} Mutants Crawler cách 50m!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "Doughnut",
      count,
    );

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const customNameNbt = `{CustomName:'{"text":"${safeName}"}'}`;

    for (let i = 0; i < totalCrawlers; i++) {
      const command = buildDefenseSummonCommand(
        "mutantszombies:crawler",
        DEFAULT_MIN_SPAWN_DISTANCE,
        customNameNbt,
      );
      await this.executeWithRetry(command);

      if (i % 5 === 0) {
        await this.delay(100);
      }
    }
  }

  async creeperGift(gift: GiftEvent) {
    return this.overreactGift(gift);
  }

  async ironGolemGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Iron Golem cho Defense mode
  }

  async lightningGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Lightning cho Defense mode
  }

  async capGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Cap cho Defense mode
  }

  async cageGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Cage cho Defense mode
  }

  async tntGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà TNT cho Defense mode
  }

  async sandBlockGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Sand Block cho Defense mode
  }

  async bombGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Bomb cho Defense mode
  }

  async goldenAppleGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Golden Apple cho Defense mode
  }

  async steveGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Steve cho Defense mode
  }

  async wolfGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Wolf cho Defense mode
  }

  async rifleGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Rifle cho Defense mode
  }

  async zombieGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Zombie cho Defense mode
  }

  private async executeGachaRolls(
    gift: GiftEvent,
    options: DefenseGachaOption[],
    iconPrefix = "🌹",
    gachaName = "Vòng Quay Rosa Gacha",
  ) {
    if (this.context.setGachaSpinning) {
      this.context.setGachaSpinning(true);
    }
    try {
      await this.context.sendMessage(
        `${iconPrefix} ${gift.username} đã kích hoạt ${gachaName} (x${gift.count})!`,
      );

      const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      const customNameNbt = `{CustomName:'{"text":"${safeUser}"}'}`;

      for (let i = 0; i < gift.count; i++) {
        const winningOption = getRandomDefenseGachaOption(options);
        if (!winningOption) continue;

        const steps = 14;
        let delayMs = 60;

        for (let step = 0; step < steps; step++) {
          const displayOpt =
            step === steps - 1
              ? winningOption
              : options[Math.floor(Math.random() * options.length)];

          const color = displayOpt.color ?? "gold";
          const safeName = displayOpt.name
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');

          await this.context.execute(
            `title @a title {"text":"${iconPrefix} ${safeName} ${iconPrefix}","color":"${color}","bold":true}`,
          );

          await this.context.execute(
            "playsound block.note_block.hat master @a ~ ~ ~ 1 1.5 1",
          );
          await this.delay(delayMs);
          delayMs = Math.min(350, delayMs * 1.2);
        }

        const winColor = winningOption.color ?? "gold";
        const safeWinName = winningOption.name
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"');

        await this.context.execute(
          `title @a title {"text":"🎉 TRÚNG: ${safeWinName} 🎉","color":"${winColor}","bold":true}`,
        );
        await this.context.execute(
          `title @a subtitle {"text":"Người quay: ${safeUser}","color":"yellow"}`,
        );

        await this.context.sendMessage(
          `🎉 ${gift.username} đã quay Gacha trúng: ${winningOption.name}!`,
        );

        await this.context.execute(
          "playsound entity.player.levelup master @a ~ ~ ~ 1 1 1",
        );
        await this.delay(1200);

        // Kích hoạt option trúng ở vị trí cách player >= 50 block
        const { x, z } = getDefenseSpawnOffset(DEFAULT_MIN_SPAWN_DISTANCE);

        if (winningOption.type === "command") {
          const command = `execute at @a run execute positioned ~${x} ~ ~${z} run ${winningOption.command}`;
          await this.executeWithRetry(command);
        } else {
          const command = `execute at @a run summon ${winningOption.command} ~${x} ~ ~${z} ${customNameNbt}`;
          await this.executeWithRetry(command);
        }
      }
    } finally {
      if (this.context.setGachaSpinning) {
        this.context.setGachaSpinning(false);
      }
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async ggGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà GG cho Defense mode
  }

  // ==========================================
  // HELPER UTILITIES
  // ==========================================

  async handleGiftEffect(
    gift: GiftEvent,
    giftName: string,
    command: string,
    amount = 1,
    option?: string,
  ) {
    // Helper thực thi hiệu ứng quà chung
  }

  private buildTaggedCommand(
    command: string,
    username: string,
    option?: string,
  ): string {
    if (option) {
      return `${command} "${username}" ${option}`;
    }
    return `${command} "${username}"`;
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
          `[DEFENSE] Gift command failed after ${maxAttempts} attempts:`,
          error,
        );
        return;
      }
      await this.executeWithRetry(command, nextAttempt);
    }
  }
}

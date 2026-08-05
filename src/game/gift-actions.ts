import { GiftEvent } from "../events/event.types.js";

interface GiftActionContext {
  execute(command: string): Promise<unknown>;
  sendMessage(text: string): Promise<void>;
  showLiveParticipant(
    username: string,
    giftName?: string,
    count?: number,
  ): Promise<void>;
  gachaGift?(gift: GiftEvent): Promise<void>;
  rosaGachaGift?(gift: GiftEvent): Promise<void>;
  shamrockGachaGift?(gift: GiftEvent): Promise<void>;
  moneyGunGift?(gift: GiftEvent): Promise<void>;
  corgiGift?(gift: GiftEvent): Promise<void>;
}

export class GiftActionService {
  constructor(private readonly context: GiftActionContext) {}

  async defaultGift(gift: GiftEvent) {
    await this.context.sendMessage(
      `${gift.username} đã gửi x${gift.count} ${gift.giftName ?? "gift"}!`,
    );
    await this.context.showLiveParticipant(
      gift.username,
      gift.giftName ?? "gift",
      gift.count,
    );
  }

  async handleGiftEffect(
    gift: GiftEvent,
    giftName: string,
    command: string,
    amount = 1,
    option?: string,
    skipPayload = false,
  ) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} ${giftName}!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? giftName,
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const total = gift.count * amount;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const taggedCommand = this.buildTaggedCommand(
      command,
      safeName,
      option,
      skipPayload,
    );

    console.log(taggedCommand);

    // Delay cố định 500ms giữa mỗi con mob theo yêu cầu
    const delayMs = 500;

    for (let i = 0; i < total; i++) {
      await this.executeWithRetry(taggedCommand);
      if (i < total - 1) {
        await sleep(delayMs);
      }
    }
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
          `Gift command failed after ${maxAttempts} attempts:`,
          error,
        );
        return;
      }

      console.warn(
        `Gift command failed, retrying (${nextAttempt}/${maxAttempts}):`,
        error,
      );
      await this.delay(1000 * nextAttempt);
      return this.executeWithRetry(command, nextAttempt);
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private buildTaggedCommand(
    command: string,
    username: string,
    option?: string,
    skipPayload = false,
  ) {
    const hasCoordinates = command.includes("~");
    const baseCommand = hasCoordinates ? command : `${command} ~ ~ ~`;

    if (skipPayload) {
      return `execute at @a run ${baseCommand}`;
    }

    const safeName = username.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const customNameTag = `CustomName:'{"text":"${safeName}"}'`;
    const payload = option
      ? option.startsWith("{")
        ? `{${customNameTag},${option.slice(1, -1)}}`
        : `{${customNameTag},${option}}`
      : `{${customNameTag}}`;

    return `execute at @a run ${baseCommand} ${payload}`;
  }

  async heartGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      return this.context.gachaGift({ ...gift, giftName: "Heart" });
    }
    return this.defaultGift(gift);
  }

  // rose zombie thuong
  async roseGift(gift: GiftEvent) {
    const command = "summon zombie" as const;
    await this.handleGiftEffect(gift, "Rose", command, 1);
  }

  // tiktok creeper
  async tiktokGift(gift: GiftEvent) {
    const command = "summon creeper" as const;

    await this.handleGiftEffect(gift, "TikTok", command);
  }

  // rosa Gacha độc lập
  async rosaGift(gift: GiftEvent) {
    if (this.context.rosaGachaGift) {
      return this.context.rosaGachaGift({ ...gift, giftName: "Rosa" });
    }

    return this.defaultGift(gift);
  }

  // perfume: 4 cột bedrock 5 block nhốt người chơi + summon gravity_tnt, sau 1s xóa bedrock
  async perfumeGift(gift: GiftEvent) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} Perfume!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? "Perfume",
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const count = Math.max(1, gift.count ?? 1);

    for (let i = 0; i < count; i++) {
      // 1. Tạo 4 cột bedrock cao 5 block vây quanh vị trí người chơi
      await this.executeWithRetry(
        "execute at @a run fill ~1 ~ ~ ~1 ~4 ~ bedrock",
      );
      await this.executeWithRetry(
        "execute at @a run fill ~-1 ~ ~ ~-1 ~4 ~ bedrock",
      );
      await this.executeWithRetry(
        "execute at @a run fill ~ ~ ~1 ~ ~4 ~1 bedrock",
      );
      await this.executeWithRetry(
        "execute at @a run fill ~ ~ ~-1 ~ ~4 ~-1 bedrock",
      );

      // 2. Chờ 2 giây (2000ms) sau khi dựng cột bedrock
      await this.delay(2000);

      // 3. Summon gravity_tnt tại vị trí người chơi đang bị nhốt
      await this.executeWithRetry(
        "execute at @a run summon luckytntmod:gravity_tnt ~ ~ ~",
      );

      // 4. Chờ 1 giây (1000ms) sau khi triệu hồi TNT
      await this.delay(1000);

      // 5. Xóa 4 cột bedrock (chỉ thay thế bedrock bằng air)
      await this.executeWithRetry(
        "execute at @a run fill ~-1 ~ ~-1 ~1 ~4 ~1 air replace bedrock",
      );

      if (i < count - 1) {
        await this.delay(500);
      }
    }
  }

  async handleGiveItemEffect(
    gift: GiftEvent,
    giftName: string,
    items: string | string[],
  ) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} ${giftName}!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? giftName,
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const itemList = Array.isArray(items) ? items : [items];
    const count = Math.max(1, gift.count ?? 1);

    for (const item of itemList) {
      const command = `execute at @a run give @a ${item} ${count}`;
      await this.executeWithRetry(command);
    }
  }

  // Finger Heart -> táo
  async fingerHeartGift(gift: GiftEvent) {
    await this.handleGiveItemEffect(gift, "Finger Heart", "golden_apple");
  }

  // Journey Pass -> Give người chơi full giáp da
  async journeyPassGift(gift: GiftEvent) {
    const armorItems = [
      "leather_helmet",
      "leather_chestplate",
      "leather_leggings",
      "leather_boots",
    ];
    await this.handleGiveItemEffect(gift, "Journey Pass", armorItems);
  }

  // GG -> Bánh mì
  async ggGift(gift: GiftEvent) {
    await this.handleGiveItemEffect(gift, "GG", "bread");
  }

  // Little Kisses -> Táo vàng phù phép + Áo sắt (Protection IV + Blast Protection III)
  async littleKissesGift(gift: GiftEvent) {
    const items = [
      "enchanted_golden_apple",
      'iron_chestplate{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:blast_protection",lvl:3s}]}',
    ];
    await this.handleGiveItemEffect(gift, "Little Kisses", items);
  }

  // Lucky Pig -> Summon guardvillagers:guard với tên username đã donate
  async luckyPigGift(gift: GiftEvent) {
    try {
      await this.context.sendMessage(`${gift.username} đã gửi tiếp viện!`);
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? "Lucky Pig",
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const safeName = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');
    const command = `execute at @a run summon minecraft:iron_golem`;
    const count = Math.max(1, gift.count ?? 1);

    for (let i = 0; i < count; i++) {
      await this.executeWithRetry(command);
    }
  }

  // cap warden
  async capGift(gift: GiftEvent) {
    const command = "summon warden" as const;

    await this.handleGiftEffect(gift, "Cap", command);
  }

  async shamrockGift(gift: GiftEvent) {
    if (this.context.shamrockGachaGift) {
      return this.context.shamrockGachaGift({ ...gift, giftName: "Shamrock" });
    }
    return this.defaultGift(gift);
  }

  async iceCreamGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      return this.context.gachaGift({ ...gift, giftName: "Ice Cream" });
    }
    return this.defaultGift(gift);
  }

  async moneyGunGift(gift: GiftEvent) {
    if (this.context.moneyGunGift) {
      return this.context.moneyGunGift({ ...gift, giftName: "Money Gun" });
    }
    return this.defaultGift(gift);
  }

  // Doughnut black hole
  async doughnutGift(gift: GiftEvent) {
    const command = "summon terramity:black_hole ~ ~ ~" as const;

    await this.handleGiftEffect(gift, "Doughnut", command, 1, undefined, true);
  }

  // corgi 5-minute event sequence
  private corgiRemainingSeconds = 0;
  private corgiTimerId?: NodeJS.Timeout;
  private corgiSpawnedBabyCount = 0;
  private corgiEnderDragonSummoned = false;

  async corgiGift(gift: GiftEvent, durationSeconds = 300) {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} Corgi! Kích hoạt Thảm Họa Corgi Dragon!`,
      );
    } catch (error) {
      console.warn("Failed to send gift notification:", error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? "Corgi",
        gift.count,
      );
    } catch (error) {
      console.warn("Failed to show live participant:", error);
    }

    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');
    const totalCount = Math.max(1, gift.count ?? 1);

    if (!this.corgiTimerId) {
      // Event gốc chưa chạy: Quà 1 là sự kiện gốc Corgi Dragon
      await this.context.execute(
        `title @a title {"text":"🐉 ĐẠI DỊCH CORGI DRAGON! 🐉","color":"dark_purple","bold":true}`,
      );
      await this.context.execute(
        `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 05:00","color":"gold"}`,
      );
      await this.context.execute(
        "playsound entity.ender_dragon.growl master @a ~ ~ ~ 1 1 1",
      );

      // Apply Slowness 1 to player for 5 minutes (300 seconds)
      await this.context.execute(
        "execute at @a run effect give @a slowness 300 0 true",
      );

      // Initial spawn: 3 baby ender dragons (~ 2 ~)
      const initialBabyCount = 3;
      for (let i = 0; i < initialBabyCount; i++) {
        await this.context.execute(
          "execute at @a run summon endertrigon:baby_ender_dragon ~ 2 ~",
        );
      }

      this.corgiSpawnedBabyCount = initialBabyCount;
      this.corgiEnderDragonSummoned = false;

      this.startCorgiCountdown(durationSeconds);

      // Từ quà 2 trở đi trong combo: cộng thêm 5 phút & triệu hồi thêm 1 Ender Dragon
      const extraCount = totalCount - 1;
      if (extraCount > 0) {
        this.corgiRemainingSeconds += extraCount * durationSeconds;
        for (let i = 0; i < extraCount; i++) {
          await this.context.execute(
            "execute at @a run summon ender_dragon ~ 5 ~",
          );
        }
      }
    } else {
      // Event đã đang chạy: Tất cả các quà trong combo đều cộng thêm 5 phút & triệu hồi thêm Ender Dragon
      this.corgiRemainingSeconds += totalCount * durationSeconds;
      for (let i = 0; i < totalCount; i++) {
        await this.context.execute(
          "execute at @a run summon ender_dragon ~ 5 ~",
        );
      }
    }
  }

  private startCorgiCountdown(durationSeconds = 300) {
    if (this.corgiTimerId) {
      return;
    }

    this.corgiRemainingSeconds = durationSeconds;

    const tick = async () => {
      this.corgiRemainingSeconds -= 1;

      if (this.corgiRemainingSeconds <= 0) {
        if (this.corgiTimerId) {
          clearInterval(this.corgiTimerId);
          this.corgiTimerId = undefined;
        }

        try {
          await this.context.execute(
            "execute at @a run kill @e[type=endertrigon:baby_ender_dragon]",
          );
          await this.context.execute(
            "execute at @a run kill @e[type=ender_dragon]",
          );
          await this.context.execute(
            "execute at @a run kill @e[type=end_crystal]",
          );
          await this.context.execute(
            "execute at @a run effect clear @a slowness",
          );
          await this.context.execute(
            `title @a title {"text":"✨ SỰ KIỆN CORGI ĐÃ KẾT THÚC! ✨","color":"green","bold":true}`,
          );
          await this.context.execute(
            "playsound entity.ender_dragon.death master @a ~ ~ ~ 1 1 1",
          );
          await this.context.execute(
            `title @a actionbar {"text":"✨ SỰ KIỆN CORGI ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
          );
        } catch (error) {
          console.warn("Failed to finalize Corgi countdown:", error);
        }
        return;
      }

      const remaining = this.corgiRemainingSeconds;
      const elapsedSeconds = durationSeconds - remaining;

      // 1. Cứ mỗi 10 giây: spawn cấp số nhân số baby ender dragon trước đó (tối đa 25 con)
      if (
        elapsedSeconds > 0 &&
        elapsedSeconds % 10 === 0 &&
        this.corgiSpawnedBabyCount < 25
      ) {
        const toSpawn = Math.min(
          this.corgiSpawnedBabyCount,
          25 - this.corgiSpawnedBabyCount,
        );
        if (toSpawn > 0) {
          for (let i = 0; i < toSpawn; i++) {
            try {
              await this.context.execute(
                "execute at @a run summon endertrigon:baby_ender_dragon ~ 2 ~",
              );
            } catch (err) {
              console.warn("Failed to summon baby_ender_dragon:", err);
            }
          }
          this.corgiSpawnedBabyCount += toSpawn;
        }
      }

      // 2. Khi còn khoảng 3 phút: summon Ender Dragon & End Crystals rải rác
      if (remaining <= 180 && !this.corgiEnderDragonSummoned) {
        this.corgiEnderDragonSummoned = true;
        try {
          await this.context.execute(
            `title @a title {"text":"🐲 ENDER DRAGON ĐÃ TỈNH GIẤC! 🐲","color":"dark_red","bold":true}`,
          );
          await this.context.execute(
            `title @a subtitle {"text":"Rồng và Tinh Thể Ma Thuật đã xuất hiện!","color":"yellow"}`,
          );
          await this.context.execute(
            "playsound entity.ender_dragon.growl master @a ~ ~ ~ 1 0.8 1",
          );
          await this.context.execute(
            "execute at @a run summon ender_dragon ^ ^5 ^2",
          );

          // End crystals rải rác chuẩn bán kính 20-28 blocks
          const crystalOffsets = [
            { x: 28, z: 0 },
            { x: -28, z: 0 },
            { x: 0, z: 28 },
            { x: 0, z: -28 },
            { x: 20, z: 20 },
            { x: -20, z: 20 },
            { x: 20, z: -20 },
            { x: -20, z: -20 },
          ];
          for (const pos of crystalOffsets) {
            await this.context.execute(
              `execute at @a run summon end_crystal ~${pos.x} 5 ~${pos.z}`,
            );
          }
        } catch (err) {
          console.warn("Failed to summon Ender Dragon or crystals:", err);
        }
      }

      // Re-apply Slowness 1 periodically
      if (remaining % 30 === 0) {
        try {
          await this.context.execute(
            "execute at @a run effect give @a slowness 300 0 true",
          );
        } catch (err) {
          console.warn("Failed to reapply slowness:", err);
        }
      }

      // 3. Update Actionbar HUD
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const mm = String(minutes).padStart(2, "0");
      const ss = String(seconds).padStart(2, "0");

      const totalBars = 10;
      const filledBars = Math.max(
        0,
        Math.min(
          totalBars,
          Math.ceil((remaining / durationSeconds) * totalBars),
        ),
      );
      const barStr =
        "▰".repeat(filledBars) + "▱".repeat(totalBars - filledBars);

      let color = "#A855F7";
      if (remaining <= 60) {
        color = "red";
      } else if (remaining <= 180) {
        color = "yellow";
      }

      try {
        await this.context.execute(
          `title @a actionbar {"text":"🐉 CORGI DRAGON 🐉  [${barStr}]  ⏱️ ${mm}:${ss}","color":"${color}","bold":true}`,
        );
      } catch (error) {
        console.warn("Failed to send Corgi actionbar HUD:", error);
      }
    };

    const timer = setInterval(() => {
      void tick();
    }, 1000);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
    this.corgiTimerId = timer;
  }

  // Confetti grande_finale
  async confettiGift(gift: GiftEvent) {
    const command = "summon ender_dragon" as const;

    await this.handleGiftEffect(gift, "Confetti", command, 1, undefined, true);
  }
}

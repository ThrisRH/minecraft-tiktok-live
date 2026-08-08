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

  // rose zombie thuong (tay rong, mu da, toc do x1.5, CanPickUpLoot:0b)
  async roseGift(gift: GiftEvent) {
    const command = "summon zombie" as const;
    const nbtOption = 'Tags:["rose_zombie"],HandItems:[{},{}],ArmorItems:[{},{},{},{id:"minecraft:leather_helmet",Count:1b}],Attributes:[{Name:"generic.movement_speed",Base:0.345f}],CanPickUpLoot:0b';
    await this.handleGiftEffect(gift, "Rose", command, 1, nbtOption);

    try {
      await this.context.execute(
        `execute at @a run item replace entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.mainhand with air`,
      );
      await this.context.execute(
        `execute at @a run item replace entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.offhand with air`,
      );
    } catch {
      try {
        await this.context.execute(
          `execute at @a run replaceitem entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.mainhand air`,
        );
        await this.context.execute(
          `execute at @a run replaceitem entity @e[type=zombie,tag=rose_zombie,limit=1,sort=nearest] weapon.offhand air`,
        );
      } catch {}
    }
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

  async journeyPassGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  // GG -> Bánh mì
  async ggGift(gift: GiftEvent) {
    await this.handleGiveItemEffect(gift, "GG", "bread");
  }

  async littleKissesGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  // Lucky Pig -> Summon ngẫu nhiên recruits:villager_noble hoặc recruits:bowman (3 con mỗi count, không giáp, RecruitCost:0)
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
    const options = [
      `execute at @a run summon recruits:villager_noble ~ ~ ~ {CustomName:'{"text":"${safeName}"}',RecruitCost:0}`,
      `execute at @a run summon recruits:bowman ~ ~ ~ {CustomName:'{"text":"${safeName}"}',RecruitCost:0}`,
    ];

    const giftCount = Math.max(1, gift.count ?? 1);
    const totalCount = giftCount * 3;

    for (let i = 0; i < totalCount; i++) {
      const chosenCommand =
        options[Math.floor(Math.random() * options.length)];
      await this.executeWithRetry(chosenCommand);
    }
  }

  async capGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }

  async shamrockGift(gift: GiftEvent) {
    if (this.context.shamrockGachaGift) {
      return this.context.shamrockGachaGift({ ...gift, giftName: "Shamrock" });
    }
    return this.defaultGift(gift);
  }

  async overreactGift(gift: GiftEvent) {
    if (this.context.gachaGift) {
      return this.context.gachaGift({
        ...gift,
        giftName: gift.giftName ?? "Overreact",
      });
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
    const command = "summon terramity:black_hole ~ ~10 ~" as const;

    await this.handleGiftEffect(gift, "Doughnut", command, 1, undefined, true);
  }

  async corgiGift(gift: GiftEvent) {
    if (this.context.corgiGift) {
      return this.context.corgiGift({ ...gift, giftName: "Corgi" });
    }
    return this.defaultGift(gift);
  }

  async confettiGift(gift: GiftEvent) {
    return this.defaultGift(gift);
  }
}

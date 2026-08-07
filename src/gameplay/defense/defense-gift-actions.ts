import { GiftEvent } from "../../events/event.types.js";
import {
  DefenseGachaOption,
  getRandomDefenseGachaOption,
} from "./defense-gacha-config.js";
import {
  buildDefenseSummonCommand,
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
  gachaGift?(gift: GiftEvent): Promise<void>;
}

export class DefenseGiftActionService {
  constructor(private readonly context: DefenseGiftActionContext) {}

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
    const customNameNbt = `{CustomName:'{"text":"${safeName}"}'}`;

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

      if (i < count - 1) {
        await sleep(delayMs);
      }
    }
  }

  async heartGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Heart cho Defense mode
  }

  async zombieGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Zombie cho Defense mode
  }

  async creeperGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Creeper cho Defense mode
  }

  async ironGolemGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Iron Golem cho Defense mode
  }

  async lightningGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Lightning cho Defense mode
  }

  async perfumeGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Perfume cho Defense mode
  }

  async tiktokGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà TikTok cho Defense mode
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

  async rosaGift(gift: GiftEvent) {
    // TODO: Logic xử lý quà Rosa cho Defense mode
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

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
  private basePosition: { x: number; y: number; z: number } | null = null;

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
      gachaGift: (gift: GiftEvent) => this.gachaGift(gift),
    });
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
    await this.minecraft.say(`[Defense Mode] ${message}`);
  }

  private async showLiveParticipant(
    username: string,
    giftName?: string,
    count?: number,
  ) {
    // TODO: Bổ sung hiển thị title lên màn hình Minecraft sau
  }
}

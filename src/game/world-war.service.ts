import { MinecraftService } from "../minecraft/minecraft.service.js";

export interface WarPosition {
  x: number;
  y: number;
  z: number;
}

export interface WarStatus {
  active: boolean;
  wave: number;
  alliedCount: number;
  enemyCount: number;
  position: WarPosition | null;
}

export class WorldWarService {
  private isWarActive = false;
  private currentWave = 1;
  private warPosition: WarPosition | null = null;
  private hudInterval?: NodeJS.Timeout;
  private alliedCount = 0;
  private enemyCount = 0;

  constructor(private readonly minecraft: MinecraftService) {}

  public isWarRunning(): boolean {
    return this.isWarActive;
  }

  public getWarStatus(): WarStatus {
    return {
      active: this.isWarActive,
      wave: this.currentWave,
      alliedCount: this.alliedCount,
      enemyCount: this.enemyCount,
      position: this.warPosition,
    };
  }

  async startWar(x: number, y: number, z: number) {
    this.warPosition = { x, y, z };
    this.isWarActive = true;
    this.currentWave = 1;
    this.alliedCount = 0;
    this.enemyCount = 0;

    await this.minecraft.execute(
      `title @a title {"text":"⚔️ CHIẾN TRANH THẾ GIỚI BẮT ĐẦU ⚔️","color":"red","bold":true}`,
    );
    await this.minecraft.execute(
      `title @a subtitle {"text":"Bảo vệ căn cứ & Tiêu diệt toàn bộ lực lượng địch!","color":"gold"}`,
    );
    await this.minecraft.execute(
      "playsound entity.ender_dragon.growl master @a ~ ~ ~ 1 0.8 1",
    );

    // Initial deployment of base defensive structures / forces
    await this.spawnInitialBaseForces();
    this.startBattlefieldHud();
  }

  async stopWar() {
    this.isWarActive = false;
    if (this.hudInterval) {
      clearInterval(this.hudInterval);
      this.hudInterval = undefined;
    }

    await this.minecraft.execute(
      `title @a title {"text":"🕊️ CHIẾN TRANH KẾT THÚC 🕊️","color":"green","bold":true}`,
    );
    await this.minecraft.execute(
      `title @a subtitle {"text":"Hòa bình đã được lặp lại trên chiến trường!","color":"white"}`,
    );
    await this.minecraft.execute(
      "playsound ui.toast.challenge_complete master @a ~ ~ ~ 1 1 1",
    );
  }

  async spawnAlliedSquad(username: string, giftName = "Tiếp viện", count = 1) {
    const safeName = username.replace(/\\/g, "\\\\").replace(/"/g, '"');
    const safeGift = giftName.replace(/\\/g, "\\\\").replace(/"/g, '"');

    await this.minecraft.execute(
      `title @a title {"text":"🪖 TIẾP VIỆN ĐỒNG MINH 🪖","color":"green","bold":true}`,
    );
    await this.minecraft.execute(
      `title @a subtitle {"text":"${safeName} đã gửi x${count} ${safeGift}","color":"yellow"}`,
    );

    const squadTypes = [
      `summon recruits:villager_noble ~ ~ ~ {CustomName:'{"text":"[Đồng Minh] ${safeName}"}',RecruitCost:0,ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}],HandItems:[{id:"minecraft:iron_sword",Count:1b},{}],Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.45}]}`,
      `summon recruits:bowman ~ ~ ~ {CustomName:'{"text":"[Xạ Thủ] ${safeName}"}',RecruitCost:0,ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}],HandItems:[{id:"minecraft:bow",Count:1b},{}],Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.45}]}`,
      `summon guardvillagers:guard ~ ~ ~ {CustomName:'{"text":"[Vệ Binh] ${safeName}"}',ArmorItems:[{id:"minecraft:diamond_boots",Count:1b},{id:"minecraft:diamond_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}],HandItems:[{id:"minecraft:iron_sword",Count:1b},{id:"minecraft:shield",Count:1b}]}`,
    ];

    const totalSoldiers = count * 3;
    for (let i = 0; i < totalSoldiers; i++) {
      const chosen = squadTypes[i % squadTypes.length];
      await this.minecraft.execute(`execute at @a run ${chosen}`);
      this.alliedCount++;
      await this.delay(300);
    }
  }

  async spawnEnemyWave(intensity = 1) {
    this.currentWave += 1;
    await this.minecraft.execute(
      `title @a title {"text":"🚨 QUÂN ĐỊCH TẤN CÔNG - WAVE ${this.currentWave} 🚨","color":"dark_red","bold":true}`,
    );
    await this.minecraft.execute(
      "playsound event.raid.horn master @a ~ ~ ~ 1 1 1",
    );

    const enemyTypes = [
      "execute at @a run summon pillager ~ ~ ~ {HandItems:[{id:'minecraft:crossbow',Count:1b},{}]}",
      "execute at @a run summon vindicator ~ ~ ~ {HandItems:[{id:'minecraft:iron_axe',Count:1b},{}]}",
      "execute at @a run summon ravager ~ ~ ~",
      "execute at @a run summon witch ~ ~ ~",
    ];

    const totalEnemies = intensity * 4;
    for (let i = 0; i < totalEnemies; i++) {
      const chosen = enemyTypes[i % enemyTypes.length];
      await this.minecraft.execute(chosen);
      this.enemyCount++;
      await this.delay(400);
    }
  }

  async triggerArtilleryStrike(username?: string) {
    const safeName = username
      ? username.replace(/\\/g, "\\\\").replace(/"/g, '"')
      : "Trung tâm Chỉ huy";

    await this.minecraft.execute(
      `title @a title {"text":"💥 KHÔNG KÍCH PHÁO BINH 💥","color":"red","bold":true}`,
    );
    await this.minecraft.execute(
      `title @a subtitle {"text":"Yêu cầu bởi: ${safeName}","color":"gold"}`,
    );

    // Bedrock containment trap & artillery strike
    await this.minecraft.execute(
      "execute at @a run fill ~2 ~ ~2 ~2 ~4 ~2 bedrock",
    );
    await this.minecraft.execute(
      "execute at @a run fill ~-2 ~ ~-2 ~-2 ~4 ~-2 bedrock",
    );
    await this.delay(1000);

    for (let i = 0; i < 3; i++) {
      await this.minecraft.execute(
        "execute at @a run summon luckytntmod:gravity_tnt ~ ~5 ~",
      );
      await this.minecraft.execute(
        "execute at @a run summon lightning_bolt ~ ~ ~",
      );
      await this.delay(800);
    }

    await this.delay(1000);
    await this.minecraft.execute(
      "execute at @a run fill ~-3 ~ ~-3 ~3 ~5 ~3 air replace bedrock",
    );
  }

  async dropSupplyCrate(username: string) {
    const safeName = username.replace(/\\/g, "\\\\").replace(/"/g, '"');

    await this.minecraft.execute(
      `title @a title {"text":"📦 HÒM TIẾP TẾ QUÂN SỰ 📦","color":"gold","bold":true}`,
    );
    await this.minecraft.execute(
      `title @a subtitle {"text":"Hòm viện trợ từ: ${safeName}","color":"yellow"}`,
    );

    const supplyCommands = [
      "execute at @a run give @a enchanted_golden_apple 2",
      'execute at @a run give @a iron_chestplate{Enchantments:[{id:"minecraft:protection",lvl:4s}]} 1',
      'execute at @a run give @a tacz:modern_kinetic_gun{GunId:"tacz:glock_17",GunCurrentAmmoCount:17,HasBulletInBarrel:1b,GunFireMode:"SEMI"} 1',
      'execute at @a run give @a tacz:ammo{AmmoId:"tacz:9mm"} 120',
      "execute at @a run give @a cooked_beef 16",
    ];

    for (const cmd of supplyCommands) {
      await this.minecraft.execute(cmd);
      await this.delay(200);
    }
  }

  private async spawnInitialBaseForces() {
    await this.minecraft.execute(
      `execute at @a run summon recruits:villager_noble ~ ~ ~ {CustomName:'{"text":"[Tiền Đồn Đồng Minh]"}',RecruitCost:0,ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}],HandItems:[{id:"minecraft:iron_sword",Count:1b},{}]}`,
    );
    await this.minecraft.execute(
      `execute at @a run summon recruits:bowman ~ ~ ~ {CustomName:'{"text":"[Tháp Bắn Pháo]"}',RecruitCost:0,ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}],HandItems:[{id:"minecraft:bow",Count:1b},{}]}`,
    );
  }

  private startBattlefieldHud() {
    if (this.hudInterval) {
      clearInterval(this.hudInterval);
    }

    this.hudInterval = setInterval(() => {
      if (!this.isWarActive) {
        if (this.hudInterval) clearInterval(this.hudInterval);
        return;
      }

      void this.minecraft.execute(
        `title @a actionbar {"text":"⚔️ WORLD WAR - WAVE ${this.currentWave} ⚔️  |  🪖 Đồng minh: ${this.alliedCount}  |  🎯 Lực lượng địch: ${this.enemyCount}","color":"red","bold":true}`,
      );
    }, 1500);

    if (typeof this.hudInterval.unref === "function") {
      this.hudInterval.unref();
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

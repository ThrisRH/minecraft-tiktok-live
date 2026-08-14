import { GiftEvent } from "../../events/event.types.js";
import { ContinuousEvent, ContinuousEventContext } from "./continuous-event.js";

export class BoxingGlovesEvent extends ContinuousEvent {
  private targetX = 1500;
  private targetZ = 1500;
  private wasPlayerDead = false;
  private waterTimerSeconds = 0;
  private isLeviathanSummoned = false;
  private pendingBabyCombos = 0;

  constructor(context: ContinuousEventContext, durationSeconds = 180) {
    super(context, {
      name: "Confetti",
      defaultDurationSeconds: durationSeconds,
      hudIcon: "🌊",
      hudTitle: "ĐÁY BIỂN SÂU",
      warningTimeSeconds: 120,
      dangerTimeSeconds: 45,
    });
  }

  protected async onStart(gift: GiftEvent): Promise<void> {
    this.wasPlayerDead = false;
    this.waterTimerSeconds = 0;
    this.isLeviathanSummoned = false;
    this.pendingBabyCombos = 0;

    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');

    await this.context.execute(
      `title @a title {"text":"🌊 ĐÁY BIỂN SÂU ĐÃ XUẤT HIỆN! 🌊","color":"blue","bold":true}`,
    );
    await this.context.execute(
      `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 03:00","color":"gold"}`,
    );
    await this.context.execute(
      "playsound entity.player.splash master @a ~ ~ ~ 1 1 1",
    );

    // 1. Dò tọa độ đại dương sâu (deep ocean)
    const coords = await this.findDeepOceanCoords();
    this.targetX = coords.x;
    this.targetZ = coords.z;

    // 2. Teleport player ra giữa đại dương sâu (20 block dưới mặt nước Y=42)
    await this.context.execute(
      `execute at @a run tp @a ${this.targetX} 42 ${this.targetZ}`,
    );

    // 3. Trao hiệu ứng (bao gồm mù, thở dưới nước, night vision, conduit power)
    await this.applyOceanEffects();
  }

  protected async onExtend(count: number): Promise<void> {
    await this.applyOceanEffects();

    // Mỗi lần gửi gift cộng dồn thì summon 2 baby leviathan per extra count
    const extraBabyCount = count * 2;

    if (this.isLeviathanSummoned) {
      for (let i = 0; i < extraBabyCount; i++) {
        const offsetX = Math.floor(Math.random() * 21) - 10;
        const offsetZ = Math.floor(Math.random() * 21) - 10;
        await this.context.execute(
          `execute at @a run summon cataclysm:the_baby_leviathan ~${offsetX} ~ ~${offsetZ} {Tags:["boxing_gloves_minion"]}`,
        );
      }
      await this.context.execute(
        `title @a subtitle {"text":"💥 Triệu hồi thêm ${extraBabyCount} Baby Leviathan!","color":"red"}`,
      );
    } else {
      this.pendingBabyCombos += extraBabyCount;
    }
  }

  protected async onTick(
    _remainingSeconds: number,
    _elapsedSeconds: number,
  ): Promise<void> {
    // 1. Kiểm tra máu người chơi qua RCON
    const healthRes = (await this.context.execute(
      "data get entity @p Health",
    )) as string | undefined;

    let isDead = false;
    if (typeof healthRes === "string") {
      const match = healthRes.match(/([0-9.]+)\s*f/i);
      if (match) {
        const hp = parseFloat(match[1]);
        isDead = hp <= 0;
      } else if (healthRes.includes("No entity was found")) {
        isDead = true;
      }
    }

    if (isDead) {
      this.wasPlayerDead = true;
      return;
    }

    // 2. Nếu người chơi vừa hồi sinh: Teleport lại đại dương sâu (Y=42)
    if (this.wasPlayerDead) {
      this.wasPlayerDead = false;
      await this.context.execute(
        `execute at @a run tp @a ${this.targetX} 42 ${this.targetZ}`,
      );
      await this.applyOceanEffects();
    }

    // 3. Kiểm tra xem người chơi có ở dưới nước / ở khu vực nước không
    const blockRes = (await this.context.execute(
      "execute at @a run execute if block ~ ~ ~ minecraft:water run say in_water",
    )) as string | undefined;

    const isInWater = typeof blockRes === "string" && blockRes.includes("in_water");

    if (isInWater || !this.isLeviathanSummoned) {
      this.waterTimerSeconds++;
    }

    // 4. Nếu ở dưới nước >= 5s và chưa summon Leviathan -> Summon Leviathan + hiện thông báo + âm thanh ma mị!
    if (this.waterTimerSeconds >= 5 && !this.isLeviathanSummoned) {
      this.isLeviathanSummoned = true;
      this.respawnCooldownSeconds = 10;
      await this.summonLeviathanBoss();
    }

    if (this.respawnCooldownSeconds > 0) {
      this.respawnCooldownSeconds--;
    }

    // 5. Nếu Leviathan đã được summon và hết cooldown -> Kiểm tra xem Leviathan có còn sống không. Nếu chết -> Hồi sinh lại!
    if (this.isLeviathanSummoned && this.respawnCooldownSeconds === 0) {
      const leviathanCheck = (await this.context.execute(
        "execute at @a run execute if entity @e[type=cataclysm:the_leviathan]",
      )) as string | undefined;

      let isLeviathanAlive = false;
      if (typeof leviathanCheck === "string") {
        const lower = leviathanCheck.toLowerCase();
        isLeviathanAlive =
          (lower.includes("test passed") || lower.includes("found") || lower.includes("1")) &&
          !lower.includes("no entity") &&
          !lower.includes("test failed");
      }

      if (!isLeviathanAlive) {
        // Leviathan bị tiêu diệt -> Hồi sinh lại 1 con trong bán kính 50 block!
        this.respawnCooldownSeconds = 10;
        const offsetX = Math.floor(Math.random() * 101) - 50;
        const offsetZ = Math.floor(Math.random() * 101) - 50;
        await this.context.execute(
          `execute at @a run summon cataclysm:the_leviathan ~${offsetX} ~ ~${offsetZ} {Tags:["boxing_gloves_boss"]}`,
        );
        await this.context.execute(
          `title @a subtitle {"text":"⚡ Leviathan đã hồi sinh từ đại dương sâu!","color":"dark_red"}`,
        );
        await this.context.execute(
          "playsound minecraft:entity.elder_guardian.curse master @a ~ ~ ~ 1 0.5 1",
        );
      }
    }

    // 6. Duy trì hiệu ứng liên tục (bao gồm gây mù, thở dưới nước...)
    await this.applyOceanEffects();
  }

  protected async onEnd(): Promise<void> {
    // Dọn dẹp trùm cataclysm:the_leviathan và cataclysm:the_baby_leviathan khi kết thúc sự kiện
    await this.context.execute(
      "execute at @a run tp @e[type=cataclysm:the_leviathan,tag=boxing_gloves_boss] 0 -999 0",
    );
    await this.context.execute(
      "execute at @a run kill @e[type=cataclysm:the_leviathan,tag=boxing_gloves_boss]",
    );
    await this.context.execute(
      "execute at @a run tp @e[type=cataclysm:the_baby_leviathan,tag=boxing_gloves_minion] 0 -999 0",
    );
    await this.context.execute(
      "execute at @a run kill @e[type=cataclysm:the_baby_leviathan,tag=boxing_gloves_minion]",
    );

    // Xóa hiệu ứng
    await this.context.execute("effect clear @a minecraft:water_breathing");

    await this.context.execute(
      `title @a title {"text":"✨ ĐÁY BIỂN SÂU ĐÃ KẾT THÚC! ✨","color":"green","bold":true}`,
    );
    await this.context.execute(
      `title @a actionbar {"text":"✨ ĐÁY BIỂN SÂU ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
    );
  }

  private async summonLeviathanBoss(): Promise<void> {
    // Summon Leviathan trong bán kính 50 block quanh player
    const offsetX = Math.floor(Math.random() * 101) - 50;
    const offsetZ = Math.floor(Math.random() * 101) - 50;
    await this.context.execute(
      `execute at @a run summon cataclysm:the_leviathan ~${offsetX} ~ ~${offsetZ} {Tags:["boxing_gloves_boss"]}`,
    );

    // If there were pending baby combos, summon them too
    if (this.pendingBabyCombos > 0) {
      for (let i = 0; i < this.pendingBabyCombos; i++) {
        const offsetX = Math.floor(Math.random() * 21) - 10;
        const offsetZ = Math.floor(Math.random() * 21) - 10;
        await this.context.execute(
          `execute at @a run summon cataclysm:the_baby_leviathan ~${offsetX} ~ ~${offsetZ} {Tags:["boxing_gloves_minion"]}`,
        );
      }
      this.pendingBabyCombos = 0;
    }

    // Announce thủy quái đã tới
    await this.context.execute(
      `title @a title {"text":"☠️ THỦY QUÁI ĐÃ TỚI! ☠️","color":"dark_purple","bold":true}`,
    );
    await this.context.execute(
      `title @a subtitle {"text":"Cataclysm Leviathan đã thức giấc từ vực thẫm!","color":"red"}`,
    );

    // Âm thanh ma mị
    await this.context.execute(
      "playsound minecraft:entity.elder_guardian.curse master @a ~ ~ ~ 1 0.4 1",
    );
    await this.context.execute(
      "playsound minecraft:ambient.underwater.loop.additions.ultra_rare ambient @a ~ ~ ~ 1 0.4 1",
    );
  }

  private async findDeepOceanCoords(): Promise<{ x: number; z: number }> {
    const deepOceanBiomes = [
      "minecraft:deep_ocean",
      "minecraft:deep_lukewarm_ocean",
      "minecraft:deep_cold_ocean",
      "minecraft:deep_frozen_ocean",
    ];

    for (const biome of deepOceanBiomes) {
      try {
        const locateRes = (await this.context.execute(
          `locate biome ${biome}`,
        )) as string | undefined;

        if (typeof locateRes === "string") {
          const match = locateRes.match(
            /\[\s*(-?\d+)\s*,\s*(?:~|-?\d+)\s*,\s*(-?\d+)\s*\]/,
          );
          if (match) {
            return {
              x: parseInt(match[1], 10),
              z: parseInt(match[2], 10),
            };
          }
        }
      } catch (err) {
        console.warn(`Failed to locate ${biome}:`, err);
      }
    }

    try {
      const locateRes = (await this.context.execute(
        "locate biome #minecraft:is_ocean",
      )) as string | undefined;

      if (typeof locateRes === "string") {
        const match = locateRes.match(
          /\[\s*(-?\d+)\s*,\s*(?:~|-?\d+)\s*,\s*(-?\d+)\s*\]/,
        );
        if (match) {
          return {
            x: parseInt(match[1], 10),
            z: parseInt(match[2], 10),
          };
        }
      }
    } catch (err) {
      console.warn("Failed to locate #minecraft:is_ocean:", err);
    }

    return { x: 3000, z: 3000 };
  }

  private async applyOceanEffects(): Promise<void> {
    const duration = Math.max(10, this.remainingSeconds);

    // Thở dưới nước (water_breathing)
    await this.context.execute(
      `effect give @a minecraft:water_breathing ${duration} 0 true`,
    );
  }
}

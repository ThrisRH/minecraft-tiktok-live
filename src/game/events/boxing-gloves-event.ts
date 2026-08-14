import { GiftEvent } from "../../events/event.types.js";
import { ContinuousEvent, ContinuousEventContext } from "./continuous-event.js";

export class BoxingGlovesEvent extends ContinuousEvent {
  private wasPlayerDead = false;
  private leviathanCount = 0;
  private targetX = 3000;
  private targetY = 42;
  private targetZ = 3000;
  private static readonly MAX_LEVIATHAN = 10;

  constructor(context: ContinuousEventContext, durationSeconds = 300) {
    super(context, {
      name: "Corgi",
      defaultDurationSeconds: durationSeconds,
      hudIcon: "🌊",
      hudTitle: "LEVIATHAN",
      warningTimeSeconds: 180,
      dangerTimeSeconds: 60,
    });
  }

  protected async onStart(gift: GiftEvent): Promise<void> {
    // Reset state hoàn toàn mỗi lần kích hoạt mới
    this.wasPlayerDead = false;
    this.leviathanCount = 0;

    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');

    await this.context.execute(
      `title @a title {"text":"🌊 LEVIATHAN ĐÃ THỨC GIẤC! 🌊","color":"dark_aqua","bold":true}`,
    );
    await this.context.execute(
      `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 05:00","color":"gold"}`,
    );
    await this.context.execute(
      "playsound minecraft:entity.elder_guardian.curse master @a ~ ~ ~ 1 0.4 1",
    );
    await this.context.execute(
      "playsound minecraft:ambient.underwater.loop.additions.ultra_rare ambient @a ~ ~ ~ 1 0.4 1",
    );

    // 1. Tìm tọa độ đại dương sâu
    const coords = await this.findDeepOceanCoords();
    this.targetX = coords.x;
    this.targetY = coords.y - 20; // 20 block dưới mặt nước tìm được
    this.targetZ = coords.z;

    // 2. Teleport player xuống đại dương sâu (Y = tọa độ tìm được - 20)
    await this.context.execute(
      `execute at @a run tp @a ${this.targetX} ${this.targetY} ${this.targetZ}`,
    );

    // 3. Trao hiệu ứng thở dưới nước
    await this.applyOceanEffects();

    // 4. Đếm ngược 5 giây trước khi spawn Leviathan
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    for (let countdown = 5; countdown >= 1; countdown--) {
      await this.context.execute(
        `title @a subtitle {"text":"⚠️ Leviathan xuất hiện sau ${countdown}s...","color":"red","bold":true}`,
      );
      await sleep(1000);
    }

    // 5. Spawn con Leviathan đầu tiên với health 150
    await this.spawnFirstLeviathan();
  }

  protected async onExtend(_count: number): Promise<void> {
    // Khi user tiếp tục gửi gift trong lúc đếm ngược, chỉ cộng thêm thời gian
    // Không spawn thêm ở đây vì spawn chỉ xảy ra khi chết/hồi sinh
    await this.applyOceanEffects();
  }

  protected async onTick(
    _remainingSeconds: number,
    _elapsedSeconds: number,
  ): Promise<void> {
    // 1. Kiểm tra máu người chơi
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

    // 2. Khi người chơi chết: đánh dấu trạng thái chết
    if (isDead) {
      if (!this.wasPlayerDead) {
        this.wasPlayerDead = true;
      }
      return;
    }

    // 3. Khi người chơi hồi sinh (vừa chết, giờ sống lại):
    //    - Teleport trở lại đại dương
    //    - Spawn thêm 1 con Leviathan (tối đa 10)
    if (this.wasPlayerDead) {
      this.wasPlayerDead = false;
      await this.context.execute(
        `execute at @a run tp @a ${this.targetX} ${this.targetY} ${this.targetZ}`,
      );
      await this.applyOceanEffects();
      if (this.leviathanCount < BoxingGlovesEvent.MAX_LEVIATHAN) {
        await this.spawnAdditionalLeviathan();
      }
      return;
    }

    // 4. Duy trì hiệu ứng thở dưới nước
    await this.applyOceanEffects();
  }

  protected async onEnd(): Promise<void> {
    this.wasPlayerDead = false;
    this.leviathanCount = 0;

    // Kill tất cả leviathan
    await this.context.execute(
      "execute at @a run tp @e[type=cataclysm:the_leviathan,tag=leviathan_boss] 0 -999 0",
    );
    await this.context.execute(
      "execute at @a run kill @e[type=cataclysm:the_leviathan,tag=leviathan_boss]",
    );

    // Xóa hiệu ứng thở dưới nước
    await this.context.execute("effect clear @a minecraft:water_breathing");

    await this.context.execute(
      `title @a title {"text":"✨ LEVIATHAN ĐÃ TAN BIẾN! ✨","color":"green","bold":true}`,
    );
    await this.context.execute(
      `title @a actionbar {"text":"✨ SỰ KIỆN LEVIATHAN ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
    );
  }

  /**
   * Spawn con Leviathan đầu tiên với health 150 trong bán kính 50 block
   */
  private async spawnFirstLeviathan(): Promise<void> {
    const offsetX = Math.floor(Math.random() * 101) - 50;
    const offsetZ = Math.floor(Math.random() * 101) - 50;
    await this.context.execute(
      `execute at @a run summon cataclysm:the_leviathan ~${offsetX} ~ ~${offsetZ} {Tags:["leviathan_boss"]}`,
    );
    // Merge thêm health 150 cho con đầu tiên (gần nhất)
    await this.context.execute(
      `data merge entity @e[type=cataclysm:the_leviathan,limit=1,sort=nearest] {Health:150.0f}`,
    );
    this.leviathanCount = 1;
  }

  /**
   * Spawn thêm 1 con Leviathan ở bán kính 50 block sau khi player hồi sinh
   */
  private async spawnAdditionalLeviathan(): Promise<void> {
    const offsetX = Math.floor(Math.random() * 101) - 50;
    const offsetZ = Math.floor(Math.random() * 101) - 50;
    await this.context.execute(
      `execute at @a run summon cataclysm:the_leviathan ~${offsetX} ~ ~${offsetZ} {Tags:["leviathan_boss"]}`,
    );
    this.leviathanCount++;

    await this.context.execute(
      `title @a subtitle {"text":"⚡ Leviathan thứ ${this.leviathanCount} đã xuất hiện! (${this.leviathanCount}/${BoxingGlovesEvent.MAX_LEVIATHAN})","color":"dark_red"}`,
    );
    await this.context.execute(
      "playsound minecraft:entity.elder_guardian.curse master @a ~ ~ ~ 1 0.5 1",
    );
  }

  /**
   * Tìm tọa độ đại dương sâu gần nhất.
   * Trả về { x, y, z } — y là Y mặt nước tìm được (default 62 nếu không parse được).
   */
  private async findDeepOceanCoords(): Promise<{
    x: number;
    y: number;
    z: number;
  }> {
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
          // locate biome trả về dạng [x, y, z] hoặc [x, ~, z]
          const match = locateRes.match(
            /\[\s*(-?\d+)\s*,\s*(~|-?\d+)\s*,\s*(-?\d+)\s*\]/,
          );
          if (match) {
            const rawY = match[2];
            const y = rawY === "~" ? 62 : parseInt(rawY, 10);
            return {
              x: parseInt(match[1], 10),
              y,
              z: parseInt(match[3], 10),
            };
          }
        }
      } catch (err) {
        console.warn(`Failed to locate ${biome}:`, err);
      }
    }

    // Fallback: tìm bất kỳ biome ocean nào
    try {
      const locateRes = (await this.context.execute(
        "locate biome #minecraft:is_ocean",
      )) as string | undefined;

      if (typeof locateRes === "string") {
        const match = locateRes.match(
          /\[\s*(-?\d+)\s*,\s*(~|-?\d+)\s*,\s*(-?\d+)\s*\]/,
        );
        if (match) {
          const rawY = match[2];
          const y = rawY === "~" ? 62 : parseInt(rawY, 10);
          return {
            x: parseInt(match[1], 10),
            y,
            z: parseInt(match[3], 10),
          };
        }
      }
    } catch (err) {
      console.warn("Failed to locate #minecraft:is_ocean:", err);
    }

    // Fallback cuối: tọa độ mặc định, Y=62 (mặt nước thông thường)
    return { x: 3000, y: 62, z: 3000 };
  }

  /**
   * Duy trì hiệu ứng thở dưới nước cho player
   */
  private async applyOceanEffects(): Promise<void> {
    const duration = Math.max(10, this.remainingSeconds);
    await this.context.execute(
      `effect give @a minecraft:water_breathing ${duration} 0 true`,
    );
  }
}

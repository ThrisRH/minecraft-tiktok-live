import { GiftEvent } from "../../events/event.types.js";
import { ContinuousEvent, ContinuousEventContext } from "./continuous-event.js";

export class CorgiEvent extends ContinuousEvent {
  private corgiSpawnedBabyCount = 0;
  private corgiEnderDragonSummoned = false;

  constructor(context: ContinuousEventContext, durationSeconds = 300) {
    super(context, {
      name: "Corgi",
      defaultDurationSeconds: durationSeconds,
      hudIcon: "🐉",
      hudTitle: "CORGI DRAGON",
      warningTimeSeconds: 180,
      dangerTimeSeconds: 60,
    });
  }

  protected async onStart(gift: GiftEvent): Promise<void> {
    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');

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

    // Initial spawn: 3 baby ender dragons
    const initialBabyCount = 3;
    for (let i = 0; i < initialBabyCount; i++) {
      await this.context.execute(
        "execute at @a run summon endertrigon:baby_ender_dragon ~ 2 ~",
      );
    }

    this.corgiSpawnedBabyCount = initialBabyCount;
    this.corgiEnderDragonSummoned = false;
  }

  protected async onExtend(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.context.execute(
        "execute at @a run summon ender_dragon ~ 5 ~",
      );
    }
  }

  protected async onTick(
    remainingSeconds: number,
    elapsedSeconds: number,
  ): Promise<void> {
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
    if (remainingSeconds <= 180 && !this.corgiEnderDragonSummoned) {
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

        // End crystals rải rác bán kính 20-28 blocks
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

    // 3. Re-apply Slowness 1 periodically
    if (remainingSeconds % 30 === 0) {
      try {
        await this.context.execute(
          "execute at @a run effect give @a slowness 300 0 true",
        );
      } catch (err) {
        console.warn("Failed to reapply slowness:", err);
      }
    }
  }

  protected async onEnd(): Promise<void> {
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

    this.corgiSpawnedBabyCount = 0;
    this.corgiEnderDragonSummoned = false;
  }
}

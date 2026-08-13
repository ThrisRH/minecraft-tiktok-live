import { GiftEvent } from "../../events/event.types.js";
import { ContinuousEvent, ContinuousEventContext } from "./continuous-event.js";

export class BoxingGlovesEvent extends ContinuousEvent {
  constructor(context: ContinuousEventContext, durationSeconds = 300) {
    super(context, {
      name: "Boxing Gloves",
      defaultDurationSeconds: durationSeconds,
      hudIcon: "🌊",
      hudTitle: "ĐÁY BIỂN SÂU",
      warningTimeSeconds: 180,
      dangerTimeSeconds: 60,
    });
  }

  protected async onStart(gift: GiftEvent): Promise<void> {
    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');

    await this.context.execute(
      `title @a title {"text":"🌊 ĐÁY BIỂN SÂU ĐÃ XUẤT HIỆN! 🌊","color":"blue","bold":true}`,
    );
    await this.context.execute(
      `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 05:00","color":"gold"}`,
    );
    await this.context.execute(
      "playsound entity.player.splash master @a ~ ~ ~ 1 1 1",
    );

    // 1. Dò tọa độ đại dương sâu (deep ocean)
    let targetX = 1500;
    let targetZ = 1500;

    try {
      const locateRes = (await this.context.execute(
        "locate biome #minecraft:is_ocean",
      )) as string | undefined;

      if (typeof locateRes === "string") {
        const match = locateRes.match(/\[\s*(-?\d+)\s*,\s*(?:~|-?\d+)\s*,\s*(-?\d+)\s*\]/);
        if (match) {
          targetX = parseInt(match[1], 10);
          targetZ = parseInt(match[2], 10);
        }
      }
    } catch (err) {
      console.warn("Failed to locate ocean biome, using default ocean coords:", err);
    }

    // 2. Teleport player ra giữa đại dương (mực nước biển ~Y=62)
    await this.context.execute(
      `execute at @a run tp @a ${targetX} 62 ${targetZ}`,
    );

    // 3. Trao hiệu ứng thở dưới nước, gây mù & nhìn rõ nhẹ dưới nước
    await this.applyOceanEffects();
  }

  protected async onExtend(_count: number): Promise<void> {
    await this.applyOceanEffects();
  }

  protected async onTick(
    _remainingSeconds: number,
    _elapsedSeconds: number,
  ): Promise<void> {
    // Duy trì hiệu ứng thở dưới nước, mù và nhìn rõ dưới nước liên tục
    await this.applyOceanEffects();
  }

  protected async onEnd(): Promise<void> {
    await this.context.execute("effect clear @a minecraft:blindness");
    await this.context.execute("effect clear @a minecraft:water_breathing");
    await this.context.execute("effect clear @a minecraft:night_vision");
    await this.context.execute("effect clear @a minecraft:conduit_power");

    await this.context.execute(
      `title @a title {"text":"✨ ĐÁY BIỂN SÂU ĐÃ KẾT THÚC! ✨","color":"green","bold":true}`,
    );
    await this.context.execute(
      `title @a actionbar {"text":"✨ ĐÁY BIỂN SÂU ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
    );
  }

  private async applyOceanEffects(): Promise<void> {
    const duration = Math.max(10, this.remainingSeconds);

    // Gây mù (blindness)
    await this.context.execute(
      `effect give @a minecraft:blindness ${duration} 0 true`,
    );
    // Thở dưới nước (water_breathing)
    await this.context.execute(
      `effect give @a minecraft:water_breathing ${duration} 0 true`,
    );
    // Nhìn rõ nhẹ dưới nước (night_vision + conduit_power)
    await this.context.execute(
      `effect give @a minecraft:night_vision ${duration} 0 true`,
    );
    await this.context.execute(
      `effect give @a minecraft:conduit_power ${duration} 0 true`,
    );
  }
}

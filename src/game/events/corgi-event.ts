import { GiftEvent } from "../../events/event.types.js";
import { ContinuousEvent, ContinuousEventContext } from "./continuous-event.js";

export class CorgiEvent extends ContinuousEvent {
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
      `title @a title {"text":"🐉 CORGI DRAGON ĐÃ XUẤT HIỆN! 🐉","color":"dark_purple","bold":true}`,
    );
    await this.context.execute(
      `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 05:00","color":"gold"}`,
    );
    await this.context.execute(
      "playsound entity.ender_dragon.growl master @a ~ ~ ~ 1 1 1",
    );

    // Triệu hồi 2 con Ender Dragon cho lần đầu kích hoạt quà Corgi
    for (let i = 0; i < 2; i++) {
      await this.context.execute(
        `execute at @a run summon ender_dragon ~ ~10 ~ {DragonPhase:1,Tags:["corgi_dragon"]}`,
      );
    }
  }

  protected async onExtend(count: number): Promise<void> {
    // Với mỗi quà Corgi gửi thêm trong combo, triệu hồi thêm Ender Dragon tương ứng
    for (let i = 0; i < count; i++) {
      await this.context.execute(
        `execute at @a run summon ender_dragon ~ ~10 ~ {DragonPhase:1,Tags:["corgi_dragon"]}`,
      );
    }
  }

  protected async onTick(
    _remainingSeconds: number,
    _elapsedSeconds: number,
  ): Promise<void> {
    // Tương tự WitherStorm, thanh đếm ngược HUD actionbar được xử lý tự động trong ContinuousEvent
  }

  protected async onEnd(): Promise<void> {
    await this.context.execute(
      "execute at @a run kill @e[type=ender_dragon,tag=corgi_dragon]",
    );
    await this.context.execute(
      `title @a title {"text":"✨ SỰ KIỆN CORGI DRAGON ĐÃ KẾT THÚC! ✨","color":"green","bold":true}`,
    );
    await this.context.execute(
      "playsound entity.ender_dragon.death master @a ~ ~ ~ 1 1 1",
    );
    await this.context.execute(
      `title @a actionbar {"text":"✨ SỰ KIỆN CORGI DRAGON ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
    );
  }
}

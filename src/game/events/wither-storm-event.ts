import { GiftEvent } from "../../events/event.types.js";
import { ContinuousEvent, ContinuousEventContext } from "./continuous-event.js";

export class WitherStormEvent extends ContinuousEvent {
  constructor(context: ContinuousEventContext, durationSeconds = 600) {
    super(context, {
      name: "Money Gun",
      defaultDurationSeconds: durationSeconds,
      hudIcon: "☠️",
      hudTitle: "WITHER STORM",
      warningTimeSeconds: 300,
      dangerTimeSeconds: 120,
    });
  }

  protected async onStart(gift: GiftEvent): Promise<void> {
    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');

    await this.context.execute(
      `title @a title {"text":"☠️ WITHER STORM ĐÃ XUẤT HIỆN! ☠️","color":"dark_red","bold":true}`,
    );
    await this.context.execute(
      `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 10:00","color":"gold"}`,
    );
    await this.context.execute(
      "playsound entity.wither.spawn master @a ~ ~ ~ 1 1 1",
    );

    // Triệu hồi 1 con Wither Storm Phase 7 cho quà 1
    await this.context.execute(
      "execute at @a run summon witherstormmod:wither_storm ~ ~ ~ {Phase:7,ConsumedEntities:2125001}",
    );

    // Triệu hồi thêm 3 con Wither thường
    for (let i = 0; i < 3; i++) {
      await this.context.execute(
        'execute at @a run summon wither ~ ~ ~ {Tags:["money_gun_wither"]}',
      );
    }
  }

  protected async onExtend(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.context.execute(
        "execute at @a run summon witherstormmod:wither_storm ~ ~ ~ {Phase:4}",
      );
    }
  }

  protected async onTick(
    _remainingSeconds: number,
    _elapsedSeconds: number,
  ): Promise<void> {
    // Tự động phát hiện: nếu tất cả 3 Wither thường bị tiêu diệt hết trong thời gian đếm ngược, triệu hồi lại 3 Wither thường mới
    await this.context.execute(
      'execute unless entity @e[type=wither,tag=money_gun_wither] run summon wither ~ ~ ~ {Tags:["money_gun_wither","wither_batch"]}',
    );
    await this.context.execute(
      'execute if entity @e[type=wither,tag=wither_batch] run summon wither ~ ~ ~ {Tags:["money_gun_wither"]}',
    );
    await this.context.execute(
      'execute if entity @e[type=wither,tag=wither_batch] run summon wither ~ ~ ~ {Tags:["money_gun_wither"]}',
    );
    await this.context.execute(
      'execute if entity @e[tag=wither_batch] run tag @e[tag=wither_batch] remove wither_batch',
    );
  }

  protected async onEnd(): Promise<void> {
    await this.context.execute(
      "execute at @a run kill @e[type=witherstormmod:wither_storm]",
    );
    await this.context.execute(
      "execute at @a run kill @e[type=wither,tag=money_gun_wither]",
    );
    await this.context.execute(
      `title @a title {"text":"✨ WITHER STORM ĐÃ TAN BIẾN! ✨","color":"green","bold":true}`,
    );
    await this.context.execute(
      "playsound entity.wither.death master @a ~ ~ ~ 1 1 1",
    );
    await this.context.execute(
      `title @a actionbar {"text":"✨ WITHER STORM ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
    );
  }
}

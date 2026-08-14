import { GiftEvent } from "../../events/event.types.js";
import { ContinuousEvent, ContinuousEventContext } from "./continuous-event.js";

export class CorgiEvent extends ContinuousEvent {
  private wasPlayerDead = false;

  constructor(context: ContinuousEventContext, durationSeconds = 300) {
    super(context, {
      name: "Confetti",
      defaultDurationSeconds: durationSeconds,
      hudIcon: "🐉",
      hudTitle: "ĐẠI TIỆC NHÀ RỒNG",
      warningTimeSeconds: 180,
      dangerTimeSeconds: 60,
    });
  }

  protected async onStart(gift: GiftEvent): Promise<void> {
    this.wasPlayerDead = false;
    const safeUser = gift.username.replace(/\\/g, "\\\\").replace(/"/g, '"');

    await this.context.execute(
      `title @a title {"text":"🐉 ĐẠI TIỆC NHÀ RỒNG ĐÃ XUẤT HIỆN! 🐉","color":"dark_purple","bold":true}`,
    );
    await this.context.execute(
      `title @a subtitle {"text":"Người gọi: ${safeUser} | Thời gian: 05:00","color":"gold"}`,
    );
    await this.context.execute(
      "playsound entity.ender_dragon.growl master @a ~ ~ ~ 1 1 1",
    );

    // Triệu hồi 2 con Ender Dragon cho lần đầu kích hoạt sự kiện
    for (let i = 0; i < 2; i++) {
      await this.context.execute(
        `execute at @p run summon ender_dragon ~ ~10 ~ {DragonPhase:1,Tags:["corgi_dragon"]}`,
      );
    }
  }

  protected async onExtend(count: number): Promise<void> {
    // Với mỗi quà gửi thêm trong combo, triệu hồi thêm Ender Dragon tương ứng
    for (let i = 0; i < count; i++) {
      await this.context.execute(
        `execute at @p run summon ender_dragon ~ ~10 ~ {DragonPhase:1,Tags:["corgi_dragon"]}`,
      );
    }
  }

  protected async onTick(
    _remainingSeconds: number,
    _elapsedSeconds: number,
  ): Promise<void> {
    // 1. Kiểm tra lượng máu của người chơi qua RCON
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

    // 2. Nếu người chơi chết: lập tức xóa rồng và dừng triệu hồi rồng mới trong lúc chờ hồi sinh
    if (isDead) {
      if (!this.wasPlayerDead) {
        this.wasPlayerDead = true;
        await this.context.execute(
          "execute at @a run tp @e[type=ender_dragon,tag=corgi_dragon] 0 -999 0",
        );
        await this.context.execute(
          "execute at @a run kill @e[type=ender_dragon,tag=corgi_dragon]",
        );
      }
      return;
    }

    // 3. Nếu người chơi vừa hồi sinh (trước đó bị chết, giờ đã sống lại)
    if (this.wasPlayerDead) {
      this.wasPlayerDead = false;
      for (let i = 0; i < 2; i++) {
        await this.context.execute(
          `execute at @p run summon ender_dragon ~ ~10 ~ {DragonPhase:1,Tags:["corgi_dragon"]}`,
        );
      }
      return;
    }

    // 4. Nếu người chơi đang sống bình thường: Dọn dẹp rồng đã hết máu và tự động triệu hồi 2 rồng mới nếu rồng bị diệt hết
    await this.context.execute(
      "execute as @e[type=ender_dragon,tag=corgi_dragon,nbt={Health:0f}] run tp @s 0 -999 0",
    );
    await this.context.execute(
      "execute as @e[type=ender_dragon,tag=corgi_dragon,nbt={Health:0f}] run kill @s",
    );

    await this.context.execute(
      'execute unless entity @e[type=ender_dragon,tag=corgi_dragon] run execute at @p run summon ender_dragon ~ ~10 ~ {DragonPhase:1,Tags:["corgi_dragon","corgi_batch"]}',
    );
    await this.context.execute(
      'execute if entity @e[type=ender_dragon,tag=corgi_batch] run execute at @p run summon ender_dragon ~ ~10 ~ {DragonPhase:1,Tags:["corgi_dragon"]}',
    );
    await this.context.execute(
      "execute if entity @e[tag=corgi_batch] run tag @e[tag=corgi_batch] remove corgi_batch",
    );
  }

  protected async onEnd(): Promise<void> {
    this.wasPlayerDead = false;
    await this.context.execute(
      "execute at @a run tp @e[type=ender_dragon,tag=corgi_dragon] 0 -999 0",
    );
    await this.context.execute(
      "execute at @a run kill @e[type=ender_dragon,tag=corgi_dragon]",
    );
    await this.context.execute(
      `title @a title {"text":"✨ SỰ KIỆN ĐẠI TIỆC NHÀ RỒNG ĐÃ KẾT THÚC! ✨","color":"green","bold":true}`,
    );
    await this.context.execute(
      "playsound entity.ender_dragon.death master @a ~ ~ ~ 1 1 1",
    );
    await this.context.execute(
      `title @a actionbar {"text":"✨ SỰ KIỆN ĐẠI TIỆC NHÀ RỒNG ĐÃ KẾT THÚC ✨","color":"green","bold":true}`,
    );
  }
}

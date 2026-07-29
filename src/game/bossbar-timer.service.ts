import { MinecraftService } from "../minecraft/minecraft.service.js";

export class BossbarTimerService {
  private timer?: NodeJS.Timeout;
  private remainingSeconds: number;
  private readonly totalSeconds: number;

  constructor(
    private readonly minecraft: MinecraftService,
    durationSeconds = 3600, // 1 tiếng = 3600s
  ) {
    this.totalSeconds = durationSeconds;
    this.remainingSeconds = durationSeconds;
  }

  async start() {
    this.stop();
    this.remainingSeconds = this.totalSeconds;

    // Reset bossbar cũ nếu tồn tại
    const oldBossbars = [
      "minecraft:live_timer",
      "minecraft:top_spacer",
      "live_timer",
      "top_spacer",
      "minecraft:timer",
      "timer",
    ];

    for (const id of oldBossbars) {
      try {
        await this.minecraft.execute(`bossbar remove ${id}`);
      } catch {
        // Bỏ qua nếu không tồn tại
      }
    }

    // Tạo bossbar Ender Dragon (màu pink, kiểu notched_10)
    await this.minecraft.execute(
      'bossbar add minecraft:live_timer "THỜI GIAN LIVE"',
    );
    await this.minecraft.execute("bossbar set minecraft:live_timer players @a");
    await this.minecraft.execute(
      `bossbar set minecraft:live_timer max ${this.totalSeconds}`,
    );
    await this.minecraft.execute(
      `bossbar set minecraft:live_timer value ${this.remainingSeconds}`,
    );
    await this.minecraft.execute(
      "bossbar set minecraft:live_timer color green",
    );
    await this.minecraft.execute(
      "bossbar set minecraft:live_timer style notched_6",
    );

    // Cập nhật hiển thị ban đầu
    await this.updateDisplay();

    console.log(
      `⏱️ Đã khởi tạo Bossbar Countdown Live: ${this.formatTime(this.remainingSeconds)}`,
    );

    // Đếm ngược real-time mỗi giây
    this.timer = setInterval(() => {
      void this.tick();
    }, 1000);
  }

  private async tick() {
    if (this.remainingSeconds <= 0) {
      this.stop();
      await this.minecraft.execute(
        'bossbar set minecraft:live_timer name {"text":"🎉 HẾT GIỜ LIVE! 🎉","color":"green","bold":true}',
      );
      await this.minecraft.execute("bossbar set minecraft:live_timer value 0");
      await this.minecraft.execute(
        "bossbar set minecraft:live_timer color green",
      );
      return;
    }

    this.remainingSeconds--;
    await this.updateDisplay();
  }

  private async updateDisplay() {
    const formatted = this.formatTime(this.remainingSeconds);
    const safeText = `⏳ THỜI GIAN LIVE: ${formatted}`;

    // Đảm bảo gán bossbar cho tất cả người chơi online (@a) liên tục mỗi giây
    await this.minecraft.execute("bossbar set minecraft:live_timer players @a");
    await this.minecraft.execute(
      "bossbar set minecraft:live_timer color green",
    );
    await this.minecraft.execute(
      "bossbar set minecraft:live_timer style notched_6",
    );

    await this.minecraft.execute(
      `bossbar set minecraft:live_timer name {"text":"${safeText}","color":"light_purple","bold":true}`,
    );
    await this.minecraft.execute(
      `bossbar set minecraft:live_timer value ${this.remainingSeconds}`,
    );
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
}

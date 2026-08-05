import { GiftEvent } from "../../events/event.types.js";

export interface ContinuousEventContext {
  execute(command: string): Promise<unknown>;
  sendMessage(text: string): Promise<void>;
  showLiveParticipant(
    username: string,
    giftName?: string,
    count?: number,
  ): Promise<void>;
}

export interface ContinuousEventOptions {
  name: string;
  defaultDurationSeconds: number;
  hudIcon: string;
  hudTitle: string;
  warningTimeSeconds?: number;
  dangerTimeSeconds?: number;
}

export abstract class ContinuousEvent {
  protected remainingSeconds = 0;
  protected timerId?: NodeJS.Timeout;

  constructor(
    protected readonly context: ContinuousEventContext,
    protected readonly options: ContinuousEventOptions,
  ) {}

  public isRunning(): boolean {
    return !!this.timerId;
  }

  public getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  async trigger(gift: GiftEvent): Promise<void> {
    try {
      await this.context.sendMessage(
        `${gift.username} đã gửi x${gift.count} ${this.options.name}!`,
      );
    } catch (error) {
      console.warn(`Failed to send ${this.options.name} gift notification:`, error);
    }

    try {
      await this.context.showLiveParticipant(
        gift.username,
        gift.giftName ?? this.options.name,
        gift.count,
      );
    } catch (error) {
      console.warn(`Failed to show live participant for ${this.options.name}:`, error);
    }

    const totalCount = Math.max(1, gift.count ?? 1);
    const duration = this.options.defaultDurationSeconds;

    if (!this.isRunning()) {
      await this.onStart(gift);

      const extraCount = totalCount - 1;
      if (extraCount > 0) {
        this.remainingSeconds += extraCount * duration;
        await this.onExtend(extraCount);
      }

      this.startCountdown();
    } else {
      this.remainingSeconds += totalCount * duration;
      await this.onExtend(totalCount);
    }
  }

  protected abstract onStart(gift: GiftEvent): Promise<void>;
  protected abstract onExtend(count: number): Promise<void>;
  protected abstract onTick(remainingSeconds: number, elapsedSeconds: number): Promise<void>;
  protected abstract onEnd(): Promise<void>;

  private startCountdown() {
    if (this.timerId) {
      return;
    }

    this.remainingSeconds = this.options.defaultDurationSeconds;
    const initialDuration = this.options.defaultDurationSeconds;

    const tick = async () => {
      this.remainingSeconds -= 1;

      if (this.remainingSeconds <= 0) {
        if (this.timerId) {
          clearInterval(this.timerId);
          this.timerId = undefined;
        }

        try {
          await this.onEnd();
        } catch (error) {
          console.warn(`Failed to finalize ${this.options.name} countdown:`, error);
        }
        return;
      }

      const remaining = this.remainingSeconds;
      const elapsedSeconds = initialDuration - remaining;

      try {
        await this.onTick(remaining, elapsedSeconds);
      } catch (error) {
        console.warn(`Error during ${this.options.name} event tick:`, error);
      }

      await this.updateHud();
    };

    const timer = setInterval(() => {
      void tick();
    }, 1000);

    if (typeof timer.unref === "function") {
      timer.unref();
    }
    this.timerId = timer;
  }

  protected async updateHud() {
    const remaining = this.remainingSeconds;
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    const totalBars = 10;
    const filledBars = Math.max(
      0,
      Math.min(
        totalBars,
        Math.ceil((remaining / this.options.defaultDurationSeconds) * totalBars),
      ),
    );
    const barStr = "▰".repeat(filledBars) + "▱".repeat(totalBars - filledBars);

    let color = "#A855F7";
    const dangerTime = this.options.dangerTimeSeconds ?? 60;
    const warningTime = this.options.warningTimeSeconds ?? 180;

    if (remaining <= dangerTime) {
      color = "red";
    } else if (remaining <= warningTime) {
      color = "yellow";
    }

    const { hudIcon, hudTitle } = this.options;
    try {
      await this.context.execute(
        `title @a actionbar {"text":"${hudIcon} ${hudTitle} ${hudIcon}  [${barStr}]  ⏱️ ${mm}:${ss}","color":"${color}","bold":true}`,
      );
    } catch (error) {
      console.warn(`Failed to send ${this.options.name} actionbar HUD:`, error);
    }
  }

  public stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
    this.remainingSeconds = 0;
  }
}

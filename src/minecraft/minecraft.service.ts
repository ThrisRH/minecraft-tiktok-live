import { Rcon } from "rcon-client";
import { connectRcon } from "./rcon.js";
import { summonZombie } from "./commands/mob.command.js";

export class MinecraftService {
  private rcon?: Rcon;
  private connected = false;
  private commandQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  async connect() {
    this.rcon = await connectRcon();
    this.connected = true;
  }

  async disconnect() {
    if (this.rcon && this.connected) {
      await this.rcon.end();
    }

    this.connected = false;
    this.rcon = undefined;
  }

  async execute(command: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      this.commandQueue.push(async () => {
        const res = await this.executeInternal(command);
        resolve(res);
      });
      void this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.commandQueue.length > 0) {
      const task = this.commandQueue.shift();
      if (task) {
        await task();
      }
    }

    this.isProcessingQueue = false;
  }

  private async executeInternal(command: string): Promise<string | undefined> {
    if (!this.connected || !this.rcon) {
      try {
        await this.connect();
      } catch (error) {
        console.warn(
          `Minecraft RCON not connected and reconnect failed for command: ${command}`,
          error,
        );
        return;
      }
    }

    try {
      return await this.rcon!.send(command);
    } catch (error) {
      console.warn("Minecraft command failed:", error);
      this.connected = false;
      this.rcon = undefined;

      try {
        await this.connect();
      } catch (reconnectError) {
        console.warn("Minecraft RCON reconnect failed:", reconnectError);
        return;
      }

      try {
        return await this.rcon!.send(command);
      } catch (retryError) {
        console.warn("Minecraft command retry failed:", retryError);
      }
    }
  }

  async say(message: string) {
    return this.execute(`say ${message}`);
  }

  async summonZombie() {
    await this.execute(summonZombie());
  }
}

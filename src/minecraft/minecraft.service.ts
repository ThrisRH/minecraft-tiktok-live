import { Rcon } from "rcon-client";
import { connectRcon } from "./rcon.js";
import { summonZombie } from "./commands/mob.command.js";

export class MinecraftService {
  private rcon?: Rcon;
  private connected = false;

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

  async execute(command: string) {
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

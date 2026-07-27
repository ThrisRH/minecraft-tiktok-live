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
      console.warn(
        `Minecraft RCON not connected, skipping command: ${command}`,
      );
      return;
    }

    try {
      return await this.rcon.send(command);
    } catch (error) {
      console.warn("Minecraft command failed:", error);
      this.connected = false;
      this.rcon = undefined;
    }
  }

  async say(message: string) {
    return this.execute(`say ${message}`);
  }

  async summonZombie() {
    await this.execute(summonZombie());
  }
}

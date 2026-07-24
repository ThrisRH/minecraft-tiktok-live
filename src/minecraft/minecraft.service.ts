import { Rcon } from "rcon-client";
import { connectRcon } from "./rcon.js";
import { summonZombie } from "./commands/mob.command.js";

export class MinecraftService {
  private rcon!: Rcon;

  async connect() {
    this.rcon = await connectRcon();
  }

  async disconnect() {
    await this.rcon.end();
  }

  async execute(command: string) {
    return this.rcon.send(command);
  }

  async say(message: string) {
    return this.execute(`say ${message}`);
  }

  async summonZombie() {
    await this.execute(summonZombie());
  }
}

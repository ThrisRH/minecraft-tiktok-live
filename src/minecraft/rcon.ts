import { Rcon } from "rcon-client";
import dotenv from "dotenv";

dotenv.config();

export async function connectRcon() {
  return await Rcon.connect({
    host: process.env.RCON_HOST!,
    port: Number(process.env.RCON_PORT),
    password: process.env.RCON_PASSWORD!,
  });
}

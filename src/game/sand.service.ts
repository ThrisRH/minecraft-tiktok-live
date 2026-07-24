import { MinecraftService } from "../minecraft/minecraft.service.js";

export class SandService {
  constructor(private minecraft: MinecraftService) {}

  async createSandTower(x: number, y: number, z: number) {
    const width = 8;
    const height = 36;

    for (let layer = 0; layer < height; layer++) {
      const block = this.randomSand();

      await this.minecraft.execute(
        `fill ${x} ${y + layer} ${z} ${x + width - 1} ${y + layer} ${z + width - 1} ${block}`,
      );
    }
  }

  private randomSand() {
    const blocks = [
      "sand",
      "red_sand",
      "white_concrete_powder",
      "orange_concrete_powder",
      "yellow_concrete_powder",
      "brown_concrete_powder",
      "red_concrete_powder",
      "pink_concrete_powder",
      "light_blue_concrete_powder",
      "cyan_concrete_powder",
      "lime_concrete_powder",
      "green_concrete_powder",
      "blue_concrete_powder",
      "purple_concrete_powder",
      "magenta_concrete_powder",
      "gray_concrete_powder",
      "light_gray_concrete_powder",
      "black_concrete_powder",
    ];

    return blocks[Math.floor(Math.random() * blocks.length)];
  }
}

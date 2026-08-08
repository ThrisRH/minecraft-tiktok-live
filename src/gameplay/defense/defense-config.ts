export const supportedGiftNames = [
  "Mic x10",
  "Heart",
  "Zombie",
  "Rose",
  "Creeper",
  "TikTok",
  "Iron Golem",
  "Lightning",
  "Perfume",
  "Lucky Box",
  "Cap",
  "Bat",
  "GG Coin",
  "Cage",
  "Sunflower",
  "Cake",
  "Fox",
  "Steve",
  "Boxing Gloves",
  "Sand Block",
  "TNT",
  "Ice",
  "Paintings",
  "Origami Bird",
  "Wolf",
  "GG",
  "Bomb",
  "Meat",
  "Golden Apple",
  "Chips",
  "End Portal",
  "Fish",
  "Iron Golem Statue",
  "Straw Hat",
  "Rifle",
  "Love Glasses",
  "Rosa",
] as const;

export type DefenseGiftName = (typeof supportedGiftNames)[number];

export interface DefenseModeConfig {
  baseMaxHealth: number;
  initialWave: number;
  mobSpawnDelayMs: number;
  likeMilestoneInterval: number;
  minSpawnDistance: number; // Khoảng cách spawn tối thiểu (mặc định 50 block)
}

export const DEFAULT_MIN_SPAWN_DISTANCE = 50;

export const defaultDefenseConfig: DefenseModeConfig = {
  baseMaxHealth: 100,
  initialWave: 1,
  mobSpawnDelayMs: 500,
  likeMilestoneInterval: 50,
  minSpawnDistance: DEFAULT_MIN_SPAWN_DISTANCE,
};

/**
 * Hàm tính vị trí offset (x, z) cách player tối thiểu minDistance block (mặc định 50 block).
 * Đảm bảo quái luôn được spawn ở ngoài vùng an toàn cách player >= 50 block.
 */
export function getDefenseSpawnOffset(
  minDistance: number = DEFAULT_MIN_SPAWN_DISTANCE,
): { x: number; z: number } {
  const angle = Math.random() * 2 * Math.PI;
  const radius = minDistance + 0.5 + Math.random() * 5;
  let x = Math.round(radius * Math.cos(angle));
  let z = Math.round(radius * Math.sin(angle));

  // Đảm bảo khoảng cách Euclid luôn >= minDistance
  while (Math.hypot(x, z) < minDistance) {
    if (x >= 0) x++;
    else x--;
    if (z >= 0) z++;
    else z--;
  }

  return { x, z };
}

/**
 * Helper tạo câu lệnh Minecraft summon mob tại vị trí cách player >= minDistance block.
 */
export function buildDefenseSummonCommand(
  mobEntity: string,
  minDistance: number = DEFAULT_MIN_SPAWN_DISTANCE,
  extraNbt = "",
): string {
  const { x, z } = getDefenseSpawnOffset(minDistance);
  const nbtStr = extraNbt ? ` ${extraNbt}` : "";
  return `execute at @a run summon ${mobEntity} ~${x} ~ ~${z}${nbtStr}`;
}

/**
 * Mapping gift names to Defense gameplay actions.
 */
export const defenseGiftMap: Record<string, string> = {
  Rose: "roseGift",
  Zombie: "zombieGift",
  Creeper: "creeperGift",
  TikTok: "tiktokGift",
  Rosa: "rosaGift",
  "Iron Golem": "ironGolemGift",
  "Sand Block": "sandBlockGift",
  TNT: "tntGift",
  Lightning: "lightningGift",
  "Golden Apple": "goldenAppleGift",
  Cage: "cageGift",
  Bomb: "bombGift",
};

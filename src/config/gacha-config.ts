export interface GachaOption {
  id: string;
  name: string; // Tên hiển thị nhảy trên màn hình khi quay (ví dụ: "Sấm Sét", "Mưa TNT")
  command: string; // Lệnh Minecraft custom sẽ kích hoạt khi trúng
  count?: number; // Số lượng triệu hồi / thực thi lệnh (mặc định là 1, ví dụ: 5 con zombie)
  weight: number; // Tỉ lệ / trọng số (ví dụ: 10 là phổ biến, 1 là hiếm)
  color?: string; // Màu chữ hiển thị trên màn hình ("gold", "aqua", "red", "yellow", v.v.)
}

export const defaultGachaOptions: GachaOption[] = [
  // common
  {
    id: "bread",
    name: "Bánh mì thịt x8",
    command: "execute at @a run give @a bread 8",
    weight: 10,
    color: "gray",
  },
  {
    id: "zombie",
    name: "Zombie thường x5",
    command: "execute at @a run summon zombie ~ ~ ~",
    count: 5,
    weight: 10,
    color: "gray",
  },
  {
    id: "creeper",
    name: "Creeper thường x5",
    command: "execute at @a run summon creeper ~ ~ ~",
    count: 5,
    weight: 10,
    color: "gray",
  },

  // uncommon
  {
    id: "pillager",
    name: "Toán Cướp Pillager x2",
    command: "execute at @a run summon pillager ~ ~ ~",
    count: 2,
    weight: 8,
    color: "green",
  },
  {
    id: "creeper",
    name: "Super Creeper",
    command:
      'execute at @a run summon minecraft:creeper ~ ~ ~ {powered:1b,Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.6}]}',
    weight: 8,
    color: "green",
  },
  {
    id: "lightning",
    name: "Cú đấm sấm sét",
    command: "execute at @a run summon lightning_bolt ~ ~ ~",
    weight: 8,
    color: "green",
  },
  {
    id: "zombie_speeder",
    name: "Zombie tốc độ x5",
    command:
      'execute at @a run summon zombie ~ ~ ~ {ArmorItems:[{id:"leather_helmet",Count:1b}],Attributes:[{Name:"generic.movement_speed",Base:1}]}',
    count: 5,
    weight: 8,
    color: "green",
  },

  // Rare
  {
    id: "ravager",
    name: "Quái Thú Ravager",
    command: "execute at @a run summon ravager ~ ~ ~",
    weight: 5,
    color: "blue",
  },
  {
    id: "golden_apple",
    name: "Táo vàng x1",
    command: "execute at @a run give @a golden_apple",
    weight: 5,
    color: "blue",
  },

  // Epic
  {
    id: "zombie_stunami",
    name: "Đại dịch Zombie",
    command:
      'execute at @a run summon minecraft:zombie ~ ~ ~ {ArmorItems:[{id:"minecraft:iron_boots",Count:1b},{id:"minecraft:iron_leggings",Count:1b},{id:"minecraft:iron_chestplate",Count:1b},{id:"minecraft:iron_helmet",Count:1b}],Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.45}]}',
    weight: 5,
    count: 10,
    color: "#A855F7",
  },
  {
    id: "to_heaven",
    name: "Lên thiên đường",
    command: "execute at @a run tp @a ~ 500 ~",
    weight: 5,
    color: "#A855F7",
  },

  // Legen
  {
    id: "grande_finale",
    name: "Ending Fairy",
    command: "execute at @a run summon luckytntmod:grande_finale",
    weight: 1,
    color: "gold",
  },
];

export const rosaGachaOptions: GachaOption[] = [
  // Common
  {
    id: "mini_creeper",
    name: "Anh em Creeper cảm tử",
    command:
      'execute at @a run summon mutantmonsters:creeper_minion ~ ~ ~ {Attributes:[{Name:"minecraft:generic.movement_speed",Base:1}]}',
    count: 20,
    weight: 16,
    color: "#A855F7",
  },
  {
    id: "mutant_creeper",
    name: "Creeper đột biến x1",
    command:
      'execute at @a run summon mutantmonsters:mutant_creeper ~ ~ ~ {Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.5}]}',
    count: 1,
    weight: 14,
    color: "gold",
  },
  {
    id: "mutant_zombie",
    name: "Zombie đột biến x1",
    command:
      'execute at @a run summon mutantmonsters:mutant_zombie ~ ~ ~ {Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.5}]}',
    weight: 15,
    color: "gold",
  },
  {
    id: "mutant_skeleton",
    name: "Skeleton đột biến x1",
    command:
      'execute at @a run summon mutantmonsters:mutant_skeleton ~ ~ ~ {Attributes:[{Name:"minecraft:generic.movement_speed"}]}',
    weight: 12,
    color: "gold",
  },

  // Mythic (Tổng trọng số 3 / 60 = 5.0%)
  {
    id: "mutant_wither_skeleton",
    name: "Wither Skeleton đột biến x1",
    command: "execute at @a run summon mutantmore:mutant_wither_skeleton ~ ~ ~",
    weight: 1,
    color: "red",
  },
  {
    id: "mutant_jungle_zombie",
    name: "Jungle Zombie đột biến x1",
    command: "execute at @a run summon mutantmore:mutant_jungle_zombie ~ ~ ~",
    weight: 1,
    color: "red",
  },
  {
    id: "mutant_shulker",
    name: "Shulker đột biến x1",
    command: "execute at @a run summon mutantmore:mutant_shulker ~ ~ ~",
    weight: 1,
    color: "red",
  },
];

export const shamrockGachaOptions: GachaOption[] = [
  // Common: +2 trái tim (Health Boost level 0 -> +4 HP)
  {
    id: "combo_vua_thay_than",
    name: "combo vừa thay thận",
    command:
      "execute at @a run effect give @a minecraft:health_boost 999999 0 true; execute at @a run effect give @a minecraft:instant_health 1 255 true",
    weight: 30,
    color: "gray",
  },

  // Rare: Táo vàng phù phép + táo vàng x 2
  {
    id: "enchanted_gapple_and_gapples",
    name: "Ăn lấy tí lộc tí lá",
    command:
      "execute at @a run give @a enchanted_golden_apple 1; execute at @a run give @a golden_apple 2",
    weight: 20,
    color: "blue",
  },

  // Rare: Full giáp sắt + kiếm sắt + khiên
  {
    id: "iron_armor_sword_shield",
    name: "Combo đời bạc",
    command:
      "execute at @a run give @a iron_helmet 1; execute at @a run give @a iron_chestplate 1; execute at @a run give @a iron_leggings 1; execute at @a run give @a iron_boots 1; execute at @a run give @a iron_sword 1; execute at @a run give @a shield 1",
    weight: 20,
    color: "blue",
  },

  // Uncommon: Combo thợ đục (Cúp sắt + Áo da chống nổ tối đa)
  {
    id: "miner_combo",
    name: "Combo thợ đục",
    command:
      'execute at @a run give @a iron_pickaxe 1; execute at @a run give @a leather_chestplate{Enchantments:[{id:"minecraft:blast_protection",lvl:5s}]} 1',
    weight: 15,
    color: "green",
  },

  // Epic: Combo vua lì đòn
  {
    id: "iron_armor_epic_set",
    name: "Combo vua lì đòn",
    command:
      'execute at @a run give @a iron_helmet 1; execute at @a run give @a diamond_chestplate{Enchantments:[{id:"minecraft:blast_protection",lvl:5s}]} 1; execute at @a run give @a iron_leggings 1; execute at @a run give @a iron_boots{Enchantments:[{id:"minecraft:feather_falling",lvl:4s}]} 1; execute at @a run give @a iron_sword 1',
    weight: 12,
    color: "#A855F7",
  },

  // Epic: Combo dân chủ (Full giáp sắt protection & blast 3 + SPAS-12 full attachments + 60 đạn 12g)
  {
    id: "democracy_combo_epic",
    name: "Combo Dân Chủ",
    command:
      'execute at @a run give @a iron_helmet{Enchantments:[{id:"minecraft:protection",lvl:3s},{id:"minecraft:blast_protection",lvl:3s}]} 1; execute at @a run give @a iron_chestplate{Enchantments:[{id:"minecraft:protection",lvl:3s},{id:"minecraft:blast_protection",lvl:3s}]} 1; execute at @a run give @a iron_leggings{Enchantments:[{id:"minecraft:protection",lvl:3s},{id:"minecraft:blast_protection",lvl:3s}]} 1; execute at @a run give @a iron_boots{Enchantments:[{id:"minecraft:protection",lvl:3s},{id:"minecraft:blast_protection",lvl:3s}]} 1; execute at @a run give @a tacz:modern_kinetic_gun{GunId:"tacz:spas_12",GunCurrentAmmoCount:8,HasBulletInBarrel:1b,GunFireMode:"SEMI",AttachmentEXTENDED_MAG:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:shotgun_extended_mag_3"}},AttachmentSCOPE:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:sight_coyote"}},AttachmentMUZZLE:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:muzzle_silencer_sg"}},AttachmentSTOCK:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:stock_heavy_spas_12"}}} 1; execute at @a run give @a tacz:ammo{AmmoId:"tacz:12g"} 60',
    weight: 12,
    color: "#A855F7",
  },

  // Epic: Combo người không phổi (+10 trái tim)
  {
    id: "combo_nguoi_khong_phoi",
    name: "combo người không phổi",
    command:
      "execute at @a run effect give @a minecraft:health_boost 999999 4 true; execute at @a run effect give @a minecraft:instant_health 1 255 true",
    weight: 12,
    color: "#A855F7",
  },

  // Legend: Full set kim cương (full protection & chống nổ) + kiếm kim cương (sharpness & smite) + khiên
  {
    id: "legend_diamond_set_and_shield",
    name: "Combo siu cấp dô địch",
    command:
      'execute at @a run give @a diamond_helmet{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:blast_protection",lvl:4s}]} 1; execute at @a run give @a diamond_chestplate{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:blast_protection",lvl:4s}]} 1; execute at @a run give @a diamond_leggings{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:blast_protection",lvl:4s}]} 1; execute at @a run give @a diamond_boots{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:blast_protection",lvl:4s}]} 1; execute at @a run give @a diamond_sword{Enchantments:[{id:"minecraft:sharpness",lvl:5s},{id:"minecraft:smite",lvl:5s}]} 1; execute at @a run give @a shield 1',
    weight: 6,
    color: "gold",
  },

  // Legend: Combo SCAR-L (Full giáp kim cương protection/blast 5 & feather falling 4 + SCAR-L full attachments + 61 đạn 556x45)
  {
    id: "legend_scar_l_combo",
    name: "Combo SCAR-L",
    command:
      'execute at @a run give @a diamond_helmet{Enchantments:[{id:"minecraft:protection",lvl:5s},{id:"minecraft:blast_protection",lvl:5s}]} 1; execute at @a run give @a diamond_chestplate{Enchantments:[{id:"minecraft:protection",lvl:5s},{id:"minecraft:blast_protection",lvl:5s}]} 1; execute at @a run give @a diamond_leggings{Enchantments:[{id:"minecraft:protection",lvl:5s},{id:"minecraft:blast_protection",lvl:5s}]} 1; execute at @a run give @a diamond_boots{Enchantments:[{id:"minecraft:protection",lvl:5s},{id:"minecraft:blast_protection",lvl:5s},{id:"minecraft:feather_falling",lvl:4s}]} 1; execute at @a run give @a tacz:modern_kinetic_gun{GunId:"tacz:scar_l",GunCurrentAmmoCount:65,HasBulletInBarrel:1b,GunFireMode:"AUTO",AttachmentEXTENDED_MAG:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:extended_mag_3"}},AttachmentSCOPE:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:sight_pk06_rifle"}},AttachmentMUZZLE:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:muzzle_compensator_trident"}},AttachmentLASER:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:laser_lopro"}},AttachmentGRIP:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:grip_vertical_ranger"}},AttachmentSTOCK:{id:"tacz:attachment",Count:1b,tag:{AttachmentId:"tacz:stock_ripstock"}}} 1; execute at @a run give @a tacz:ammo{AmmoId:"tacz:556x45"} 61',
    weight: 6,
    color: "gold",
  },

  // Legend: Combo đã uống sữa ensure (+20 trái tim)
  {
    id: "combo_da_uong_sua_ensure",
    name: "combo đã uống sữa ensure",
    command:
      "execute at @a run effect give @a minecraft:health_boost 999999 9 true; execute at @a run effect give @a minecraft:instant_health 1 255 true",
    weight: 6,
    color: "gold",
  },

  // Mythic: Combo hoa rơi cửa phật (Minigun + 100 đạn 308 + Full giáp Netherite protection/blast 15 & feather falling 255 +30 tim + Regen & Resistance 30s)
  {
    id: "mythic_minigun_combo",
    name: "Combo hoa rơi cửa phật",
    command:
      'execute at @a run give @a netherite_helmet{Enchantments:[{id:"minecraft:protection",lvl:15s},{id:"minecraft:blast_protection",lvl:15s}]} 1; execute at @a run give @a netherite_chestplate{Enchantments:[{id:"minecraft:protection",lvl:15s},{id:"minecraft:blast_protection",lvl:15s}]} 1; execute at @a run give @a netherite_leggings{Enchantments:[{id:"minecraft:protection",lvl:15s},{id:"minecraft:blast_protection",lvl:15s}]} 1; execute at @a run give @a netherite_boots{Enchantments:[{id:"minecraft:protection",lvl:15s},{id:"minecraft:blast_protection",lvl:15s},{id:"minecraft:feather_falling",lvl:255s}]} 1; execute at @a run give @a tacz:modern_kinetic_gun{GunId:"tacz:minigun",GunCurrentAmmoCount:20,HasBulletInBarrel:1b,GunFireMode:"AUTO",SceneCredits:0b} 1; execute at @a run give @a tacz:ammo{AmmoId:"tacz:308"} 100; execute at @a run effect give @a minecraft:health_boost 999999 14 true; execute at @a run effect give @a minecraft:instant_health 1 255 true; execute at @a run effect give @a minecraft:regeneration 30 255 true; execute at @a run effect give @a minecraft:resistance 30 255 true',
    weight: 2,
    color: "red",
  },
];

/**
 * Lựa chọn một option ngẫu nhiên theo trọng số (weight).
 */
export function getRandomGachaOption(
  options: GachaOption[] = defaultGachaOptions,
): GachaOption {
  if (!options || options.length === 0) {
    throw new Error("Bể quà Gacha không được để trống");
  }

  const totalWeight = options.reduce(
    (sum, opt) => sum + Math.max(0, opt.weight),
    0,
  );
  if (totalWeight <= 0) {
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
  }

  let randomVal = Math.random() * totalWeight;
  for (const option of options) {
    const weight = Math.max(0, option.weight);
    if (randomVal < weight) {
      return option;
    }
    randomVal -= weight;
  }

  return options[options.length - 1];
}

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
    weight: 9,
    color: "#A855F7",
  },
  {
    id: "mutant_creeper",
    name: "Creeper đột biến x1",
    command:
      'execute at @a run summon mutantmonsters:mutant_creeper ~ ~ ~ {Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.5}]}',
    count: 1,
    weight: 8,
    color: "gold",
  },
  {
    id: "mutant_zombie",
    name: "Zombie đột biến x1",
    command:
      'execute at @a run summon mutantmonsters:mutant_zombie ~ ~ ~ {Attributes:[{Name:"minecraft:generic.movement_speed",Base:0.5}]}',
    weight: 9,
    color: "gold",
  },
  {
    id: "mutant_skeleton",
    name: "Skeleton đột biến x1",
    command:
      'execute at @a run summon mutantmonsters:mutant_skeleton ~ ~ ~ {Attributes:[{Name:"minecraft:generic.movement_speed"}]}',
    weight: 7,
    color: "gold",
  },
];

export const shamrockGachaOptions: GachaOption[] = [
  // Common (Trọng số 20 - 25: Hỗ trợ cơ bản & thực phẩm sinh tồn)
  {
    id: "survival_food_pack",
    name: "Bữa Ăn Sinh Tồn",
    command:
      "execute at @a run give @a cooked_beef 16; execute at @a run give @a golden_apple 2",
    weight: 20,
    color: "gray",
  },

  // Uncommon (Trọng số 15: Set đồ sắt & Potion sinh tồn)
  {
    id: "enchanted_iron_set",
    name: "Set Đồ Sắt Phù Phép",
    command:
      'execute at @a run give @a iron_helmet{Enchantments:[{id:"minecraft:protection",lvl:3s}]} 1; execute at @a run give @a iron_chestplate{Enchantments:[{id:"minecraft:protection",lvl:3s}]} 1; execute at @a run give @a iron_leggings{Enchantments:[{id:"minecraft:protection",lvl:3s}]} 1; execute at @a run give @a iron_boots{Enchantments:[{id:"minecraft:protection",lvl:3s}]} 1; execute at @a run give @a iron_sword{Enchantments:[{id:"minecraft:sharpness",lvl:3s}]} 1',
    weight: 15,
    color: "green",
  },
  {
    id: "survival_potion_combo",
    name: "Combo Sinh Tồn",
    command:
      "execute at @a run effect give @a regeneration 90 1; execute at @a run effect give @a resistance 90 0; execute at @a run effect give @a fire_resistance 90 0",
    weight: 15,
    color: "green",
  },

  // Rare (Trọng số 8 - 9: Kiếm Kim Cương + Khiên + Totem & Buff Chiến Đấu)
  {
    id: "shield_diamond_sword_pack",
    name: "Set An Toàn (Hoặc Không)",
    command:
      'execute at @a run give @a diamond_sword{Enchantments:[{id:"minecraft:sharpness",lvl:4s},{id:"minecraft:unbreaking",lvl:3s},{id:"minecraft:fire_aspect",lvl:1s}]} 1; execute at @a run give @a shield{Enchantments:[{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a totem_of_undying 1',
    weight: 9,
    color: "blue",
  },
  {
    id: "battle_buff_pack",
    name: "Sức Mạnh 7 Chọ",
    command:
      "execute at @a run effect give @a strength 60 1; execute at @a run effect give @a speed 60 1; execute at @a run effect give @a absorption 120 3; execute at @a run give @a golden_apple 3",
    weight: 8,
    color: "blue",
  },

  // Epic (Trọng số 4: Set Kim Cương Siêu Phụ & Cung Thần)
  {
    id: "epic_diamond_armor_set",
    name: "Set Tanker Suýt Tuyệt Đối",
    command:
      'execute at @a run give @a diamond_helmet{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a diamond_chestplate{Enchantments:[{id:"minecraft:blast_protection",lvl:4s},{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a diamond_leggings{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a diamond_boots{Enchantments:[{id:"minecraft:feather_falling",lvl:4s},{id:"minecraft:protection",lvl:4s}]} 1',
    weight: 4,
    color: "#A855F7",
  },
  {
    id: "god_bow_pack",
    name: "Cung Thần & 5 Táo Vàng",
    command:
      'execute at @a run give @a bow{Enchantments:[{id:"minecraft:power",lvl:5s},{id:"minecraft:flame",lvl:1s},{id:"minecraft:infinity",lvl:1s},{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a arrow 1; execute at @a run give @a golden_apple 5',
    weight: 4,
    color: "#A855F7",
  },

  // Legendary (Trọng số 1: Báu Vật Hồi Sinh & Set Netherite Thượng Cổ - Tỉ lệ hiếm ~2%)
  {
    id: "legendary_survival_god_pack",
    name: "Báu Vật Thượng Cổ",
    command:
      "execute at @a run give @a enchanted_golden_apple 2; execute at @a run give @a totem_of_undying 2; execute at @a run effect give @a regeneration 60 2; execute at @a run effect give @a resistance 120 1",
    weight: 1,
    color: "gold",
  },
  {
    id: "legendary_netherite_set",
    name: "Set Đồ Netherite Thượng Cổ",
    command:
      'execute at @a run give @a netherite_helmet{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a netherite_chestplate{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a netherite_leggings{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:unbreaking",lvl:3s}]} 1; execute at @a run give @a netherite_boots{Enchantments:[{id:"minecraft:protection",lvl:4s},{id:"minecraft:feather_falling",lvl:4s}]} 1; execute at @a run give @a netherite_sword{Enchantments:[{id:"minecraft:sharpness",lvl:5s},{id:"minecraft:fire_aspect",lvl:2s},{id:"minecraft:unbreaking",lvl:3s}]} 1',
    weight: 1,
    color: "gold",
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

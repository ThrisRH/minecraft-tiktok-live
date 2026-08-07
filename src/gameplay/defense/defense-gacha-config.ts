export interface DefenseGachaOption {
  id: string;
  name: string; // Tên hiển thị nhảy trên màn hình khi quay gacha defense
  command: string; // Lệnh Minecraft thực thi khi trúng
  count?: number; // Số lượng (ví dụ: 5 con mob / 2 trụ bảo vệ)
  weight: number; // Trọng số tỉ lệ trúng
  color?: string; // Màu sắc hiển thị title
}

/**
 * Cấu hình danh sách các lựa chọn trong vòng quay Gacha Defense.
 * Các giá trị mẫu cho chế độ Phòng thủ (Defense Mode).
 * Cụ thể logic thực thi chi tiết có thể được bổ sung sau.
 */
export const defenseGachaOptions: DefenseGachaOption[] = [
  // Common (Thường)
  {
    id: "zombie_wave",
    name: "Sóng Zombie Tấn Công x5",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    count: 5,
    weight: 10,
    color: "gray",
  },
  {
    id: "wooden_wall",
    name: "Dựng Tường Gỗ Bảo Vệ",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    weight: 10,
    color: "gray",
  },

  // Uncommon (Khá)
  {
    id: "golem_guard",
    name: "Triệu Hồi Vệ Binh Iron Golem x1",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    weight: 8,
    color: "green",
  },
  {
    id: "creeper_squad",
    name: "Biệt Đội Creeper Tấn Công x3",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    count: 3,
    weight: 8,
    color: "green",
  },

  // Rare (Hiếm)
  {
    id: "base_repair",
    name: "Hồi Phục Máu Căn Cứ +20HP",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    weight: 5,
    color: "blue",
  },
  {
    id: "tnt_trap",
    name: "Bẫy TNT Xung Quanh Căn Cứ",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    weight: 5,
    color: "blue",
  },

  // Epic (Cực Hiếm)
  {
    id: "lightning_storm",
    name: "Bão Sấm Sét Quét Mobs",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    weight: 2,
    color: "#A855F7",
  },

  // Legendary (Huyền Thoại)
  {
    id: "boss_invasion",
    name: "Xâm Lược: Wither Boss / Boss Defense",
    command: "", // TODO: Thêm lệnh Minecraft thực tế sau
    weight: 1,
    color: "gold",
  },
];

/**
 * Hàm chọn ngẫu nhiên 1 phần thưởng gacha dựa theo trọng số (weight).
 * Để rỗng / stub logic chính nếu chưa cần tính toán phức tạp.
 */
export function getRandomDefenseGachaOption(
  options: DefenseGachaOption[] = defenseGachaOptions,
): DefenseGachaOption | null {
  if (options.length === 0) return null;

  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  if (totalWeight <= 0) return options[0];

  let random = Math.random() * totalWeight;

  for (const option of options) {
    if (random < option.weight) {
      return option;
    }
    random -= option.weight;
  }

  return options[0];
}

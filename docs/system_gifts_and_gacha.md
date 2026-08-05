# Danh Sách Quà Tặng & Vòng Quay Gacha Trong Hệ Thống

## 1. Danh Sách Quà Tặng (Gift Actions)

| Tên Quà | Phân Loại | Lệnh / Hiệu ứng Minecraft |
|---|---|---|
| **Heart / Heart Me** | Gacha Thường | Kích hoạt Vòng quay Gacha Thường |
| **Ice Cream / IceCream** | Gacha Thường | Kích hoạt Vòng quay Gacha Thường |
| **Rosa** | Rosa Gacha | Kích hoạt Vòng quay Rosa Gacha |
| **Shamrock** | Shamrock Gacha | Kích hoạt Vòng quay Shamrock Gacha |
| **Rose** | Summon Entity | `summon zombie ~ ~ ~` (x1 mỗi count) |
| **TikTok** | Summon Entity | `summon creeper ~ ~ ~` (x1 mỗi count) |
| **Cap** | Summon Entity | `summon warden ~ ~ ~` (x1 mỗi count) |
| **Doughnut** | Summon Entity | `summon terramity:black_hole ~ ~ ~` (x1 mỗi count) |
| **Confetti** | Summon Entity | `summon ender_dragon ~ ~ ~` (x1 mỗi count) |
| **Lucky Pig** | Summon Entity | `summon guardvillagers:guard` (full giáp sắt, kiếm & khiên, gắn tên người donate) |
| **Finger Heart** | Cho Vật Phẩm | `give @a golden_apple` (x1 mỗi count) |
| **Journey Pass** | Cho Vật Phẩm | `give @a` Full set giáp da (Mũ, Áo, Quần, Giày) |
| **GG** | Cho Vật Phẩm | `give @a bread` (x1 mỗi count) |
| **Little Kisses** | Cho Vật Phẩm | `give @a enchanted_golden_apple 1` + `iron_chestplate` (Protection IV, Blast Protection III) |
| **Perfume** | Bẫy / Khống chế | Dựng 4 cột Bedrock nhốt 2s -> Summon `luckytntmod:gravity_tnt` -> Xóa Bedrock sau 1s |
| **Corgi** | Sự kiện 5 phút | **Corgi Dragon**: Áp Slowness 1 (300s), summon 3 baby ender dragon, x2 baby dragon mỗi 10s (max 25), mốc 3m triệu hồi Ender Dragon + 8 End Crystals. Combo: +5m & +1 Ender Dragon |
| **Money Gun** | Sự kiện 10 phút | **Wither Storm**: Summon Wither Storm Phase 7. Combo: +10m & +1 Wither Storm Phase 4 |
| **Mặc định / Quà khác** | Thông báo | Gửi tin nhắn Chat & hiển thị Tiêu đề trên màn hình |

---

## 2. Vòng Quay Gacha (Gacha Pools)

### A. Vòng Quay Thường (`defaultGachaOptions`)
| Tên Phần Thưởng | Trọng Số (Tỷ lệ) | Lệnh / Vật Phẩm |
|---|---|---|
| Bánh mì thịt x8 | 10 (Thường) | `give @a bread 8` |
| Zombie thường x5 | 10 (Thường) | `summon zombie ~ ~ ~` (x5) |
| Creeper thường x5 | 10 (Thường) | `summon creeper ~ ~ ~` (x5) |
| Toán Cướp Pillager x2 | 8 (Không phổ biến) | `summon pillager ~ ~ ~` (x2) |
| Super Creeper | 8 (Không phổ biến) | `summon creeper {powered:1b}` |
| Cú đấm sấm sét | 8 (Không phổ biến) | `summon lightning_bolt ~ ~ ~` |
| Zombie tốc độ x5 | 8 (Không phổ biến) | `summon zombie` (mũ da, speed 1.0) (x5) |
| Quái Thú Ravager | 5 (Hiếm) | `summon ravager ~ ~ ~` |
| Táo vàng x1 | 5 (Hiếm) | `give @a golden_apple 1` |
| Đại dịch Zombie x10 | 5 (Sử thi) | `summon zombie` (full giáp sắt) (x10) |
| Lên thiên đường | 5 (Sử thi) | `tp @a ~ 500 ~` |
| Ending Fairy | 1 (Huyền thoại) | `summon luckytntmod:grande_finale` |

### B. Vòng Quay Rosa Gacha (`rosaGachaOptions`)
| Tên Phần Thưởng | Trọng Số (Tỷ lệ) | Lệnh / Vật Phẩm |
|---|---|---|
| Creeper cảm tử x20 | 9 (Thường) | `summon mutantmonsters:creeper_minion` (x20) |
| Zombie đột biến x1 | 9 (Thường) | `summon mutantmonsters:mutant_zombie` |
| Creeper đột biến x1 | 8 (Không phổ biến) | `summon mutantmonsters:mutant_creeper` |
| Skeleton đột biến x1 | 7 (Không phổ biến) | `summon mutantmonsters:mutant_skeleton` |

### C. Vòng Quay Shamrock Gacha (`shamrockGachaOptions`)
| Tên Phần Thưởng | Trọng Số (Tỷ lệ) | Lệnh / Vật Phẩm |
|---|---|---|
| 16 Bánh Mì | 20 (Thường) | `give @a bread 16` |
| 2 Táo Vàng | 18 (Thường) | `give @a golden_apple 2` |
| 1 Táo Vàng Phù Phép | 12 (Thường) | `give @a enchanted_golden_apple 1` |
| Set Giáp Sắt | 15 (Không phổ biến) | `give @a` Full set giáp sắt không phù phép |
| Kiếm Sắt & Khiên | 15 (Không phổ biến) | `give @a iron_sword 1; give @a shield 1` |
| Áo Sắt Phù Phép Protection III | 10 (Hiếm) | `give @a iron_chestplate{Protection:3}` |
| Combo Sinh Tồn | 10 (Hiếm) | `effect give @a regeneration 60s` + `resistance 60s` |
| Set Giáp Kim Cương Phù Phép | 2 (Huyền thoại) | `give @a` Full set giáp kim cương (Protection IV, Unbreaking III) |
| Kiếm Kim Cương Thượng Cổ | 2 (Huyền thoại) | `give @a diamond_sword` (Sharpness IV, Smite III) |

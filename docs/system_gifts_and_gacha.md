# Danh Sách Quà Tặng & Vòng Quay Gacha Trong Hệ Thống

## 1. Danh Sách Quà Tặng (Gift Actions)

<<<<<<< HEAD
| Tên Quà | Phân Loại | Lệnh / Hiệu ứng Minecraft |
|---|---|---|
| **Heart / Heart Me** | Gacha Thường | Kích hoạt Vòng quay Gacha Thường |
| **Overreact** | Gacha Thường | Kích hoạt Vòng quay Gacha Thường |
| **Rosa** | Rosa Gacha | Kích hoạt Vòng quay Rosa Gacha |
| **Shamrock** | Shamrock Gacha | Kích hoạt Vòng quay Shamrock Gacha |
| **Rose** | Summon Entity | `summon zombie ~ ~ ~` (x1 mỗi count) |
| **TikTok** | Summon Entity | `summon creeper ~ ~ ~` (x1 mỗi count) |
| **Cap** | Summon Entity | `summon warden ~ ~ ~` (x1 mỗi count) |
| **Doughnut** | Summon Entity | `summon terramity:black_hole ~ ~ ~` (x1 mỗi count) |
| **Confetti** | Summon Entity | `summon ender_dragon ~ ~ ~` (x1 mỗi count) |
| **Lucky Pig** | Summon Entity | Triệu hồi 3 con Sói Netherite Armor (`minecraft:wolf`) có Owner và giáp Netherite (gắn tên người donate) |
| **Finger Heart** | Cho Vật Phẩm | `give @a golden_apple` (x1 mỗi count) |
| **Journey Pass** | Cho Vật Phẩm | `give @a` Full set giáp da (Mũ, Áo, Quần, Giày) |
| **GG** | Cho Vật Phẩm | `give @a bread` (x1 mỗi count) |
| **Little Kisses** | Summon Entity | `summon mutantmonsters:mutant_snow_golem` (x1 mỗi count) |
| **Perfume** | Bẫy / Khống chế | Dựng 4 cột Bedrock nhốt 2s -> Summon `luckytntmod:gravity_tnt` -> Xóa Bedrock sau 1s |
| **Corgi** | Sự kiện 5 phút | **Corgi Dragon**: Summon 2 Ender Dragon, đếm ngược HUD Actionbar 5 phút. Combo: +5m & +1 Ender Dragon |
| **Money Gun** | Sự kiện 10 phút | **Wither Storm**: Summon Wither Storm Phase 7. Combo: +10m & +1 Wither Storm Phase 4 |
| **Confetti** | Sự kiện 3 phút | **Đáy Biển Sâu**: Teleport đại dương sâu (Y=42, chìm 20 block) -> Thở dưới nước -> 5s sau xuất hiện `cataclysm:the_leviathan` (chết tự hồi sinh). Combo: +3m & +2 `cataclysm:the_baby_leviathan` |
| **Mặc định / Quà khác** | Thông báo | Gửi tin nhắn Chat & hiển thị Tiêu đề trên màn hình |
=======
| Tên Quà                 | Phân Loại       | Lệnh / Hiệu ứng Minecraft                                                                                                     |
| ----------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Heart / Heart Me**    | Gacha Thường    | Kích hoạt Vòng quay Gacha Thường                                                                                              |
| **Overreact**           | Gacha Thường    | Kích hoạt Vòng quay Gacha Thường                                                                                              |
| **Rosa**                | Rosa Gacha      | Kích hoạt Vòng quay Rosa Gacha                                                                                                |
| **Shamrock**            | Shamrock Gacha  | Kích hoạt Vòng quay Shamrock Gacha                                                                                            |
| **Rose**                | Summon Entity   | `summon zombie ~ ~ ~` (x1 mỗi count)                                                                                          |
| **TikTok**              | Summon Entity   | `summon creeper ~ ~ ~` (x1 mỗi count)                                                                                         |
| **Cap**                 | Summon Entity   | `summon warden ~ ~ ~` (x1 mỗi count)                                                                                          |
| **Doughnut**            | Summon Entity   | `summon terramity:black_hole ~ ~ ~` (x1 mỗi count)                                                                            |
| **Confetti**            | Summon Entity   | `summon ender_dragon ~ ~ ~` (x1 mỗi count)                                                                                    |
| **Lucky Pig**           | Summon Entity   | Triệu hồi 3 con Bodyguard (`bodyguard:bodyguard_gk`) có Owner, áo giáp sắt Bảo vệ 2, kiếm đá Đập phá 2 (gắn tên người donate) |
| **Finger Heart**        | Cho Vật Phẩm    | `give @a golden_apple` (x1 mỗi count)                                                                                         |
| **Journey Pass**        | Cho Vật Phẩm    | `give @a` Full set giáp da (Mũ, Áo, Quần, Giày)                                                                               |
| **GG**                  | Cho Vật Phẩm    | `give @a bread` (x1 mỗi count)                                                                                                |
| **Little Kisses**       | Cho Vật Phẩm    | `give @a enchanted_golden_apple 1` + `iron_chestplate` (Protection IV, Blast Protection III)                                  |
| **Perfume**             | Bẫy / Khống chế | Dựng 4 cột Bedrock nhốt 2s -> Summon `luckytntmod:gravity_tnt` -> Xóa Bedrock sau 1s                                          |
| **Corgi**               | Sự kiện 5 phút  | **Corgi Dragon**: Summon 2 Ender Dragon, đếm ngược HUD Actionbar 5 phút. Combo: +5m & +1 Ender Dragon                         |
| **Money Gun**           | Sự kiện 10 phút | **Wither Storm**: Summon Wither Storm Phase 7. Combo: +10m & +1 Wither Storm Phase 4                                          |
| **Mặc định / Quà khác** | Thông báo       | Gửi tin nhắn Chat & hiển thị Tiêu đề trên màn hình                                                                            |
>>>>>>> gameplay/survival

---

## 2. Vòng Quay Gacha (Gacha Pools)

### A. Vòng Quay Thường (`defaultGachaOptions`)

| Tên Phần Thưởng       | Trọng Số (Tỷ lệ)   | Lệnh / Vật Phẩm                         |
| --------------------- | ------------------ | --------------------------------------- |
| Bánh mì thịt x8       | 10 (Thường)        | `give @a bread 8`                       |
| Zombie thường x5      | 10 (Thường)        | `summon zombie ~ ~ ~` (x5)              |
| Creeper thường x5     | 10 (Thường)        | `summon creeper ~ ~ ~` (x5)             |
| Toán Cướp Pillager x2 | 8 (Không phổ biến) | `summon pillager ~ ~ ~` (x2)            |
| Super Creeper         | 8 (Không phổ biến) | `summon creeper {powered:1b}`           |
| Cú đấm sấm sét        | 8 (Không phổ biến) | `summon lightning_bolt ~ ~ ~`           |
| Zombie tốc độ x5      | 8 (Không phổ biến) | `summon zombie` (mũ da, speed 1.0) (x5) |
| Quái Thú Ravager      | 5 (Hiếm)           | `summon ravager ~ ~ ~`                  |
| Táo vàng x1           | 5 (Hiếm)           | `give @a golden_apple 1`                |
| Đại dịch Zombie x10   | 5 (Sử thi)         | `summon zombie` (full giáp sắt) (x10)   |
| Lên thiên đường       | 5 (Sử thi)         | `tp @a ~ 500 ~`                         |
| Ending Fairy          | 1 (Huyền thoại)    | `summon luckytntmod:grande_finale`      |

### B. Vòng Quay Rosa Gacha (`rosaGachaOptions`)

| Tên Phần Thưởng             | Trọng Số (Tỷ lệ)        | Lệnh / Vật Phẩm                              |
| --------------------------- | ----------------------- | -------------------------------------------- |
| Creeper cảm tử x20          | 27 (Thường)             | `summon mutantmonsters:creeper_minion` (x20) |
| Zombie đột biến x1          | 15 (Thường)             | `summon mutantmonsters:mutant_zombie`        |
| Creeper đột biến x1         | 15 (Không phổ biến)     | `summon mutantmonsters:mutant_creeper`       |
| Skeleton đột biến x1        | 3 (Thần thoại - Mythic) | `summon mutantmonsters:mutant_skeleton`      |
| Wither Skeleton đột biến x1 | 1 (Thần thoại - Mythic) | `summon mutantmore:mutant_wither_skeleton`   |
| Jungle Zombie đột biến x1   | 1 (Thần thoại - Mythic) | `summon mutantmore:mutant_jungle_zombie`     |
| Shulker đột biến x1         | 1 (Thần thoại - Mythic) | `summon mutantmore:mutant_shulker`           |

### C. Vòng Quay Shamrock Gacha (`shamrockGachaOptions`)

| Tên Phần Thưởng                                                         | Trọng Số (Tỷ lệ)               | Lệnh / Vật Phẩm                                                                                                             |
| ----------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Combo vừa thay thận (+2 trái tim)                                       | 30 (Thường - Common)           | `effect give @a minecraft:health_boost 999999 0 true`, `instant_health`                                                     |
| Táo Vàng Phù Phép + 2 Táo Vàng                                          | 20 (Hiếm - Rare)               | `give @a enchanted_golden_apple 1`, `golden_apple 2`                                                                        |
| Full Giáp Sắt + Kiếm Sắt + Khiên                                        | 20 (Hiếm - Rare)               | `give @a` Full set giáp sắt, `iron_sword 1`, `shield 1`                                                                     |
| Combo Thợ Đục                                                           | 15 (Không phổ biến - Uncommon) | `give @a iron_pickaxe 1`, `leather_chestplate` (Blast Protection V)                                                         |
| Full Giáp Sắt (Áo Kim Cương Chống Nổ 5 & Giày Rơi Nhẹ Max) + Kiếm Sắt   | 12 (Sử thi - Epic)             | `give @a` Helmet/Leggings sắt, `diamond_chestplate` (Blast Protection V), `iron_boots` (Feather Falling IV), `iron_sword 1` |
| Combo Dân Chủ (Full Giáp Sắt Prot/Blast 3 + SPAS-12 Full Attachments + 60 Đạn 12g) | 12 (Sử thi - Epic)       | `give @a` Full giáp sắt (Protection III, Blast Protection III), `tacz:spas_12` (attachments), `tacz:ammo 12g` (x60)     |
| Combo người không phổi (+10 trái tim)                                               | 12 (Sử thi - Epic)       | `effect give @a minecraft:health_boost 999999 4 true`, `instant_health`                                                  |
| Full Set Kim Cương (Protection 4 & Chống Nổ 4) + Kiếm Kim Cương + Khiên             | 6 (Huyền thoại - Legend) | `give @a` Full set giáp kim cương (Protection IV, Blast Protection IV), `diamond_sword` (Sharpness V, Smite V), `shield 1` |
| Combo SCAR-L (Full Giáp KC Prot/Blast 5 & Feather Falling 4 + SCAR-L Full Attachments) | 6 (Huyền thoại - Legend) | `give @a` Full giáp kim cương (Prot V, Blast Prot V, Feather Falling IV), `tacz:scar_l` (attachments), `tacz:ammo 556x45` (x61) |
| Combo đã uống sữa ensure (+20 trái tim)                                             | 6 (Huyền thoại - Legend) | `effect give @a minecraft:health_boost 999999 9 true`, `instant_health`                                                  |
| Combo Hoa Rơi Cửa Phật (Full Giáp Netherite Prot/Blast 15 & Feather Falling 255 + Minigun +30 Tim + Regen/Resistance 30s) | 2 (Thần thoại - Mythic)  | `give @a` Full giáp Netherite (Prot XV, Blast XV, Feather Falling 255), `tacz:minigun`, `tacz:ammo 308` (x100), `health_boost 14`, `regeneration 30s`, `resistance 30s` |

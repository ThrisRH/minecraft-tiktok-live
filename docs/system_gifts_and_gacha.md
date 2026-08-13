# Danh Sách Quà Tặng & Vòng Quay Gacha Trong Hệ Thống

## 1. Danh Sách Quà Tặng (Gift Actions)

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
| Creeper cảm tử x20          | 9 (Thường)              | `summon mutantmonsters:creeper_minion` (x20) |
| Zombie đột biến x1          | 9 (Thường)              | `summon mutantmonsters:mutant_zombie`        |
| Creeper đột biến x1         | 8 (Không phổ biến)      | `summon mutantmonsters:mutant_creeper`       |
| Skeleton đột biến x1        | 7 (Không phổ biến)      | `summon mutantmonsters:mutant_skeleton`      |
| Wither Skeleton đột biến x1 | 2 (Thần thoại - Mythic) | `summon mutantmore:mutant_wither_skeleton`   |
| Jungle Zombie đột biến x1   | 2 (Thần thoại - Mythic) | `summon mutantmore:mutant_jungle_zombie`     |
| Shulker đột biến x1         | 2 (Thần thoại - Mythic) | `summon mutantmore:mutant_shulker`           |

### C. Vòng Quay Shamrock Gacha (`shamrockGachaOptions`)

| Tên Phần Thưởng                                                         | Trọng Số (Tỷ lệ)               | Lệnh / Vật Phẩm                                                                                                             |
| ----------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Full Giáp Da + Kiếm Gỗ + 12 Bánh Mì                                     | 30 (Thường - Common)           | `give @a` Full set giáp da, `wooden_sword 1`, `bread 12`                                                                    |
| Táo Vàng Phù Phép + 2 Táo Vàng                                          | 20 (Hiếm - Rare)               | `give @a enchanted_golden_apple 1`, `golden_apple 2`                                                                        |
| Full Giáp Sắt + Kiếm Sắt + Khiên                                        | 20 (Hiếm - Rare)               | `give @a` Full set giáp sắt, `iron_sword 1`, `shield 1`                                                                     |
| Combo Thợ Đục                                                           | 15 (Không phổ biến - Uncommon) | `give @a iron_pickaxe 1`, `leather_chestplate` (Blast Protection V)                                                         |
| Full Giáp Sắt (Áo Kim Cương Chống Nổ 5 & Giày Rơi Nhẹ Max) + Kiếm Sắt   | 12 (Sử thi - Epic)             | `give @a` Helmet/Leggings sắt, `diamond_chestplate` (Blast Protection V), `iron_boots` (Feather Falling IV), `iron_sword 1` |
| Combo Dân Chủ (Áo Sắt Protection 3 + Súng Glock 17 + 60 Băng Đạn 9mm)   | 12 (Sử thi - Epic)             | `give @a iron_chestplate` (Protection III), `tacz:glock_17` (17 ammo, semi), `tacz:ammo 9mm` (x60)                          |
| Full Set Kim Cương (Protection 4 & Chống Nổ 4) + Kiếm Kim Cương + Khiên | 6 (Huyền thoại - Legend)       | `give @a` Full set giáp kim cương (Protection IV, Blast Protection IV), `diamond_sword` (Sharpness V, Smite V), `shield 1`  |
| Combo SCAR-L                                                            | 6 (Huyền thoại - Legend)       | `give @a tacz:scar_l` (30 ammo, auto), `tacz:ammo 556x45` (x61)                                                             |
| Combo Hoa Rơi Cửa Phật                                                  | 2 (Thần thoại - Mythic)        | `give @a tacz:minigun` (20 ammo, auto), `tacz:ammo 308mm` (x200)                                                            |

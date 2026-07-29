# Bảng quy đổi quà thành hiệu ứng

Tài liệu này ghi lại quà nào sẽ triệu hồi vật gì trong Minecraft.

## Bảng đơn giản

| Quà          | Triệu hồi          | Ghi chú                                | Xu  |
| ------------ | ------------------ | -------------------------------------- | --- |
| Heart        | Quay Gacha 1       | Quay Gacha custom option ngẫu nhiên    | 1   |
| Shamrock     | Quay Gacha 1       | Quay Gacha custom option ngẫu nhiên    | 1   |
| Finger Heart | Quay Gacha 1       | Quay Gacha custom option ngẫu nhiên    | 5   |
| Rose         | Zombie giáp        | Mỗi lần quà sẽ triệu hồi 1 zombie giáp | 1   |
| Rosa         | Rosa Gacha         | Quay Vòng Quay Gacha Rosa độc lập      | 10  |
| TikTok       | Creeper            | Triệu hồi creeper                      | 1   |
| Perfume      | Pillager           | Triệu hồi 5 Pillager                   | 20  |
| Journey Pass | Full Giáp Da       | Give trọn bộ giáp da cho người chơi    | 10  |
| GG           | Fireworks          | Bắn pháo hoa ăn mừng                   | 1   |
| Cap          | Wither             | Triệu hồi wither                       | 99  |
| Doughnut     | Ravager            | Triệu hồi ravager                      | 30  |
| Corgi        | TNT rain           | Triệu hồi entity TNT rain              | 299 |

## Nơi xử lý

- Logic xử lý nằm ở [src/game/gift-actions.ts](src/game/gift-actions.ts)
- Đăng ký tên quà nằm ở [src/events/gift-registry.ts](src/events/gift-registry.ts)

Nếu muốn đổi hiệu ứng của một quà, hãy sửa method tương ứng trong [src/game/gift-actions.ts](src/game/gift-actions.ts).

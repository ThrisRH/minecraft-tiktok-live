# Bảng quy đổi quà thành hiệu ứng

Tài liệu này ghi lại quà nào sẽ triệu hồi vật gì trong Minecraft.

## Bảng đơn giản

| Quà      | Triệu hồi       | Ghi chú                                | Xu  |
| -------- | --------------- | -------------------------------------- | --- |
| Heart    | Không triệu hồi | Chỉ hiện thông báo và title            | 1   |
| Rose     | Zombie giáp     | Mỗi lần quà sẽ triệu hồi 1 zombie giáp | 1   |
| Rosa     | Zombie giáp     | Mỗi lần quà sẽ triệu hồi 5 zombie giáp | 10  |
| TikTok   | Creeper         | Triệu hồi creeper                      | 1   |
| Perfume  | Pillager        | Triệu hồi Pillage                      | 20  |
| Cap      | Wither          | Triệu hồi wither                       | 99  |
| Doughnut | Ravager         | Triệu hồi ravager                      | 30  |
| Corgi    | TNT rain        | Triệu hồi entity TNT rain              | 299 |

## Nơi xử lý

- Logic xử lý nằm ở [src/game/gift-actions.ts](src/game/gift-actions.ts)
- Đăng ký tên quà nằm ở [src/events/gift-registry.ts](src/events/gift-registry.ts)

Nếu muốn đổi hiệu ứng của một quà, hãy sửa method tương ứng trong [src/game/gift-actions.ts](src/game/gift-actions.ts).

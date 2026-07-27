# Bảng quy đổi quà thành hiệu ứng

Tài liệu này ghi lại quà nào sẽ triệu hồi vật gì trong Minecraft.

## Bảng đơn giản

| Quà      | Triệu hồi       | Ghi chú                                |
| -------- | --------------- | -------------------------------------- |
| Heart    | Không triệu hồi | Chỉ hiện thông báo và title            |
| Rose     | Zombie giáp     | Mỗi lần quà sẽ triệu hồi 1 zombie giáp |
| Rosa     | Zombie giáp     | Mỗi lần quà sẽ triệu hồi 5 zombie giáp |
| TikTok   | Creeper         | Triệu hồi creeper                      |
| Perfume  | Lightning bolt  | Triệu hồi sấm sét                      |
| Cap      | Wither          | Triệu hồi wither                       |
| Doughnut | Ravager         | Triệu hồi ravager                      |
| Corgi    | TNT rain        | Triệu hồi entity TNT rain              |

## Nơi xử lý

- Logic xử lý nằm ở [src/game/gift-actions.ts](src/game/gift-actions.ts)
- Đăng ký tên quà nằm ở [src/events/gift-registry.ts](src/events/gift-registry.ts)

Nếu muốn đổi hiệu ứng của một quà, hãy sửa method tương ứng trong [src/game/gift-actions.ts](src/game/gift-actions.ts).

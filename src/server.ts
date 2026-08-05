import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Dispatcher } from "./events/dispatcher.js";
import { GameActionService } from "./game/game-action.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GiftMetadata {
  id: string;
  name: string;
  category: "gacha" | "event" | "mob" | "item" | "trap";
  description: string;
  icon: string;
}

const GIFT_CATALOG: GiftMetadata[] = [
  {
    id: "Heart",
    name: "Heart",
    category: "gacha",
    description: "Vòng quay Gacha Thường",
    icon: "🎲",
  },
  {
    id: "Overreact",
    name: "Overreact",
    category: "gacha",
    description: "Vòng quay Gacha Thường",
    icon: "🎲",
  },
  {
    id: "Rosa",
    name: "Rosa",
    category: "gacha",
    description: "Vòng quay Rosa Gacha (Quái đột biến)",
    icon: "🌹",
  },
  {
    id: "Shamrock",
    name: "Shamrock",
    category: "gacha",
    description: "Vòng quay Shamrock Gacha (Cân bằng)",
    icon: "☘️",
  },
  {
    id: "Corgi",
    name: "Corgi",
    category: "event",
    description: "Sự kiện đếm ngược Corgi Dragon (5 phút)",
    icon: "🐉",
  },
  {
    id: "Money Gun",
    name: "Money Gun",
    category: "event",
    description: "Sự kiện đếm ngược Wither Storm (10 phút)",
    icon: "☠️",
  },
  {
    id: "Rose",
    name: "Rose",
    category: "mob",
    description: "Triệu hồi Zombie",
    icon: "🧟",
  },
  {
    id: "TikTok",
    name: "TikTok",
    category: "mob",
    description: "Triệu hồi Creeper",
    icon: "🧨",
  },
  {
    id: "Cap",
    name: "Cap",
    category: "mob",
    description: "Triệu hồi Warden",
    icon: "👾",
  },
  {
    id: "Doughnut",
    name: "Doughnut",
    category: "mob",
    description: "Triệu hồi Hố đen (Black Hole)",
    icon: "🕳️",
  },
  {
    id: "Confetti",
    name: "Confetti",
    category: "mob",
    description: "Triệu hồi Ender Dragon",
    icon: "🐲",
  },
  {
    id: "Lucky Pig",
    name: "Lucky Pig",
    category: "mob",
    description: "Triệu hồi Vệ binh Guard Villager (Full giáp)",
    icon: "🛡️",
  },
  {
    id: "Finger Heart",
    name: "Finger Heart",
    category: "item",
    description: "Cho Táo Vàng (Golden Apple)",
    icon: "🍎",
  },
  {
    id: "Journey Pass",
    name: "Journey Pass",
    category: "item",
    description: "Cho Full set Giáp Da",
    icon: "👕",
  },
  {
    id: "GG",
    name: "GG",
    category: "item",
    description: "Cho Bánh mì (Bread)",
    icon: "🍞",
  },
  {
    id: "Little Kisses",
    name: "Little Kisses",
    category: "item",
    description: "Cho Táo Vàng Phù Phép + Áo Sắt Phù Phép",
    icon: "💋",
  },
  {
    id: "Perfume",
    name: "Perfume",
    category: "trap",
    description: "Bẫy 4 cột Bedrock nhốt 2s & TNT Gravity",
    icon: "💣",
  },
];

interface LogEntry {
  timestamp: string;
  type: "gift" | "like" | "system" | "error";
  message: string;
}

export class ControlPanelServer {
  private logs: LogEntry[] = [];
  private server?: http.Server;

  constructor(
    private readonly dispatcher: Dispatcher,
    private readonly game: GameActionService,
    private readonly port = 3050,
  ) {}

  public addLog(type: LogEntry["type"], message: string) {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) {
      this.logs.pop();
    }
  }

  public start(): Promise<string> {
    return new Promise((resolve, reject) => {
      const publicDir = path.resolve(__dirname, "../public");

      this.server = http.createServer((req, res) => {
        void (async () => {
          try {
            const parsedUrl = new URL(req.url ?? "/", `http://localhost:${this.port}`);
            const pathname = parsedUrl.pathname;

            // CORS headers
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");

            if (req.method === "OPTIONS") {
              res.writeHead(204);
              res.end();
              return;
            }

            // REST API Routes
            if (pathname === "/api/gifts" && req.method === "GET") {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(GIFT_CATALOG));
              return;
            }

            if (pathname === "/api/logs" && req.method === "GET") {
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify(this.logs));
              return;
            }

            if (pathname === "/api/trigger-gift" && req.method === "POST") {
              const body = await this.parseJsonBody(req);
              const giftName = String(body.giftName ?? "Heart");
              const count = Math.max(1, Number(body.count ?? 1));
              const username = String(body.username ?? "DesktopTester");

              this.addLog("gift", `🎁 Triggers gift: ${giftName} (x${count}) từ user: ${username}`);

              void this.dispatcher
                .dispatch({
                  type: "gift",
                  giftName,
                  count,
                  username,
                })
                .then(() => {
                  this.addLog("system", `✅ Hoàn thành kích hoạt gift: ${giftName}`);
                })
                .catch((err: unknown) => {
                  const errMsg = err instanceof Error ? err.message : String(err);
                  this.addLog("error", `❌ Lỗi khi gửi gift ${giftName}: ${errMsg}`);
                });

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ status: "success", giftName, count, username }));
              return;
            }

            if (pathname === "/api/trigger-like" && req.method === "POST") {
              const body = await this.parseJsonBody(req);
              const count = Math.max(1, Number(body.count ?? 1));
              const username = String(body.username ?? "DesktopTester");

              this.addLog("like", `❤️ Gửi ${count} lượt Like từ user: ${username}`);

              void this.game
                .like(count, username)
                .then(() => {
                  this.addLog("system", `✅ Hoàn thành xử lý Like cho: ${username}`);
                })
                .catch((err: unknown) => {
                  const errMsg = err instanceof Error ? err.message : String(err);
                  this.addLog("error", `❌ Lỗi khi xử lý Like: ${errMsg}`);
                });

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ status: "success", count, username }));
              return;
            }

            if (pathname === "/api/test-all" && req.method === "POST") {
              const body = await this.parseJsonBody(req);
              const count = Math.max(1, Number(body.count ?? 1));
              const delayMs = Math.max(0, Number(body.delayMs ?? 1000));
              const username = String(body.username ?? "AutoTester");

              this.addLog("system", `🚀 Bắt đầu chuỗi tự động test tất cả các quà...`);

              void this.dispatcher
                .testAllGifts({
                  count,
                  delayMs,
                  username,
                  onGiftStart: (name, idx, total) => {
                    this.addLog("gift", `[${idx + 1}/${total}] 🎁 Auto Testing: ${name}`);
                  },
                })
                .then(() => {
                  this.addLog("system", `✅ Đã test xong toàn bộ danh sách quà!`);
                })
                .catch((err: unknown) => {
                  const errMsg = err instanceof Error ? err.message : String(err);
                  this.addLog("error", `❌ Lỗi khi auto test: ${errMsg}`);
                });

              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ status: "started" }));
              return;
            }

            // Serve Static Files
            let filePath = path.join(publicDir, pathname === "/" ? "index.html" : pathname);

            if (!fs.existsSync(filePath)) {
              filePath = path.join(publicDir, "index.html");
            }

            const ext = path.extname(filePath).toLowerCase();
            const contentTypeMap: Record<string, string> = {
              ".html": "text/html",
              ".css": "text/css",
              ".js": "text/javascript",
              ".json": "application/json",
              ".png": "image/png",
              ".jpg": "image/jpeg",
              ".svg": "image/svg+xml",
            };

            const contentType = contentTypeMap[ext] ?? "text/plain";
            const content = fs.readFileSync(filePath);
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
          } catch (error) {
            console.error("Server error:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal Server Error" }));
          }
        })();
      });

      this.server.listen(this.port, () => {
        const url = `http://localhost:${this.port}`;
        this.addLog("system", `🖥️ Desktop Control Panel Server đang chạy tại: ${url}`);
        resolve(url);
      });

      this.server.on("error", (err) => reject(err));
    });
  }

  private parseJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          resolve(body ? (JSON.parse(body) as Record<string, unknown>) : {});
        } catch {
          resolve({});
        }
      });
    });
  }
}

import { PrismaClient } from "@prisma/client";
import {
  defaultGachaOptions,
  rosaGachaOptions,
  shamrockGachaOptions,
} from "../src/config/gacha-config.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seed...");

  // 1. Create Gacha Pools
  const pools = [
    {
      id: "default_gacha",
      name: "Vòng Quay Gacha Thường",
      description: "Bể quà Gacha mặc định kích hoạt bởi Heart / Ice Cream",
    },
    {
      id: "rosa_gacha",
      name: "Vòng Quay Rosa Gacha",
      description: "Bể quà Gacha độc lập cho quà Rosa",
    },
    {
      id: "shamrock_gacha",
      name: "Vòng Quay Shamrock Gacha",
      description: "Bể quà Gacha độc lập cho quà Shamrock",
    },
  ];

  for (const pool of pools) {
    await prisma.gachaPool.upsert({
      where: { id: pool.id },
      update: { name: pool.name, description: pool.description },
      create: pool,
    });
  }

  // 2. Insert / Update items in Default Gacha Pool
  for (const opt of defaultGachaOptions) {
    await prisma.gachaItem.upsert({
      where: { id: opt.id },
      update: {
        poolId: "default_gacha",
        name: opt.name,
        command: opt.command,
        count: opt.count ?? 1,
        weight: opt.weight,
        color: opt.color ?? "gold",
      },
      create: {
        id: opt.id,
        poolId: "default_gacha",
        name: opt.name,
        command: opt.command,
        count: opt.count ?? 1,
        weight: opt.weight,
        color: opt.color ?? "gold",
      },
    });
  }

  // 3. Insert / Update items in Rosa Gacha Pool
  for (const opt of rosaGachaOptions) {
    await prisma.gachaItem.upsert({
      where: { id: opt.id },
      update: {
        poolId: "rosa_gacha",
        name: opt.name,
        command: opt.command,
        count: opt.count ?? 1,
        weight: opt.weight,
        color: opt.color ?? "gold",
      },
      create: {
        id: opt.id,
        poolId: "rosa_gacha",
        name: opt.name,
        command: opt.command,
        count: opt.count ?? 1,
        weight: opt.weight,
        color: opt.color ?? "gold",
      },
    });
  }

  // 4. Insert / Update items in Shamrock Gacha Pool
  for (const opt of shamrockGachaOptions) {
    await prisma.gachaItem.upsert({
      where: { id: opt.id },
      update: {
        poolId: "shamrock_gacha",
        name: opt.name,
        command: opt.command,
        count: opt.count ?? 1,
        weight: opt.weight,
        color: opt.color ?? "gold",
      },
      create: {
        id: opt.id,
        poolId: "shamrock_gacha",
        name: opt.name,
        command: opt.command,
        count: opt.count ?? 1,
        weight: opt.weight,
        color: opt.color ?? "gold",
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

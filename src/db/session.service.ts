import prisma from "./prisma.service.js";

export class SessionService {
  private activeSessionId: string | null = null;

  async getOrCreateActiveSession(tiktokUsername = "default_streamer"): Promise<string> {
    if (this.activeSessionId) {
      return this.activeSessionId;
    }

    const active = await prisma.liveSession.findFirst({
      where: { tiktokUsername, status: "ACTIVE" },
      orderBy: { startedAt: "desc" },
    });

    if (active) {
      this.activeSessionId = active.id;
      return active.id;
    }

    const created = await prisma.liveSession.create({
      data: {
        tiktokUsername,
        title: `Live Stream ${new Date().toLocaleDateString("vi-VN")}`,
        status: "ACTIVE",
      },
    });

    this.activeSessionId = created.id;
    return created.id;
  }

  async recordGiftEvent(data: {
    username: string;
    giftName: string;
    count: number;
    diamondValue?: number;
    giftId?: string;
    actionType?: string;
  }) {
    try {
      const sessionId = await this.getOrCreateActiveSession();
      const count = Math.max(1, data.count);
      const diamondValue = data.diamondValue ?? 0;

      // 1. Upsert Viewer record
      await prisma.viewer.upsert({
        where: { tiktokUsername: data.username },
        update: {
          totalGiftsSent: { increment: count },
          totalDiamondsSpent: { increment: diamondValue },
        },
        create: {
          tiktokUsername: data.username,
          displayName: data.username,
          totalGiftsSent: count,
          totalDiamondsSpent: diamondValue,
        },
      });

      // 2. Create GiftEvent record
      const giftEvent = await prisma.giftEvent.create({
        data: {
          sessionId,
          viewerUsername: data.username,
          giftName: data.giftName,
          giftId: data.giftId,
          count,
          diamondValue,
          actionType: data.actionType,
        },
      });

      // 3. Increment LiveSession stats
      await prisma.liveSession.update({
        where: { id: sessionId },
        data: {
          totalGifts: { increment: count },
          totalDiamonds: { increment: diamondValue },
        },
      });

      return giftEvent;
    } catch (err) {
      console.warn("Failed to record GiftEvent to DB:", err);
      return null;
    }
  }

  async recordGachaLog(data: {
    giftEventId?: string;
    username: string;
    poolId: string;
    gachaItemId: string;
    resultName: string;
    commandExecuted: string;
  }) {
    try {
      const sessionId = await this.getOrCreateActiveSession();

      // Ensure a gift event ID exists
      let giftEventId = data.giftEventId;
      if (!giftEventId) {
        const dummyEvent = await this.recordGiftEvent({
          username: data.username,
          giftName: "Gacha Spin",
          count: 1,
          actionType: "GACHA",
        });
        giftEventId = dummyEvent?.id;
      }

      if (!giftEventId) return null;

      let gachaItemId: string | null = data.gachaItemId;
      if (gachaItemId) {
        const itemExists = await prisma.gachaItem.findUnique({
          where: { id: gachaItemId },
        });
        if (!itemExists) {
          gachaItemId = null;
        }
      }

      return await prisma.gachaLog.create({
        data: {
          giftEventId,
          sessionId,
          viewerUsername: data.username,
          poolId: data.poolId,
          gachaItemId,
          resultName: data.resultName,
          commandExecuted: data.commandExecuted,
        },
      });
    } catch (err) {
      console.warn("Failed to record GachaLog to DB:", err);
      return null;
    }
  }

  async recordLikes(count: number, username?: string) {
    try {
      const sessionId = await this.getOrCreateActiveSession();
      await prisma.liveSession.update({
        where: { id: sessionId },
        data: { totalLikes: { increment: count } },
      });
    } catch (err) {
      console.warn("Failed to record likes to DB:", err);
    }
  }
}

export const sessionService = new SessionService();

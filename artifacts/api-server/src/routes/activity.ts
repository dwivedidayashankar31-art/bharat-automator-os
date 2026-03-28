import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { activitiesTable } from "@workspace/db/schema";
import { desc, sql, eq } from "drizzle-orm";

const router: IRouter = Router();

router.post("/track", async (req, res) => {
  try {
    const { action, sector, details, userId, sessionId } = req.body as {
      action?: string;
      sector?: string;
      details?: Record<string, unknown>;
      userId?: string;
      sessionId?: string;
    };

    if (!action || typeof action !== "string" || !sector || typeof sector !== "string") {
      res.status(400).json({ error: "action and sector are required strings." });
      return;
    }

    await db.insert(activitiesTable).values({
      userId: userId || null,
      sessionId: sessionId || null,
      action: action.slice(0, 100),
      sector: sector.slice(0, 50),
      details: details || null,
      ipAddress: (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

    res.json({ tracked: true });
  } catch {
    res.status(500).json({ error: "Failed to track activity." });
  }
});

router.get("/feed", async (_req, res) => {
  try {
    const activities = await db.select().from(activitiesTable)
      .orderBy(desc(activitiesTable.createdAt))
      .limit(50);

    res.json({ activities });
  } catch {
    res.status(500).json({ error: "Failed to fetch activity feed." });
  }
});

router.get("/stats", async (_req, res) => {
  try {
    const totalActions = await db.select({
      count: sql<number>`count(*)`,
    }).from(activitiesTable);

    const bySector = await db.select({
      sector: activitiesTable.sector,
      count: sql<number>`count(*)`,
    }).from(activitiesTable).groupBy(activitiesTable.sector);

    const byAction = await db.select({
      action: activitiesTable.action,
      count: sql<number>`count(*)`,
    }).from(activitiesTable).groupBy(activitiesTable.action).orderBy(sql`count(*) desc`).limit(20);

    const hourlyToday = await db.select({
      hour: sql<string>`to_char(${activitiesTable.createdAt}, 'HH24:00')`,
      count: sql<number>`count(*)`,
    }).from(activitiesTable)
      .where(sql`${activitiesTable.createdAt} >= now() - interval '24 hours'`)
      .groupBy(sql`to_char(${activitiesTable.createdAt}, 'HH24:00')`)
      .orderBy(sql`to_char(${activitiesTable.createdAt}, 'HH24:00')`);

    const uniqueUsers = await db.select({
      count: sql<number>`count(distinct coalesce(${activitiesTable.userId}, ${activitiesTable.sessionId}, ${activitiesTable.ipAddress}))`,
    }).from(activitiesTable);

    res.json({
      totalActions: totalActions[0]?.count || 0,
      uniqueUsers: uniqueUsers[0]?.count || 0,
      bySector,
      byAction,
      hourlyToday,
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch activity stats." });
  }
});

router.get("/users", async (_req, res) => {
  try {
    const users = await db.select({
      userId: activitiesTable.userId,
      sessionId: activitiesTable.sessionId,
      ipAddress: activitiesTable.ipAddress,
      totalActions: sql<number>`count(*)`,
      sectors: sql<string>`string_agg(distinct ${activitiesTable.sector}, ', ')`,
      lastAction: sql<string>`max(${activitiesTable.action})`,
      firstSeen: sql<string>`min(${activitiesTable.createdAt})`,
      lastSeen: sql<string>`max(${activitiesTable.createdAt})`,
    }).from(activitiesTable)
      .groupBy(activitiesTable.userId, activitiesTable.sessionId, activitiesTable.ipAddress)
      .orderBy(sql`max(${activitiesTable.createdAt}) desc`)
      .limit(100);

    res.json({ users });
  } catch {
    res.status(500).json({ error: "Failed to fetch user data." });
  }
});

export default router;

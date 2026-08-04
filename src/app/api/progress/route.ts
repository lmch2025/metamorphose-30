import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/* Initialise le singleton de stats s'il n'existe pas */
async function ensureStats() {
  const existing = await db.userStats.findUnique({ where: { id: "singleton" } });
  if (!existing) {
    return db.userStats.create({ data: { id: "singleton" } });
  }
  return existing;
}

/* GET /api/progress — renvoie la liste des jours complétés + stats */
export async function GET() {
  const [progressRows, stats] = await Promise.all([
    db.dayProgress.findMany(),
    ensureStats(),
  ]);

  const completedDays = progressRows
    .filter((p) => p.completed)
    .map((p) => p.day)
    .sort((a, b) => a - b);

  return NextResponse.json({
    completedDays,
    stats: {
      totalSessions: stats.totalSessions,
      totalMinutes: stats.totalMinutes,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastSessionDay: stats.lastSessionDay,
      lastSessionDate: stats.lastSessionDate,
    },
  });
}

/* POST /api/progress — marque un jour comme complété (ou non) */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { day, completed = true } = body as { day: number; completed?: boolean };

    if (typeof day !== "number" || day < 1 || day > 30) {
      return NextResponse.json(
        { error: "Le paramètre 'day' doit être un nombre entre 1 et 30." },
        { status: 400 },
      );
    }

    /* Upsert du jour */
    await db.dayProgress.upsert({
      where: { day },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
      },
      create: {
        day,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    /* Recalcul des stats agrégées */
    const allProgress = await db.dayProgress.findMany({ where: { completed: true } });
    const completedDays = allProgress.map((p) => p.day).sort((a, b) => a - b);

    /* Calcul de la série (streak) : jours consécutifs à partir de 1 */
    let currentStreak = 0;
    for (let i = 1; i <= 30; i++) {
      if (completedDays.includes(i)) currentStreak++;
      else break;
    }

    const stats = await ensureStats();
    const longestStreak = Math.max(stats.longestStreak, currentStreak);

    await db.userStats.update({
      where: { id: "singleton" },
      data: {
        totalSessions: completedDays.length,
        totalMinutes: completedDays.length * 5,
        currentStreak,
        longestStreak,
        lastSessionDay: completed ? day : stats.lastSessionDay,
        lastSessionDate: completed ? new Date() : stats.lastSessionDate,
      },
    });

    return NextResponse.json({
      success: true,
      day,
      completed,
      completedDays,
      currentStreak,
      longestStreak,
      totalSessions: completedDays.length,
    });
  } catch (error) {
    console.error("[POST /api/progress] error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la progression." },
      { status: 500 },
    );
  }
}

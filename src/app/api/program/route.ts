import { NextResponse } from "next/server";
import {
  program,
  PHASES,
  TOTAL_DAYS,
  TOTAL_DURATION,
  TOTAL_EXERCISES,
} from "@/lib/program-data";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    program,
    phases: PHASES,
    meta: {
      totalDays: TOTAL_DAYS,
      totalDuration: TOTAL_DURATION,
      totalExercises: TOTAL_EXERCISES,
      dailyDuration: 300,
    },
  });
}

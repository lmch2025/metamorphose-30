import { NextResponse } from "next/server";
import { fitnessResources } from "@/lib/resources-data";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({
    resources: fitnessResources,
    total: fitnessResources.length,
  });
}

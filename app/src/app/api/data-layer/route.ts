import { NextResponse } from "next/server";
import { getDataLayerSnapshot } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 40)));
  const snapshot = await getDataLayerSnapshot(limit);
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "no-store" },
  });
}

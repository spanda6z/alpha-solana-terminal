import { NextResponse } from "next/server";
import { getRapSheetSnapshot } from "@/lib/data/rapsheet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(40, Number(searchParams.get("limit") ?? 80)));
  return NextResponse.json(await getRapSheetSnapshot(limit), {
    headers: { "Cache-Control": "no-store" },
  });
}

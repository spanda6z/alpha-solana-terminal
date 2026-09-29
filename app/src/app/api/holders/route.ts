import { NextRequest, NextResponse } from "next/server";
import { fetchHolderSnapshot } from "../../../lib/data/rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const mint = request.nextUrl.searchParams.get("mint");
  if (!mint) return NextResponse.json({ error: "mint is required" }, { status: 400 });
  const holders = await fetchHolderSnapshot(mint);
  return NextResponse.json(
    { mint, holders, generatedAt: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

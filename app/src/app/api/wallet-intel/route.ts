import { NextResponse } from "next/server";
import { fetchWalletIntel } from "@/lib/data/helius";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ error: "wallet is required" }, { status: 400 });
  const intel = await fetchWalletIntel(wallet);
  return NextResponse.json({ intel, generatedAt: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}

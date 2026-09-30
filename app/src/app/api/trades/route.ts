import { NextRequest, NextResponse } from "next/server";
import { getMintSwaps, hasHelius } from "@/lib/helius";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const mint = req.nextUrl.searchParams.get("mint");
  if (!mint || mint.length < 32) {
    return NextResponse.json({ ok: false, error: "mint required" }, { status: 400 });
  }
  if (!hasHelius()) {
    return NextResponse.json({
      ok: false,
      error: "HELIUS_API_KEY not set",
      trades: [],
      hint: "Add HELIUS_API_KEY in Vercel env",
    });
  }
  try {
    const trades = await getMintSwaps(mint, 50);
    return NextResponse.json({ ok: true, trades });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e?.message || "trades failed",
      trades: [],
    });
  }
}

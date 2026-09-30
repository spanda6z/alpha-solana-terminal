import { NextResponse } from "next/server";
import { hasHelius } from "@/lib/helius";

export const dynamic = "force-dynamic";

export async function GET() {
  const birdeye = Boolean(process.env.BIRDEYE_API_KEY);
  const helius = hasHelius();
  return NextResponse.json({
    ok: true,
    product: "SOLBIT",
    chain: "solana",
    providers: {
      birdeye: birdeye ? "configured" : "missing",
      helius: helius ? "configured" : "missing",
      dexscreener: "public",
    },
    ready: {
      discover: true,
      deskChart: true,
      tradeTape: helius,
      holders: helius,
      denseBoard: birdeye,
    },
    honesty: "No fabricated market activity. Missing feeds return WAITING FOR DATA.",
  });
}

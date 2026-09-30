import { NextResponse } from "next/server";
import { fetchBirdeyeTokenList, fetchBirdeyeTokenOverview } from "@/lib/data/birdeye";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  const sort = (searchParams.get("sort") || "volume") as
    | "volume"
    | "momentum"
    | "liquidity"
    | "market_cap";

  try {
    if (address) {
      const token = await fetchBirdeyeTokenOverview(address);
      return NextResponse.json(
        { source: "birdeye", live: Boolean(token), token, generatedAt: Date.now() },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    const sortBy =
      sort === "momentum"
        ? "volume_24h_change_percent"
        : sort === "liquidity"
          ? "liquidity"
          : sort === "market_cap"
            ? "market_cap"
            : "volume_24h_usd";

    const tokens = await fetchBirdeyeTokenList({
      limit: Math.min(100, Math.max(1, Number(searchParams.get("limit") || 50))),
      sortBy,
      minLiquidity: Math.max(0, Number(searchParams.get("minLiquidity") || 100)),
    });

    return NextResponse.json(
      { source: "birdeye", live: true, tokens, generatedAt: Date.now() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        source: "birdeye",
        live: false,
        tokens: [],
        error: error instanceof Error ? error.message : "Birdeye request failed",
        generatedAt: Date.now(),
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}

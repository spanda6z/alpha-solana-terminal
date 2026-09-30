import { NextRequest, NextResponse } from "next/server";
import {
  birdeyeTrending,
  birdeyeTokenList,
  birdeyeNewListings,
  birdeyeSearch,
  type BirdeyeToken,
} from "@/lib/birdeye";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function fmtUsd(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.0001) return `$${n.toFixed(4)}`;
  return `$${n.toExponential(2)}`;
}

function fmtPrice(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(2)}`;
}

function riskFrom(liq: number, change: number): "LOW" | "MED" | "HIGH" | "UNKNOWN" {
  if (liq < 5000) return "HIGH";
  if (liq < 50000 || Math.abs(change) > 80) return "MED";
  if (liq > 200000) return "LOW";
  return "UNKNOWN";
}

function mapToken(t: BirdeyeToken) {
  const price = t.price ?? 0;
  const liq = t.liquidity ?? 0;
  const vol = t.volume24hUSD ?? 0;
  const change = t.price24hChangePercent ?? 0;
  const mc = t.mc ?? t.marketCap ?? 0;
  return {
    mint: t.address,
    symbol: t.symbol || "???",
    name: t.name || "",
    risk: riskFrom(liq, change),
    price: fmtPrice(price),
    priceRaw: price,
    change24h: change,
    mcap: fmtUsd(mc),
    mcapRaw: mc,
    liq: fmtUsd(liq),
    liqRaw: liq,
    vol: fmtUsd(vol),
    volRaw: vol,
    age: "—",
    imageUrl: t.logoURI,
    source: "birdeye",
  };
}

export async function GET(req: NextRequest) {
  const key = process.env.BIRDEYE_API_KEY;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const mode = searchParams.get("mode") || "trending";

  if (!key) {
    return NextResponse.json(
      { ok: false, error: "BIRDEYE_API_KEY not set", tokens: [], source: "none" },
      { status: 200 }
    );
  }

  try {
    let raw: BirdeyeToken[] = [];
    if (q.trim().length > 1) {
      raw = await birdeyeSearch(key, q.trim(), 30);
    } else if (mode === "new") {
      raw = await birdeyeNewListings(key, 30);
    } else if (mode === "volume") {
      raw = await birdeyeTokenList(key, "v24hUSD", 50);
    } else {
      raw = await birdeyeTrending(key, 50);
      if (raw.length < 10) {
        const more = await birdeyeTokenList(key, "v24hUSD", 50);
        const seen = new Set(raw.map((t) => t.address));
        for (const t of more) {
          if (t.address && !seen.has(t.address)) {
            raw.push(t);
            seen.add(t.address);
          }
        }
      }
    }

    const tokens = raw.filter((t) => t.address).map(mapToken).slice(0, 80);

    return NextResponse.json({
      ok: true,
      source: "birdeye",
      count: tokens.length,
      tokens,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message || "Birdeye failed",
        tokens: [],
        source: "birdeye",
      },
      { status: 200 }
    );
  }
}

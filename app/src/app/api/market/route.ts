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

type OutToken = {
  mint: string;
  pairAddress?: string;
  symbol: string;
  name: string;
  risk: "LOW" | "MED" | "HIGH" | "UNKNOWN";
  price: string;
  priceRaw: number;
  change24h: number;
  mcap: string;
  mcapRaw: number;
  liq: string;
  liqRaw: number;
  vol: string;
  volRaw: number;
  age: string;
  imageUrl?: string;
  source: string;
};

function mapBirdeye(t: BirdeyeToken): OutToken {
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

function ageFrom(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

async function dexScreenerFallback(q: string, mode: string): Promise<OutToken[]> {
  let url = "https://api.dexscreener.com/token-boosts/top/v1";
  if (q.trim().length > 20) {
    url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(q.trim())}`;
  } else if (q.trim().length > 1) {
    url = `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q.trim())}`;
  } else if (mode === "new") {
    url = "https://api.dexscreener.com/token-profiles/latest/v1";
  }

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();

    let pairs: any[] = [];
    if (Array.isArray(data.pairs)) pairs = data.pairs;
    else if (Array.isArray(data)) {
      const addrs = data
        .filter((x: any) => (x.chainId || "").toLowerCase() === "solana")
        .map((x: any) => x.tokenAddress)
        .filter(Boolean)
        .slice(0, 20);
      if (addrs.length) {
        const r2 = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${addrs.join(",")}`,
          { cache: "no-store" }
        );
        if (r2.ok) {
          const j2 = await r2.json();
          pairs = j2.pairs || [];
        }
      }
    }

    const sol = pairs.filter((p) => (p.chainId || "").toLowerCase() === "solana");
    const seen = new Set<string>();
    const out: OutToken[] = [];
    for (const p of sol) {
      const mint = p.baseToken?.address;
      if (!mint || seen.has(mint)) continue;
      seen.add(mint);
      const price = Number(p.priceUsd) || 0;
      const liq = Number(p.liquidity?.usd) || 0;
      const vol = Number(p.volume?.h24) || 0;
      const change = Number(p.priceChange?.h24) || 0;
      const mc = Number(p.marketCap || p.fdv) || 0;
      out.push({
        mint,
        pairAddress: p.pairAddress,
        symbol: p.baseToken?.symbol || "???",
        name: p.baseToken?.name || "",
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
        age: p.pairCreatedAt ? ageFrom(p.pairCreatedAt) : "—",
        imageUrl: p.info?.imageUrl,
        source: "dexscreener",
      });
      if (out.length >= 60) break;
    }
    return out;
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const key = process.env.BIRDEYE_API_KEY;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const mode = searchParams.get("mode") || "trending";

  if (key) {
    try {
      let raw: BirdeyeToken[] = [];
      if (q.trim().length > 1) {
        raw = await birdeyeSearch(key, q.trim(), 30);
      } else if (mode === "new") {
        raw = await birdeyeNewListings(key, 30);
      } else if (mode === "volume" || mode === "liquidity") {
        raw = await birdeyeTokenList(key, "v24hUSD", 50);
      } else if (mode === "gainers") {
        raw = await birdeyeTokenList(key, "v24hChangePercent", 50);
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

      let tokens = raw.filter((t) => t.address).map(mapBirdeye);
      if (mode === "losers") tokens = [...tokens].sort((a, b) => a.change24h - b.change24h);
      else if (mode === "gainers") tokens = [...tokens].sort((a, b) => b.change24h - a.change24h);
      else if (mode === "liquidity") tokens = [...tokens].sort((a, b) => b.liqRaw - a.liqRaw);

      if (tokens.length >= 5) {
        return NextResponse.json({
          ok: true,
          source: "birdeye",
          count: tokens.length,
          tokens: tokens.slice(0, 80),
        });
      }
    } catch {
      /* fall through */
    }
  }

  const fallback = await dexScreenerFallback(q, mode);
  if (fallback.length) {
    let tokens = fallback;
    if (mode === "losers") tokens = [...tokens].sort((a, b) => a.change24h - b.change24h);
    if (mode === "gainers") tokens = [...tokens].sort((a, b) => b.change24h - a.change24h);
    if (mode === "liquidity") tokens = [...tokens].sort((a, b) => b.liqRaw - a.liqRaw);
    return NextResponse.json({
      ok: true,
      source: "dexscreener",
      count: tokens.length,
      tokens,
      note: key ? "Birdeye thin — DexScreener fallback" : "DexScreener public fallback",
    });
  }

  return NextResponse.json({
    ok: false,
    error: key ? "Market providers returned no rows" : "BIRDEYE_API_KEY not set; DexScreener empty",
    tokens: [],
    source: "none",
    hint: "Set BIRDEYE_API_KEY on Vercel for denser boards",
  });
}

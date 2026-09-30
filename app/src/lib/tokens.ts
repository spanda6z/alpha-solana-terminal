/**
 * Market data — prefers Birdeye via /api/market, falls back to DexScreener
 */

export type RiskLevel = "LOW" | "MED" | "HIGH" | "UNKNOWN";

export interface TokenRow {
  mint: string;
  symbol: string;
  name: string;
  risk: RiskLevel;
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
  pairUrl?: string;
  pairAddress?: string;
  buys?: number;
  sells?: number;
  source?: string;
}

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

function ageFromMs(createdAt?: number): string {
  if (!createdAt) return "—";
  const mins = Math.floor((Date.now() - createdAt) / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

function riskFrom(liqUsd: number, change24h: number): RiskLevel {
  if (liqUsd < 5000) return "HIGH";
  if (liqUsd < 50000 || Math.abs(change24h) > 80) return "MED";
  if (liqUsd > 200000) return "LOW";
  return "UNKNOWN";
}

interface DexPair {
  chainId: string;
  pairAddress: string;
  url?: string;
  baseToken: { address: string; name: string; symbol: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  marketCap?: number;
  fdv?: number;
  pairCreatedAt?: number;
  info?: { imageUrl?: string };
}

function pairToRow(p: DexPair): TokenRow | null {
  if (p.chainId !== "solana") return null;
  const mint = p.baseToken?.address;
  if (!mint) return null;
  const price = parseFloat(p.priceUsd || "0");
  const liq = p.liquidity?.usd ?? 0;
  const change = p.priceChange?.h24 ?? 0;
  const mcap = p.marketCap ?? p.fdv ?? 0;
  const vol = p.volume?.h24 ?? 0;
  return {
    mint,
    symbol: p.baseToken.symbol || "???",
    name: p.baseToken.name || "",
    risk: riskFrom(liq, change),
    price: fmtPrice(price),
    priceRaw: price,
    change24h: change,
    mcap: fmtUsd(mcap),
    mcapRaw: mcap,
    liq: fmtUsd(liq),
    liqRaw: liq,
    vol: fmtUsd(vol),
    volRaw: vol,
    age: ageFromMs(p.pairCreatedAt),
    imageUrl: p.info?.imageUrl,
    pairUrl: p.url,
    pairAddress: p.pairAddress,
    source: "dexscreener",
  };
}

function dedupeBest(pairs: DexPair[]): TokenRow[] {
  const best = new Map<string, DexPair>();
  for (const p of pairs) {
    if (p.chainId !== "solana" || !p.baseToken?.address) continue;
    const mint = p.baseToken.address;
    const prev = best.get(mint);
    if (!prev || (p.liquidity?.usd ?? 0) > (prev.liquidity?.usd ?? 0)) best.set(mint, p);
  }
  const rows: TokenRow[] = [];
  for (const p of best.values()) {
    const row = pairToRow(p);
    if (row) rows.push(row);
  }
  return rows;
}

async function fromBirdeyeApi(q?: string, mode?: string): Promise<TokenRow[]> {
  try {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (mode) params.set("mode", mode);
    const res = await fetch(`/api/market?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.ok || !Array.isArray(data.tokens) || !data.tokens.length) return [];
    return data.tokens as TokenRow[];
  } catch {
    return [];
  }
}

async function dexSearch(q: string): Promise<TokenRow[]> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return dedupeBest(data.pairs || []).slice(0, 40);
  } catch {
    return [];
  }
}

async function dexMarket(): Promise<TokenRow[]> {
  const all: DexPair[] = [];
  try {
    const boosts = await fetch("https://api.dexscreener.com/token-boosts/top/v1");
    if (boosts.ok) {
      const list = await boosts.json();
      const solMints = (list as any[])
        .filter((b) => b.chainId === "solana")
        .slice(0, 40)
        .map((b) => b.tokenAddress as string);
      for (let i = 0; i < solMints.length; i += 30) {
        const chunk = solMints.slice(i, i + 30).join(",");
        const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${chunk}`);
        if (r.ok) {
          const d = await r.json();
          all.push(...(d.pairs || []));
        }
      }
    }
  } catch {
    /* */
  }
  for (const q of ["SOL", "USDC", "raydium", "pump"]) {
    try {
      const r = await fetch(
        `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(q)}`
      );
      if (r.ok) {
        const d = await r.json();
        all.push(
          ...((d.pairs || []) as DexPair[]).filter((p) => p.chainId === "solana").slice(0, 40)
        );
      }
    } catch {
      /* */
    }
  }
  let rows = dedupeBest(all);
  rows.sort((a, b) => b.volRaw - a.volRaw);
  return rows.slice(0, 80);
}

async function attachPairs(rows: TokenRow[]): Promise<TokenRow[]> {
  const need = rows.filter((r) => !r.pairAddress).slice(0, 25);
  if (!need.length) return rows;
  try {
    const ids = need.map((r) => r.mint).join(",");
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ids}`);
    if (!res.ok) return rows;
    const data = await res.json();
    const best = new Map<string, string>();
    for (const p of data.pairs || []) {
      if (p.chainId !== "solana") continue;
      const mint = p.baseToken?.address;
      if (!mint || best.has(mint)) continue;
      best.set(mint, p.pairAddress);
    }
    return rows.map((r) => ({
      ...r,
      pairAddress: r.pairAddress || best.get(r.mint),
    }));
  } catch {
    return rows;
  }
}

export async function searchTokens(q: string): Promise<TokenRow[]> {
  if (!q.trim()) return [];
  const be = await fromBirdeyeApi(q);
  if (be.length) return attachPairs(be);
  return dexSearch(q);
}

export type MarketMode =
  | "trending"
  | "new"
  | "volume"
  | "liquidity"
  | "gainers"
  | "losers";

export async function fetchMarketTokens(
  limit = 80,
  mode: MarketMode = "trending"
): Promise<TokenRow[]> {
  const beMode =
    mode === "new"
      ? "new"
      : mode === "volume" || mode === "liquidity"
      ? "volume"
      : "trending";
  const be = await fromBirdeyeApi(undefined, beMode);
  let rows = be.length ? await attachPairs(be) : await dexMarket();

  if (mode === "gainers") {
    rows = [...rows].sort((a, b) => b.change24h - a.change24h);
  } else if (mode === "losers") {
    rows = [...rows].sort((a, b) => a.change24h - b.change24h);
  } else if (mode === "liquidity") {
    rows = [...rows].sort((a, b) => b.liqRaw - a.liqRaw);
  } else if (mode === "volume") {
    rows = [...rows].sort((a, b) => b.volRaw - a.volRaw);
  } else if (mode === "new") {
    rows = [...rows].sort((a, b) => a.mcapRaw - b.mcapRaw);
  }
  return rows.slice(0, limit);
}

export async function fetchWatchlistTokens(): Promise<TokenRow[]> {
  return fetchMarketTokens(20);
}

/**
 * Solana market discovery via DexScreener public endpoints.
 *
 * This module deliberately labels data according to what DexScreener actually
 * exposes. It does not invent bonding/graduation state.
 */

export type Verdict = "SAFE" | "CAUTION" | "DANGER" | "BLUE CHIP" | "UNKNOWN";

export type MarketCategory =
  | "TRENDING"
  | "NEW"
  | "VOLUME"
  | "LIQUIDITY"
  | "MOVERS"
  | "BONDING";

export interface TokenRow {
  mint: string;
  symbol: string;
  name: string;
  verdict: Verdict;
  price: string;
  priceRaw: number;
  change24h: number;
  mcap: string;
  liq: string;
  vol: string;
  age: string;
  ageMs: number;
  volume24h: number;
  liquidityUsd: number;
  imageUrl?: string;
  pairUrl?: string;
  pairAddress?: string;
  dexId?: string;
  createdAt?: number;
  source?: "boosts" | "profiles" | "search" | "watchlist";
}

const BLUE_CHIPS = new Set([
  "So11111111111111111111111111111111111111112",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
]);

const WATCHLIST = [
  "So11111111111111111111111111111111111111112",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
];

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
  if (n == null || !Number.isFinite(n) || n === 0) return "—";
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(2)}`;
}

function ageFromMs(createdAt?: number): string {
  if (!createdAt) return "—";
  const age = Math.max(0, Date.now() - createdAt);
  const minutes = Math.floor(age / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}y`;
}

function guessVerdict(mint: string, liqUsd: number, change24h: number): Verdict {
  if (BLUE_CHIPS.has(mint)) return "BLUE CHIP";
  if (liqUsd < 5000) return "DANGER";
  if (liqUsd < 50000) return "CAUTION";
  if (Math.abs(change24h) > 80) return "CAUTION";
  if (liqUsd > 200000) return "SAFE";
  return "UNKNOWN";
}

interface DexPair {
  chainId: string;
  dexId?: string;
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

interface DiscoveryItem {
  chainId: string;
  tokenAddress: string;
  icon?: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Market feed failed (${res.status})`);
  return res.json();
}

async function enrichTokens(addresses: string[]): Promise<TokenRow[]> {
  const unique = [...new Set(addresses.filter(Boolean))].slice(0, 100);
  if (!unique.length) return [];

  const data = await getJson<{ pairs?: DexPair[] }>(
    `https://api.dexscreener.com/latest/dex/tokens/${unique.join(",")}`
  );

  const best = new Map<string, DexPair>();
  for (const pair of data.pairs || []) {
    if (pair.chainId !== "solana") continue;
    const mint = pair.baseToken.address;
    const previous = best.get(mint);
    if (!previous || (pair.liquidity?.usd ?? 0) > (previous.liquidity?.usd ?? 0)) {
      best.set(mint, pair);
    }
  }

  return [...best.values()].map(pairToRow).filter(Boolean) as TokenRow[];
}

function pairToRow(p: DexPair): TokenRow | null {
  if (p.chainId !== "solana") return null;

  const mint = p.baseToken.address;
  const price = Number.parseFloat(p.priceUsd || "0");
  const liq = p.liquidity?.usd ?? 0;
  const change = p.priceChange?.h24 ?? 0;
  const volume = p.volume?.h24 ?? 0;
  const createdAt = p.pairCreatedAt;

  return {
    mint,
    symbol: p.baseToken.symbol || "UNKNOWN",
    name: p.baseToken.name || "Unknown token",
    verdict: guessVerdict(mint, liq, change),
    price: fmtPrice(price),
    priceRaw: price,
    change24h: change,
    mcap: fmtUsd(p.marketCap ?? p.fdv),
    liq: fmtUsd(liq),
    vol: fmtUsd(volume),
    age: ageFromMs(createdAt),
    ageMs: createdAt ? Math.max(0, Date.now() - createdAt) : Number.MAX_SAFE_INTEGER,
    volume24h: volume,
    liquidityUsd: liq,
    imageUrl: p.info?.imageUrl,
    pairUrl: p.url,
    pairAddress: p.pairAddress,
    dexId: p.dexId,
    createdAt,
  };
}

export async function fetchWatchlistTokens(): Promise<TokenRow[]> {
  try {
    const rows = await enrichTokens(WATCHLIST);
    return rows.length ? rows : fallbackRows();
  } catch {
    return fallbackRows();
  }
}

export async function fetchTrendingTokens(limit = 100): Promise<TokenRow[]> {
  try {
    const boosts = await getJson<DiscoveryItem[]>(
      "https://api.dexscreener.com/token-boosts/top/v1"
    );
    const addresses = boosts
      .filter((item) => item.chainId === "solana")
      .map((item) => item.tokenAddress)
      .slice(0, Math.max(20, Math.min(limit, 100)));

    const rows = await enrichTokens(addresses);
    return rows.length ? rows : fallbackRows();
  } catch {
    return fetchWatchlistTokens();
  }
}

export async function fetchNewTokens(limit = 100): Promise<TokenRow[]> {
  try {
    const profiles = await getJson<DiscoveryItem[]>(
      "https://api.dexscreener.com/token-profiles/latest/v1"
    );
    const addresses = profiles
      .filter((item) => item.chainId === "solana")
      .map((item) => item.tokenAddress)
      .slice(0, Math.min(limit, 100));

    const rows = await enrichTokens(addresses);
    return rows
      .sort((a, b) => a.ageMs - b.ageMs)
      .map((row) => ({ ...row, source: "profiles" }));
  } catch {
    return [];
  }
}

export async function fetchMarketTokens(category: MarketCategory): Promise<TokenRow[]> {
  const rows =
    category === "NEW"
      ? await fetchNewTokens(100)
      : await fetchTrendingTokens(100);

  const deduped = new Map<string, TokenRow>();
  for (const row of rows) deduped.set(row.mint, row);

  const result = [...deduped.values()];

  switch (category) {
    case "VOLUME":
      return result.sort((a, b) => b.volume24h - a.volume24h);
    case "LIQUIDITY":
      return result.sort((a, b) => b.liquidityUsd - a.liquidityUsd);
    case "MOVERS":
      return result.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
    case "NEW":
      return result.sort((a, b) => a.ageMs - b.ageMs);
    case "BONDING":
      // DexScreener does not expose a verified Solana bonding/graduation state
      // in this feed. Show the newest discovered pairs instead of inventing it.
      return result
        .filter((row) => row.ageMs <= 7 * 86400000)
        .sort((a, b) => a.ageMs - b.ageMs);
    case "TRENDING":
    default:
      return result;
  }
}

export async function searchTokens(query: string): Promise<TokenRow[]> {
  const q = query.trim();
  if (!q) return fetchTrendingTokens(100);

  // A mint address can be queried directly and is the most precise path.
  try {
    const rows = await enrichTokens([q]);
    if (rows.length) return rows;
  } catch {
    // Fall through to the public search endpoint.
  }

  try {
    const data = await getJson<{ pairs?: DexPair[] }>(
      `https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(q)}`
    );
    const best = new Map<string, DexPair>();

    for (const pair of data.pairs || []) {
      if (pair.chainId !== "solana") continue;
      const mint = pair.baseToken.address;
      const previous = best.get(mint);
      if (!previous || (pair.liquidity?.usd ?? 0) > (previous.liquidity?.usd ?? 0)) {
        best.set(mint, pair);
      }
    }

    return [...best.values()].map(pairToRow).filter(Boolean) as TokenRow[];
  } catch {
    return [];
  }
}

export function filterTokens(
  rows: TokenRow[],
  options: { query?: string; dex?: string }
): TokenRow[] {
  const query = options.query?.trim().toLowerCase() || "";
  const dex = options.dex || "ALL";

  return rows.filter((row) => {
    if (dex !== "ALL" && row.dexId !== dex) return false;
    if (!query) return true;

    return (
      row.symbol.toLowerCase().includes(query) ||
      row.name.toLowerCase().includes(query) ||
      row.mint.toLowerCase().includes(query)
    );
  });
}

function fallbackRows(): TokenRow[] {
  return [
    {
      mint: "So11111111111111111111111111111111111111112",
      symbol: "SOL",
      name: "Solana",
      verdict: "BLUE CHIP",
      price: "—",
      priceRaw: 0,
      change24h: 0,
      mcap: "—",
      liq: "—",
      vol: "—",
      age: "—",
      ageMs: Number.MAX_SAFE_INTEGER,
      volume24h: 0,
      liquidityUsd: 0,
      source: "watchlist",
    },
  ];
}

/**
 * Live Solana token data via DexScreener (public, no API key)
 */

export type Verdict = "SAFE" | "CAUTION" | "DANGER" | "BLUE CHIP" | "UNKNOWN";

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
  imageUrl?: string;
  pairUrl?: string;
  pairAddress?: string;
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
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1000) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.01) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toExponential(2)}`;
}

function ageFromMs(createdAt?: number): string {
  if (!createdAt) return "—";
  const days = Math.floor((Date.now() - createdAt) / 86400000);
  if (days < 1) return "<1d";
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
  const mint = p.baseToken.address;
  const price = parseFloat(p.priceUsd || "0");
  const liq = p.liquidity?.usd ?? 0;
  const change = p.priceChange?.h24 ?? 0;
  return {
    mint,
    symbol: p.baseToken.symbol,
    name: p.baseToken.name,
    verdict: guessVerdict(mint, liq, change),
    price: fmtPrice(price),
    priceRaw: price,
    change24h: change,
    mcap: fmtUsd(p.marketCap ?? p.fdv),
    liq: fmtUsd(liq),
    vol: fmtUsd(p.volume?.h24),
    age: ageFromMs(p.pairCreatedAt),
    imageUrl: p.info?.imageUrl,
    pairUrl: p.url,
    pairAddress: p.pairAddress,
  };
}

export async function fetchWatchlistTokens(): Promise<TokenRow[]> {
  const ids = WATCHLIST.join(",");
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${ids}`);
  if (!res.ok) return fallbackRows();
  const data = await res.json();
  const pairs: DexPair[] = data.pairs || [];
  const best = new Map<string, DexPair>();
  for (const p of pairs) {
    if (p.chainId !== "solana") continue;
    const mint = p.baseToken.address;
    const prev = best.get(mint);
    if (!prev || (p.liquidity?.usd ?? 0) > (prev.liquidity?.usd ?? 0)) best.set(mint, p);
  }
  const rows: TokenRow[] = [];
  for (const mint of WATCHLIST) {
    const p = best.get(mint);
    if (p) {
      const row = pairToRow(p);
      if (row) rows.push(row);
    }
  }
  return rows.length ? rows : fallbackRows();
}

export async function fetchFirehoseTokens(limit = 30): Promise<TokenRow[]> {
  try {
    // DexScreener search gives us a broad, public market stream without inventing events.
    // We use several high-signal Solana queries and deduplicate by mint.
    const queries = ["solana", "pump", "ai", "meme"];
    const responses = await Promise.all(
      queries.map((q) => fetch(`https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(q)}`))
    );
    const best = new Map<string, DexPair>();
    for (const res of responses) {
      if (!res.ok) continue;
      const data = await res.json();
      for (const p of (data.pairs || []) as DexPair[]) {
        if (p.chainId !== "solana") continue;
        const mint = p.baseToken.address;
        const prev = best.get(mint);
        if (!prev || (p.pairCreatedAt ?? 0) > (prev.pairCreatedAt ?? 0)) best.set(mint, p);
      }
    }
    return [...best.values()]
      .sort((a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0))
      .slice(0, limit)
      .map(pairToRow)
      .filter((x): x is TokenRow => Boolean(x));
  } catch {
    return [];
  }
}

export async function fetchTrendingTokens(limit = 20): Promise<TokenRow[]> {
  try {
    const res = await fetch("https://api.dexscreener.com/token-boosts/top/v1");
    if (!res.ok) throw new Error("boosts failed");
    const boosts = await res.json();
    const sol = (boosts as any[])
      .filter((b) => b.chainId === "solana")
      .slice(0, limit)
      .map((b) => b.tokenAddress as string);
    if (!sol.length) throw new Error("empty");
    const res2 = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${sol.join(",")}`);
    const data = await res2.json();
    const pairs: DexPair[] = data.pairs || [];
    const best = new Map<string, DexPair>();
    for (const p of pairs) {
      if (p.chainId !== "solana") continue;
      const mint = p.baseToken.address;
      const prev = best.get(mint);
      if (!prev || (p.liquidity?.usd ?? 0) > (prev.liquidity?.usd ?? 0)) best.set(mint, p);
    }
    const rows: TokenRow[] = [];
    for (const mint of sol) {
      const p = best.get(mint);
      if (p) {
        const row = pairToRow(p);
        if (row) rows.push(row);
      }
    }
    return rows.length ? rows : fallbackRows();
  } catch {
    return fetchWatchlistTokens();
  }
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
    },
  ];
}

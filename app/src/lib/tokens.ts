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

async function fetchBirdeyeRows(sort: "volume" | "momentum" | "liquidity" | "market_cap" = "volume", limit = 50): Promise<TokenRow[]> {
  try {
    const res = await fetch(`/api/market?sort=${sort}&limit=${Math.min(limit, 100)}&minLiquidity=100`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok || !data.live || !Array.isArray(data.tokens)) return [];
    return data.tokens.map((token: any) => ({
      mint: token.address,
      symbol: token.symbol,
      name: token.name,
      verdict: guessVerdict(token.address, Number(token.liquidity || 0), Number(token.priceChange24hPercent || 0)),
      price: fmtPrice(Number(token.price || 0)),
      priceRaw: Number(token.price || 0),
      change24h: Number(token.priceChange24hPercent || 0),
      mcap: fmtUsd(Number(token.marketCap || token.fdv || 0)),
      liq: fmtUsd(Number(token.liquidity || 0)),
      vol: fmtUsd(Number(token.volume24h || 0)),
      age: "LIVE",
      imageUrl: token.logoURI,
    })) as TokenRow[];
  } catch {
    return [];
  }
}

export async function fetchWatchlistTokens(): Promise<TokenRow[]> {
  const rows = await Promise.all(WATCHLIST.map(async (mint) => {
    try {
      const res = await fetch(`/api/market?address=${encodeURIComponent(mint)}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.live || !data.token) return null;
      const token = data.token;
      return {
        mint: token.address,
        symbol: token.symbol,
        name: token.name,
        verdict: guessVerdict(token.address, Number(token.liquidity || 0), Number(token.priceChange24hPercent || 0)),
        price: fmtPrice(Number(token.price || 0)),
        priceRaw: Number(token.price || 0),
        change24h: Number(token.priceChange24hPercent || 0),
        mcap: fmtUsd(Number(token.marketCap || token.fdv || 0)),
        liq: fmtUsd(Number(token.liquidity || 0)),
        vol: fmtUsd(Number(token.volume24h || 0)),
        age: "LIVE",
        imageUrl: token.logoURI,
      } as TokenRow;
    } catch {
      return null;
    }
  }));
  const valid = rows.filter((row): row is TokenRow => Boolean(row));
  return valid.length ? valid : fallbackRows();
}

export async function fetchTrendingTokens(limit = 20): Promise<TokenRow[]> {
  const rows = await fetchBirdeyeRows("volume", limit);
  return rows.length ? rows : fallbackRows();
}

export async function fetchFirehoseTokens(limit = 30): Promise<TokenRow[]> {
  return fetchBirdeyeRows("momentum", limit);
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

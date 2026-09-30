const BASE = "https://public-api.birdeye.so";

type BirdeyeToken = Record<string, any>;

async function birdeyeGet(path: string, params: Record<string, string | number | undefined>) {
  const key = process.env.BIRDEYE_API_KEY;
  if (!key) throw new Error("BIRDEYE_API_KEY is not configured");
  const url = new URL(BASE + path);
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(name, String(value));
  }
  const response = await fetch(url, {
    headers: { accept: "application/json", "X-API-KEY": key, "x-chain": "solana" },
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error("Birdeye " + response.status + ": " + body.slice(0, 180));
  }
  const payload = await response.json();
  if (payload?.success === false) throw new Error(payload?.message || "Birdeye request failed");
  return payload?.data ?? payload;
}

export interface BirdeyeMarketRow {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24hPercent: number;
  liquidity: number;
  volume24h: number;
  marketCap: number;
  fdv: number;
  holder: number;
  trade24h: number;
  buy24h: number;
  sell24h: number;
  logoURI?: string;
  lastTradeUnixTime?: number;
}

function numberOf(...values: unknown[]): number {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function normalizeToken(item: BirdeyeToken): BirdeyeMarketRow | null {
  const address = String(item.address || item.mint || "");
  if (!address) return null;
  return {
    address,
    symbol: String(item.symbol || "UNKNOWN"),
    name: String(item.name || item.symbol || "Unknown token"),
    price: numberOf(item.price, item.priceUsd),
    priceChange24hPercent: numberOf(item.priceChange24hPercent, item.price_change_24h_percent),
    liquidity: numberOf(item.liquidity, item.liquidityUsd, item.liquidity_usd),
    volume24h: numberOf(item.v24hUSD, item.volume24hUSD, item.volume_24h_usd),
    marketCap: numberOf(item.mc, item.marketCap, item.market_cap),
    fdv: numberOf(item.fdv),
    holder: numberOf(item.holder, item.holders),
    trade24h: numberOf(item.trade24h, item.trade_24h_count),
    buy24h: numberOf(item.buy24h, item.buy_24h_count),
    sell24h: numberOf(item.sell24h, item.sell_24h_count),
    logoURI: item.logoURI || item.logo_uri || undefined,
    lastTradeUnixTime: numberOf(item.lastTradeUnixTime, item.last_trade_unix_time) || undefined,
  };
}

export async function fetchBirdeyeTokenList(options: {
  limit?: number;
  sortBy?: "liquidity" | "volume_24h_usd" | "volume_24h_change_percent" | "market_cap";
  minLiquidity?: number;
} = {}): Promise<BirdeyeMarketRow[]> {
  const data = await birdeyeGet("/defi/v3/token/list", {
    sort_by: options.sortBy || "volume_24h_usd",
    sort_type: "desc",
    offset: 0,
    limit: Math.min(options.limit || 50, 100),
    min_liquidity: options.minLiquidity ?? 100,
  });
  const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return items.map(normalizeToken).filter((x): x is BirdeyeMarketRow => Boolean(x));
}

export async function fetchBirdeyeTokenOverview(address: string): Promise<BirdeyeMarketRow | null> {
  const data = await birdeyeGet("/defi/token_overview", { address });
  return normalizeToken(data);
}

/**
 * Birdeye server-side helpers
 * Base: https://public-api.birdeye.so
 * Auth: X-API-KEY + x-chain: solana
 */

const BASE = "https://public-api.birdeye.so";

export type BirdeyeToken = {
  address: string;
  symbol?: string;
  name?: string;
  logoURI?: string;
  liquidity?: number;
  volume24hUSD?: number;
  volume24hChangePercent?: number;
  price?: number;
  price24hChangePercent?: number;
  mc?: number;
  marketCap?: number;
  rank?: number;
  decimals?: number;
};

async function beFetch(path: string, apiKey: string, params?: Record<string, string>) {
  const url = new URL(path.startsWith("http") ? path : `${BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), {
    headers: {
      "X-API-KEY": apiKey,
      "x-chain": "solana",
      accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Birdeye ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function birdeyeTrending(apiKey: string, limit = 50): Promise<BirdeyeToken[]> {
  const data = await beFetch("/defi/token_trending", apiKey, {
    sort_by: "rank",
    sort_type: "asc",
    offset: "0",
    limit: String(Math.min(limit, 50)),
  });
  const list = data?.data?.tokens || data?.data?.items || data?.tokens || [];
  return Array.isArray(list) ? list : [];
}

export async function birdeyeTokenList(
  apiKey: string,
  sortBy: string = "v24hUSD",
  limit = 50
): Promise<BirdeyeToken[]> {
  try {
    const data = await beFetch("/defi/tokenlist", apiKey, {
      sort_by: sortBy,
      sort_type: "desc",
      offset: "0",
      limit: String(Math.min(limit, 50)),
    });
    const list = data?.data?.tokens || data?.data?.items || [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function birdeyeNewListings(apiKey: string, limit = 20): Promise<BirdeyeToken[]> {
  try {
    const data = await beFetch("/defi/v2/tokens/new_listing", apiKey, {
      limit: String(limit),
      meme_platform_enabled: "true",
    });
    const list = data?.data?.items || data?.data?.tokens || data?.data || [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function birdeyeSearch(apiKey: string, keyword: string, limit = 20): Promise<BirdeyeToken[]> {
  try {
    const data = await beFetch("/defi/v3/search", apiKey, {
      keyword,
      target: "token",
      sort_by: "volume_24h_usd",
      sort_type: "desc",
      offset: "0",
      limit: String(limit),
      chain: "solana",
    });
    const items =
      data?.data?.items ||
      data?.data?.tokens ||
      data?.data?.result ||
      data?.data ||
      [];
    if (Array.isArray(items)) {
      return items
        .map((x: any) => ({
          address: x.address || x.token_address || x.mint,
          symbol: x.symbol,
          name: x.name,
          logoURI: x.logo_uri || x.logoURI,
          liquidity: x.liquidity,
          volume24hUSD: x.volume_24h_usd || x.volume24hUSD,
          price: x.price,
          price24hChangePercent: x.price_change_24h_percent || x.price24hChangePercent,
          mc: x.market_cap || x.mc || x.fdv,
        }))
        .filter((t: BirdeyeToken) => !!t.address);
    }
    return [];
  } catch {
    return [];
  }
}

export async function birdeyeTokenOverview(apiKey: string, address: string) {
  const data = await beFetch("/defi/token_overview", apiKey, { address });
  return data?.data || data;
}

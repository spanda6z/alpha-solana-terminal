import type { EventSource, NormalizedEvent } from "./types";

interface DexPair {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  url?: string;
  baseToken?: { address?: string; symbol?: string; name?: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  priceChange?: { h24?: number };
  marketCap?: number;
  fdv?: number;
  pairCreatedAt?: number;
}

const ENDPOINT = "https://api.dexscreener.com/latest/dex/search/";

function pairEvent(p: DexPair): NormalizedEvent | null {
  const mint = p.baseToken?.address;
  if (!mint || p.chainId !== "solana") return null;
  const created = p.pairCreatedAt ?? Date.now();
  return {
    id: `pair:${p.pairAddress ?? mint}`,
    kind: "NEW_PAIR",
    source: "dexscreener" satisfies EventSource,
    timestamp: created,
    mint,
    symbol: p.baseToken?.symbol,
    name: p.baseToken?.name,
    pairAddress: p.pairAddress,
    liquidityUsd: p.liquidity?.usd,
    priceUsd: Number(p.priceUsd ?? 0) || undefined,
    metadata: {
      dex: p.dexId ?? "unknown",
      volume24hUsd: p.volume?.h24 ?? 0,
      change24h: p.priceChange?.h24 ?? 0,
      marketCapUsd: p.marketCap ?? p.fdv ?? 0,
      pairUrl: p.url ?? null,
    },
  };
}

export async function fetchNewPairEvents(limit = 40): Promise<NormalizedEvent[]> {
  const queries = ["solana", "pump", "meme", "ai"];
  const responses = await Promise.all(
    queries.map((q) => fetch(ENDPOINT + "?q=" + encodeURIComponent(q), { cache: "no-store" }).catch(() => null))
  );

  const byMint = new Map<string, NormalizedEvent>();
  for (const res of responses) {
    if (!res?.ok) continue;
    const data = await res.json().catch(() => null);
    for (const pair of (data?.pairs ?? []) as DexPair[]) {
      const event = pairEvent(pair);
      if (!event || !event.mint) continue;
      const prev = byMint.get(event.mint);
      if (!prev || event.timestamp > prev.timestamp) byMint.set(event.mint, event);
    }
  }

  return [...byMint.values()]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

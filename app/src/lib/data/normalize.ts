import type { DataSourceStatus, NormalizedEvent } from "./types";

export function dedupeEvents(events: NormalizedEvent[]): NormalizedEvent[] {
  const map = new Map<string, NormalizedEvent>();
  for (const event of events) {
    const current = map.get(event.id);
    if (!current || event.timestamp > current.timestamp) map.set(event.id, event);
  }
  return [...map.values()].sort((a, b) => b.timestamp - a.timestamp);
}

export function sourceStatuses(): DataSourceStatus[] {
  return [
    {
      name: "dexscreener",
      enabled: true,
      live: true,
      detail: "Public pair discovery",
    },
    {
      name: "helius",
      enabled: Boolean(process.env.HELIUS_API_KEY),
      live: false,
      detail: process.env.HELIUS_API_KEY ? "Indexer adapter ready" : "Set HELIUS_API_KEY for transaction events",
    },
    {
      name: "solana-rpc",
      enabled: Boolean(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.SOLANA_RPC_URL),
      live: Boolean(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.SOLANA_RPC_URL),
      detail: "Mint and authority inspection",
    },
  ];
}

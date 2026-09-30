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
  const birdeye = Boolean(process.env.BIRDEYE_API_KEY);
  const helius = Boolean(process.env.HELIUS_API_KEY);
  const rpc = Boolean(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || process.env.SOLANA_RPC_URL);
  return [
    { name: "birdeye", enabled: birdeye, live: birdeye, detail: birdeye ? "Primary market discovery and token metrics" : "Set BIRDEYE_API_KEY for primary market discovery" },
    { name: "dexscreener", enabled: true, live: true, detail: "Public pair discovery" },
    { name: "helius", enabled: helius, live: helius, detail: helius ? "Enhanced transaction events" : "Set HELIUS_API_KEY for swap events" },
    { name: "solana-rpc", enabled: rpc, live: rpc, detail: rpc ? "Mint and authority inspection" : "Set SOLANA_RPC_URL for authority inspection" },
  ];
}

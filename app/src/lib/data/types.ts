export type EventKind =
  | "NEW_PAIR"
  | "SWAP"
  | "LIQUIDITY"
  | "HOLDER"
  | "CREATOR"
  | "WALLET"
  | "AUTHORITY";

export type EventSource = "dexscreener" | "helius" | "solana-rpc" | "unknown";

export interface NormalizedEvent {
  id: string;
  kind: EventKind;
  source: EventSource;
  timestamp: number;
  slot?: number;
  signature?: string;
  mint?: string;
  symbol?: string;
  name?: string;
  pairAddress?: string;
  wallet?: string;
  actor?: string;
  side?: "BUY" | "SELL" | "ADD" | "REMOVE" | "UNKNOWN";
  amountUsd?: number;
  priceUsd?: number;
  liquidityUsd?: number;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface DataSourceStatus {
  name: EventSource;
  enabled: boolean;
  live: boolean;
  detail: string;
}

export interface DataLayerSnapshot {
  events: NormalizedEvent[];
  sources: DataSourceStatus[];
  generatedAt: number;
}

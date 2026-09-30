export type NavId =
  | "landing"
  | "discover"
  | "markets"
  | "firehose"
  | "smart"
  | "watch"
  | "bots";

export type DeskTab =
  | "overview"
  | "chart"
  | "flow"
  | "trades"
  | "holders"
  | "liquidity"
  | "wallets"
  | "risk"
  | "transactions";

export type SelectedToken = {
  mint: string;
  pairAddress?: string;
  symbol?: string;
  name?: string;
  price?: string;
  change24h?: number;
  mcap?: string;
  liq?: string;
  vol?: string;
  age?: string;
  imageUrl?: string;
  risk?: string;
};

export type Confidence = "HIGH" | "MEDIUM" | "LOW";

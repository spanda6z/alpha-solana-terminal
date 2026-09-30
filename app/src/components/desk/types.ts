export type Tab = "market" | "firehose" | "bots" | "rap" | "account";

export type Verdict = "SAFE" | "CAUTION" | "DANGER" | "BLUE CHIP" | "UNKNOWN";

export type SelectedToken = {
  mint: string;
  pairAddress?: string;
  symbol?: string;
  name?: string;
  verdict?: Verdict;
  price?: string;
  change24h?: number;
  mcap?: string;
  liq?: string;
  vol?: string;
  age?: string;
  imageUrl?: string;
};

export type MarketCategory =
  | "trending"
  | "new"
  | "gainers"
  | "losers"
  | "volume"
  | "liquidity"
  | "unusual"
  | "whale"
  | "watched";

export type Filter =
  | "ALL"
  | "SAFE"
  | "FLAGGED"
  | "ALIVE"
  | "BLUE CHIP"
  | "WATCH"
  | "LIQ1K";

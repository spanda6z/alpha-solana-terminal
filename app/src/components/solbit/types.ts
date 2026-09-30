export type NavId =
  | "landing"
  | "market"
  | "desk"
  | "flow"
  | "smart"
  | "rap"
  | "watch";

export type DeskTab =
  | "overview"
  | "flow"
  | "holders"
  | "trades"
  | "risk"
  | "smart"
  | "dex";

export type SelectedToken = {
  mint: string;
  pairAddress?: string;
  symbol?: string;
  name?: string;
};

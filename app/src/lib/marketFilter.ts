/** Majors / stables / wrappers that clutter a memecoin intelligence board */
const NOISE = new Set(
  [
    "So11111111111111111111111111111111111111112",
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
    "bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1",
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  ].map((s) => s.toLowerCase())
);

const NOISE_SYMBOLS = new Set(
  ["SOL", "WSOL", "USDC", "USDT", "USD1", "DAI", "ETH", "WETH", "BTC", "WBTC", "MSOL", "JITOSOL", "BSOL", "STSOL"].map(
    (s) => s.toUpperCase()
  )
);

export function isNoiseToken(mint: string, symbol?: string): boolean {
  if (mint && NOISE.has(mint.toLowerCase())) return true;
  if (symbol && NOISE_SYMBOLS.has(symbol.toUpperCase().replace(/[^A-Z0-9]/g, ""))) return true;
  return false;
}

export function isBoardWorthy(t: {
  mint: string;
  symbol?: string;
  mcapRaw?: number;
  liqRaw?: number;
  change24h?: number;
  volRaw?: number;
}): boolean {
  if (isNoiseToken(t.mint, t.symbol)) return false;
  if ((t.liqRaw ?? 0) < 500 && (t.volRaw ?? 0) < 100) return false;
  return true;
}

export function rankTrending(rows: { change24h: number; volRaw: number; liqRaw: number }[]) {
  return [...rows].sort((a, b) => {
    const score = (x: typeof a) => Math.abs(x.change24h) * Math.log10(Math.max(x.volRaw, 10));
    return score(b) - score(a);
  });
}

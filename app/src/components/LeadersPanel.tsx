"use client";

const MOCK_LEADERS = [
  { rank: 1, wallet: "7xKX…9mPq", pnl: "+$184.2k", win: "72%", trades: 412 },
  { rank: 2, wallet: "3nRf…2kLs", pnl: "+$91.5k", win: "61%", trades: 289 },
  { rank: 3, wallet: "9pQw…4hTx", pnl: "+$67.8k", win: "58%", trades: 156 },
  { rank: 4, wallet: "5mBc…8vZn", pnl: "+$42.1k", win: "55%", trades: 98 },
  { rank: 5, wallet: "2aDf…1qWe", pnl: "+$28.4k", win: "64%", trades: 74 },
];

export function LeadersPanel() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-1">Smart money</h2>
      <p className="text-sm text-gray-400 mb-6">
        Top wallets by 7d PnL on Solana memecoins. Shadow-bot them from the Bots tab.
      </p>

      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-[48px_1.4fr_1fr_0.8fr_0.8fr] gap-2 px-4 py-2 text-[11px] text-gray-500 bg-[#0d0e14] border-b border-gray-800">
          <div>#</div>
          <div>WALLET</div>
          <div className="text-right">7D PNL</div>
          <div className="text-right">WIN</div>
          <div className="text-right">TRADES</div>
        </div>
        {MOCK_LEADERS.map((r) => (
          <div
            key={r.rank}
            className="grid grid-cols-[48px_1.4fr_1fr_0.8fr_0.8fr] gap-2 px-4 py-3 text-sm border-b border-gray-800/40 hover:bg-white/[0.02]"
          >
            <div className="text-gray-500">{r.rank}</div>
            <div className="font-mono text-violet-300">{r.wallet}</div>
            <div className="text-right text-emerald-400 font-medium">{r.pnl}</div>
            <div className="text-right text-gray-300">{r.win}</div>
            <div className="text-right text-gray-400">{r.trades}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500 text-center">
        Live indexer (Helius / Dune) will replace mock data after deploy.
      </p>
    </div>
  );
}

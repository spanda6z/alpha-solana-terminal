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
    <div className="p-5 max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Smart money</h2>
        <p className="text-[13px] text-gray-500 mt-1">
          Top wallets by 7d PnL. Shadow them from Bots.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-white/[0.015]">
        <div className="grid grid-cols-[40px_1.3fr_1fr_0.7fr_0.7fr] gap-2 px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-600 border-b border-white/[0.05]">
          <div>#</div>
          <div>Wallet</div>
          <div className="text-right">7d PnL</div>
          <div className="text-right">Win</div>
          <div className="text-right">Trades</div>
        </div>
        {MOCK_LEADERS.map((r) => (
          <div
            key={r.rank}
            className="grid grid-cols-[40px_1.3fr_1fr_0.7fr_0.7fr] gap-2 px-4 py-3 text-[13px] border-b border-white/[0.03] hover:bg-white/[0.02] transition"
          >
            <div className="text-gray-600 font-medium">{r.rank}</div>
            <div className="mono text-violet-300/90 text-[12px]">{r.wallet}</div>
            <div className="text-right mono text-emerald-400 font-medium text-[12px]">{r.pnl}</div>
            <div className="text-right mono text-gray-400 text-[12px]">{r.win}</div>
            <div className="text-right mono text-gray-500 text-[12px]">{r.trades}</div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[11px] text-gray-600 text-center">
        Live indexer (Helius / Dune) replaces mock data after deploy
      </p>
    </div>
  );
}

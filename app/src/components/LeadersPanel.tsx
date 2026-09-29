"use client";

const ROWS = [
  { rank: 1, wallet: "7xKX…9mPq", pnl: "+184.2K", win: "72%", n: 412 },
  { rank: 2, wallet: "3nRf…2kLs", pnl: "+91.5K", win: "61%", n: 289 },
  { rank: 3, wallet: "9pQw…4hTx", pnl: "+67.8K", win: "58%", n: 156 },
  { rank: 4, wallet: "5mBc…8vZn", pnl: "+42.1K", win: "55%", n: 98 },
  { rank: 5, wallet: "2aDf…1qWe", pnl: "+28.4K", win: "64%", n: 74 },
];

export function LeadersPanel() {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-4">
        <h2 className="mono text-[14px] font-semibold">WALLETS</h2>
        <p className="mono text-[11px] text-[#6b6b6b] mt-1">7d PnL · mock data</p>
      </div>
      <div className="border border-[#1a1a1a] overflow-x-auto">
        <div className="grid grid-cols-[36px_1fr_80px_56px_56px] gap-2 px-3 py-1.5 mono text-[9px] text-[#3d3d3d] tracking-wider border-b border-[#1a1a1a] min-w-[300px]">
          <div>#</div>
          <div>ADDR</div>
          <div className="text-right">PNL</div>
          <div className="text-right">WIN</div>
          <div className="text-right">N</div>
        </div>
        {ROWS.map((r) => (
          <div
            key={r.rank}
            className="grid grid-cols-[36px_1fr_80px_56px_56px] gap-2 px-3 py-2.5 border-b border-[#111] mono text-[11px] min-w-[300px]"
          >
            <div className="text-[#3d3d3d]">{r.rank}</div>
            <div className="text-[#ff6b00]">{r.wallet}</div>
            <div className="text-right text-[#22c55e]">{r.pnl}</div>
            <div className="text-right text-[#6b6b6b]">{r.win}</div>
            <div className="text-right text-[#6b6b6b]">{r.n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

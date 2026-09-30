"use client";

export function LeadersView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2.5 border-b border-[#252536] flex items-center gap-2">
        <button onClick={onBack} className="text-[12px] text-[#9b9bb0]">
          ← THE DESK
        </button>
        <span className="font-semibold text-[14px]">SMART MONEY</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="text-[11px] text-[#9b9bb0]">
          24H · 7D · ALL · wallet scores need a Solana smart-money index
        </div>
        <div className="card p-4 text-[12px] text-[#9b9bb0] leading-relaxed">
          Nlyra ranks wallets by realized edge across launches. On Solana this needs
          continuous swap + PnL scoring (Helius + custom pipeline).
          <div className="mt-3 text-[#5c5c72]">STATE · INDEXER NOT CONNECTED</div>
        </div>
        <div className="card p-3 opacity-70">
          <div className="text-[11px] text-[#5c5c72] mb-2">DEMO SHAPE</div>
          {["Wallet A", "Wallet B", "Wallet C"].map((w, i) => (
            <div
              key={w}
              className="flex items-center gap-3 py-2 border-b border-[#1a1a28] last:border-0"
            >
              <span className="text-[#5c5c72] w-4 text-[12px]">{i + 1}</span>
              <div className="flex-1 font-medium text-[13px]">{w}</div>
              <span className="text-[#34d399] text-[12px] font-semibold">—</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import clsx from "clsx";

export function RapSheetView() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-[#9b9bb0] border-b border-[#1a1a28]">
        <span className="font-semibold text-[#f4f4f8]">Creators</span>
        <span className="text-[#5c5c72]">· Solana deployers</span>
      </div>

      <div className="flex gap-1.5 overflow-x-auto px-2.5 py-2 border-b border-[#1a1a28]">
        {["CREATORS", "ALL", "SERIAL"].map((p, i) => (
          <span key={p} className={clsx("pill", i === 0 && "active")}>
            {p}
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="card p-4 text-[12px] text-[#9b9bb0] leading-relaxed">
          Rap Sheet ranks deployers by launch outcomes (dead %, serial cadence, last token).
          That needs a Solana token-creation indexer — not connected yet.
        </div>
        <div className="card px-3 py-3 flex items-center gap-3 opacity-60">
          <div className="w-10 h-10 rounded-xl bg-[#1a1a28] flex items-center justify-center text-[10px] font-mono text-[#a78bfa]">
            0x
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[12px]">7xKX…9mPq</div>
            <div className="text-[11px] text-[#5c5c72] mt-0.5">Indexer required</div>
          </div>
        </div>
      </div>
    </div>
  );
}

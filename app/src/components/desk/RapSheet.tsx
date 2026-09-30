"use client";

import { useState } from "react";
import clsx from "clsx";

type RapTab = "creators" | "wallets" | "launches";

export function RapSheetView() {
  const [tab, setTab] = useState<RapTab>("creators");

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2.5 border-b border-[#252536]">
        <div className="text-[14px] font-semibold">RAP SHEET</div>
        <div className="text-[11px] text-[#5c5c72] mt-0.5">
          Creators · wallets · launch history
        </div>
      </div>

      <div className="flex border-b border-[#252536]">
        {(
          [
            ["creators", "CREATORS"],
            ["wallets", "WALLETS"],
            ["launches", "LAUNCHES"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={clsx(
              "flex-1 py-2.5 text-[11px] font-semibold tracking-wide border-b-2",
              tab === id
                ? "border-[#8b5cf6] text-[#a78bfa]"
                : "border-transparent text-[#5c5c72]"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="card p-4 text-[12px] text-[#9b9bb0] leading-relaxed">
          {tab === "creators" && (
            <>
              Creator kill-rates, prior rugs, and linked mints need a Solana launch
              indexer (mint authority → prior tokens → outcomes).
            </>
          )}
          {tab === "wallets" && (
            <>
              Wallet dossiers (first buy, dump timing, multi-mint patterns) need
              continuous swap attribution.
            </>
          )}
          {tab === "launches" && (
            <>
              Launch timeline per creator — same indexer dependency as creators.
            </>
          )}
          <div className="mt-3 text-[#5c5c72]">STATE · INDEXER NOT CONNECTED</div>
        </div>

        <div className="card p-3 opacity-60">
          <div className="text-[10px] text-[#5c5c72] mb-2 tracking-wider">SHAPE · DEMO</div>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-2.5 border-b border-[#1a1a28] last:border-0"
            >
              <div className="w-9 h-9 rounded-full bg-[#1a1a28] flex items-center justify-center text-[11px] text-[#a78bfa]">
                {i}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">
                  {tab === "creators"
                    ? `Creator ${i.toString(16)}…`
                    : tab === "wallets"
                    ? `Wallet ${i.toString(16)}…`
                    : `Launch #${i}`}
                </div>
                <div className="text-[10px] text-[#5c5c72] mt-0.5">
                  {tab === "creators"
                    ? "— mints · kill rate —"
                    : tab === "wallets"
                    ? "score — · early —"
                    : "— ago · status —"}
                </div>
              </div>
              <span className="text-[11px] text-[#5c5c72]">—</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

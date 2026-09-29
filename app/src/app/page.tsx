"use client";

import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MarketBoard, type SelectedToken } from "@/components/MarketBoard";
import { TokenPanel } from "@/components/TokenPanel";
import { BotPanel } from "@/components/BotPanel";
import { LeadersPanel } from "@/components/LeadersPanel";

type Tab = "market" | "bots" | "leaders";

export default function Home() {
  const [tab, setTab] = useState<Tab>("market");
  const [selected, setSelected] = useState<SelectedToken | null>(null);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#050505] text-[#ececec] flex flex-col">
      <header className="h-12 shrink-0 border-b border-[#1a1a1a] flex items-center justify-between px-2 sm:px-3 bg-[#050505]">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-md bg-[#ff6b00] flex items-center justify-center">
              <span className="mono text-[14px] font-bold text-[#050505] leading-none">α</span>
            </div>
            <span className="hidden sm:inline mono text-[13px] font-semibold tracking-tight text-[#ff6b00]">
              ALPHA
            </span>
          </div>

          <nav className="flex items-stretch h-12">
            {(
              [
                { id: "market", label: "BOARD" },
                { id: "bots", label: "BOTS" },
                { id: "leaders", label: "WALLETS" },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  if (t.id !== "market") setSelected(null);
                }}
                className={`px-2.5 sm:px-3 mono text-[11px] tracking-wide border-b-2 transition ${
                  tab === t.id
                    ? "border-[#ff6b00] text-[#ff6b00]"
                    : "border-transparent text-[#6b6b6b] hover:text-[#ececec]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="shrink-0">
          <WalletMultiButton />
        </div>
      </header>

      <div className="h-7 shrink-0 border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 flex items-center gap-3 mono text-[10px] text-[#6b6b6b] overflow-x-auto">
        <span className="shrink-0">
          <span className="text-[#ff6b00]">●</span> LIVE
        </span>
        <span className="shrink-0">DEXSCREENER</span>
        <span className="shrink-0">JUPITER</span>
      </div>

      <main className="flex flex-1 min-h-0 relative">
        <div className="flex-1 min-w-0 overflow-hidden">
          {tab === "market" && (
            <MarketBoard onSelect={setSelected} selected={selected?.mint ?? null} />
          )}
          {tab === "bots" && <BotPanel />}
          {tab === "leaders" && <LeadersPanel />}
        </div>

        {selected && tab === "market" && (
          <div className="trade-sheet md:relative md:w-full md:max-w-[360px] md:border-l md:border-[#1a1a1a] bg-[#0a0a0a] overflow-y-auto shrink-0">
            <TokenPanel
              mint={selected.mint}
              pairAddress={selected.pairAddress}
              symbol={selected.symbol}
              onClose={() => setSelected(null)}
              onOpenBot={() => {
                setSelected(null);
                setTab("bots");
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

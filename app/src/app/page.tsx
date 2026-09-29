"use client";

import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MarketBoard } from "@/components/MarketBoard";
import { TokenPanel } from "@/components/TokenPanel";
import { BotPanel } from "@/components/BotPanel";
import { LeadersPanel } from "@/components/LeadersPanel";

type Tab = "market" | "bots" | "leaders";

export default function Home() {
  const [tab, setTab] = useState<Tab>("market");
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#050505] text-[#ececec]">
      <header className="h-11 border-b border-[#1a1a1a] flex items-center justify-between px-3 bg-[#050505]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="mono text-[13px] font-semibold tracking-tight text-[#c8ff00]">ALPHA</span>
            <span className="mono text-[10px] text-[#3d3d3d] uppercase tracking-widest">/ sol</span>
          </div>

          <nav className="flex items-stretch h-11">
            {(
              [
                { id: "market", label: "BOARD" },
                { id: "bots", label: "BOTS" },
                { id: "leaders", label: "WALLETS" },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 mono text-[11px] tracking-wide border-b-2 transition ${
                  tab === t.id
                    ? "border-[#c8ff00] text-[#c8ff00]"
                    : "border-transparent text-[#6b6b6b] hover:text-[#ececec]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline mono text-[10px] text-[#3d3d3d]">
            MAINNET · 1% · NON-CUSTODIAL
          </span>
          <WalletMultiButton />
        </div>
      </header>

      <div className="h-7 border-b border-[#1a1a1a] bg-[#0a0a0a] px-3 flex items-center gap-4 mono text-[10px] text-[#6b6b6b] overflow-x-auto">
        <span><span className="text-[#c8ff00]">●</span> FEED LIVE</span>
        <span>DEXSCREENER</span>
        <span>JUPITER ROUTER</span>
        <span>6 STRATEGIES</span>
      </div>

      <main className="flex h-[calc(100vh-76px)]">
        <div className="flex-1 min-w-0 overflow-hidden">
          {tab === "market" && (
            <MarketBoard onSelect={setSelectedToken} selected={selectedToken} />
          )}
          {tab === "bots" && <BotPanel />}
          {tab === "leaders" && <LeadersPanel />}
        </div>

        {selectedToken && tab === "market" && (
          <div className="w-full max-w-[340px] border-l border-[#1a1a1a] bg-[#0a0a0a] overflow-y-auto shrink-0">
            <TokenPanel
              mint={selectedToken}
              onClose={() => setSelectedToken(null)}
              onOpenBot={() => {
                setSelectedToken(null);
                setTab("bots");
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}

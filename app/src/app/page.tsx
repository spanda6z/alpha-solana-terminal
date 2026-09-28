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
    <div className="min-h-screen bg-[#0a0b0f] text-gray-100 font-sans">
      <header className="border-b border-gray-800 bg-[#0d0e14] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-sm">
              α
            </div>
            <span className="font-semibold tracking-tight text-lg">ALPHA</span>
          </div>

          <nav className="flex gap-1">
            {(["market", "bots", "leaders"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition ${
                  tab === t
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 hidden sm:block">
            Solana · Non-custodial · 1% fee
          </div>
          <WalletMultiButton className="!bg-violet-600 hover:!bg-violet-500 !rounded-lg !h-9 !text-sm" />
        </div>
      </header>

      <div className="border-b border-gray-800/60 bg-[#0d0e14] px-4 py-2 flex gap-6 text-xs text-gray-400 overflow-x-auto">
        <span>
          <span className="text-emerald-400 font-medium">Live</span> DexScreener
        </span>
        <span>
          <span className="text-violet-400 font-medium">Jupiter</span> swaps
        </span>
        <span>
          <span className="text-sky-400 font-medium">6</span> bot strategies
        </span>
        <span>
          <span className="text-amber-400 font-medium">1%</span> protocol fee
        </span>
      </div>

      <main className="flex h-[calc(100vh-96px)]">
        <div className="flex-1 overflow-hidden">
          {tab === "market" && (
            <MarketBoard onSelect={setSelectedToken} selected={selectedToken} />
          )}
          {tab === "bots" && <BotPanel />}
          {tab === "leaders" && <LeadersPanel />}
        </div>

        {selectedToken && tab === "market" && (
          <div className="w-full max-w-sm border-l border-gray-800 bg-[#0d0e14] overflow-y-auto">
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

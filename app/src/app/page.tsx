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
    <div className="alpha-bg min-h-screen text-gray-100">
      <header className="glass sticky top-0 z-40 border-b border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-violet-500/25">
              α
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 live-dot ring-2 ring-[#07080c]" />
            </div>
            <div>
              <div className="font-semibold tracking-tight text-[15px] leading-none">ALPHA</div>
              <div className="text-[10px] text-gray-500 tracking-wide mt-0.5">SOLANA TERMINAL</div>
            </div>
          </div>

          <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

          <nav className="flex gap-0.5 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            {(
              [
                { id: "market", label: "Market" },
                { id: "bots", label: "Bots" },
                { id: "leaders", label: "Leaders" },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition ${
                  tab === t.id
                    ? "bg-violet-600/25 text-violet-200 shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" />
              Mainnet
            </span>
            <span className="text-white/20">·</span>
            <span>1% fee</span>
            <span className="text-white/20">·</span>
            <span>Non-custodial</span>
          </div>
          <WalletMultiButton />
        </div>
      </header>

      <div className="border-b border-white/[0.05] bg-black/20 px-4 py-2 flex gap-5 text-[11px] text-gray-500 overflow-x-auto">
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400/90 font-medium">Live</span>
          <span>DexScreener</span>
        </span>
        <span className="shrink-0">
          <span className="text-violet-400 font-medium">Jupiter</span> routes
        </span>
        <span className="shrink-0">
          <span className="text-sky-400 font-medium">6</span> strategies
        </span>
        <span className="shrink-0">
          <span className="text-amber-400 font-medium">α</span> fee router
        </span>
      </div>

      <main className="flex h-[calc(100vh-89px)]">
        <div className="flex-1 overflow-hidden min-w-0">
          {tab === "market" && (
            <MarketBoard onSelect={setSelectedToken} selected={selectedToken} />
          )}
          {tab === "bots" && <BotPanel />}
          {tab === "leaders" && <LeadersPanel />}
        </div>

        {selectedToken && tab === "market" && (
          <div className="w-full max-w-[360px] border-l border-white/[0.06] bg-[#0c0d12]/95 overflow-y-auto shrink-0">
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

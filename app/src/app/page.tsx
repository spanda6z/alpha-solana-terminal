"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { MarketBoard, type SelectedToken } from "@/components/MarketBoard";
import { TokenPanel } from "@/components/TokenPanel";
import { BotPanel } from "@/components/BotPanel";
import { FirehosePanel } from "@/components/FirehosePanel";
import { RapSheetPanel } from "@/components/RapSheetPanel";
import { AccountPanel } from "@/components/AccountPanel";

type Tab = "market" | "firehose" | "bots" | "rapsheet" | "account";

export default function Home() {
  const [tab, setTab] = useState<Tab>("market");
  const [selected, setSelected] = useState<SelectedToken | null>(null);
  const [search, setSearch] = useState("");

  const openToken = (token: SelectedToken) => {
    setSelected(token);
    setTab("market");
  };

  const navigate = (next: Tab) => {
    setTab(next);
    if (next !== "market" && next !== "firehose") setSelected(null);
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#050505] text-[#ececec] flex flex-col">
      <header className="h-12 shrink-0 border-b border-[#1a1a1a] flex items-center gap-2 px-2 sm:px-3 bg-[#050505]">
        <button onClick={() => navigate("market")} className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[#ff6b00] flex items-center justify-center">
            <span className="mono text-[14px] font-bold text-[#050505] leading-none">α</span>
          </div>
          <span className="hidden sm:inline mono text-[13px] font-semibold tracking-tight text-[#ff6b00]">ALPHA</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xl ml-2">
          <Search size={13} className="text-[#4a4a4a]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate("market");
                setSelected(null);
              }
            }}
            placeholder="SEARCH TOKEN / MINT / WALLET"
            className="w-full bg-transparent outline-none mono text-[10px] text-[#ececec] placeholder:text-[#3d3d3d]"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden md:inline-flex items-center gap-1 mono text-[9px] text-[#6b6b6b]">
            <span className="text-[#22c55e]">●</span> NODE LIVE
          </span>
          <WalletMultiButton />
        </div>
      </header>

      <div className="h-7 shrink-0 border-b border-[#1a1a1a] bg-[#090909] px-3 flex items-center gap-4 mono text-[9px] text-[#4a4a4a] overflow-x-auto">
        <span className="text-[#22c55e]">● LIVE</span>
        <span>DEXSCREENER</span>
        <span>JUPITER</span>
        <span>SOLANA MAINNET</span>
        {search && <span className="text-[#ff6b00]">QUERY: {search}</span>}
      </div>

      <main className="flex-1 min-h-0 flex relative">
        <div className="flex-1 min-w-0 overflow-hidden">
          {tab === "market" && <MarketBoard onSelect={setSelected} selected={selected?.mint ?? null} />}
          {tab === "firehose" && <FirehosePanel onSelect={openToken} />}
          {tab === "bots" && <BotPanel />}
          {tab === "rapsheet" && <RapSheetPanel />}
          {tab === "account" && <AccountPanel />}
        </div>

        {selected && (tab === "market" || tab === "firehose") && (
          <div className="trade-sheet md:relative md:w-full md:max-w-[430px] md:border-l md:border-[#1a1a1a] bg-[#0a0a0a] overflow-y-auto shrink-0">
            <TokenPanel
              mint={selected.mint}
              pairAddress={selected.pairAddress}
              symbol={selected.symbol}
              onClose={() => setSelected(null)}
              onOpenBot={() => navigate("bots")}
            />
          </div>
        )}
      </main>

      <nav className="h-12 shrink-0 border-t border-[#1a1a1a] bg-[#070707] grid grid-cols-5">
        {([
          ["market", "MARKET"],
          ["firehose", "FIREHOSE"],
          ["bots", "BOTS"],
          ["rapsheet", "RAP SHEET"],
          ["account", "ACCOUNT"],
        ] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className={`mono text-[9px] sm:text-[10px] tracking-wider border-t-2 transition ${tab === id ? "border-[#ff6b00] text-[#ff6b00]" : "border-transparent text-[#5a5a5a] hover:text-[#ececec]"}`}
          >
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

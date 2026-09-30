"use client";

import { useCallback, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Search,
  Home,
  Crosshair,
  LayoutList,
  Flame,
  Bot,
  Skull,
  User,
} from "lucide-react";
import { Board } from "@/components/desk/Board";
import { TokenDesk } from "@/components/desk/TokenDesk";
import { BotsView } from "@/components/desk/Bots";
import { RapSheetView } from "@/components/desk/RapSheet";
import { AccountView } from "@/components/desk/Account";
import type { Tab, SelectedToken } from "@/components/desk/types";
import clsx from "clsx";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "@/hooks/useSwap";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "market", label: "MARKET", icon: LayoutList },
  { id: "firehose", label: "FIREHOSE", icon: Flame },
  { id: "bots", label: "BOTS", icon: Bot },
  { id: "rap", label: "RAP SHEET", icon: Skull },
  { id: "account", label: "ACCOUNT", icon: User },
];

export default function DeskApp() {
  const [tab, setTab] = useState<Tab>("market");
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [watch, setWatch] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const { connected } = useWallet();
  const { buyWithSol } = useSwap();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("desk_watch");
      if (raw) setWatch(JSON.parse(raw));
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("desk_watch", JSON.stringify(watch));
    } catch {
      /* */
    }
  }, [watch]);

  const toggleWatch = useCallback((mint: string) => {
    setWatch((w) => (w.includes(mint) ? w.filter((x) => x !== mint) : [...w, mint]));
  }, []);

  const quickBuy = async (t: SelectedToken) => {
    if (!connected) return;
    try {
      await buyWithSol(new PublicKey(t.mint), 0.1, 100);
    } catch {
      /* */
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0b0b12] text-[#f4f4f8]">
      <header className="h-12 shrink-0 border-b border-[#252536] flex items-center gap-2 px-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] flex items-center justify-center text-[11px] font-bold shrink-0">
          ∞
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 h-9 rounded-full bg-[#12121c] border border-[#252536] px-3 flex items-center gap-2 text-[#5c5c72] text-[13px]"
        >
          <Search size={14} />
          <span>search</span>
        </button>
        <button className="w-9 h-9 rounded-full bg-[#12121c] border border-[#252536] flex items-center justify-center text-[#9b9bb0]">
          <Crosshair size={16} />
        </button>
        <button
          onClick={() => {
            setTab("market");
            setToken(null);
          }}
          className="w-9 h-9 rounded-full bg-[#12121c] border border-[#252536] flex items-center justify-center text-[#9b9bb0]"
        >
          <Home size={16} />
        </button>
        <div className="shrink-0 scale-90 origin-right">
          <WalletMultiButton />
        </div>
      </header>

      <main className="flex-1 min-h-0 flex relative">
        <div className={clsx("flex-1 min-w-0 min-h-0 overflow-hidden", token && "hidden md:block")}>
          {(tab === "market" || tab === "firehose") && (
            <Board
              mode={tab === "firehose" ? "firehose" : "market"}
              onOpenToken={setToken}
              onQuickBuy={quickBuy}
              watchlist={watch}
              onToggleWatch={toggleWatch}
            />
          )}
          {tab === "bots" && <BotsView />}
          {tab === "rap" && <RapSheetView />}
          {tab === "account" && <AccountView watchCount={watch.length} />}
        </div>

        {token && (
          <TokenDesk
            token={token}
            watched={watch.includes(token.mint)}
            onClose={() => setToken(null)}
            onToggleWatch={() => toggleWatch(token.mint)}
            onOpenBots={() => {
              setToken(null);
              setTab("bots");
            }}
          />
        )}
      </main>

      {!token && (
        <nav className="h-[58px] shrink-0 border-t border-[#252536] bg-[#0b0b12] flex items-stretch pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setToken(null);
                }}
                className={clsx(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] font-semibold tracking-wide",
                  active ? "text-[#a78bfa]" : "text-[#5c5c72]"
                )}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {t.label}
              </button>
            );
          })}
        </nav>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-start pt-16 px-3">
          <div className="w-full max-w-lg mx-auto card p-3">
            <div className="flex justify-between mb-2">
              <span className="text-[12px] font-semibold text-[#a78bfa]">SEARCH</span>
              <button onClick={() => setSearchOpen(false)} className="text-[#5c5c72] text-[12px]">
                CLOSE
              </button>
            </div>
            <input
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Token / CA / symbol"
              className="desk-input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQ.trim().length > 20) {
                  setToken({ mint: searchQ.trim() });
                  setSearchOpen(false);
                }
              }}
            />
            <p className="text-[11px] text-[#5c5c72] mt-2">
              Paste a mint and press Enter, or use the board search.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

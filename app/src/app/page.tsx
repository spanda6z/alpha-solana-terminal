"use client";

import { useCallback, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
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

const TABS: { id: Tab; label: string }[] = [
  { id: "market", label: "MARKET" },
  { id: "firehose", label: "FIREHOSE" },
  { id: "bots", label: "BOTS" },
  { id: "rap", label: "RAP SHEET" },
  { id: "account", label: "ACCOUNT" },
];

export default function DeskApp() {
  const [tab, setTab] = useState<Tab>("market");
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [watch, setWatch] = useState<string[]>([]);
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

  const openToken = (t: SelectedToken) => setToken(t);

  const quickBuy = async (t: SelectedToken) => {
    if (!connected) return;
    try {
      await buyWithSol(new PublicKey(t.mint), 0.1, 100);
    } catch {
      /* */
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0a0a0b] text-[#f0f0f2]">
      <header className="h-11 shrink-0 border-b border-[#1e1e22] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#a3e635] flex items-center justify-center mono text-[11px] font-bold text-[#0a0a0b]">
            DK
          </div>
          <div>
            <div className="mono text-[12px] font-semibold leading-none">THE DESK</div>
            <div className="mono text-[8px] text-[#52525b] tracking-wider">SOLANA</div>
          </div>
        </div>
        <WalletMultiButton />
      </header>

      <main className="flex-1 min-h-0 flex relative">
        <div className={clsx("flex-1 min-w-0 min-h-0 overflow-hidden", token && "hidden md:block")}>
          {(tab === "market" || tab === "firehose") && (
            <Board
              mode={tab === "firehose" ? "firehose" : "market"}
              onOpenToken={openToken}
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
        <nav className="h-14 shrink-0 border-t border-[#1e1e22] bg-[#111113] flex items-stretch pb-[env(safe-area-inset-bottom)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setToken(null);
              }}
              className={clsx(
                "flex-1 mono text-[9px] tracking-wide flex flex-col items-center justify-center gap-0.5",
                tab === t.id ? "text-[#a3e635]" : "text-[#52525b]"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/solbit/Shell";
import { Landing } from "@/components/solbit/Landing";
import { MarketView } from "@/components/solbit/Market";
import {
  FirehoseView,
  SmartMoneyView,
  WatchView,
  BotsView,
} from "@/components/solbit/SimpleViews";
import { TokenDesk } from "@/components/desk/TokenDesk";
import type { NavId, SelectedToken } from "@/components/solbit/types";

export default function SolbitApp() {
  const router = useRouter();
  const [nav, setNav] = useState<NavId>("landing");
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [watch, setWatch] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("solbit_watch");
      if (raw) setWatch(JSON.parse(raw));
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("solbit_watch", JSON.stringify(watch));
    } catch {
      /* */
    }
  }, [watch]);

  const openDesk = useCallback(
    (t: SelectedToken) => {
      setToken(t);
      if (t.mint) router.push(`/token/${t.mint}`);
    },
    [router]
  );

  const toggleWatch = useCallback((mint: string) => {
    setWatch((w) => (w.includes(mint) ? w.filter((x) => x !== mint) : [...w, mint]));
  }, []);

  if (nav === "landing" && !token) {
    return <Landing onEnter={() => setNav("discover")} />;
  }

  return (
    <Shell
      nav={nav}
      onNav={(n) => {
        setNav(n);
        setToken(null);
      }}
      onSearch={() => setSearchOpen(true)}
      hideMobileNav={!!token}
    >
      {token ? (
        <TokenDesk
          token={token}
          watched={watch.includes(token.mint)}
          onClose={() => {
            setToken(null);
            router.push("/");
          }}
          onToggleWatch={() => toggleWatch(token.mint)}
          onOpenBots={() => {
            setToken(null);
            setNav("bots");
          }}
        />
      ) : (
        <>
          {(nav === "discover" || nav === "markets") && (
            <MarketView
              onOpenDesk={openDesk}
              title={nav === "markets" ? "MARKETS" : "DISCOVER"}
            />
          )}
          {nav === "firehose" && <FirehoseView />}
          {nav === "smart" && <SmartMoneyView />}
          {nav === "watch" && <WatchView count={watch.length} />}
          {nav === "bots" && <BotsView />}
        </>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-start pt-16 px-3">
          <div className="w-full max-w-lg mx-auto sb-panel p-3">
            <div className="flex justify-between mb-2">
              <span className="mono text-[11px] font-semibold text-[#3d9eff]">SEARCH</span>
              <button onClick={() => setSearchOpen(false)} className="mono text-[11px] text-[#7D8794]">
                CLOSE
              </button>
            </div>
            <input
              autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Token / CA / wallet / signature"
              className="sb-input"
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQ.trim().length > 20) {
                  openDesk({ mint: searchQ.trim() });
                  setSearchOpen(false);
                }
              }}
            />
            <p className="mono text-[10px] text-[#4A5560] mt-2">
              Paste a mint and press Enter. Wallet/tx search requires indexers.
            </p>
          </div>
        </div>
      )}
    </Shell>
  );
}

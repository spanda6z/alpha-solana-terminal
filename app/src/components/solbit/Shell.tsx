"use client";

import clsx from "clsx";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { NavId } from "./types";

const DESKTOP_NAV: { id: NavId; label: string }[] = [
  { id: "discover", label: "DISCOVER" },
  { id: "firehose", label: "FIREHOSE" },
  { id: "watch", label: "WATCH" },
  { id: "smart", label: "SMART" },
];

const MOBILE_NAV: { id: NavId; label: string }[] = [
  { id: "discover", label: "DISCOVER" },
  { id: "firehose", label: "FLOW" },
  { id: "watch", label: "WATCH" },
  { id: "smart", label: "ACCOUNT" },
];

export function Shell({
  nav,
  onNav,
  onSearch,
  children,
  hideMobileNav,
}: {
  nav: NavId;
  onNav: (n: NavId) => void;
  onSearch: () => void;
  children: React.ReactNode;
  hideMobileNav?: boolean;
}) {
  return (
    <div className="h-[100dvh] flex flex-col bg-[#05070A] text-[#F5F7FA] overflow-hidden">
      <header className="h-11 shrink-0 border-b border-[#151B22] flex items-center justify-between px-3 gap-2">
        <button onClick={() => onNav("discover")} className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded bg-[#3d9eff] flex items-center justify-center mono text-[11px] font-bold text-[#05070A]">
            SB
          </div>
          <span className="mono text-[12px] font-semibold tracking-tight sm:inline">SOLBIT</span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {DESKTOP_NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className={clsx(
                "px-3 py-1.5 mono text-[10px] tracking-wide border-b-2",
                nav === n.id || (n.id === "discover" && nav === "markets")
                  ? "border-[#3d9eff] text-[#3d9eff]"
                  : "border-transparent text-[#7D8794]"
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onSearch}
            className="mono text-[10px] text-[#7D8794] border border-[#151B22] w-8 h-8 flex items-center justify-center"
            aria-label="Search"
          >
            ⌕
          </button>
          <div className="wallet-slot scale-[0.85] origin-right">
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</main>

      {!hideMobileNav && (
        <nav className="md:hidden h-14 shrink-0 border-t border-[#151B22] bg-[#05070A] flex items-stretch pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center gap-0.5 mono text-[9px] tracking-wide",
                nav === n.id || (n.id === "discover" && nav === "markets")
                  ? "text-[#3d9eff]"
                  : "text-[#7D8794]"
              )}
            >
              <span
                className={clsx(
                  "w-5 h-0.5 rounded-full mb-0.5",
                  nav === n.id || (n.id === "discover" && nav === "markets")
                    ? "bg-[#3d9eff]"
                    : "bg-transparent"
                )}
              />
              {n.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

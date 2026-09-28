"use client";

import { useState } from "react";
import clsx from "clsx";

type Filter = "ALL" | "SAFE" | "FLAGGED" | "ALIVE" | "BLUE CHIP" | "MY BAG";

interface TokenRow {
  mint: string;
  symbol: string;
  name: string;
  verdict: "SAFE" | "CAUTION" | "DANGER" | "BLUE CHIP" | "UNKNOWN";
  price: string;
  change24h: number;
  mcap: string;
  liq: string;
  vol: string;
  age: string;
}

const MOCK: TokenRow[] = [
  {
    mint: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    verdict: "BLUE CHIP",
    price: "$148.22",
    change24h: 2.4,
    mcap: "$68.1B",
    liq: "—",
    vol: "$1.2B",
    age: "—",
  },
  {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    symbol: "USDC",
    name: "USD Coin",
    verdict: "BLUE CHIP",
    price: "$1.00",
    change24h: 0.01,
    mcap: "$32B",
    liq: "—",
    vol: "$4.1B",
    age: "—",
  },
  {
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    verdict: "SAFE",
    price: "$0.0000214",
    change24h: -4.2,
    mcap: "$1.4B",
    liq: "$12.4M",
    vol: "$89M",
    age: "2y",
  },
  {
    mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    symbol: "POPCAT",
    name: "Popcat",
    verdict: "CAUTION",
    price: "$0.84",
    change24h: 11.3,
    mcap: "$820M",
    liq: "$18M",
    vol: "$42M",
    age: "1y",
  },
];

const verdictColor = {
  "BLUE CHIP": "text-sky-400 bg-sky-400/10",
  SAFE: "text-emerald-400 bg-emerald-400/10",
  CAUTION: "text-amber-400 bg-amber-400/10",
  DANGER: "text-rose-400 bg-rose-400/10",
  UNKNOWN: "text-gray-400 bg-gray-400/10",
};

export function MarketBoard({
  onSelect,
  selected,
}: {
  onSelect: (mint: string) => void;
  selected: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("ALL");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60 overflow-x-auto">
        {(["ALL", "SAFE", "FLAGGED", "ALIVE", "BLUE CHIP", "MY BAG"] as Filter[]).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition",
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-gray-800/60 text-gray-400 hover:text-gray-200"
              )}
            >
              {f}
            </button>
          )
        )}
      </div>

      <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.5fr_0.5fr] gap-2 px-4 py-2 text-[11px] text-gray-500 border-b border-gray-800/40">
        <div>TOKEN</div>
        <div>VERDICT</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">24H</div>
        <div className="text-right">MC</div>
        <div className="text-right">LIQ</div>
        <div className="text-right">VOL</div>
        <div className="text-right">AGE</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {MOCK.map((t) => (
          <button
            key={t.mint}
            onClick={() => onSelect(t.mint)}
            className={clsx(
              "w-full grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.5fr_0.5fr] gap-2 px-4 py-2.5 text-sm hover:bg-white/[0.03] transition border-b border-gray-800/20 text-left",
              selected === t.mint && "bg-violet-600/10"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{t.symbol}</div>
                <div className="text-[11px] text-gray-500 truncate">{t.name}</div>
              </div>
            </div>
            <div>
              <span
                className={clsx(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium",
                  verdictColor[t.verdict]
                )}
              >
                {t.verdict}
              </span>
            </div>
            <div className="text-right font-mono text-[13px]">{t.price}</div>
            <div
              className={clsx(
                "text-right font-mono text-[13px]",
                t.change24h >= 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {t.change24h >= 0 ? "+" : ""}
              {t.change24h.toFixed(1)}%
            </div>
            <div className="text-right text-gray-400 text-[13px]">{t.mcap}</div>
            <div className="text-right text-gray-400 text-[13px]">{t.liq}</div>
            <div className="text-right text-gray-400 text-[13px]">{t.vol}</div>
            <div className="text-right text-gray-500 text-[13px]">{t.age}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

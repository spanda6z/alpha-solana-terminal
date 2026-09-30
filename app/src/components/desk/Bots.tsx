"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";

const STRATS = [
  {
    id: "shadow",
    name: "Shadow · Copy trading",
    color: "bg-orange-400",
    desc: "Follow a Smart Money wallet. Every swap it makes is mirrored from your escrow at your size.",
    best: "RIDING PROVEN WALLETS",
  },
  {
    id: "sniper",
    name: "Sniper · Launches",
    color: "bg-emerald-400",
    desc: "Snipe new launches with your own entry rules, filters and exits. Funds stay in your contract.",
    best: "NEW LAUNCHES",
  },
  {
    id: "dca",
    name: "DCA",
    color: "bg-sky-400",
    desc: "Fixed SOL buys on a schedule, optional take-profit.",
    best: "ACCUMULATING",
  },
  {
    id: "martingale",
    name: "Martingale",
    color: "bg-amber-400",
    desc: "Scale in on drops, exit at +TP from average cost.",
    best: "DIP REVERSALS",
  },
  {
    id: "grid",
    name: "Spot Grid",
    color: "bg-fuchsia-400",
    desc: "N levels between two prices. Profit per grid enforced by the contract.",
    best: "SIDEWAYS CHOP",
  },
  {
    id: "infinity",
    name: "Infinity Grid",
    color: "bg-violet-400",
    desc: "Sell a fixed SOL value on every step up, buy back on dips. No ceiling.",
    best: "UPTRENDS",
  },
];

type Sub = "my" | "create" | "leaders";

export function BotsView() {
  const { connected } = useWallet();
  const [sub, setSub] = useState<Sub>("create");
  const [sel, setSel] = useState<(typeof STRATS)[0] | null>(null);
  const [mint, setMint] = useState("");
  const [dep, setDep] = useState("0.5");

  if (sel) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <button onClick={() => setSel(null)} className="text-[12px] text-[#9b9bb0] mb-4">
          ← Strategies
        </button>
        <div className="flex items-center gap-2 mb-1">
          <span className={clsx("w-2.5 h-2.5 rounded-sm", sel.color)} />
          <h2 className="text-[16px] font-semibold">{sel.name}</h2>
        </div>
        <p className="text-[12px] text-[#9b9bb0] mb-4">{sel.desc}</p>
        <div className="space-y-3">
          <div>
            <div className="text-[10px] text-[#5c5c72] mb-1 tracking-wide">MINT</div>
            <input className="desk-input" value={mint} onChange={(e) => setMint(e.target.value)} />
          </div>
          <div>
            <div className="text-[10px] text-[#5c5c72] mb-1 tracking-wide">DEPOSIT SOL</div>
            <input type="number" className="desk-input" value={dep} onChange={(e) => setDep(e.target.value)} />
          </div>
          <button
            disabled={!connected || !mint}
            className="w-full py-3.5 rounded-xl bg-[#8b5cf6] text-white font-semibold text-[13px] disabled:opacity-40"
          >
            {!connected ? "CONNECT WALLET" : `CREATE ${sel.name.split("·")[0].trim()}`}
          </button>
          <p className="text-[11px] text-[#5c5c72] text-center">
            Non-custodial · on-chain when programs are deployed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex border-b border-[#252536]">
        {(
          [
            { id: "my" as Sub, label: "MY BOTS" },
            { id: "create" as Sub, label: "CREATE" },
            { id: "leaders" as Sub, label: "LEADERBOARD" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            onClick={() => setSub(s.id)}
            className={clsx(
              "flex-1 py-3 text-[11px] font-semibold tracking-wide border-b-2",
              sub === s.id
                ? "border-[#8b5cf6] text-[#a78bfa]"
                : "border-transparent text-[#5c5c72]"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {sub === "my" && (
          <div className="card p-6 text-center text-[13px] text-[#9b9bb0]">
            No bots yet. Open CREATE to pick a strategy.
          </div>
        )}

        {sub === "create" && (
          <>
            <div className="card p-3 mb-3 text-[12px] text-[#9b9bb0] leading-relaxed">
              <span className="inline-block px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#a78bfa] text-[10px] font-semibold mr-2">
                SOLANA
              </span>
              Pick a strategy. Funds stay in contracts you control when programs are live.
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {STRATS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSel(s)}
                  className="card p-3 text-left active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={clsx("w-2 h-2 rounded-sm", s.color)} />
                    <span className="text-[13px] font-semibold leading-tight">{s.name}</span>
                  </div>
                  <p className="text-[11px] text-[#9b9bb0] leading-snug mb-2 line-clamp-4">{s.desc}</p>
                  <div className="text-[9px] font-semibold tracking-wide text-[#a78bfa]">
                    BEST FOR · {s.best}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {sub === "leaders" && (
          <div className="space-y-2">
            <div className="text-[11px] text-[#5c5c72] mb-2">LEADERBOARD · PUBLIC BOTS · DEMO</div>
            {[
              { name: "@alpha", strat: "Infinity Grid", apr: "+1170%" },
              { name: "@wizard", strat: "Spot Grid", apr: "+49%" },
              { name: "@eco", strat: "Shadow", apr: "+623%" },
            ].map((r, i) => (
              <div key={r.name} className="card px-3 py-3 flex items-center gap-3">
                <span className="text-[12px] text-[#5c5c72] w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px]">{r.name}</div>
                  <div className="text-[11px] text-[#9b9bb0]">{r.strat}</div>
                </div>
                <span className="text-[#34d399] font-semibold text-[13px]">{r.apr}</span>
                <button className="px-3 py-1 rounded-full border border-[#8b5cf6] text-[#a78bfa] text-[11px] font-semibold">
                  COPY
                </button>
              </div>
            ))}
            <p className="text-[11px] text-[#5c5c72] pt-2">
              Copy = same strategy, your wallet. Live ranking needs deployed keepers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

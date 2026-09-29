"use client";

import { useState } from "react";
import { X, Loader2, ExternalLink, Zap } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "../hooks/useSwap";
import clsx from "clsx";

export function TokenPanel({
  mint,
  onClose,
  onOpenBot,
}: {
  mint: string;
  onClose: () => void;
  onOpenBot?: () => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
  const { connected } = useWallet();
  const { buyWithSol, sellForSol, loading, error, lastTx } = useSwap();

  const handleTrade = async () => {
    if (!connected) return;
    const tokenMint = new PublicKey(mint);
    const val = parseFloat(amount) || 0;
    if (val <= 0) return;
    if (side === "buy") await buyWithSol(tokenMint, val);
    else await sellForSol(tokenMint, Math.floor(val * 1e6));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold tracking-tight">Trade</div>
          <div className="text-[10px] text-gray-600 mono truncate max-w-[220px] mt-0.5">{mint}</div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition">
          <X size={16} />
        </button>
      </div>

      <div className="h-36 mx-3 mt-3 rounded-xl bg-gradient-to-b from-violet-950/40 via-transparent to-transparent border border-white/[0.05] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[11px] text-gray-600 uppercase tracking-widest">Chart</div>
          <div className="text-[10px] text-gray-700 mt-1">Birdeye · Helius</div>
        </div>
      </div>

      <div className="p-4 space-y-3.5">
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <button
            onClick={() => setSide("buy")}
            className={clsx(
              "flex-1 py-2 rounded-lg text-[13px] font-semibold transition",
              side === "buy"
                ? "bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/15"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Buy
          </button>
          <button
            onClick={() => setSide("sell")}
            className={clsx(
              "flex-1 py-2 rounded-lg text-[13px] font-semibold transition",
              side === "sell"
                ? "bg-rose-500/90 text-white shadow-lg shadow-rose-500/15"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Sell
          </button>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-gray-600 mb-1.5 block">
            Amount · {side === "buy" ? "SOL" : "tokens"}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-3.5 py-3 text-sm mono focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition"
            placeholder="0.0"
            disabled={loading}
          />
        </div>

        <div className="flex gap-1.5">
          {["0.1", "0.5", "1", "Max"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v === "Max" ? "1.0" : v)}
              className="flex-1 py-1.5 text-[11px] rounded-lg bg-white/[0.04] border border-white/[0.05] text-gray-400 hover:text-gray-200 hover:bg-white/[0.07] transition"
              disabled={loading}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          onClick={handleTrade}
          disabled={!connected || loading}
          className={clsx(
            "w-full py-3 rounded-xl font-semibold text-[13px] transition flex items-center justify-center gap-2 disabled:opacity-40",
            side === "buy"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:opacity-95"
              : "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-600/20 hover:opacity-95"
          )}
        >
          {loading ? (
            <><Loader2 size={15} className="animate-spin" /> Swapping…</>
          ) : !connected ? (
            "Connect wallet"
          ) : (
            <><Zap size={14} /> {side === "buy" ? "Buy" : "Sell"} · Jupiter</>
          )}
        </button>

        {error && <p className="text-[11px] text-rose-400 text-center break-all">{error}</p>}
        {lastTx && (
          <a href={`https://solscan.io/tx/${lastTx}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-[11px] text-violet-400 hover:text-violet-300">
            View on Solscan <ExternalLink size={11} />
          </a>
        )}

        <p className="text-[10px] text-gray-600 text-center leading-relaxed">
          Non-custodial · Jupiter routes · 1% Alpha fee after deploy
        </p>
      </div>

      <div className="mt-auto border-t border-white/[0.05] p-4">
        <div className="text-[10px] uppercase tracking-wider text-gray-600 mb-2.5">Automate</div>
        <div className="grid grid-cols-2 gap-1.5">
          {["DCA", "Grid", "Shadow", "Ladder"].map((b) => (
            <button
              key={b}
              onClick={onOpenBot}
              className="py-2 text-[11px] font-medium rounded-lg bg-white/[0.03] border border-white/[0.05] text-gray-400 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 transition"
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

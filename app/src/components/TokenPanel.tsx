"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
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
      <div className="flex items-center justify-between px-3 h-11 border-b border-[#1a1a1a]">
        <div className="min-w-0">
          <div className="mono text-[11px] tracking-wider text-[#c8ff00]">TRADE</div>
          <div className="mono text-[9px] text-[#3d3d3d] truncate max-w-[200px]">{mint}</div>
        </div>
        <button onClick={onClose} className="p-1 text-[#6b6b6b] hover:text-[#ececec]">
          <X size={14} />
        </button>
      </div>

      <div className="h-28 border-b border-[#1a1a1a] flex items-center justify-center bg-[#050505]">
        <span className="mono text-[9px] text-[#3d3d3d] tracking-widest">CHART · TBD</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 border border-[#1a1a1a]">
          <button
            onClick={() => setSide("buy")}
            className={clsx(
              "py-2 mono text-[11px] tracking-wider transition",
              side === "buy" ? "bg-[#00e676] text-[#050505] font-semibold" : "text-[#6b6b6b] hover:text-[#ececec]"
            )}
          >
            BUY
          </button>
          <button
            onClick={() => setSide("sell")}
            className={clsx(
              "py-2 mono text-[11px] tracking-wider transition border-l border-[#1a1a1a]",
              side === "sell" ? "bg-[#ff3d57] text-white font-semibold" : "text-[#6b6b6b] hover:text-[#ececec]"
            )}
          >
            SELL
          </button>
        </div>

        <div>
          <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1.5">
            AMOUNT · {side === "buy" ? "SOL" : "TOKEN"}
          </div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="alpha-input" disabled={loading} />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {["0.1", "0.5", "1", "MAX"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v === "MAX" ? "1" : v)}
              className="py-1.5 mono text-[10px] border border-[#1a1a1a] text-[#6b6b6b] hover:border-[#c8ff00] hover:text-[#c8ff00] transition"
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
            "w-full py-2.5 mono text-[12px] font-semibold tracking-wider transition disabled:opacity-40",
            side === "buy" ? "bg-[#00e676] text-[#050505]" : "bg-[#ff3d57] text-white"
          )}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <Loader2 size={14} className="animate-spin" /> EXECUTING
            </span>
          ) : !connected ? (
            "CONNECT WALLET"
          ) : (
            `${side === "buy" ? "BUY" : "SELL"} VIA JUPITER`
          )}
        </button>

        {error && <p className="mono text-[10px] text-[#ff3d57] text-center break-all">{error}</p>}
        {lastTx && (
          <a href={`https://solscan.io/tx/${lastTx}`} target="_blank" rel="noopener noreferrer" className="block mono text-[10px] text-[#c8ff00] text-center hover:underline">
            TX → SOLSCAN
          </a>
        )}
      </div>

      <div className="mt-auto border-t border-[#1a1a1a] p-3">
        <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-2">BOTS</div>
        <div className="grid grid-cols-2 gap-1">
          {["DCA", "GRID", "SHADOW", "LADDER"].map((b) => (
            <button
              key={b}
              onClick={onOpenBot}
              className="py-2 mono text-[10px] border border-[#1a1a1a] text-[#6b6b6b] hover:border-[#c8ff00] hover:text-[#c8ff00] transition"
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

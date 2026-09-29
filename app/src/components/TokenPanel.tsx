"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "../hooks/useSwap";
import { useTokenBalance, useSolBalance } from "../hooks/useTokenBalance";
import { MINTS } from "../lib/jupiter";
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
  const [outPreview, setOutPreview] = useState<string | null>(null);
  const { connected } = useWallet();
  const { buyWithSol, sellForSol, previewQuote, loading, error, lastTx } = useSwap();
  const sol = useSolBalance();
  const token = useTokenBalance(mint);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const val = parseFloat(amount);
      if (!val || val <= 0 || !mint) {
        setOutPreview(null);
        return;
      }
      try {
        const tokenMint = new PublicKey(mint);
        if (side === "buy") {
          const raw = Math.floor(val * LAMPORTS_PER_SOL);
          const q = await previewQuote(MINTS.SOL, tokenMint, raw);
          if (!cancelled && q) {
            const out = Number(q.outAmount) / Math.pow(10, token.decimals || 6);
            setOutPreview(`≈ ${out.toLocaleString(undefined, { maximumFractionDigits: 4 })} tokens`);
          }
        } else {
          const raw = Math.floor(val * Math.pow(10, token.decimals));
          if (raw <= 0) {
            setOutPreview(null);
            return;
          }
          const q = await previewQuote(tokenMint, MINTS.SOL, raw);
          if (!cancelled && q) {
            const out = Number(q.outAmount) / LAMPORTS_PER_SOL;
            setOutPreview(`≈ ${out.toFixed(4)} SOL`);
          }
        }
      } catch {
        if (!cancelled) setOutPreview(null);
      }
    };
    const t = setTimeout(run, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [amount, side, mint, token.decimals, previewQuote]);

  const handleTrade = async () => {
    if (!connected) return;
    const tokenMint = new PublicKey(mint);
    const val = parseFloat(amount) || 0;
    if (val <= 0) return;

    if (side === "buy") {
      await buyWithSol(tokenMint, val);
      sol.refresh();
    } else {
      const raw = Math.floor(val * Math.pow(10, token.decimals));
      await sellForSol(tokenMint, raw);
      token.refresh();
      sol.refresh();
    }
  };

  const setMax = () => {
    if (side === "buy") {
      const max = Math.max(0, sol.balance - 0.01);
      setAmount(max > 0 ? max.toFixed(4) : "0");
    } else {
      setAmount(token.balance > 0 ? token.balance.toString() : "0");
    }
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

      <div className="px-3 py-2 border-b border-[#1a1a1a] mono text-[10px] text-[#6b6b6b] flex justify-between gap-2">
        <span>SOL {sol.balance.toFixed(4)}</span>
        <span>TOK {token.loading ? "…" : token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
      </div>

      <div className="h-20 border-b border-[#1a1a1a] flex items-center justify-center bg-[#050505]">
        <span className="mono text-[9px] text-[#3d3d3d] tracking-widest">CHART · TBD</span>
      </div>

      <div className="p-3 space-y-3">
        <div className="grid grid-cols-2 border border-[#1a1a1a]">
          <button
            onClick={() => {
              setSide("buy");
              setAmount("0.1");
            }}
            className={clsx(
              "py-2 mono text-[11px] tracking-wider transition",
              side === "buy" ? "bg-[#00e676] text-[#050505] font-semibold" : "text-[#6b6b6b] hover:text-[#ececec]"
            )}
          >
            BUY
          </button>
          <button
            onClick={() => {
              setSide("sell");
              setAmount(token.balance > 0 ? String(token.balance) : "0");
            }}
            className={clsx(
              "py-2 mono text-[11px] tracking-wider transition border-l border-[#1a1a1a]",
              side === "sell" ? "bg-[#ff3d57] text-white font-semibold" : "text-[#6b6b6b] hover:text-[#ececec]"
            )}
          >
            SELL
          </button>
        </div>

        <div>
          <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1.5 flex justify-between">
            <span>AMOUNT · {side === "buy" ? "SOL" : "TOKEN"}</span>
            {outPreview && <span className="text-[#6b6b6b] normal-case tracking-normal">{outPreview}</span>}
          </div>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="alpha-input" disabled={loading} />
        </div>

        <div className="grid grid-cols-4 gap-1">
          {(side === "buy" ? ["0.1", "0.5", "1", "MAX"] : ["25%", "50%", "75%", "MAX"]).map((v) => (
            <button
              key={v}
              onClick={() => {
                if (v === "MAX") setMax();
                else if (v.endsWith("%")) {
                  const pct = parseInt(v, 10) / 100;
                  setAmount((token.balance * pct).toString());
                } else setAmount(v);
              }}
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

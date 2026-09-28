"use client";

import { useState } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "../hooks/useSwap";

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

    if (side === "buy") {
      await buyWithSol(tokenMint, val);
    } else {
      const raw = Math.floor(val * 1e6);
      await sellForSol(tokenMint, raw);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <div className="font-semibold">Token</div>
          <div className="text-xs text-gray-500 font-mono truncate max-w-[240px]">{mint}</div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400">
          <X size={16} />
        </button>
      </div>

      <div className="h-40 bg-gradient-to-b from-violet-950/30 to-transparent border-b border-gray-800 flex items-center justify-center text-gray-600 text-sm">
        Chart · Birdeye / Helius
      </div>

      <div className="p-4 space-y-4">
        <div className="flex gap-1 p-1 bg-gray-900 rounded-lg">
          <button
            onClick={() => setSide("buy")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              side === "buy" ? "bg-emerald-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setSide("sell")}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              side === "sell" ? "bg-rose-600 text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Sell
          </button>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Amount ({side === "buy" ? "SOL" : "tokens"})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            placeholder="0.0"
            disabled={loading}
          />
        </div>

        <div className="flex gap-2">
          {["0.1", "0.5", "1", "Max"].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v === "Max" ? "1.0" : v)}
              className="flex-1 py-1.5 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700"
              disabled={loading}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          onClick={handleTrade}
          disabled={!connected || loading}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${
            side === "buy"
              ? "bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
              : "bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-50"
          }`}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Swapping…
            </>
          ) : !connected ? (
            "Connect wallet"
          ) : (
            `${side === "buy" ? "Buy" : "Sell"} · Jupiter · 1% fee`
          )}
        </button>

        {error && <p className="text-xs text-rose-400 text-center break-all">{error}</p>}
        {lastTx && (
          <a
            href={`https://solscan.io/tx/${lastTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-violet-400 hover:underline"
          >
            View on Solscan <ExternalLink size={12} />
          </a>
        )}

        <p className="text-[11px] text-gray-500 text-center">
          Non-custodial. Routes through Jupiter. Fee via Alpha Fee Router after deploy.
        </p>
      </div>

      <div className="mt-auto border-t border-gray-800 p-4 space-y-2">
        <div className="text-xs text-gray-500 mb-2">Start a bot on this token</div>
        <div className="grid grid-cols-2 gap-2">
          {["DCA", "Grid", "Shadow", "Ladder"].map((b) => (
            <button
              key={b}
              onClick={onOpenBot}
              className="py-2 text-xs rounded-md bg-gray-800/80 hover:bg-violet-600/20 text-gray-300 hover:text-violet-300 transition"
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

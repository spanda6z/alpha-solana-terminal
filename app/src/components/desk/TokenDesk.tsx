"use client";

import { useState } from "react";
import { X, Star, ExternalLink, Loader2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalance, useSolBalance } from "@/hooks/useTokenBalance";
import type { SelectedToken, Verdict } from "./types";
import clsx from "clsx";

const verdictColor: Record<Verdict, string> = {
  SAFE: "text-[#22c55e]",
  CAUTION: "text-[#eab308]",
  DANGER: "text-[#ef4444]",
  "BLUE CHIP": "text-[#38bdf8]",
  UNKNOWN: "text-[#8a8a93]",
};

export function TokenDesk({
  token,
  watched,
  onClose,
  onToggleWatch,
  onOpenBots,
}: {
  token: SelectedToken;
  watched: boolean;
  onClose: () => void;
  onToggleWatch: () => void;
  onOpenBots: () => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
  const [slip, setSlip] = useState(100);
  const { connected } = useWallet();
  const { buyWithSol, sellForSol, loading, error, lastTx } = useSwap();
  const sol = useSolBalance();
  const tok = useTokenBalance(token.mint);

  const chart = token.pairAddress
    ? `https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : null;

  const trade = async () => {
    if (!connected) return;
    const m = new PublicKey(token.mint);
    const v = parseFloat(amount) || 0;
    if (v <= 0) return;
    if (side === "buy") {
      await buyWithSol(m, v, slip);
      sol.refresh();
    } else {
      await sellForSol(m, Math.floor(v * Math.pow(10, tok.decimals)), slip);
      tok.refresh();
      sol.refresh();
    }
  };

  const v = token.verdict || "UNKNOWN";

  return (
    <div className="token-overlay">
      <div className="h-12 shrink-0 border-b border-[#1e1e22] px-3 flex items-center gap-2">
        <button onClick={onClose} className="mono text-[11px] text-[#8a8a93] px-1">
          ←
        </button>
        {token.imageUrl ? (
          <img src={token.imageUrl} alt="" className="w-7 h-7 rounded-md object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-md bg-[#1e1e22]" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="mono text-[14px] font-semibold truncate">{token.symbol}</span>
            <span className={clsx("mono text-[10px]", verdictColor[v])}>
              {v === "BLUE CHIP" ? "BLUE" : v}
            </span>
          </div>
          <div className="mono text-[9px] text-[#52525b] truncate">{token.mint}</div>
        </div>
        <button
          onClick={onToggleWatch}
          className={clsx("p-2", watched ? "text-[#a3e635]" : "text-[#52525b]")}
        >
          <Star size={16} fill={watched ? "currentColor" : "none"} />
        </button>
        {token.pairAddress && (
          <a
            href={`https://dexscreener.com/solana/${token.pairAddress}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-[#52525b]"
          >
            <ExternalLink size={14} />
          </a>
        )}
        <button onClick={onClose} className="p-2 text-[#8a8a93] md:hidden">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 px-3 py-2 border-b border-[#1e1e22] mono text-center">
        <div>
          <div className="text-[9px] text-[#52525b]">PRICE</div>
          <div className="text-[11px]">{token.price || "—"}</div>
        </div>
        <div>
          <div className="text-[9px] text-[#52525b]">MC</div>
          <div className="text-[11px]">{token.mcap || "—"}</div>
        </div>
        <div>
          <div className="text-[9px] text-[#52525b]">LIQ</div>
          <div className="text-[11px]">{token.liq || "—"}</div>
        </div>
        <div>
          <div className="text-[9px] text-[#52525b]">24H</div>
          <div
            className={clsx(
              "text-[11px]",
              (token.change24h || 0) >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
            )}
          >
            {token.change24h != null
              ? `${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(1)}%`
              : "—"}
          </div>
        </div>
      </div>

      <div className="h-44 shrink-0 border-b border-[#1e1e22] bg-[#0a0a0b] relative">
        {chart ? (
          <iframe title="chart" src={chart} className="w-full h-full border-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center mono text-[10px] text-[#52525b]">
            NO PAIR · CHART UNAVAILABLE
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="mono text-[10px] text-[#8a8a93] flex justify-between">
          <span>SOL {sol.balance.toFixed(4)}</span>
          <span>
            TOK {tok.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
        </div>

        <div className="grid grid-cols-2 border border-[#1e1e22] rounded overflow-hidden">
          <button
            onClick={() => setSide("buy")}
            className={clsx(
              "py-2.5 mono text-[12px] font-semibold",
              side === "buy" ? "bg-[#22c55e] text-[#0a0a0b]" : "text-[#8a8a93]"
            )}
          >
            BUY
          </button>
          <button
            onClick={() => setSide("sell")}
            className={clsx(
              "py-2.5 mono text-[12px] font-semibold border-l border-[#1e1e22]",
              side === "sell" ? "bg-[#ef4444] text-white" : "text-[#8a8a93]"
            )}
          >
            SELL
          </button>
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="desk-input"
          inputMode="decimal"
        />

        <div className="grid grid-cols-4 gap-1">
          {(side === "buy" ? ["0.05", "0.1", "0.25", "MAX"] : ["25%", "50%", "75%", "MAX"]).map(
            (x) => (
              <button
                key={x}
                onClick={() => {
                  if (x === "MAX") {
                    setAmount(
                      side === "buy"
                        ? Math.max(0, sol.balance - 0.01).toFixed(4)
                        : String(tok.balance)
                    );
                  } else if (x.endsWith("%")) {
                    setAmount(String((tok.balance * parseInt(x)) / 100));
                  } else setAmount(x);
                }}
                className="py-2 mono text-[11px] border border-[#1e1e22] text-[#8a8a93] rounded"
              >
                {x}
              </button>
            )
          )}
        </div>

        <div className="flex gap-1">
          {[50, 100, 300, 500].map((b) => (
            <button
              key={b}
              onClick={() => setSlip(b)}
              className={clsx(
                "flex-1 py-1.5 mono text-[10px] border rounded",
                slip === b
                  ? "border-[#a3e635] text-[#a3e635]"
                  : "border-[#1e1e22] text-[#52525b]"
              )}
            >
              {b / 100}%
            </button>
          ))}
        </div>

        <button
          onClick={trade}
          disabled={!connected || loading}
          className={clsx(
            "w-full py-3.5 mono text-[13px] font-semibold rounded disabled:opacity-40",
            side === "buy" ? "bg-[#22c55e] text-[#0a0a0b]" : "bg-[#ef4444] text-white"
          )}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <Loader2 size={14} className="animate-spin" /> EXECUTING
            </span>
          ) : !connected ? (
            "CONNECT WALLET"
          ) : (
            `${side === "buy" ? "BUY" : "SELL"} · MARKET`
          )}
        </button>

        {error && <p className="mono text-[10px] text-[#ef4444] text-center">{error}</p>}
        {lastTx && (
          <a
            href={`https://solscan.io/tx/${lastTx}`}
            target="_blank"
            rel="noreferrer"
            className="block mono text-[10px] text-[#a3e635] text-center"
          >
            TX → SOLSCAN
          </a>
        )}

        <button
          onClick={onOpenBots}
          className="w-full py-2.5 mono text-[11px] border border-[#1e1e22] text-[#8a8a93] rounded"
        >
          OPEN BOTS ON THIS TOKEN
        </button>
      </div>
    </div>
  );
}

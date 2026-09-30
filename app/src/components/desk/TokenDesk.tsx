"use client";

import { useState } from "react";
import { X, Star, ExternalLink, Loader2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalance, useSolBalance } from "@/hooks/useTokenBalance";
import type { SelectedToken, Verdict } from "./types";
import clsx from "clsx";

const verdictCls: Record<Verdict, string> = {
  SAFE: "text-[#34d399]",
  CAUTION: "text-[#fbbf24]",
  DANGER: "text-[#f87171]",
  "BLUE CHIP": "text-[#60a5fa]",
  UNKNOWN: "text-[#9b9bb0]",
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
      <div className="h-12 shrink-0 border-b border-[#252536] px-3 flex items-center gap-2">
        <button onClick={onClose} className="text-[13px] text-[#9b9bb0] px-1">
          ←
        </button>
        {token.imageUrl ? (
          <img src={token.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#1a1a28] flex items-center justify-center text-[12px] font-bold text-[#a78bfa]">
            {(token.symbol || "?")[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px] truncate">{token.symbol}</span>
            <span className={clsx("text-[10px] font-semibold", verdictCls[v])}>
              {v === "BLUE CHIP" ? "BLUE CHIP" : v}
            </span>
          </div>
          <div className="text-[10px] text-[#5c5c72] font-mono truncate">
            {token.mint.slice(0, 6)}…{token.mint.slice(-4)}
          </div>
        </div>
        <button
          onClick={onToggleWatch}
          className={clsx("p-2", watched ? "text-[#a78bfa]" : "text-[#5c5c72]")}
        >
          <Star size={16} fill={watched ? "currentColor" : "none"} />
        </button>
        {token.pairAddress && (
          <a
            href={`https://dexscreener.com/solana/${token.pairAddress}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 text-[#5c5c72]"
          >
            <ExternalLink size={14} />
          </a>
        )}
        <button onClick={onClose} className="p-2 text-[#9b9bb0] md:hidden">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1 px-3 py-2.5 border-b border-[#252536] text-center">
        {[
          ["PRICE", token.price || "—"],
          ["MC", token.mcap || "—"],
          ["LIQ", token.liq || "—"],
          [
            "24H",
            token.change24h != null
              ? `${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(1)}%`
              : "—",
          ],
        ].map(([k, val]) => (
          <div key={k as string}>
            <div className="text-[9px] text-[#5c5c72] tracking-wider">{k}</div>
            <div
              className={clsx(
                "text-[12px] font-semibold mt-0.5",
                k === "24H" &&
                  token.change24h != null &&
                  (token.change24h >= 0.05
                    ? "text-[#34d399]"
                    : token.change24h <= -0.05
                    ? "text-[#f87171]"
                    : "")
              )}
            >
              {val}
            </div>
          </div>
        ))}
      </div>

      <div className="h-44 shrink-0 border-b border-[#252536] relative bg-[#0b0b12]">
        {chart ? (
          <iframe title="chart" src={chart} className="w-full h-full border-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-[#5c5c72]">
            Chart unavailable
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="flex justify-between text-[11px] text-[#9b9bb0]">
          <span>SOL {sol.balance.toFixed(4)}</span>
          <span>
            BAL {tok.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </span>
        </div>

        <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-[#252536]">
          <button
            onClick={() => {
              setSide("buy");
              setAmount("0.1");
            }}
            className={clsx(
              "py-3 text-[13px] font-semibold",
              side === "buy" ? "bg-[#34d399] text-[#0b0b12]" : "text-[#9b9bb0]"
            )}
          >
            BUY
          </button>
          <button
            onClick={() => {
              setSide("sell");
              setAmount(tok.balance > 0 ? String(tok.balance) : "0");
            }}
            className={clsx(
              "py-3 text-[13px] font-semibold border-l border-[#252536]",
              side === "sell" ? "bg-[#f87171] text-white" : "text-[#9b9bb0]"
            )}
          >
            SELL
          </button>
        </div>

        <div>
          <div className="text-[10px] text-[#5c5c72] tracking-wide mb-1.5">
            AMOUNT · {side === "buy" ? "SOL" : "TOKEN"}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="desk-input"
            inputMode="decimal"
          />
        </div>

        <div className="grid grid-cols-4 gap-1.5">
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
                    setAmount(String((tok.balance * parseInt(x, 10)) / 100));
                  } else setAmount(x);
                }}
                className="py-2.5 text-[11px] border border-[#252536] text-[#9b9bb0] rounded-lg active:border-[#8b5cf6] active:text-[#a78bfa]"
              >
                {x}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#5c5c72] shrink-0">SLIP</span>
          {[50, 100, 300, 500].map((b) => (
            <button
              key={b}
              onClick={() => setSlip(b)}
              className={clsx(
                "flex-1 py-2 text-[11px] border rounded-lg",
                slip === b
                  ? "border-[#8b5cf6] text-[#a78bfa]"
                  : "border-[#252536] text-[#5c5c72]"
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
            "w-full py-3.5 text-[14px] font-semibold rounded-xl disabled:opacity-40",
            side === "buy" ? "bg-[#34d399] text-[#0b0b12]" : "bg-[#f87171] text-white"
          )}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center w-full">
              <Loader2 size={14} className="animate-spin" /> SIGN IN WALLET
            </span>
          ) : !connected ? (
            "CONNECT TO TRADE"
          ) : side === "buy" ? (
            `BUY ${token.symbol || "TOKEN"}`
          ) : (
            `SELL ${token.symbol || "TOKEN"}`
          )}
        </button>

        {error && <p className="text-[10px] text-[#f87171] text-center break-all">{error}</p>}
        {lastTx && (
          <a
            href={`https://solscan.io/tx/${lastTx}`}
            target="_blank"
            rel="noreferrer"
            className="block text-[11px] text-[#a78bfa] text-center font-medium"
          >
            VIEW TX
          </a>
        )}

        <button
          onClick={onOpenBots}
          className="w-full py-2.5 text-[12px] border border-[#252536] text-[#9b9bb0] rounded-xl"
        >
          CREATE BOT
        </button>
      </div>
    </div>
  );
}

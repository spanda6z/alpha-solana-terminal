"use client";

import { useEffect, useState } from "react";
import { X, Star, ExternalLink, Loader2, Bell, Share2, Bot } from "lucide-react";
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

type DeskTab = "trades" | "holders" | "top" | "orders" | "info";

type DexTrade = {
  txHash?: string;
  type?: string;
  priceUsd?: number;
  volumeUsd?: number;
  amount?: number;
  maker?: string;
  timestamp?: number;
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
  const [tab, setTab] = useState<DeskTab>("info");
  const [tradeOpen, setTradeOpen] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
  const [slip, setSlip] = useState(100);
  const [trades, setTrades] = useState<DexTrade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const { connected } = useWallet();
  const { buyWithSol, sellForSol, loading, error, lastTx } = useSwap();
  const sol = useSolBalance();
  const tok = useTokenBalance(token.mint);

  const chart = token.pairAddress
    ? `https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : null;

  useEffect(() => {
    if (!token.pairAddress || tab !== "trades") return;
    let cancelled = false;
    (async () => {
      setLoadingTrades(true);
      try {
        if (!cancelled) setTrades([]);
      } catch {
        if (!cancelled) setTrades([]);
      } finally {
        if (!cancelled) setLoadingTrades(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token.pairAddress, tab]);

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
  const TABS: { id: DeskTab; label: string }[] = [
    { id: "trades", label: "TRADES" },
    { id: "holders", label: "HOLDERS" },
    { id: "top", label: "TOP" },
    { id: "orders", label: "ORDERS" },
    { id: "info", label: "INFO" },
  ];

  return (
    <div className="token-overlay">
      <div className="shrink-0 border-b border-[#252536]">
        <div className="h-11 px-3 flex items-center gap-2">
          <button onClick={onClose} className="text-[#9b9bb0] text-[13px] px-0.5">
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
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[15px] truncate">{token.symbol}</span>
              <span className={clsx("text-[10px] font-semibold", verdictCls[v])}>
                {v === "BLUE CHIP" ? "BLUE CHIP" : v}
              </span>
            </div>
            <div className="text-[10px] text-[#5c5c72] truncate">
              {token.name || "Solana"} · pump / raydium
            </div>
          </div>
          <button
            onClick={onToggleWatch}
            className={clsx("p-1.5", watched ? "text-[#a78bfa]" : "text-[#5c5c72]")}
          >
            <Star size={16} fill={watched ? "currentColor" : "none"} />
          </button>
          <button className="p-1.5 text-[#5c5c72]">
            <Bell size={15} />
          </button>
          <button onClick={onOpenBots} className="p-1.5 text-[#5c5c72]">
            <Bot size={15} />
          </button>
          {token.pairAddress && (
            <a
              href={`https://dexscreener.com/solana/${token.pairAddress}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#5c5c72]"
            >
              <Share2 size={14} />
            </a>
          )}
          <button onClick={onClose} className="p-1.5 text-[#9b9bb0] md:hidden">
            <X size={16} />
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold tracking-tight">{token.price || "—"}</span>
            <span
              className={clsx(
                "text-[13px] font-medium",
                (token.change24h || 0) >= 0 ? "text-[#34d399]" : "text-[#f87171]"
              )}
            >
              {token.change24h != null
                ? `${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(1)}%`
                : ""}
            </span>
          </div>
          <div className="flex gap-3 mt-1 text-[11px] text-[#9b9bb0]">
            <span>
              MC <span className="text-[#f4f4f8] font-medium">{token.mcap || "—"}</span>
            </span>
            <span>
              LIQ <span className="text-[#f4f4f8] font-medium">{token.liq || "—"}</span>
            </span>
            <span>
              VOL <span className="text-[#f4f4f8] font-medium">{token.vol || "—"}</span>
            </span>
            <span>
              AGE <span className="text-[#f4f4f8] font-medium">{token.age || "—"}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="h-36 shrink-0 border-b border-[#252536] relative bg-[#0b0b12]">
        {chart ? (
          <iframe title="chart" src={chart} className="w-full h-full border-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-[#5c5c72]">
            Chart unavailable
          </div>
        )}
      </div>

      <div className="shrink-0 px-3 py-2 border-b border-[#252536]">
        <button
          onClick={() => {
            setTradeOpen((o) => !o);
            setSide("buy");
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#12121c] border border-[#252536] active:border-[#8b5cf6]"
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#34d399]" />
            BUY · 0.1 SOL
          </span>
          <span className="text-[13px] text-[#9b9bb0]">
            {token.price || "—"} {tradeOpen ? "⌃" : "⌄"}
          </span>
        </button>
      </div>

      {tradeOpen && (
        <div className="shrink-0 px-3 py-3 border-b border-[#252536] space-y-2.5 bg-[#0e0e16]">
          <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-[#252536]">
            <button
              onClick={() => setSide("buy")}
              className={clsx(
                "py-2.5 text-[12px] font-semibold",
                side === "buy" ? "bg-[#34d399] text-[#0b0b12]" : "text-[#9b9bb0]"
              )}
            >
              BUY
            </button>
            <button
              onClick={() => setSide("sell")}
              className={clsx(
                "py-2.5 text-[12px] font-semibold border-l border-[#252536]",
                side === "sell" ? "bg-[#f87171] text-white" : "text-[#9b9bb0]"
              )}
            >
              SELL
            </button>
          </div>
          <div className="flex justify-between text-[10px] text-[#9b9bb0]">
            <span>SOL {sol.balance.toFixed(4)}</span>
            <span>
              BAL {tok.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="desk-input"
            inputMode="decimal"
          />
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
                  className="py-2 text-[11px] border border-[#252536] text-[#9b9bb0] rounded-lg"
                >
                  {x}
                </button>
              )
            )}
          </div>
          <div className="flex gap-1.5">
            {[50, 100, 300, 500].map((b) => (
              <button
                key={b}
                onClick={() => setSlip(b)}
                className={clsx(
                  "flex-1 py-1.5 text-[10px] border rounded-lg",
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
              "w-full py-3 text-[13px] font-semibold rounded-xl disabled:opacity-40",
              side === "buy" ? "bg-[#34d399] text-[#0b0b12]" : "bg-[#f87171] text-white"
            )}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2 justify-center w-full">
                <Loader2 size={14} className="animate-spin" /> SIGN
              </span>
            ) : !connected ? (
              "CONNECT TO TRADE"
            ) : side === "buy" ? (
              `BUY ${token.symbol || ""}`
            ) : (
              `SELL ${token.symbol || ""}`
            )}
          </button>
          {error && <p className="text-[10px] text-[#f87171] text-center break-all">{error}</p>}
          {lastTx && (
            <a
              href={`https://solscan.io/tx/${lastTx}`}
              target="_blank"
              rel="noreferrer"
              className="block text-[11px] text-[#a78bfa] text-center"
            >
              VIEW TX
            </a>
          )}
        </div>
      )}

      <div className="flex border-b border-[#252536] shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "flex-1 py-2.5 text-[11px] font-semibold tracking-wide border-b-2",
              tab === t.id
                ? "border-[#8b5cf6] text-[#a78bfa]"
                : "border-transparent text-[#5c5c72]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "info" && (
          <div className="p-3 space-y-3">
            <div className="text-[10px] text-[#5c5c72] tracking-wider font-semibold">
              ACTIVITY · MARKET
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {["5M", "1H", "6H", "24H"].map((w, i) => (
                <div
                  key={w}
                  className={clsx(
                    "rounded-xl border border-[#252536] p-2 text-center",
                    i === 3 && "border-[#8b5cf6]/40"
                  )}
                >
                  <div className="text-[9px] text-[#5c5c72]">{w}</div>
                  <div
                    className={clsx(
                      "text-[12px] font-semibold mt-0.5",
                      i === 3
                        ? (token.change24h || 0) >= 0
                          ? "text-[#34d399]"
                          : "text-[#f87171]"
                        : "text-[#5c5c72]"
                    )}
                  >
                    {i === 3 && token.change24h != null
                      ? `${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(1)}%`
                      : "—"}
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-3 space-y-3">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#9b9bb0]">VOLUME 24H</span>
                <span className="font-semibold">{token.vol || "—"}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1a1a28] overflow-hidden flex">
                <div className="bg-[#34d399] w-1/2" />
                <div className="bg-[#f87171] w-1/2" />
              </div>
              <div className="flex justify-between text-[10px] text-[#5c5c72]">
                <span>buy flow · approx</span>
                <span>sell flow · approx</span>
              </div>
            </div>

            <div className="text-[10px] text-[#5c5c72] tracking-wider font-semibold pt-1">
              SECURITY
            </div>
            <div className="card divide-y divide-[#252536]">
              <div className="px-3 py-2.5 flex justify-between text-[12px]">
                <span className="text-[#9b9bb0]">LIQUIDITY</span>
                <span className="font-medium">{token.liq || "—"}</span>
              </div>
              <div className="px-3 py-2.5 flex justify-between text-[12px]">
                <span className="text-[#9b9bb0]">VERDICT</span>
                <span className={clsx("font-semibold", verdictCls[v])}>{v}</span>
              </div>
              <div className="px-3 py-2.5 flex justify-between text-[12px]">
                <span className="text-[#9b9bb0]">TOP 10 / DEV %</span>
                <span className="text-[#5c5c72]">Indexer required</span>
              </div>
              <div className="px-3 py-2.5 flex justify-between text-[12px]">
                <span className="text-[#9b9bb0]">SELL TEST</span>
                <span className="text-[#5c5c72]">Not simulated</span>
              </div>
            </div>

            <div className="text-[10px] text-[#5c5c72] text-center pt-1">
              Mint {token.mint.slice(0, 8)}…{token.mint.slice(-6)}
            </div>
          </div>
        )}

        {tab === "trades" && (
          <div className="p-3">
            <div className="text-[10px] text-[#5c5c72] mb-2 tracking-wider">
              TAPE · LIVE WHEN INDEXER CONNECTED
            </div>
            {loadingTrades && (
              <div className="text-center text-[12px] text-[#5c5c72] py-8">Loading…</div>
            )}
            {!loadingTrades && !trades.length && (
              <div className="card p-4 text-[12px] text-[#9b9bb0] leading-relaxed">
                Full trade tape (wallet · size · age) needs a Solana swap indexer or Helius
                webhooks. Chart still reflects live pair price via DexScreener.
              </div>
            )}
          </div>
        )}

        {tab === "holders" && (
          <div className="p-3 space-y-3">
            <div className="text-[10px] text-[#5c5c72] tracking-wider">
              CONCENTRATION · NEEDS HOLDER INDEX
            </div>
            <div className="card p-3">
              <div className="flex justify-between text-[11px] mb-2">
                <span className="text-[#fbbf24]">top 5 —</span>
                <span className="text-[#fbbf24]">top 10 —</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a28]" />
              <div className="mt-3 text-[12px] text-[#9b9bb0]">
                Holder map, LP tags, and whale labels require a Solana token-holder indexer
                (Helius / custom).
              </div>
            </div>
          </div>
        )}

        {tab === "top" && (
          <div className="p-3">
            <div className="card p-4 text-[12px] text-[#9b9bb0]">
              Top traders for this mint need swap aggregation. Connect Helius or Birdeye top
              traders when available.
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div className="p-3">
            <div className="card p-4 text-[12px] text-[#9b9bb0]">
              Open limit orders appear here when the order book / bot escrow is live on-chain.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

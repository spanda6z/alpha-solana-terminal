"use client";

import { useEffect, useState } from "react";
import { X, Star, Loader2, Share2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalance, useSolBalance } from "@/hooks/useTokenBalance";
import type { SelectedToken, Verdict } from "./types";
import clsx from "clsx";

const riskCls: Record<string, string> = {
  SAFE: "text-[#2dd4bf]",
  CAUTION: "text-[#f59e0b]",
  DANGER: "text-[#ef4444]",
  "BLUE CHIP": "text-[#3d9eff]",
  UNKNOWN: "text-[#7D8794]",
  LOW: "text-[#2dd4bf]",
  MED: "text-[#f59e0b]",
  HIGH: "text-[#ef4444]",
};

type DeskTab = "trades" | "holders" | "risk" | "info";

type TapeRow = {
  txHash?: string;
  type?: string;
  amount?: number;
  maker?: string;
  timestamp?: number;
};

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "24h"] as const;

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
  const [tab, setTab] = useState<DeskTab>("trades");
  const [interval, setInterval_] = useState<(typeof INTERVALS)[number]>("15m");
  const [tradeOpen, setTradeOpen] = useState(false);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
  const [slip, setSlip] = useState(100);
  const [trades, setTrades] = useState<TapeRow[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [holders, setHolders] = useState<
    { address: string; amount: number; pct: number; tag?: string | null }[]
  >([]);
  const [conc, setConc] = useState<{ top5: number; top10: number } | null>(null);
  const [loadingHolders, setLoadingHolders] = useState(false);
  const [dataHint, setDataHint] = useState<string | null>(null);
  const { connected } = useWallet();
  const { buyWithSol, sellForSol, loading, error, lastTx } = useSwap();
  const sol = useSolBalance();
  const tok = useTokenBalance(token.mint);

  const chart = token.pairAddress
    ? `https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : null;

  useEffect(() => {
    if (tab !== "trades" && tab !== "holders") return;
    let cancelled = false;
    (async () => {
      if (tab === "trades") {
        setLoadingTrades(true);
        try {
          const res = await fetch(`/api/trades?mint=${encodeURIComponent(token.mint)}`);
          const data = await res.json();
          if (cancelled) return;
          if (!data.ok) setDataHint(data.hint || data.error || null);
          else setDataHint(null);
          setTrades(
            (data.trades || []).map((tr: any) => ({
              txHash: tr.signature || tr.txHash,
              type: tr.side || tr.type,
              amount: tr.amount,
              maker: tr.wallet || tr.maker,
              timestamp: tr.timestamp || tr.ageSec,
            }))
          );
        } catch {
          if (!cancelled) setTrades([]);
        } finally {
          if (!cancelled) setLoadingTrades(false);
        }
      }
      if (tab === "holders") {
        setLoadingHolders(true);
        try {
          const res = await fetch(`/api/holders?mint=${encodeURIComponent(token.mint)}`);
          const data = await res.json();
          if (cancelled) return;
          if (!data.ok) setDataHint(data.hint || data.error || null);
          else setDataHint(null);
          setHolders(data.holders || []);
          setConc(data.concentration || null);
        } catch {
          if (!cancelled) {
            setHolders([]);
            setConc(null);
          }
        } finally {
          if (!cancelled) setLoadingHolders(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token.mint, tab]);

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

  const riskLabel =
    token.verdict ||
    (token.risk === "LOW"
      ? "SAFE"
      : token.risk === "MED"
      ? "CAUTION"
      : token.risk === "HIGH"
      ? "DANGER"
      : "UNKNOWN");

  const TABS: { id: DeskTab; label: string }[] = [
    { id: "trades", label: "TRADES" },
    { id: "holders", label: "HOLDERS" },
    { id: "risk", label: "RISK" },
    { id: "info", label: "INFO" },
  ];

  return (
    <div className="token-overlay flex flex-col bg-[#05070A] text-[#F5F7FA]">
      <div className="shrink-0 border-b border-[#151B22]">
        <div className="h-11 px-3 flex items-center gap-2">
          <button onClick={onClose} className="mono text-[12px] text-[#7D8794] px-1">
            ←
          </button>
          {token.imageUrl ? (
            <img src={token.imageUrl} alt="" className="w-8 h-8 rounded-full object-cover bg-[#0A0E13]" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0A0E13] border border-[#151B22] flex items-center justify-center mono text-[11px] text-[#3d9eff]">
              {(token.symbol || "?")[0]}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[15px] truncate">{token.symbol || "TOKEN"}</span>
              <span className={clsx("mono text-[9px] font-semibold", riskCls[riskLabel] || riskCls.UNKNOWN)}>
                {riskLabel}
              </span>
            </div>
            <div className="mono text-[9px] text-[#4A5560] truncate">
              {token.mint.slice(0, 4)}…{token.mint.slice(-4)}
            </div>
          </div>
          <button
            onClick={onToggleWatch}
            className={clsx("p-1.5", watched ? "text-[#3d9eff]" : "text-[#4A5560]")}
          >
            <Star size={16} fill={watched ? "currentColor" : "none"} />
          </button>
          {token.pairAddress && (
            <a
              href={`https://dexscreener.com/solana/${token.pairAddress}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-[#4A5560]"
            >
              <Share2 size={14} />
            </a>
          )}
          <button onClick={onClose} className="p-1.5 text-[#7D8794] md:hidden">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-0 px-2 pb-2 border-t border-[#151B22]/60">
          {[
            { k: "PRICE", v: token.price || "—" },
            { k: "MC", v: token.mcap || "—" },
            { k: "LIQ", v: token.liq || "—" },
            { k: "VOL", v: token.vol || "—" },
            {
              k: "24H",
              v:
                token.change24h != null
                  ? `${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(1)}%`
                  : "—",
              cls:
                token.change24h != null
                  ? token.change24h >= 0.05
                    ? "text-[#2dd4bf]"
                    : token.change24h <= -0.05
                    ? "text-[#ef4444]"
                    : undefined
                  : undefined,
            },
          ].map((m) => (
            <div key={m.k} className="px-1 pt-2 text-center">
              <div className="mono text-[8px] text-[#4A5560] tracking-wider">{m.k}</div>
              <div className={clsx("mono text-[11px] font-semibold mt-0.5 truncate", m.cls)}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="border-b border-[#151B22]">
          <div className="flex gap-1 px-2 py-1.5 overflow-x-auto">
            {INTERVALS.map((iv) => (
              <button
                key={iv}
                onClick={() => setInterval_(iv)}
                className={clsx(
                  "mono text-[10px] px-2 py-1 border",
                  interval === iv ? "border-[#3d9eff] text-[#3d9eff]" : "border-transparent text-[#4A5560]"
                )}
              >
                {iv}
              </button>
            ))}
            <span className="mono text-[9px] text-[#4A5560] ml-auto self-center pr-1">{interval} · chart</span>
          </div>
          <div className="h-[220px] sm:h-[280px] bg-[#0A0E13]">
            {chart ? (
              <iframe title="chart" src={chart} className="w-full h-full border-0" />
            ) : (
              <div className="h-full flex flex-col items-center justify-center data-unavailable">
                Historical data unavailable
                <span className="block mt-1 text-[#4A5560]">No pair for chart embed</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex border-b border-[#151B22] sticky top-0 bg-[#05070A] z-10">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex-1 mono text-[10px] tracking-wide py-2.5 border-b-2",
                tab === t.id ? "border-[#3d9eff] text-[#3d9eff]" : "border-transparent text-[#7D8794]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "trades" && (
          <div className="pb-4">
            <div className="flex items-center px-3 py-1.5 mono text-[9px] text-[#4A5560] border-b border-[#151B22]">
              <span className="w-12">TIME</span>
              <span className="w-12">SIDE</span>
              <span className="flex-1 text-right">SIZE</span>
              <span className="w-24 text-right">WALLET</span>
            </div>
            {loadingTrades && (
              <div className="py-8 text-center mono text-[11px] text-[#7D8794]">Loading tape…</div>
            )}
            {!loadingTrades && !trades.length && (
              <div className="data-unavailable py-10">
                WAITING FOR DATA
                <div className="mt-1 text-[#4A5560]">
                  Set HELIUS_API_KEY on Vercel for live trades. No fabricated activity.
                </div>
              </div>
            )}
            {trades.map((tr, i) => {
              const isBuy = (tr.type || "").toLowerCase().includes("buy");
              const time =
                tr.timestamp == null
                  ? "—"
                  : tr.timestamp < 1e10
                  ? `${tr.timestamp}s`
                  : new Date(tr.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });
              return (
                <div
                  key={(tr.txHash || "") + i}
                  className="flex items-center px-3 py-2 border-b border-[#151B22] mono text-[11px]"
                >
                  <span className="w-12 text-[#4A5560]">{time}</span>
                  <span className={clsx("w-12 font-semibold", isBuy ? "text-[#2dd4bf]" : "text-[#ef4444]")}>
                    {isBuy ? "BUY" : "SELL"}
                  </span>
                  <span className="flex-1 text-right font-medium">
                    {tr.amount != null
                      ? Number(tr.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : "—"}
                  </span>
                  <span className="w-24 text-right text-[#7D8794] truncate">
                    {tr.maker ? `${tr.maker.slice(0, 4)}…${tr.maker.slice(-4)}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {tab === "holders" && (
          <div className="p-3 space-y-3 pb-4">
            {dataHint && <div className="mono text-[10px] text-[#f59e0b]">{dataHint}</div>}
            {loadingHolders && (
              <div className="py-6 text-center mono text-[11px] text-[#7D8794]">Loading…</div>
            )}
            <div className="sb-panel p-3">
              <div className="flex justify-between mono text-[10px] mb-2">
                <span className="text-[#7D8794]">
                  TOP 5 <span className="text-[#F5F7FA]">{conc ? `${conc.top5.toFixed(1)}%` : "—"}</span>
                </span>
                <span className="text-[#7D8794]">
                  TOP 10 <span className="text-[#F5F7FA]">{conc ? `${conc.top10.toFixed(1)}%` : "—"}</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#151B22] overflow-hidden">
                <div
                  className="bg-[#3d9eff] h-full"
                  style={{ width: `${Math.min(100, conc?.top10 || 0)}%` }}
                />
              </div>
            </div>
            {!loadingHolders && !holders.length && (
              <div className="data-unavailable">
                WAITING FOR DATA
                <div className="mt-1 text-[#4A5560]">HELIUS_API_KEY required for holders.</div>
              </div>
            )}
            {holders.map((h, i) => (
              <div
                key={h.address}
                className="flex items-center gap-2 py-2 border-b border-[#151B22] mono text-[11px]"
              >
                <span className="text-[#4A5560] w-5">{i + 1}</span>
                <span className="flex-1 text-[#7D8794] truncate">
                  {h.address.slice(0, 6)}…{h.address.slice(-4)}
                </span>
                {h.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 border border-[#151B22] text-[#3d9eff]">
                    {h.tag}
                  </span>
                )}
                <span className="font-semibold w-14 text-right">{h.pct.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        )}

        {tab === "risk" && (
          <div className="p-3 space-y-3 pb-4">
            <div className="sb-panel p-3">
              <div className="mono text-[10px] text-[#7D8794] tracking-wide mb-1">OBSERVABLE RISK</div>
              <div className={clsx("mono text-[14px] font-semibold", riskCls[riskLabel])}>{riskLabel}</div>
              <p className="mono text-[10px] text-[#4A5560] mt-2 leading-relaxed">
                Heuristic from liquidity and volatility. Not a scam label. Full checks need indexers.
              </p>
            </div>
            <div className="sb-panel p-3 space-y-2 mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#7D8794]">Liquidity</span>
                <span>{token.liq || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8794]">24h change</span>
                <span>
                  {token.change24h != null
                    ? `${token.change24h >= 0 ? "+" : ""}${token.change24h.toFixed(1)}%`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8794]">Top 10 holders</span>
                <span>{conc ? `${conc.top10.toFixed(1)}%` : "DATA UNAVAILABLE"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8794]">Confidence</span>
                <span className="text-[#f59e0b]">LOW–MEDIUM</span>
              </div>
            </div>
            <p className="mono text-[9px] text-[#4A5560] px-1">Not a buy signal. Missing data lowers confidence.</p>
          </div>
        )}

        {tab === "info" && (
          <div className="p-3 space-y-2 pb-4 mono text-[11px]">
            <div className="sb-panel p-3 space-y-2">
              <div className="flex justify-between gap-2">
                <span className="text-[#7D8794]">Contract</span>
                <span className="truncate text-right text-[10px]">{token.mint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8794]">Name</span>
                <span>{token.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7D8794]">Age</span>
                <span>{token.age || "—"}</span>
              </div>
            </div>
            <button
              onClick={onOpenBots}
              className="w-full mono text-[10px] py-2.5 border border-[#151B22] text-[#7D8794]"
            >
              OPEN MONITORING BOTS
            </button>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-[#151B22] bg-[#05070A] pb-[env(safe-area-inset-bottom)]">
        {!tradeOpen ? (
          <div className="px-3 py-2.5 flex gap-2">
            <button
              onClick={() => {
                setSide("buy");
                setTradeOpen(true);
              }}
              className="flex-1 mono text-[12px] font-semibold py-3 bg-[#2dd4bf] text-[#05070A]"
            >
              BUY
            </button>
            <button
              onClick={() => {
                setSide("sell");
                setTradeOpen(true);
              }}
              className="flex-1 mono text-[12px] font-semibold py-3 border border-[#ef4444] text-[#ef4444]"
            >
              SELL
            </button>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => setSide("buy")}
                  className={clsx(
                    "mono text-[10px] px-3 py-1.5 border",
                    side === "buy" ? "border-[#2dd4bf] text-[#2dd4bf]" : "border-[#151B22] text-[#7D8794]"
                  )}
                >
                  BUY
                </button>
                <button
                  onClick={() => setSide("sell")}
                  className={clsx(
                    "mono text-[10px] px-3 py-1.5 border",
                    side === "sell" ? "border-[#ef4444] text-[#ef4444]" : "border-[#151B22] text-[#7D8794]"
                  )}
                >
                  SELL
                </button>
              </div>
              <button onClick={() => setTradeOpen(false)} className="mono text-[10px] text-[#7D8794]">
                CLOSE
              </button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {(side === "buy" ? ["0.05", "0.1", "0.25", "0.5", "1"] : ["25", "50", "75", "100"]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    if (side === "buy") setAmount(p);
                    else setAmount(String((tok.balance * parseInt(p, 10)) / 100));
                  }}
                  className="mono text-[10px] px-2.5 py-1 border border-[#151B22] text-[#7D8794]"
                >
                  {side === "buy" ? `${p}◎` : `${p}%`}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="sb-input flex-1"
                placeholder={side === "buy" ? "SOL amount" : "Token amount"}
              />
              <select
                value={slip}
                onChange={(e) => setSlip(Number(e.target.value))}
                className="sb-input w-24"
              >
                {[50, 100, 200, 500].map((s) => (
                  <option key={s} value={s}>
                    {s / 100}% slip
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-between mono text-[9px] text-[#4A5560]">
              <span>Bal {side === "buy" ? `${sol.balance.toFixed(3)}◎` : tok.balance.toFixed(2)}</span>
              {!connected && <span className="text-[#f59e0b]">Connect wallet</span>}
            </div>
            {error && <div className="mono text-[10px] text-[#ef4444]">{error}</div>}
            {lastTx && (
              <a
                href={`https://solscan.io/tx/${lastTx}`}
                target="_blank"
                rel="noreferrer"
                className="block mono text-[10px] text-[#3d9eff] truncate"
              >
                TX {lastTx}
              </a>
            )}
            <button
              onClick={trade}
              disabled={!connected || loading}
              className={clsx(
                "w-full mono text-[12px] font-semibold py-3 flex items-center justify-center gap-2",
                side === "buy" ? "bg-[#2dd4bf] text-[#05070A]" : "bg-[#ef4444] text-white",
                (!connected || loading) && "opacity-50"
              )}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {side === "buy" ? `BUY ${token.symbol || ""}` : `SELL ${token.symbol || ""}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

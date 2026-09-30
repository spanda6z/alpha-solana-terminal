"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useSolBalance } from "@/hooks/useTokenBalance";
import { Star, Users, Zap, Wallet } from "lucide-react";

export function AccountView({ watchCount }: { watchCount: number }) {
  const { publicKey, connected } = useWallet();
  const sol = useSolBalance();

  return (
    <div className="p-3 space-y-3 max-w-lg mx-auto">
      {!connected ? (
        <div className="card p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1a1a28] flex items-center justify-center mx-auto mb-3">
            <Wallet size={22} className="text-[#a78bfa]" />
          </div>
          <h2 className="text-[17px] font-semibold mb-2">Your desk</h2>
          <p className="text-[13px] text-[#9b9bb0] leading-relaxed mb-4">
            Connect to see what you hold, your PnL, your open orders and watchlist.
            Non-custodial: keys never leave your wallet.
          </p>
          <p className="text-[12px] text-[#5c5c72]">Use CONNECT in the top bar</p>
        </div>
      ) : (
        <div className="card p-4 space-y-2 text-[13px]">
          <div className="flex justify-between">
            <span className="text-[#5c5c72]">Wallet</span>
            <span className="text-[#a78bfa] font-medium">
              {publicKey?.toBase58().slice(0, 4)}…{publicKey?.toBase58().slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5c5c72]">SOL</span>
            <span className="font-semibold">{sol.balance.toFixed(4)}</span>
          </div>
        </div>
      )}

      <button className="card w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <Star size={18} className="text-[#a78bfa]" />
        <div className="flex-1">
          <div className="font-semibold text-[14px]">Watchlist</div>
          <div className="text-[12px] text-[#9b9bb0]">
            {watchCount ? `${watchCount} tokens` : "Empty — tap ★ on any token"}
          </div>
        </div>
        <span className="text-[#5c5c72]">›</span>
      </button>

      <button className="card w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <Users size={18} className="text-[#a78bfa]" />
        <div className="flex-1">
          <div className="font-semibold text-[14px]">Following</div>
          <div className="text-[12px] text-[#9b9bb0]">Nobody — tap a wallet in trades</div>
        </div>
        <span className="text-[#5c5c72]">›</span>
      </button>

      <button className="card w-full px-4 py-3.5 flex items-center gap-3 text-left">
        <Zap size={18} className="text-[#a78bfa]" />
        <div className="flex-1">
          <div className="font-semibold text-[14px]">Alerts</div>
          <div className="text-[12px] text-[#9b9bb0]">None — price, launches, wallets</div>
        </div>
        <span className="text-[#5c5c72]">›</span>
      </button>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button className="py-3 rounded-xl bg-[#8b5cf6] text-white font-semibold text-[12px]">
          NEW ALERT
        </button>
        <button className="py-3 rounded-xl border border-[#252536] text-[#9b9bb0] font-semibold text-[12px]">
          LINK TELEGRAM
        </button>
      </div>
    </div>
  );
}

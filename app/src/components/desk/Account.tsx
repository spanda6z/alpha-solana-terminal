"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useSolBalance } from "@/hooks/useTokenBalance";

export function AccountView({ watchCount }: { watchCount: number }) {
  const { publicKey, connected } = useWallet();
  const sol = useSolBalance();

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h2 className="mono text-[14px] font-semibold">ACCOUNT</h2>
      {!connected ? (
        <p className="mono text-[12px] text-[#8a8a93]">Connect a wallet to see positions.</p>
      ) : (
        <>
          <div className="border border-[#1e1e22] rounded p-3 mono text-[11px] space-y-2">
            <div className="flex justify-between">
              <span className="text-[#52525b]">WALLET</span>
              <span className="text-[#a3e635]">
                {publicKey?.toBase58().slice(0, 4)}…{publicKey?.toBase58().slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52525b]">SOL</span>
              <span>{sol.balance.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#52525b]">WATCHLIST</span>
              <span>{watchCount}</span>
            </div>
          </div>
          <div className="mono text-[11px] text-[#8a8a93]">
            Positions, open orders, and PnL appear when bag tracking is connected.
          </div>
        </>
      )}
    </div>
  );
}

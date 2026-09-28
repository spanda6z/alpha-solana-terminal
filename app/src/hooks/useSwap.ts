"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { prepareSwap, MINTS } from "../lib/jupiter";

export function useSwap() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const swap = useCallback(
    async (params: {
      inputMint: PublicKey;
      outputMint: PublicKey;
      amountLamports: number;
      slippageBps?: number;
    }) => {
      if (!publicKey) {
        setError("Wallet not connected");
        return null;
      }

      setLoading(true);
      setError(null);
      setLastTx(null);

      try {
        const { quote, tx } = await prepareSwap(
          connection,
          publicKey,
          params.inputMint,
          params.outputMint,
          params.amountLamports,
          params.slippageBps ?? 100
        );

        const sig = await sendTransaction(tx, connection);
        await connection.confirmTransaction(sig, "confirmed");

        setLastTx(sig);
        return { signature: sig, quote };
      } catch (e: any) {
        console.error(e);
        setError(e?.message || "Swap failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [connection, publicKey, sendTransaction]
  );

  const buyWithSol = useCallback(
    (tokenMint: PublicKey, solAmount: number) => {
      const lamports = Math.floor(solAmount * 1e9);
      return swap({
        inputMint: MINTS.SOL,
        outputMint: tokenMint,
        amountLamports: lamports,
      });
    },
    [swap]
  );

  return { swap, buyWithSol, loading, error, lastTx };
}

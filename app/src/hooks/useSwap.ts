"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { prepareSwap, getQuote, MINTS } from "../lib/jupiter";

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
      if (params.amountLamports <= 0) {
        setError("Amount must be > 0");
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

        const sig = await sendTransaction(tx, connection, {
          skipPreflight: false,
          maxRetries: 3,
        });
        await connection.confirmTransaction(sig, "confirmed");

        setLastTx(sig);
        return { signature: sig, quote };
      } catch (e: any) {
        console.error(e);
        const msg =
          e?.message?.includes("User rejected") || e?.name === "WalletSignTransactionError"
            ? "Transaction cancelled"
            : e?.message || "Swap failed";
        setError(msg);
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

  const sellForSol = useCallback(
    (tokenMint: PublicKey, tokenAmountRaw: number | bigint) => {
      return swap({
        inputMint: tokenMint,
        outputMint: MINTS.SOL,
        amountLamports: Number(tokenAmountRaw),
      });
    },
    [swap]
  );

  const previewQuote = useCallback(
    async (inputMint: PublicKey, outputMint: PublicKey, amountRaw: number) => {
      if (amountRaw <= 0) return null;
      try {
        return await getQuote({
          inputMint: inputMint.toBase58(),
          outputMint: outputMint.toBase58(),
          amount: amountRaw,
          slippageBps: 100,
        });
      } catch {
        return null;
      }
    },
    []
  );

  return { swap, buyWithSol, sellForSol, previewQuote, loading, error, lastTx, setError };
}

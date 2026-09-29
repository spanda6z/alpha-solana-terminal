"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount, getMint } from "@solana/spl-token";
import { useCallback, useEffect, useState } from "react";

const WSOL = "So11111111111111111111111111111111111111112";

export function useTokenBalance(mint: string | null) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [raw, setRaw] = useState<bigint>(BigInt(0));
  const [decimals, setDecimals] = useState<number>(9);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!publicKey || !mint) {
      setBalance(0);
      setRaw(BigInt(0));
      return;
    }
    setLoading(true);
    try {
      if (mint === WSOL) {
        const lamports = await connection.getBalance(publicKey);
        setDecimals(9);
        setRaw(BigInt(lamports));
        setBalance(lamports / LAMPORTS_PER_SOL);
        return;
      }
      const mintPk = new PublicKey(mint);
      const mintInfo = await getMint(connection, mintPk);
      const dec = mintInfo.decimals;
      setDecimals(dec);

      const ata = getAssociatedTokenAddressSync(mintPk, publicKey);
      try {
        const acc = await getAccount(connection, ata);
        setRaw(acc.amount);
        setBalance(Number(acc.amount) / Math.pow(10, dec));
      } catch {
        setRaw(BigInt(0));
        setBalance(0);
      }
    } catch {
      setBalance(0);
      setRaw(BigInt(0));
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, mint]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 20_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { balance, raw, decimals, loading, refresh };
}

export function useSolBalance() {
  return useTokenBalance(WSOL);
}

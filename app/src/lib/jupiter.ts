/**
 * Jupiter Quote + Swap (v6)
 */

import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";

const JUPITER_QUOTE = "https://quote-api.jup.ag/v6/quote";
const JUPITER_SWAP = "https://quote-api.jup.ag/v6/swap";

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  onlyDirectRoutes?: boolean;
}

export interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: any[];
}

export async function getQuote(params: QuoteParams): Promise<QuoteResponse> {
  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: Math.floor(params.amount).toString(),
    slippageBps: (params.slippageBps ?? 100).toString(),
    onlyDirectRoutes: (params.onlyDirectRoutes ?? false).toString(),
  });

  const res = await fetch(`${JUPITER_QUOTE}?${search}`);
  if (!res.ok) {
    throw new Error(`Quote failed: ${res.status}`);
  }
  return res.json();
}

export async function getSwapTransaction(
  quote: QuoteResponse,
  userPublicKey: string,
  prioritizationFeeLamports: number = 50_000
): Promise<VersionedTransaction> {
  const res = await fetch(JUPITER_SWAP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      prioritizationFeeLamports,
      dynamicComputeUnitLimit: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Swap build failed: ${res.status}`);
  }

  const { swapTransaction } = await res.json();
  const txBuf = Buffer.from(swapTransaction, "base64");
  return VersionedTransaction.deserialize(txBuf);
}

export async function prepareSwap(
  _connection: Connection,
  user: PublicKey,
  inputMint: PublicKey,
  outputMint: PublicKey,
  amount: number,
  slippageBps = 100
) {
  const quote = await getQuote({
    inputMint: inputMint.toBase58(),
    outputMint: outputMint.toBase58(),
    amount,
    slippageBps,
  });
  const tx = await getSwapTransaction(quote, user.toBase58());
  return { quote, tx };
}

export const MINTS = {
  SOL: new PublicKey("So11111111111111111111111111111111111111112"),
  USDC: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  USDT: new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"),
};

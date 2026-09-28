/**
 * Alpha instruction builders
 */

import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  PROGRAM_IDS,
  STRATEGY,
  getBotPda,
  getVaultPda,
  getFeeConfigPda,
} from "../programs";

const BOT_CORE = PROGRAM_IDS.botCore;

export function buildCreateBotIx(params: {
  owner: PublicKey;
  mint: PublicKey;
  ownerTokenAccount: PublicKey;
  strategy: number;
  initialDeposit: bigint;
}): { ix: TransactionInstruction; botPda: PublicKey; vaultPda: PublicKey } {
  const [botPda] = getBotPda(params.owner, params.strategy);
  const [vaultPda] = getVaultPda(botPda);

  const data = Buffer.alloc(8 + 1 + 8);
  data.writeBigUInt64LE(0n, 0);
  data.writeUInt8(params.strategy, 8);
  data.writeBigUInt64LE(params.initialDeposit, 9);

  const keys = [
    { pubkey: params.owner, isSigner: true, isWritable: true },
    { pubkey: params.mint, isSigner: false, isWritable: false },
    { pubkey: params.ownerTokenAccount, isSigner: false, isWritable: true },
    { pubkey: botPda, isSigner: false, isWritable: true },
    { pubkey: vaultPda, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  const ix = new TransactionInstruction({
    keys,
    programId: BOT_CORE,
    data,
  });

  return { ix, botPda, vaultPda };
}

export function buildWithdrawAndCloseIx(params: {
  owner: PublicKey;
  strategy: number;
  ownerTokenAccount: PublicKey;
}): TransactionInstruction {
  const [botPda] = getBotPda(params.owner, params.strategy);
  const [vaultPda] = getVaultPda(botPda);

  const data = Buffer.alloc(8);

  const keys = [
    { pubkey: params.owner, isSigner: true, isWritable: true },
    { pubkey: botPda, isSigner: false, isWritable: true },
    { pubkey: params.ownerTokenAccount, isSigner: false, isWritable: true },
    { pubkey: vaultPda, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: BOT_CORE,
    data,
  });
}

export function ensureAtaIx(
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey
): { ata: PublicKey; ix: TransactionInstruction | null } {
  const ata = getAssociatedTokenAddressSync(mint, owner);
  const ix = createAssociatedTokenAccountInstruction(payer, ata, owner, mint);
  return { ata, ix };
}

export { STRATEGY, PROGRAM_IDS, getBotPda, getVaultPda, getFeeConfigPda };

/**
 * Alpha Program IDs and PDA helpers
 */

import { PublicKey } from "@solana/web3.js";

export const PROGRAM_IDS = {
  feeRouter: new PublicKey("DDAspZPbRaaJKNXPuVtuQLiDEHGyJ3ASMUcMigLNvdxW"),
  botCore: new PublicKey("4Ao2LU3FdW2j2wkJAktPLxhAkPAgCpv1hZwnpTRJm9DC"),
  dcaBot: new PublicKey("Au1TvdD1sS6Tb1HsGebz8KRqMXqBK5N7tkREBWBkUDid"),
  gridBot: new PublicKey("GU843f7sYg6oBofypdvbSdFFXhWR7fQucq3DRtbcWy6Z"),
  shadowBot: new PublicKey("2qJXqHk8QkRr85FXqStz3g67KvDi2CnVeUkK2v6ZwZ2e"),
  ladderBot: new PublicKey("2GZGjRr7SarumQX3n6BeAw3rBsfcrjkwPjJzoRui3fYg"),
  martingaleBot: new PublicKey("5ERrEkhCCJtVY2USYDBTfYvG4RtZJXxAxnSMHkTGE5m7"),
} as const;

export const STRATEGY = {
  DCA: 0,
  GRID: 1,
  INFINITY_GRID: 2,
  SHADOW: 3,
  LADDER: 4,
  MARTINGALE: 5,
} as const;

export const SEEDS = {
  FEE_CONFIG: Buffer.from("fee_config"),
  BOT: Buffer.from("bot"),
  VAULT: Buffer.from("vault"),
  DCA: Buffer.from("dca"),
  GRID: Buffer.from("grid"),
  SHADOW: Buffer.from("shadow"),
  LADDER: Buffer.from("ladder"),
  MARTINGALE: Buffer.from("martingale"),
} as const;

export function getFeeConfigPda(programId = PROGRAM_IDS.feeRouter): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.FEE_CONFIG], programId);
}

export function getBotPda(
  owner: PublicKey,
  strategy: number,
  programId = PROGRAM_IDS.botCore
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEEDS.BOT, owner.toBuffer(), Buffer.from([strategy])],
    programId
  );
}

export function getVaultPda(
  botHeader: PublicKey,
  programId = PROGRAM_IDS.botCore
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.VAULT, botHeader.toBuffer()], programId);
}

export function getDcaPda(bot: PublicKey, programId = PROGRAM_IDS.dcaBot): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.DCA, bot.toBuffer()], programId);
}

export function getGridPda(bot: PublicKey, programId = PROGRAM_IDS.gridBot): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.GRID, bot.toBuffer()], programId);
}

export function getShadowPda(bot: PublicKey, programId = PROGRAM_IDS.shadowBot): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.SHADOW, bot.toBuffer()], programId);
}

export function getLadderPda(bot: PublicKey, programId = PROGRAM_IDS.ladderBot): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.LADDER, bot.toBuffer()], programId);
}

export function getMartingalePda(bot: PublicKey, programId = PROGRAM_IDS.martingaleBot): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.MARTINGALE, bot.toBuffer()], programId);
}

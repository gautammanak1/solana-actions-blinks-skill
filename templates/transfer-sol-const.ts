import { PublicKey } from "@solana/web3.js";

/** Devnet test recipient from official solana-actions examples */
export const DEFAULT_SOL_ADDRESS = new PublicKey(
  process.env.TREASURY_WALLET ?? "nick6zJc6HpW3kfBm4xS2dmbuVRyb5F3AnUvj5ymzR5",
);

export const DEFAULT_SOL_AMOUNT = 0.01;

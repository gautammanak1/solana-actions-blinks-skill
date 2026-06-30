"use client";

import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DevnetBanner() {
  return (
    <Alert variant="destructive" className="mx-auto max-w-5xl border-dashed">
      <AlertCircle />
      <AlertTitle>Use Devnet in your wallet</AlertTitle>
      <AlertDescription>
        <p>
          Phantom must be on <strong>Devnet</strong>, not Mainnet — otherwise tips fail during
          simulation.
        </p>
        <p className="mt-2">
          Need SOL?{" "}
          <a
            href="https://faucet.solana.com/"
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-4"
          >
            faucet.solana.com
          </a>
        </p>
      </AlertDescription>
    </Alert>
  );
}

"use client";

import { Blink, useBlink } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useState } from "react";

import "@dialectlabs/blinks/index.css";

const ACTION_PATH = "/api/actions/transfer-sol";
const FALLBACK_ORIGIN = "https://solana-actions-blinks-demo-nine.vercel.app";

export function ActionBlink() {
  const [actionUrl, setActionUrl] = useState(`${FALLBACK_ORIGIN}${ACTION_PATH}`);

  useEffect(() => {
    setActionUrl(`${window.location.origin}${ACTION_PATH}`);
  }, []);

  const { blink, isLoading } = useBlink({ url: actionUrl });
  const { adapter } = useBlinkSolanaWalletAdapter(clusterApiUrl("devnet"));

  return (
    <div className="card card-accent">
      <h2>Try the blink</h2>
      <p>
        Embedded <code>@dialectlabs/blinks</code> client — no dial.to or Inspector needed.
        Use Phantom on <strong>devnet</strong>.
      </p>
      <div className="wallet-row">
        <WalletMultiButton />
      </div>
      <div className="blink-shell">
        {isLoading || !blink ? (
          <div className="loading">Loading action…</div>
        ) : (
          <Blink blink={blink} adapter={adapter} stylePreset="default" />
        )}
      </div>
    </div>
  );
}

"use client";

import { Blink, setProxyUrl, useAction } from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useState } from "react";

import "@dialectlabs/blinks/index.css";

// dial.to proxy (proxy.dial.to / api.dial.to) is often down — fetch the Action URL directly.
setProxyUrl("");

const ACTION_PATH = "/api/actions/transfer-sol";
const FALLBACK_ORIGIN = "https://solana-actions-blinks-demo-nine.vercel.app";

export function ActionBlink() {
  const [actionUrl, setActionUrl] = useState(`${FALLBACK_ORIGIN}${ACTION_PATH}`);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActionUrl(`${window.location.origin}${ACTION_PATH}`);
  }, []);

  const { blink, isLoading } = useAction({ url: actionUrl });
  const { adapter } = useBlinkSolanaWalletAdapter(clusterApiUrl("devnet"));

  useEffect(() => {
    if (!isLoading && !blink) {
      setError("Could not load action. Check the GET endpoint or try again.");
    } else {
      setError(null);
    }
  }, [blink, isLoading]);

  return (
    <div className="card card-accent">
      <h2>Try the blink</h2>
      <p>
        Embedded <code>@dialectlabs/blinks</code> client — fetches your Action directly (no dial.to
        proxy). Use Phantom on <strong>devnet</strong>.
      </p>
      <div className="wallet-row">
        <WalletMultiButton />
      </div>
      <div className="blink-shell">
        {isLoading ? (
          <div className="loading">Loading action…</div>
        ) : error ? (
          <div className="loading">{error}</div>
        ) : blink ? (
          <Blink blink={blink} adapter={adapter} stylePreset="default" securityLevel="all" />
        ) : null}
      </div>
    </div>
  );
}

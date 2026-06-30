"use client";

export function DevnetBanner() {
  return (
    <div className="devnet-banner" role="alert">
      <strong>Devnet only</strong>
      <p>
        This demo builds transactions on <strong>Solana Devnet</strong>. If Phantom shows{" "}
        <strong>Mainnet</strong>, the tip will fail with &quot;reverted during simulation&quot;.
      </p>
      <ol>
        <li>Phantom → top-left network → switch to <strong>Devnet</strong></li>
        <li>
          Get test SOL:{" "}
          <a href="https://faucet.solana.com/" target="_blank" rel="noreferrer">
            faucet.solana.com
          </a>
        </li>
        <li>Refresh this page → connect wallet → tip again</li>
      </ol>
    </div>
  );
}

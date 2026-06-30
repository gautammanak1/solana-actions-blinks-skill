"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState } from "react";

const ACTION_PATH = "/api/actions/transfer-sol";
const FALLBACK_ORIGIN = "https://solana-actions-blinks-demo-nine.vercel.app";

type ActionParameter = {
  name: string;
  label?: string;
  type?: string;
  min?: number;
  max?: number;
  required?: boolean;
};

type LinkedAction = {
  label: string;
  href: string;
  parameters?: ActionParameter[];
};

type ActionGetResponse = {
  title: string;
  icon: string;
  description: string;
  links?: { actions: LinkedAction[] };
};

function resolveHref(href: string, params: Record<string, string>) {
  let url = href;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  }
  return url;
}

export function ActionBlink() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const [actionUrl, setActionUrl] = useState(`${FALLBACK_ORIGIN}${ACTION_PATH}`);
  const [action, setAction] = useState<ActionGetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [customAmount, setCustomAmount] = useState("0.05");

  useEffect(() => {
    setActionUrl(`${window.location.origin}${ACTION_PATH}`);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(actionUrl, { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message ?? `GET failed (${res.status})`);
        }
        return res.json() as Promise<ActionGetResponse>;
      })
      .then((data) => {
        if (!cancelled) setAction(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [actionUrl]);

  const linkedActions = useMemo(() => action?.links?.actions ?? [], [action]);

  const executeTip = useCallback(
    async (href: string, extraParams: Record<string, string> = {}) => {
      if (!publicKey || !signTransaction) {
        setError("Connect a devnet wallet first.");
        return;
      }

      setBusy(true);
      setError(null);
      setStatus(null);

      try {
        const postUrl = resolveHref(href, extraParams);
        const res = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account: publicKey.toBase58() }),
        });
        const body = await res.json();
        if (!res.ok) {
          throw new Error(body.message ?? "Action POST failed");
        }

        const txBytes = Uint8Array.from(atob(body.transaction), (c) => c.charCodeAt(0));
        const transaction = Transaction.from(txBytes);
        const signed = await signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: true,
        });
        await connection.confirmTransaction(signature, "confirmed");

        setStatus(`Sent! ${body.message ?? "Transaction confirmed."} Signature: ${signature.slice(0, 8)}…`);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        if (/simulation|reverted|unknown error/i.test(message)) {
          setError(
            "Transaction simulation failed. Is Phantom set to Devnet (not Mainnet)? Get devnet SOL from faucet.solana.com, then retry.",
          );
        } else {
          setError(message);
        }
      } finally {
        setBusy(false);
      }
    },
    [connection, publicKey, signTransaction],
  );

  return (
    <div className="card card-accent">
      <h2>Try the blink</h2>
      <p>
        Native Action client — talks directly to your GET/POST endpoints. No dial.to or Inspector
        required. Use Phantom on <strong>devnet</strong>.
      </p>
      <div className="wallet-row">
        <WalletMultiButton />
      </div>

      <div className="blink-shell">
        {loading ? (
          <div className="loading">Loading action…</div>
        ) : error && !action ? (
          <div className="loading error-text">{error}</div>
        ) : action ? (
          <div className="tip-jar">
            <div className="tip-jar-header">
              <img src={action.icon} alt="" className="tip-jar-icon" width={48} height={48} />
              <div>
                <div className="tip-jar-title">{action.title}</div>
                <div className="tip-jar-desc">{action.description}</div>
              </div>
            </div>

            <div className="tip-buttons">
              {linkedActions.map((item) => {
                const param = item.parameters?.[0];
                if (param) {
                  return (
                    <div key={item.label} className="custom-tip">
                      <label htmlFor="custom-amount">{param.label ?? "Amount (SOL)"}</label>
                      <div className="custom-tip-row">
                        <input
                          id="custom-amount"
                          type="number"
                          min={param.min ?? 0.001}
                          max={param.max ?? 10}
                          step="0.001"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          disabled={busy}
                        />
                        <button
                          type="button"
                          className="tip-btn"
                          disabled={!connected || busy}
                          onClick={() => executeTip(item.href, { [param.name]: customAmount })}
                        >
                          {item.label}
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.label}
                    type="button"
                    className="tip-btn"
                    disabled={!connected || busy}
                    onClick={() => executeTip(item.href)}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {!connected && (
              <p className="hint">Connect wallet to enable tip buttons.</p>
            )}
            {error && action && <p className="hint error-text">{error}</p>}
            {status && <p className="hint success-text">{status}</p>}
          </div>
        ) : null}
      </div>
    </div>
  );
}

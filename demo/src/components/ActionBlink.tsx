"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction } from "@solana/web3.js";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

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
            "Transaction simulation failed. Switch Phantom to Devnet, fund from faucet.solana.com, then retry.",
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
    <Card className="mx-auto max-w-lg shadow-md">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>Tip jar</CardTitle>
            <CardDescription className="mt-1.5">
              Pick an amount and send SOL instantly.
            </CardDescription>
          </div>
          <WalletMultiButton />
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {loading ? (
          <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
            <Loader2 className="size-4 animate-spin" />
            Loading action…
          </div>
        ) : error && !action ? (
          <p className="text-destructive py-6 text-center text-sm">{error}</p>
        ) : action ? (
          <>
            <div className="flex items-center gap-4">
              <img
                src={action.icon}
                alt=""
                className="border-border size-12 rounded-xl border object-cover"
                width={48}
                height={48}
              />
              <div className="min-w-0">
                <p className="font-medium leading-tight">{action.title}</p>
                <p className="text-muted-foreground mt-1 text-sm">{action.description}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-2.5">
              {linkedActions.map((item) => {
                const param = item.parameters?.[0];
                if (param) {
                  return (
                    <div key={item.label} className="space-y-2">
                      <label htmlFor="custom-amount" className="text-muted-foreground text-sm">
                        {param.label ?? "Amount (SOL)"}
                      </label>
                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Input
                          id="custom-amount"
                          type="number"
                          min={param.min ?? 0.001}
                          max={param.max ?? 10}
                          step="0.001"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          disabled={busy}
                        />
                        <Button
                          type="button"
                          disabled={!connected || busy}
                          onClick={() => executeTip(item.href, { [param.name]: customAmount })}
                        >
                          {busy ? <Loader2 className="animate-spin" /> : item.label}
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <Button
                    key={item.label}
                    type="button"
                    variant="secondary"
                    className="h-11 w-full"
                    disabled={!connected || busy}
                    onClick={() => executeTip(item.href)}
                  >
                    {busy ? <Loader2 className="animate-spin" /> : item.label}
                  </Button>
                );
              })}
            </div>

            {!connected && (
              <p className="text-muted-foreground text-center text-sm">
                Connect your wallet to enable tipping.
              </p>
            )}
            {error && action && (
              <p className="text-destructive text-center text-sm">{error}</p>
            )}
            {status && (
              <p className="text-accent text-center text-sm break-all">{status}</p>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

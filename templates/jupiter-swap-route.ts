/**
 * Jupiter USDC → SOL Swap Action
 * API: https://api.jup.ag/swap/v1 (see skill/reference/jupiter-api.md)
 *
 * Copy to: src/app/api/actions/swap/usdc-to-sol/route.ts
 * Requires: JUPITER_API_KEY, SOLANA_RPC in env
 */

import {
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  createPostResponse,
  ActionError,
  LinkedAction,
} from "@solana/actions";
import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";

const headers = createActionHeaders();
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL = "So11111111111111111111111111111111111111112";
const ALLOWED_SLIPPAGE = new Set([50, 100, 300]);

export const dynamic = "force-dynamic";

export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const base = new URL("/api/actions/swap/usdc-to-sol", requestUrl.origin).toString();

  const payload: ActionGetResponse = {
    type: "action",
    title: "Swap USDC → SOL",
    icon: new URL("/icon.png", requestUrl.origin).toString(),
    description: "Swap via Jupiter. Quote fetched at sign time.",
    label: "Swap",
    links: {
      actions: [
        { type: "action", label: "Swap $10", href: `${base}?amount=10&slippageBps=50` },
        {
          type: "action",
          label: "Custom",
          href: `${base}?amount={amount}&slippageBps={slippage}`,
          parameters: [
            { name: "amount", label: "USDC", type: "number", required: true, min: 1, max: 10000 },
            {
              name: "slippage",
              label: "Slippage",
              type: "select",
              required: true,
              options: [
                { label: "0.5%", value: "50", selected: true },
                { label: "1%", value: "100" },
                { label: "3%", value: "300" },
              ],
            },
          ],
        },
      ] as unknown as LinkedAction[],
    },
  };
  return Response.json(payload, { headers });
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);
    const usdc = parseFloat(url.searchParams.get("amount") ?? "10");
    const slippageBps = parseInt(
      url.searchParams.get("slippageBps") ?? url.searchParams.get("slippage") ?? "50",
      10,
    );

    if (usdc < 1 || usdc > 10000) throw "amount out of range";
    if (!ALLOWED_SLIPPAGE.has(slippageBps)) throw "invalid slippage";

    const body: ActionPostRequest = await req.json();
    const account = new PublicKey(body.account);
    const baseUnits = Math.floor(usdc * 1_000_000);

    const quoteUrl = new URL("https://api.jup.ag/swap/v1/quote");
    quoteUrl.searchParams.set("inputMint", USDC);
    quoteUrl.searchParams.set("outputMint", SOL);
    quoteUrl.searchParams.set("amount", String(baseUnits));
    quoteUrl.searchParams.set("slippageBps", String(slippageBps));

    const quoteRes = await fetch(quoteUrl, {
      headers: { "x-api-key": process.env.JUPITER_API_KEY! },
    });
    if (!quoteRes.ok) throw `Jupiter quote failed: ${quoteRes.status}`;
    const quote = await quoteRes.json();

    const swapRes = await fetch("https://api.jup.ag/swap/v1/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.JUPITER_API_KEY!,
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: account.toBase58(),
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
      }),
    });
    if (!swapRes.ok) throw `Jupiter swap failed: ${swapRes.status}`;
    const { swapTransaction } = await swapRes.json();

    const transaction = VersionedTransaction.deserialize(
      Buffer.from(swapTransaction, "base64"),
    );

    const connection = new Connection(process.env.SOLANA_RPC!);
    const sim = await connection.simulateTransaction(transaction);
    if (sim.value.err) throw "Swap simulation failed";

    const payload = await createPostResponse({
      fields: {
        type: "transaction",
        transaction,
        message: `Swap ${usdc} USDC → ~${(Number(quote.outAmount) / 1e9).toFixed(4)} SOL`,
      },
    });

    return Response.json(payload, { headers });
  } catch (err) {
    const message = typeof err === "string" ? err : "Swap failed";
    return Response.json({ message } satisfies ActionError, { status: 400, headers });
  }
};

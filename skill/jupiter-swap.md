# Skill: Jupiter Swap Blink Action

Real Jupiter Swap API v1 integration for shareable swap blinks.

API reference: [reference/jupiter-api.md](reference/jupiter-api.md)  
Template: [templates/jupiter-swap-route.ts](../../templates/jupiter-swap-route.ts)

## When to use

- "Swap USDC → SOL" blink on X
- DeFi onboarding via shareable link
- Token exchange without full dApp navigation

## Env vars

```bash
SOLANA_RPC=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
JUPITER_API_KEY=your_key_from_portal.jup.ag
```

Get API key: https://portal.jup.ag (free tier available)

## GET — swap with amount + slippage params

```typescript
const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const SOL  = "So11111111111111111111111111111111111111112";

const baseHref = new URL("/api/actions/swap/usdc-to-sol", requestUrl.origin).toString();

const payload: ActionGetResponse = {
  type: "action",
  title: "Quick Swap — USDC to SOL",
  icon: new URL("/jupiter-icon.png", requestUrl.origin).toString(),
  description: "Swap USDC to SOL via Jupiter. Quotes are live at sign time.",
  label: "Swap",
  links: {
    actions: [
      { label: "Swap $10 USDC", href: `${baseHref}?amount=10&slippageBps=50` },
      { label: "Swap $50 USDC", href: `${baseHref}?amount=50&slippageBps=50` },
      {
        label: "Custom Swap",
        href: `${baseHref}?amount={amount}&slippageBps={slippage}`,
        parameters: [
          {
            name: "amount",
            label: "USDC amount",
            type: "number",
            required: true,
            min: 1,
            max: 10000,
          },
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
    ],
  },
};
```

## POST — live quote + swap tx

```typescript
import { VersionedTransaction } from "@solana/web3.js";

const ALLOWED_SLIPPAGE = new Set([50, 100, 300]);

export const POST = async (req: Request) => {
  const url = new URL(req.url);
  const usdcAmount = parseFloat(url.searchParams.get("amount") ?? "10");
  const slippageBps = parseInt(url.searchParams.get("slippageBps") ?? "50", 10);

  if (usdcAmount < 1 || usdcAmount > 10000) throw "amount out of range";
  if (!ALLOWED_SLIPPAGE.has(slippageBps)) throw "invalid slippage";

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  const baseUnits = Math.floor(usdcAmount * 1_000_000);

  // 1. Quote
  const quoteUrl = new URL("https://api.jup.ag/swap/v1/quote");
  quoteUrl.searchParams.set("inputMint", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  quoteUrl.searchParams.set("outputMint", "So11111111111111111111111111111111111111112");
  quoteUrl.searchParams.set("amount", String(baseUnits));
  quoteUrl.searchParams.set("slippageBps", String(slippageBps));

  const quoteRes = await fetch(quoteUrl, {
    headers: { "x-api-key": process.env.JUPITER_API_KEY! },
  });
  if (!quoteRes.ok) throw `Jupiter quote failed: ${quoteRes.statusText}`;
  const quote = await quoteRes.json();

  // 2. Swap transaction
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
      prioritizationFeeLamports: "auto",
    }),
  });
  if (!swapRes.ok) throw `Jupiter swap build failed: ${swapRes.statusText}`;
  const { swapTransaction } = await swapRes.json();

  const transaction = VersionedTransaction.deserialize(
    Buffer.from(swapTransaction, "base64")
  );

  // 3. Simulate
  const connection = new Connection(process.env.SOLANA_RPC!);
  const sim = await connection.simulateTransaction(transaction);
  if (sim.value.err) throw "Swap would fail — check USDC balance";

  const outSol = (Number(quote.outAmount) / 1e9).toFixed(4);

  const payload = await createPostResponse({
    fields: {
      transaction,
      message: `Swap ${usdcAmount} USDC → ~${outSol} SOL (Jupiter)`,
    },
  });

  return Response.json(payload, { headers });
};
```

## Real API test (no Action — direct Jupiter)

```bash
# Quote $10 USDC → SOL
curl -sG "https://api.jup.ag/swap/v1/quote" \
  -H "x-api-key: $JUPITER_API_KEY" \
  --data-urlencode "inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" \
  --data-urlencode "outputMint=So11111111111111111111111111111111111111112" \
  --data-urlencode "amount=10000000" \
  --data-urlencode "slippageBps=50" | jq '{inAmount, outAmount, priceImpactPct}'
```

## actions.json

```json
{
  "rules": [
    {
      "pathPattern": "/swap",
      "apiPath": "https://yourdomain.com/api/actions/swap/usdc-to-sol"
    }
  ]
}
```

## Blinks Inspector notes

- Swap txs are **VersionedTransaction** — Inspector must decode v0 tx
- Test on mainnet-beta with small amounts first
- Quote expires in seconds — always fetch in POST, never in GET

## Security checklist

- [ ] Mints hardcoded (USDC + SOL only for this route)
- [ ] Slippage allowlist: 50, 100, 300 bps
- [ ] Amount bounds: 1–10000 USDC
- [ ] `JUPITER_API_KEY` server-side only
- [ ] Simulate tx before return
- [ ] Rate limit POST (Jupiter calls are costly)

## GET disclaimer

Include in description:
```
Swap via Jupiter. Price shown at sign time. Slippage applies.
Not financial advice.
```

## Related

- Jupiter API details → [reference/jupiter-api.md](reference/jupiter-api.md)
- jup-ag/agent-skills for advanced Jupiter agent patterns

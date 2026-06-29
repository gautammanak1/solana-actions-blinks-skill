# Jupiter Swap API — Real Endpoints for Swap Actions

Docs: https://station.jup.ag/docs  
API reference: https://developers.jup.ag/docs/api-reference/swap/v1/quote  
Portal (API key): https://portal.jup.ag

## Base URL (2026)

```
https://api.jup.ag
```

**Do not use** deprecated hosts: `lite-api.jup.ag`, `quote-api.jup.ag/v6`

## Authentication

```http
x-api-key: YOUR_JUPITER_API_KEY
```

Free tier: sign up at https://portal.jup.ag  
Env var: `JUPITER_API_KEY`

## Step 1 — GET /swap/v1/quote

Fetch a fresh quote inside POST handler (never cache between GET metadata and POST tx).

```bash
curl -sG "https://api.jup.ag/swap/v1/quote" \
  -H "x-api-key: YOUR_KEY" \
  --data-urlencode "inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" \
  --data-urlencode "outputMint=So11111111111111111111111111111111111111112" \
  --data-urlencode "amount=1000000" \
  --data-urlencode "slippageBps=50" \
  --data-urlencode "swapMode=ExactIn"
```

| Param | Description |
|-------|-------------|
| `inputMint` | Source token mint (USDC above) |
| `outputMint` | Destination mint (SOL above) |
| `amount` | Input amount in **token base units** (USDC 6 decimals → 1 USDC = 1000000) |
| `slippageBps` | 50 = 0.5%, 100 = 1%, 300 = 3% |
| `swapMode` | `ExactIn` or `ExactOut` |

### Example response (truncated)

```json
{
  "inputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "inAmount": "1000000",
  "outputMint": "So11111111111111111111111111111111111111112",
  "outAmount": "5843210",
  "otherAmountThreshold": "5803984",
  "swapMode": "ExactIn",
  "slippageBps": 50,
  "priceImpactPct": "0.0012",
  "routePlan": [ ... ]
}
```

## Step 2 — POST /swap/v1/swap

Pass entire quote response + user pubkey:

```bash
curl -sX POST "https://api.jup.ag/swap/v1/swap" \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_KEY" \
  -d '{
    "quoteResponse": { ... paste quote JSON ... },
    "userPublicKey": "UserWalletBase58Pubkey",
    "wrapAndUnwrapSol": true,
    "dynamicComputeUnitLimit": true,
    "prioritizationFeeLamports": "auto"
  }'
```

### Response

```json
{
  "swapTransaction": "<base64 serialized VersionedTransaction>",
  "lastValidBlockHeight": 123456789,
  "prioritizationFeeLamports": 5000
}
```

## Step 3 — Return in Action POST

```typescript
import { VersionedTransaction } from "@solana/web3.js";
import { createPostResponse } from "@solana/actions";

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

const { swapTransaction } = await swapRes.json();
const transaction = VersionedTransaction.deserialize(
  Buffer.from(swapTransaction, "base64")
);

const payload = await createPostResponse({
  fields: {
    transaction,
    message: `Swap ${inAmount} USDC → ~${quote.outAmount} SOL`,
  },
});
```

## TypeScript helper (copy into swap action)

```typescript
const JUPITER_BASE = "https://api.jup.ag";

async function jupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number;       // base units
  slippageBps: number;
}) {
  const url = new URL(`${JUPITER_BASE}/swap/v1/quote`);
  url.searchParams.set("inputMint", params.inputMint);
  url.searchParams.set("outputMint", params.outputMint);
  url.searchParams.set("amount", String(params.amount));
  url.searchParams.set("slippageBps", String(params.slippageBps));
  url.searchParams.set("swapMode", "ExactIn");

  const res = await fetch(url, {
    headers: { "x-api-key": process.env.JUPITER_API_KEY! },
  });
  if (!res.ok) throw `Jupiter quote failed: ${res.status}`;
  return res.json();
}

async function jupiterSwap(quote: unknown, userPublicKey: string) {
  const res = await fetch(`${JUPITER_BASE}/swap/v1/swap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.JUPITER_API_KEY!,
    },
    body: JSON.stringify({
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
    }),
  });
  if (!res.ok) throw `Jupiter swap failed: ${res.status}`;
  return res.json();
}
```

## Common mint pairs for Actions

| Pair | inputMint | outputMint |
|------|-----------|------------|
| USDC → SOL | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | `So11111111111111111111111111111111111111112` |
| SOL → USDC | `So11111111111111111111111111111111111111112` | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |

Hardcode mints per route — never from client input.

## Slippage allowlist (security)

```typescript
const ALLOWED_SLIPPAGE_BPS = new Set([50, 100, 300]);

function parseSlippage(raw: string | null): number {
  const bps = parseInt(raw ?? "50", 10);
  if (!ALLOWED_SLIPPAGE_BPS.has(bps)) throw "Invalid slippage";
  return bps;
}
```

Pass slippage via Action href query: `&slippageBps=50`

## Simulate before return

```typescript
const simulation = await connection.simulateTransaction(transaction);
if (simulation.value.err) {
  throw "Swap simulation failed — check USDC balance and ATA";
}
```

## Rate limits

- Quote + swap = 2 HTTP calls per user click
- Add POST rate limiting on your Action endpoint
- Jupiter API key tier controls Jupiter-side limits

## Swap API v2 (optional advanced)

Jupiter also offers unified v2 at `api.jup.ag/swap/v2`:
- `GET /order` — assembled tx with best price (managed landing)
- `GET /build` — raw instructions for composability

For standard blinks, **v1 quote + swap** is sufficient and widely documented.

See: https://dev.jup.ag/docs/changelog

# Skill: SOL Tip Jar & Transfer Action

Production pattern from official [transfer-sol](https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts).

Copy-paste template: [templates/transfer-sol-route.ts](../../templates/transfer-sol-route.ts)

## When to use

- Creator tip jar (fixed or preset amounts)
- Donation blinks on X / Discord
- Native SOL transfer from shareable link

## Real devnet test recipient (official example)

```
nick6zJc6HpW3kfBm4xS2dmbuVRyb5F3AnUvj5ymzR5
```

## Files

```
src/app/api/actions/transfer-sol/route.ts
src/app/api/actions/transfer-sol/const.ts
public/actions.json
public/solana_devs.jpg   # or your icon.png
.env.local
```

## const.ts

```typescript
import { PublicKey } from "@solana/web3.js";

export const DEFAULT_SOL_ADDRESS = new PublicKey(
  process.env.TREASURY_WALLET ?? "nick6zJc6HpW3kfBm4xS2dmbuVRyb5F3AnUvj5ymzR5"
);
export const DEFAULT_SOL_AMOUNT = 0.01;
```

## GET — linked actions with preset + custom amount

Official pattern uses **href query params**, not POST body.data:

```typescript
const baseHref = new URL(
  `/api/actions/transfer-sol?to=${toPubkey.toBase58()}`,
  requestUrl.origin,
).toString();

const payload: ActionGetResponse = {
  type: "action",
  title: "Tip Jar — Support This Project",
  icon: new URL("/icon.png", requestUrl.origin).toString(),
  description: "Send SOL to support open source work on Solana.",
  label: "Transfer", // ignored when links.actions present
  links: {
    actions: [
      { label: "Tip 0.01 SOL", href: `${baseHref}&amount=0.01` },
      { label: "Tip 0.1 SOL",  href: `${baseHref}&amount=0.1` },
      { label: "Tip 1 SOL",    href: `${baseHref}&amount=1` },
      {
        label: "Custom Tip",
        href: `${baseHref}&amount={amount}`,
        parameters: [
          {
            name: "amount",
            label: "SOL amount",
            required: true,
            type: "number",
            min: 0.001,
            max: 10,
          },
        ],
      },
    ],
  },
};
```

## POST — validate query + build tx

```typescript
function validatedQueryParams(requestUrl: URL) {
  let toPubkey = DEFAULT_SOL_ADDRESS;
  let amount = DEFAULT_SOL_AMOUNT;

  if (requestUrl.searchParams.get("to")) {
    toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
  }
  amount = parseFloat(requestUrl.searchParams.get("amount") ?? String(DEFAULT_SOL_AMOUNT));
  if (amount <= 0 || amount > 10) throw "amount out of range (0.001–10 SOL)";

  return { amount, toPubkey };
}

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const { amount, toPubkey } = validatedQueryParams(requestUrl);
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  const connection = new Connection(process.env.SOLANA_RPC ?? "https://api.devnet.solana.com");

  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
  const minimumBalance = await connection.getMinimumBalanceForRentExemption(0);
  if (lamports < minimumBalance) {
    throw `amount too small for rent exemption`;
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  }).add(
    SystemProgram.transfer({ fromPubkey: account, toPubkey, lamports })
  );

  const payload = await createPostResponse({
    fields: {
      transaction,
      message: `Send ${amount} SOL to ${toPubkey.toBase58().slice(0, 4)}...`,
    },
  });

  return Response.json(payload, { headers });
};
```

## actions.json

```json
{
  "rules": [
    {
      "pathPattern": "/tip",
      "apiPath": "https://yourdomain.com/api/actions/transfer-sol"
    },
    {
      "pathPattern": "/support",
      "apiPath": "https://yourdomain.com/api/actions/transfer-sol"
    }
  ]
}
```

## Real test commands

```bash
# GET metadata
curl -s "https://yourdomain.com/api/actions/transfer-sol" | jq

# OPTIONS CORS
curl -sI -X OPTIONS "https://yourdomain.com/api/actions/transfer-sol" | grep -i access-control

# POST (replace DEVNET_WALLET with funded devnet pubkey)
curl -sX POST "https://yourdomain.com/api/actions/transfer-sol?amount=0.01" \
  -H "Content-Type: application/json" \
  -d '{"account":"DEVNET_WALLET_PUBKEY"}' | jq '.transaction' | head -c 80
```

## Blinks Inspector

1. Open https://www.blinks.xyz/inspector
2. Paste: `https://yourdomain.com/api/actions/transfer-sol`
3. Test each linked button (0.01, 0.1, 1, custom)
4. Sign on devnet Phantom

## dial.to share link

```typescript
const actionUrl = "https://yourdomain.com/api/actions/transfer-sol";
const shareUrl = `https://dial.to/?action=${encodeURIComponent("solana-action:" + actionUrl)}`;
```

## Security rules

| Rule | Implementation |
|------|----------------|
| Recipient | `to` param only from trusted allowlist OR fixed env treasury |
| Amount | Server bounds 0.001–10 SOL |
| Signer | `body.account` === tx fee payer |
| Rent | `getMinimumBalanceForRentExemption` check |
| Rate limit | 30 POST/min per IP |

**Production tip:** Remove `?to=` override — hardcode treasury only:

```typescript
const toPubkey = new PublicKey(process.env.TREASURY_WALLET!);
// ignore client ?to= entirely
```

## Devnet airdrop

```bash
solana airdrop 2 YOUR_WALLET --url devnet
```

## Related

- SPL USDC tips → [spl-transfer.md](spl-transfer.md)
- SDK helpers → [reference/sdk-api.md](reference/sdk-api.md)
- Constants → [reference/constants.md](reference/constants.md)

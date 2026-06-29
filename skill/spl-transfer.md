# Skill: SPL Token Transfer Action (USDC Tips)

SPL token tips and payments via Solana Actions — USDC on mainnet/devnet.

Template: [templates/transfer-spl-route.ts](../../templates/transfer-spl-route.ts)

## When to use

- USDC tip jar (stable amount for creators)
- Token payment blinks
- USDC/USDG donations

## Real mint addresses

| Network | USDC Mint |
|---------|-----------|
| Mainnet | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Devnet | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |

Decimals: **6** (1 USDC = 1_000_000 base units)

## Dependencies

```bash
npm add @solana/actions @solana/web3.js @solana/spl-token
```

## GET response

```typescript
const baseHref = new URL(
  `/api/actions/transfer-usdc?to=${TREASURY.toBase58()}`,
  requestUrl.origin,
).toString();

const payload: ActionGetResponse = {
  type: "action",
  title: "USDC Tip Jar",
  icon: new URL("/icon.png", requestUrl.origin).toString(),
  description: "Send USDC to support this project.",
  label: "Send USDC",
  links: {
    actions: [
      { label: "Tip $1 USDC",  href: `${baseHref}&amount=1` },
      { label: "Tip $5 USDC",  href: `${baseHref}&amount=5` },
      { label: "Tip $10 USDC", href: `${baseHref}&amount=10` },
      {
        label: "Custom Amount",
        href: `${baseHref}&amount={amount}`,
        parameters: [
          {
            name: "amount",
            label: "USDC amount",
            type: "number",
            required: true,
            min: 0.01,
            max: 1000,
            pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
            patternDescription: "0.01 to 1000 USDC",
          },
        ],
      },
    ],
  },
};
```

## POST — build SPL transfer with ATA

```typescript
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const USDC_MINT = new PublicKey(
  process.env.USDC_MINT ?? "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"
);
const TREASURY = new PublicKey(process.env.TREASURY_WALLET!);

export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const usdcAmount = parseFloat(requestUrl.searchParams.get("amount") ?? "1");
  if (usdcAmount < 0.01 || usdcAmount > 1000) throw "amount out of range";

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);
  const connection = new Connection(process.env.SOLANA_RPC!);

  const baseUnits = Math.floor(usdcAmount * 1_000_000);

  const senderAta = getAssociatedTokenAddressSync(USDC_MINT, account, false, TOKEN_PROGRAM_ID);
  const treasuryAta = getAssociatedTokenAddressSync(USDC_MINT, TREASURY, false, TOKEN_PROGRAM_ID);

  // Verify sender has USDC ATA with balance
  const senderAccount = await connection.getTokenAccountBalance(senderAta).catch(() => null);
  if (!senderAccount || BigInt(senderAccount.value.amount) < BigInt(baseUnits)) {
    throw "Insufficient USDC balance";
  }

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction({ feePayer: account, blockhash, lastValidBlockHeight });

  // Create treasury ATA if missing (user pays rent — or sponsor separately)
  transaction.add(
    createAssociatedTokenAccountIdempotentInstruction(
      account,
      treasuryAta,
      TREASURY,
      USDC_MINT,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    ),
    createTransferInstruction(senderAta, treasuryAta, account, baseUnits, [], TOKEN_PROGRAM_ID)
  );

  const payload = await createPostResponse({
    fields: {
      transaction,
      message: `Send ${usdcAmount} USDC tip`,
    },
  });

  return Response.json(payload, { headers });
};
```

## Devnet USDC faucet

Devnet USDC: use SPL Token Faucet or deploy test mint.

```bash
# Check devnet USDC balance
spl-token balance 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU --url devnet
```

Or swap devnet SOL → USDC via Jupiter devnet if available.

## actions.json

```json
{
  "rules": [
    {
      "pathPattern": "/tip-usdc",
      "apiPath": "https://yourdomain.com/api/actions/transfer-usdc"
    }
  ]
}
```

## Real curl test

```bash
curl -sX POST "https://yourdomain.com/api/actions/transfer-usdc?amount=1" \
  -H "Content-Type: application/json" \
  -d '{"account":"YOUR_DEVNET_WALLET"}' | jq '.message'
```

## Security

- Hardcode `USDC_MINT` per network (mainnet vs devnet env)
- Hardcode `TREASURY_WALLET`
- Verify sender ATA balance server-side before building tx
- Bound amount 0.01–1000 USDC
- Never accept mint address from client

## Error messages users see

| Error | Cause |
|-------|-------|
| Insufficient USDC balance | No ATA or low balance |
| amount out of range | Server validation |
| Invalid account | Bad pubkey in POST body |

## Related

- SOL tips → [tip-jar.md](tip-jar.md)
- Constants → [reference/constants.md](reference/constants.md)

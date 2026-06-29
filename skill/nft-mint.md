# Skill: NFT Mint Blink (Metaplex)

NFT mint Actions using Metaplex Token Metadata or Core collections.

Metaplex docs: https://developers.metaplex.com/

## When to use

- Genesis collection mint from X blink
- Allowlist + public mint tiers via linked actions
- Event NFT claim links

## Programs (mainnet)

| Program | ID |
|---------|-----|
| Token Metadata | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s` |
| Metaplex Core | `CoREENxT6tW1HoK8eYdBEYJEsMYqKF896L6sLSpMp7Cx` |

## Dependencies

```bash
npm add @solana/actions @solana/web3.js @metaplex-foundation/mpl-core @metaplex-foundation/umi-bundle-defaults
```

Or for Candy Machine v3:
```bash
npm add @metaplex-foundation/mpl-candy-machine
```

## Env vars

```bash
COLLECTION_MINT=YourCollectionAddress
CANDY_MACHINE=YourCandyMachineAddress   # if using CM
MINT_PRICE_LAMPORTS=500000000            # 0.5 SOL
MAX_SUPPLY=1000
```

## GET — live supply from chain

```typescript
export const GET = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const connection = new Connection(process.env.SOLANA_RPC!);

  const candyMachine = new PublicKey(process.env.CANDY_MACHINE!);
  // Fetch on-chain CM account — use @metaplex-foundation/mpl-candy-machine SDK
  const { itemsAvailable, itemsRedeemed } = await fetchCandyMachineState(connection, candyMachine);
  const remaining = itemsAvailable - itemsRedeemed;
  const isLive = remaining > 0 && Date.now() < MINT_END_TIMESTAMP;

  const baseHref = new URL("/api/actions/mint", requestUrl.origin).toString();

  if (!isLive) {
    return Response.json({
      type: "action",
      icon: new URL("/collection.png", requestUrl.origin).toString(),
      title: "Genesis Mint",
      description: "Mint window closed.",
      label: "Mint Closed",
      disabled: true,
      error: { message: remaining === 0 ? "Sold out" : "Mint not live yet" },
    } satisfies ActionGetResponse, { headers });
  }

  return Response.json({
    type: "action",
    icon: new URL("/collection.png", requestUrl.origin).toString(),
    title: "Genesis Mint",
    description: `Mint Genesis NFT · 0.5 SOL · ${remaining}/${itemsAvailable} left`,
    label: "Mint",
    links: {
      actions: [
        { label: "Mint NFT", href: `${baseHref}?tier=public` },
        {
          label: "Allowlist Mint",
          href: `${baseHref}?tier=allowlist&proof={proof}`,
          parameters: [
            {
              name: "proof",
              label: "Allowlist proof (base58)",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  } satisfies ActionGetResponse, { headers });
};
```

## POST — build mint transaction

```typescript
export const POST = async (req: Request) => {
  const url = new URL(req.url);
  const tier = url.searchParams.get("tier") ?? "public";

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);
  const connection = new Connection(process.env.SOLANA_RPC!);

  // 1. Check not already minted (indexer or on-chain PDA)
  if (await hasAlreadyMinted(connection, account)) {
    throw "Wallet already minted";
  }

  // 2. Allowlist verification
  if (tier === "allowlist") {
    const proof = url.searchParams.get("proof") ?? body.data?.proof;
    if (!verifyMerkleProof(account, proof)) throw "Not on allowlist";
  }

  // 3. Build mint ix with Metaplex SDK (simplified)
  const mintKeypair = Keypair.generate();
  const instructions = await buildMetaplexMintInstructions({
    payer: account,
    candyMachine: new PublicKey(process.env.CANDY_MACHINE!),
    collectionMint: new PublicKey(process.env.COLLECTION_MINT!),
    newMint: mintKeypair.publicKey,
    priceLamports: Number(process.env.MINT_PRICE_LAMPORTS),
  });

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const transaction = new Transaction({ feePayer: account, blockhash, lastValidBlockHeight });
  instructions.forEach(ix => transaction.add(ix));

  // Candy machine mints often need CM partial signer
  transaction.partialSign(mintKeypair);

  const payload = await createPostResponse({
    fields: {
      transaction,
      message: `Mint Genesis NFT for ${Number(process.env.MINT_PRICE_LAMPORTS) / 1e9} SOL`,
    },
    signers: [mintKeypair],  // if SDK requires
  });

  return Response.json(payload, { headers });
};
```

## Metaplex Core (2024+ pattern)

For new collections, prefer **Metaplex Core** over legacy Candy Machine:

```typescript
import { create } from "@metaplex-foundation/mpl-core";
// See: https://developers.metaplex.com/core
```

Core simplifies asset model — one `createV1` instruction per mint.

## actions.json

```json
{
  "rules": [
    {
      "pathPattern": "/mint",
      "apiPath": "https://nft.project.com/api/actions/mint"
    }
  ]
}
```

## Real test flow (devnet)

1. Deploy CM or Core collection to devnet
2. Set env vars with devnet addresses
3. Inspector → GET shows live remaining count
4. POST → sign mint tx on devnet
5. Verify NFT in wallet via `spl-token accounts` or Phantom

## Security (critical for mints)

| Rule | Why |
|------|-----|
| Hardcode CM/collection addresses | Prevent mint to attacker's collection |
| Enforce 1 mint per wallet | Server + on-chain guard |
| Verify allowlist server-side | Client proof can be forged |
| Check supply on-chain in POST | Not just GET metadata |
| Simulate before return | Catch insufficient SOL |
| Rate limit POST | Prevent CM spam |

## Disabled states

Return GET with `disabled: true` when:
- Sold out (`itemsRedeemed >= itemsAvailable`)
- Before start timestamp
- After end timestamp
- Paused by admin flag

## Related

- Program deployment → solana-dev-skill
- Constants → [reference/constants.md](reference/constants.md)

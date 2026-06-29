# Solana Actions — Real Constants & Addresses

Verified on-chain identifiers for Action handlers. **Never accept these from client POST body** — hardcode or load from env.

## RPC endpoints

| Network | URL | Notes |
|---------|-----|-------|
| Devnet (public) | `https://api.devnet.solana.com` | Rate limited; OK for local dev |
| Devnet (Helius) | `https://devnet.helius-rpc.com/?api-key=YOUR_KEY` | Recommended for Actions |
| Mainnet (Helius) | `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY` | Required at viral blink scale |
| Mainnet (public) | `https://api.mainnet-beta.solana.com` | Avoid for production Actions |

Env var: `SOLANA_RPC` (official solana-actions examples use this name)

## Native SOL

| Constant | Value |
|----------|-------|
| Wrapped SOL mint | `So11111111111111111111111111111111111111112` |
| Lamports per SOL | `1_000_000_000` |
| System Program | `11111111111111111111111111111111` |

## SPL tokens (mainnet)

| Token | Mint |
|-------|------|
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| USDT | `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` |
| USDG | `2u1tszSeqZ3qBWF3uNGPFc8yHpir3HMTCb1Q7XJTrApy` |

## SPL tokens (devnet)

| Token | Mint |
|-------|------|
| USDC (devnet) | `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |

## Programs

| Program | ID |
|---------|-----|
| SPL Token | `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA` |
| Token-2022 | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Associated Token Account | `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL` |
| Metaplex Token Metadata | `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s` |
| Metaplex Core | `CoREENxT6tW1HoK8eYdBEYJEsMYqKF896L6sLSpMp7Cx` |
| SPL Governance (Realms) | `GovER5Lthms3bLBxW7e2YvWfW2PpNq8` |

> Confirm at https://app.realms.today/ or SPL Governance source

## Official solana-actions devnet example wallet

From [transfer-sol/const.ts](https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/const.ts):

```
nick6zJc6HpW3kfBm4xS2dmbuVRyb5F3AnUvj5ymzR5
```

Default example amount: `1.0` SOL

Use as devnet `to` recipient when testing official transfer pattern.

## Jupiter API (2026)

| Item | Value |
|------|-------|
| Base URL | `https://api.jup.ag` |
| Quote | `GET /swap/v1/quote` |
| Swap tx | `POST /swap/v1/swap` |
| API key header | `x-api-key: YOUR_KEY` |
| Key portal | https://portal.jup.ag |
| Docs | https://station.jup.ag/docs |

Deprecated (do not use in new code):
- `lite-api.jup.ag` (migrating to `api.jup.ag`)
- `quote-api.jup.ag/v6`

## Blinks tooling (live URLs)

| Tool | URL |
|------|-----|
| Blinks Inspector | https://www.blinks.xyz/inspector |
| dial.to interstitial | https://dial.to |
| Dialect registry | https://dial.to/register |
| Awesome Blinks | https://github.com/solana-developers/awesome-blinks |

## Package versions (pin in production)

```json
{
  "@solana/actions": "^1.6.6",
  "@solana/web3.js": "^1.98.0",
  "@solana/spl-token": "^0.4.9"
}
```

Install:
```bash
npm add @solana/actions @solana/web3.js @solana/spl-token
```

## .env.example (copy to .env.local)

```bash
# RPC — official examples use SOLANA_RPC
SOLANA_RPC=https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY

# Tip / transfer recipient (your treasury wallet)
TREASURY_WALLET=YourBase58PubkeyHere

# Site origin for icon URLs and actions.json apiPath
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Jupiter (swap actions only)
JUPITER_API_KEY=your_key_from_portal.jup.ag

# Metaplex / mint (mint actions only)
COLLECTION_MINT=YourCollectionMintPubkey
CANDY_MACHINE=YourCandyMachinePubkey

# Realms (vote actions only)
REALMS_GOVERNANCE=YourGovernancePubkey
PROPOSAL_ID=YourProposalPubkey
```

## Amount conversion

```typescript
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

// USDC has 6 decimals
const usdcBaseUnits = Math.floor(usdcAmount * 1_000_000);
```

## Rent exemption check (required for SOL transfers)

From official transfer-sol — always verify recipient won't be below rent minimum:

```typescript
const minimumBalance = await connection.getMinimumBalanceForRentExemption(0);
if (lamports < minimumBalance) {
  throw `account may not be rent exempt: ${recipient.toBase58()}`;
}
```

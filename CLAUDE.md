# Solana Actions & Blinks Development

You have the **solana-actions-blinks** skill with **real working templates** and **live API integrations**.

## Skill modules (read ONE per task)

| Task | File |
|------|------|
| SOL tip | `skill/tip-jar.md` |
| USDC tip | `skill/spl-transfer.md` |
| Jupiter swap | `skill/jupiter-swap.md` |
| NFT mint | `skill/nft-mint.md` |
| DAO vote | `skill/governance-vote.md` |
| Sign-in | `skill/message-sign.md` |

## Templates (copy-paste)

- `templates/transfer-sol-route.ts` — official solana-actions pattern
- `templates/jupiter-swap-route.ts` — api.jup.ag/swap/v1
- `templates/actions.json` — domain mapping
- `templates/env.example` — SOLANA_RPC, JUPITER_API_KEY

## SDK (always use)

```typescript
import { createActionHeaders, createPostResponse } from "@solana/actions";
const headers = createActionHeaders();
```

## Commands

/build-tip-action · /build-swap-action · /build-mint-action · /build-vote-action · /test-blink · /register-dialect

## Agents

**actions-architect** (design) · **blink-engineer** (implement)

## Test

https://www.blinks.xyz/inspector

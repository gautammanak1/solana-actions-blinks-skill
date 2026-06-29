# /build-tip-action — Build SOL Tip Jar Action

Scaffold production SOL tip Action using official solana-actions transfer pattern.

## Usage

```
/build-tip-action [--treasury PUBKEY] [--network devnet|mainnet]
```

## Procedure

1. Read [skill/tip-jar.md](../skill/tip-jar.md)
2. Copy templates:
   - `templates/transfer-sol-route.ts` → `src/app/api/actions/transfer-sol/route.ts`
   - `templates/transfer-sol-const.ts` → `src/app/api/actions/transfer-sol/const.ts`
3. Copy `templates/env.example` → `.env.local` — set `TREASURY_WALLET`, `SOLANA_RPC`
4. Merge `templates/actions.json` tip rule into `public/actions.json`
5. Add icon at `public/icon.png`

## Required SDK calls

- `createActionHeaders()` — NOT manual CORS
- `createPostResponse({ fields: { transaction, message } })`
- `validatedQueryParams()` — amount from URL query

## Real devnet test

```bash
solana airdrop 2 YOUR_WALLET --url devnet
curl -s "http://localhost:3000/api/actions/transfer-sol" | jq '.links.actions[].label'
```

Inspector: https://www.blinks.xyz/inspector

## Deliverable

- Working route.ts + const.ts
- dial.to URL
- Inspector test report (GET/POST pass)

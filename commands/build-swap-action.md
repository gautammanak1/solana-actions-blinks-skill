# /build-swap-action — Build Jupiter Swap Blink

Scaffold USDC→SOL swap Action with live Jupiter API v1.

## Usage

```
/build-swap-action [--pair usdc-sol|sol-usdc]
```

## Procedure

1. Read [skill/jupiter-swap.md](../skill/jupiter-swap.md) + [skill/reference/jupiter-api.md](../skill/reference/jupiter-api.md)
2. Copy `templates/jupiter-swap-route.ts` → `src/app/api/actions/swap/usdc-to-sol/route.ts`
3. Set env: `JUPITER_API_KEY` from https://portal.jup.ag, `SOLANA_RPC`
4. Test Jupiter directly:

```bash
curl -sG "https://api.jup.ag/swap/v1/quote" \
  -H "x-api-key: $JUPITER_API_KEY" \
  --data-urlencode "inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" \
  --data-urlencode "outputMint=So11111111111111111111111111111111111111112" \
  --data-urlencode "amount=1000000" \
  --data-urlencode "slippageBps=50" | jq '.outAmount'
```

5. Merge swap rule into `public/actions.json`
6. Simulate tx in POST before return

## Security (mandatory)

- Slippage allowlist: 50, 100, 300 bps
- Amount bounds: 1–10000 USDC
- Hardcoded mints only
- Never expose JUPITER_API_KEY client-side

## Deliverable

- Working swap route
- curl quote test output
- Inspector POST with mainnet wallet (small amount)

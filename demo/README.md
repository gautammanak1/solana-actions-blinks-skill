# Live Devnet Demo

Deployable Next.js app with a working SOL tip jar Action on **devnet**.

## Deploy (Vercel)

```bash
cd demo
npm install
npx vercel --prod
```

Set env on Vercel (optional):
```
SOLANA_RPC=https://api.devnet.solana.com
TREASURY_WALLET=nick6zJc6HpW3kfBm4xS2dmbuVRyb5F3AnUvj5ymzR5
```

After deploy, update `public/actions.json` with your Vercel domain.

## Test

1. **GET** — `curl -s https://YOUR_DOMAIN/api/actions/transfer-sol | jq`
2. **Inspector** — https://www.blinks.xyz/inspector → paste Action URL
3. **dial.to** — `https://dial.to/?action=solana-action%3Ahttps%3A%2F%2FYOUR_DOMAIN%2Fapi%2Factions%2Ftransfer-sol`

## Local

```bash
npm install && npm run dev
# http://localhost:3000/api/actions/transfer-sol
```

Use Cloudflare tunnel for HTTPS local testing with Inspector.

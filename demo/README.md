# Live Devnet Demo

Deployable Next.js app with a working SOL tip jar Action on **devnet** and an embedded `@dialectlabs/blinks` preview UI.

**Production:** https://solana-actions-blinks-demo-nine.vercel.app

## GitHub → Vercel (auto-deploy)

This repo is connected to Vercel. Settings:

| Setting | Value |
|---------|--------|
| Project | `solana-actions-blinks-demo` |
| Root Directory | `demo` |
| Branch | `main` → production |

Push to `main` and Vercel builds + deploys automatically. Check status in the [Vercel dashboard](https://vercel.com/selfselectionboard/solana-actions-blinks-demo).

### First-time setup (already done for this repo)

```bash
cd demo
npx vercel git connect https://github.com/YOUR_USER/solana-actions-blinks-skill.git
# Set Root Directory to `demo` in Vercel project settings (or via API)
```

## Manual deploy (optional)

```bash
cd demo
npm install
npx vercel --prod
```

Env on Vercel (optional):

```
SOLANA_RPC=https://api.devnet.solana.com
TREASURY_WALLET=nick6zJc6HpW3kfBm4xS2dmbuVRyb5F3AnUvj5ymzR5
```

## Test

1. **Embedded blink** — open `/` on the deployment, connect Phantom on **devnet**, tip.
2. **GET** — `curl -s https://solana-actions-blinks-demo-nine.vercel.app/api/actions/transfer-sol | jq`
3. **actions.json** — `curl -s https://solana-actions-blinks-demo-nine.vercel.app/actions.json | jq`

## Local

```bash
npm install && npm run dev
# http://localhost:3000
```

`actions.json` is served from `src/app/actions.json/route.ts`.

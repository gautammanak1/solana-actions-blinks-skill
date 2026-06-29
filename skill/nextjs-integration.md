# Next.js & Express Integration

Reference implementation: [solana-actions examples](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

## Next.js 15 App Router (recommended)

### Install

```bash
npm add @solana/actions @solana/web3.js
# or @solana/kit for greenfield tx building
```

### Route handler template

`src/app/api/actions/tip/route.ts`:

```typescript
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

export const dynamic = "force-dynamic";

const connection = new Connection(
  process.env.RPC_URL ?? "https://api.devnet.solana.com"
);
const TREASURY = new PublicKey(process.env.TREASURY!);
const TIP_LAMPORTS = 10_000_000; // 0.01 SOL — fixed amount safest for v1

export async function GET() {
  const payload: ActionGetResponse = {
    icon: new URL("/icon.png", process.env.NEXT_PUBLIC_SITE_URL!).toString(),
    title: "My Project Tip Jar",
    description: "Send a small SOL tip to support development.",
    label: "Tip 0.01 SOL",
  };
  return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(req: Request) {
  try {
    const body: ActionPostRequest = await req.json();
    const user = new PublicKey(body.account);

    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction({
      feePayer: user,
      recentBlockhash: blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: user,
        toPubkey: TREASURY,
        lamports: TIP_LAMPORTS,
      })
    );

    const payload: ActionPostResponse = {
      type: "transaction",
      transaction: tx
        .serialize({ requireAllSignatures: false, verifySignatures: false })
        .toString("base64"),
      message: `Tip 0.01 SOL to My Project`,
    };

    return Response.json(payload, { headers: ACTIONS_CORS_HEADERS });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to build transaction";
    return Response.json({ message }, { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
}
```

### Environment (.env.local)

```bash
RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
TREASURY=YourWalletPubkeyBase58
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### public/actions.json

```json
{
  "rules": [
    {
      "pathPattern": "/tip",
      "apiPath": "https://yourdomain.com/api/actions/tip"
    }
  ]
}
```

### public/icon.png

- PNG, SVG, or WebP
- Absolute URL in GET response
- Square icon works best in blink UI

## Deploy (Vercel)

1. Set env vars in Vercel dashboard
2. Deploy — routes at `https://yourdomain.com/api/actions/tip`
3. Confirm `https://yourdomain.com/actions.json` accessible
4. Test with [Blinks Inspector](https://www.blinks.xyz/inspector)

Vercel automatically handles HTTPS.

## Local dev with Inspector

Wallets and Inspector need public HTTPS:

```bash
# Terminal 1
npm run dev

# Terminal 2 — Cloudflare tunnel (or ngrok)
cloudflared tunnel --url http://localhost:3000
```

Use tunnel URL in Inspector: `https://xxx.trycloudflare.com/api/actions/tip`

Update icon URLs to tunnel origin for local testing.

## Express alternative

```typescript
import express from "express";
import cors from "cors";
import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostResponse } from "@solana/actions";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const app = express();
app.use(express.json());

const corsHeaders = ACTIONS_CORS_HEADERS as Record<string, string>;
app.use(cors({ origin: "*", methods: ["GET", "POST", "OPTIONS"] }));

const connection = new Connection(process.env.RPC_URL!);

app.options("/actions/tip", (_req, res) => res.set(corsHeaders).sendStatus(204));

app.get("/actions/tip", (_req, res) => {
  const payload: ActionGetResponse = {
    icon: "https://api.myapp.com/icon.png",
    title: "Tip Jar",
    description: "Support the project.",
    label: "Tip 0.01 SOL",
  };
  res.set(corsHeaders).json(payload);
});

app.post("/actions/tip", async (req, res) => {
  try {
    const user = new PublicKey(req.body.account);
    const { blockhash } = await connection.getLatestBlockhash();
    const tx = new Transaction({ feePayer: user, recentBlockhash: blockhash }).add(
      SystemProgram.transfer({
        fromPubkey: user,
        toPubkey: new PublicKey(process.env.TREASURY!),
        lamports: 10_000_000,
      })
    );
    const payload: ActionPostResponse = {
      type: "transaction",
      transaction: tx.serialize({ requireAllSignatures: false }).toString("base64"),
    };
    res.set(corsHeaders).json(payload);
  } catch (e) {
    res.status(400).set(corsHeaders).json({ message: "Invalid request" });
  }
});

// actions.json at root
app.get("/actions.json", (_req, res) => {
  res.set(corsHeaders).json({
    rules: [{ pathPattern: "/tip", apiPath: "https://api.myapp.com/actions/tip" }],
  });
});

app.listen(3000);
```

## Multi-route organization

```
src/app/api/actions/
├── tip/route.ts
├── mint/route.ts
└── vote/
    ├── yes/route.ts
    └── no/route.ts
```

Each route = independent Action API with own GET/POST/OPTIONS.

Shared helpers:

`src/lib/actions/cors.ts`:
```typescript
export { ACTIONS_CORS_HEADERS } from "@solana/actions";
```

`src/lib/actions/validate.ts`:
```typescript
export { parseAccount, parseAmount } from "./validators";
```

## Using @solana/kit (2026 greenfield)

When building new handlers without legacy web3.js:

```typescript
// Use @solana/kit transaction message builders
// Serialize to wire format → base64 for ActionPostResponse.transaction
```

Prefer kit for new code; reference official examples still use web3.js — both valid.

## Edge runtime note

Solana `@solana/web3.js` works on Node runtime. For Edge:
- Prefer calling internal Node API route
- Or use lightweight kit types if compatible with your deploy target

Default: `export const runtime = "nodejs"` on Action routes if you hit Edge compatibility issues.

## Deliverable template for agents

When user asks to implement, deliver:

1. `route.ts` with GET, POST, OPTIONS
2. `actions.json` entry
3. `.env.example`
4. Blink test URL for dial.to
5. Inspector test steps

See [examples/tip-jar.md](examples/tip-jar.md) for complete walkthrough.

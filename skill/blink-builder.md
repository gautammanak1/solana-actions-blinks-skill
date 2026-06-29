# Build Action Endpoints & Blink URLs

## Architecture

Every Action is a **stateless HTTP endpoint** (or set of endpoints) that:
1. Describes itself via GET
2. Builds a transaction for a specific user via POST
3. Answers CORS preflight via OPTIONS

Deploy behind HTTPS. For local dev, use ngrok/Cloudflare tunnel so wallets and Inspector can reach you.

## Single-action endpoint (simplest)

One URL handles GET + POST. User sees one button.

### GET response shape

```json
{
  "type": "action",
  "icon": "https://yourdomain.com/icon.png",
  "title": "Tip Jar",
  "description": "Send SOL to support this project.",
  "label": "Send Tip"
}
```

### POST flow

1. Parse `account` from body (user wallet)
2. Parse optional `data` fields (amount, etc.)
3. Validate server-side (amount bounds, recipient, program state)
4. Build unsigned `VersionedTransaction`
5. Return `{ "type": "transaction", "transaction": "<base64>" }`

## Multi-action endpoint (linked actions)

Use when user picks among options (vote yes/no, tier selection).

### GET with links.actions

```json
{
  "icon": "https://dao.example.com/icon.svg",
  "title": "DAO Proposal #42",
  "description": "Vote on treasury allocation.",
  "label": "Vote",
  "links": {
    "actions": [
      {
        "type": "action",
        "label": "Vote Yes",
        "href": "https://api.dao.example.com/vote/42/yes"
      },
      {
        "type": "action",
        "label": "Vote No",
        "href": "https://api.dao.example.com/vote/42/no"
      }
    ]
  }
}
```

**Important**: when `links.actions` exists, clients render **only** those buttons — not the root `label`.

Each `href` is its own Action endpoint with its own GET/POST/OPTIONS.

## Parameterized actions (user input)

Add `parameters` to a LinkedAction (or root action when no links):

```json
{
  "label": "Send Tip",
  "href": "https://api.example.com/tip",
  "parameters": [
    {
      "name": "amount",
      "label": "Amount (SOL)",
      "type": "number",
      "required": true,
      "min": 0.001,
      "max": 10,
      "pattern": "^[0-9]+(\\.[0-9]{1,9})?$",
      "patternDescription": "Enter SOL amount between 0.001 and 10"
    }
  ]
}
```

POST body:
```json
{
  "account": "UserWalletPubkeyBase58...",
  "data": { "amount": "0.5" }
}
```

Always parse `data.amount` as string or number and validate on server.

## Disabled / expired actions

```json
{
  "icon": "https://dao.example.com/icon.svg",
  "title": "Proposal #42",
  "description": "Voting closed on June 1, 2026.",
  "label": "Vote Closed",
  "disabled": true,
  "error": { "message": "This proposal is no longer accepting votes." }
}
```

Return HTTP 200 with disabled metadata — not HTTP 404.

## Blink URL construction

### Method 1 — dial.to (recommended for testing/sharing)

```
https://dial.to/?action=solana-action:<url-encoded-action-url>
```

Example (tip endpoint `https://api.myapp.com/actions/tip`):
```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fapi.myapp.com%2Factions%2Ftip
```

### Method 2 — solana-action: direct link

```
solana-action:https://api.myapp.com/actions/tip
```

Works in Action-aware wallets/clients. No fallback website preview in non-supporting clients.

### Method 3 — actions.json mapped site URL

User shares: `https://myapp.com/tip`  
Client reads `https://myapp.com/actions.json` → resolves to Action API URL.

Best for **marketing pages** that should work as normal links too.

## Building transactions in POST handler

### With @solana/kit (preferred)

```typescript
import { pipe, createTransactionMessage, setTransactionMessageFeePayer } from "@solana/kit";
import { address } from "@solana/addresses";

// 1. Validate account pubkey
// 2. Build instructions (transfer, mint, swap, etc.)
// 3. Serialize to base64 for ActionPostResponse
```

### With @solana/actions SDK (required — official pattern)

```typescript
import {
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  createPostResponse,
  ActionError,
} from "@solana/actions";
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";

const headers = createActionHeaders();

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const payload: ActionGetResponse = { /* ... */ };
  return Response.json(payload, { headers });
}

export async function OPTIONS() {
  return Response.json(null, { headers });
}

export async function POST(req: Request) {
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);
  const connection = new Connection(process.env.SOLANA_RPC!);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction({ feePayer: account, blockhash, lastValidBlockHeight })
    .add(SystemProgram.transfer({ fromPubkey: account, toPubkey: TREASURY, lamports }));

  const payload = await createPostResponse({
    fields: { transaction, message: "Preview text" },
  });
  return Response.json(payload, { headers });
}
```

Full working file: [templates/transfer-sol-route.ts](../../templates/transfer-sol-route.ts)

## Message signing actions

For auth or off-chain commitments:

```json
{
  "type": "message",
  "message": "Sign to prove ownership of wallet for MyApp",
  "links": {
    "next": {
      "type": "action",
      "label": "Continue",
      "href": "https://api.myapp.com/actions/step-2"
    }
  }
}
```

Verify signature server-side before executing step 2 POST.

## File layout (Next.js)

```
src/app/api/actions/tip/route.ts       # GET, POST, OPTIONS
public/actions.json                     # domain mapping
public/icon.png                         # action icon (HTTPS served)
```

## Environment variables

```bash
RPC_URL=https://devnet.helius-rpc.com/?api-key=...
TREASURY=<recipient pubkey>
ACTION_BASE_URL=https://api.myapp.com  # for absolute hrefs in linked actions
```

## Pre-ship checklist

- [ ] Icon hosted on same domain or trusted CDN (HTTPS)
- [ ] All hrefs absolute HTTPS
- [ ] OPTIONS tested (Inspector shows green CORS)
- [ ] POST tested with real devnet wallet
- [ ] Edge cases: disabled, invalid input, wrong account
- [ ] Rate limit on POST (see callback-security.md)

See [nextjs-integration.md](nextjs-integration.md) for full App Router setup.

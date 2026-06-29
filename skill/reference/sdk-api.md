# @solana/actions SDK — Real API Reference

Package: https://www.npmjs.com/package/@solana/actions  
Typedocs: https://solana-developers.github.io/solana-actions/  
Source: https://github.com/solana-developers/solana-actions

## Install

```bash
npm add @solana/actions @solana/web3.js
```

## Core exports (use these — not hand-rolled CORS)

### `createActionHeaders()`

Returns spec-compliant CORS headers for GET, POST, OPTIONS.

```typescript
import { createActionHeaders } from "@solana/actions";

const headers = createActionHeaders();

export const GET = async () => Response.json(payload, { headers });
export const OPTIONS = async () => Response.json(null, { headers });
export const POST = async (req: Request) => Response.json(payload, { headers });
```

Replaces older `ACTIONS_CORS_HEADERS` constant — **prefer `createActionHeaders()`**.

### `createPostResponse()`

Builds valid `ActionPostResponse` from a Transaction or VersionedTransaction.

```typescript
import { createPostResponse } from "@solana/actions";
import { Transaction } from "@solana/web3.js";

const payload = await createPostResponse({
  fields: {
    transaction,           // Transaction | VersionedTransaction
    message: `Send 1 SOL to ${recipient}`,  // optional preview text
  },
  // signers: [],  // optional additional signers
});

return Response.json(payload, { headers });
```

Handles base64 serialization correctly — **always use this instead of manual `.serialize().toString("base64")`**.

### Types

```typescript
import type {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ActionError,
  LinkedAction,
} from "@solana/actions";
```

### `ActionPostRequest` (POST body from wallet client)

```typescript
interface ActionPostRequest {
  account: string;  // base58 signer pubkey — REQUIRED
  data?: Record<string, string | number | boolean | string[]>;
}
```

> Official solana-actions **transfer-sol** example passes `amount` via **URL query params** in the Action href, not `body.data`. Both patterns exist — see [tip-jar.md](../tip-jar.md).

### `ActionError`

```typescript
interface ActionError {
  message: string;
}

// Return on failure:
return Response.json(
  { message: "Invalid account" } satisfies ActionError,
  { status: 400, headers }
);
```

## Blink URL helpers

### Encode Action URL for dial.to

```typescript
function buildDialToUrl(actionHttpsUrl: string): string {
  const actionProtocol = `solana-action:${actionHttpsUrl}`;
  return `https://dial.to/?action=${encodeURIComponent(actionProtocol)}`;
}

// Example output:
// https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fapi.example.com%2Fapi%2Factions%2Ftip
```

### Direct solana-action link

```
solana-action:https://api.example.com/api/actions/tip
```

## Linked actions with query params (official pattern)

Official [transfer-sol](https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts) pattern:

```typescript
const baseHref = new URL(
  `/api/actions/transfer-sol?to=${toPubkey.toBase58()}`,
  requestUrl.origin,
).toString();

links: {
  actions: [
    { label: "Send 1 SOL", href: `${baseHref}&amount=1` },
    { label: "Send 5 SOL", href: `${baseHref}&amount=5` },
    {
      label: "Send SOL",
      href: `${baseHref}&amount={amount}`,
      parameters: [
        { name: "amount", label: "Enter SOL amount", required: true },
      ],
    },
  ],
}
```

POST reads params from URL:

```typescript
export const POST = async (req: Request) => {
  const requestUrl = new URL(req.url);
  const amount = parseFloat(requestUrl.searchParams.get("amount")!);
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);
  // build tx with amount + account...
};
```

## Minimal route handler skeleton

```typescript
import {
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  createPostResponse,
  ActionError,
} from "@solana/actions";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";

const headers = createActionHeaders();

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const payload: ActionGetResponse = {
      type: "action",
      title: "My Action",
      icon: new URL("/icon.png", requestUrl.origin).toString(),
      description: "Description here",
      label: "Do Action",
    };
    return Response.json(payload, { headers });
  } catch (err) {
    const message = typeof err === "string" ? err : "Unknown error";
    return Response.json({ message } satisfies ActionError, { status: 400, headers });
  }
};

export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const body: ActionPostRequest = await req.json();
    const account = new PublicKey(body.account);
    const connection = new Connection(process.env.SOLANA_RPC!);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    const transaction = new Transaction({ feePayer: account, blockhash, lastValidBlockHeight })
      .add(/* instructions */);

    const payload = await createPostResponse({
      fields: { transaction, message: "Preview text" },
    });
    return Response.json(payload, { headers });
  } catch (err) {
    const message = typeof err === "string" ? err : "Unknown error";
    return Response.json({ message } satisfies ActionError, { status: 400, headers });
  }
};
```

## Next.js App Router requirements

```typescript
export const dynamic = "force-dynamic";  // prevent stale blockhash cache
export const runtime = "nodejs";         // if web3.js compatibility issues on Edge
```

## Versioned transactions

```typescript
import { VersionedTransaction, TransactionMessage } from "@solana/web3.js";

const transaction = new VersionedTransaction(
  new TransactionMessage({
    payerKey: account,
    recentBlockhash: blockhash,
    instructions: [transferInstruction],
  }).compileToV0Message()
);

const payload = await createPostResponse({ fields: { transaction } });
```

Use v0 for Jupiter swaps and complex routes.

## QR codes (optional)

```typescript
import { encodeURL } from "@solana/actions";
// For Solana Pay QR — different from blinks but same SDK package
```

## SDK vs spec package

| Package | Purpose |
|---------|---------|
| `@solana/actions` | Runtime SDK — headers, createPostResponse, helpers |
| `@solana/actions-spec` | TypeScript types only — for strict typing without runtime |

Most projects only need `@solana/actions`.

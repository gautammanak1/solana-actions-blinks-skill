# Skill: Message Signing Actions

Sign-in and off-chain authorization via Solana Actions `type: "message"` responses.

Spec: [actions-spec.md](actions-spec.md) → Message Signing section

## When to use

- "Sign in with Solana" before executing main action
- Proof of wallet ownership for allowlist
- Multi-step action chains (auth → mint → claim)

## Flow

```
Step 1 POST → returns type: "message" + links.next
User signs message in wallet
Step 2 POST → verify signature server-side → return transaction
```

## Step 1 — Return signable message

```typescript
import { nanoid } from "nanoid"; // npm add nanoid

export const POST = async (req: Request) => {
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  const nonce = nanoid(8);
  const issued = new Date().toISOString();

  // Store nonce in Redis/DB with 5min TTL keyed to account
  await storeNonce(account.toBase58(), nonce);

  const message = [
    "Sign in to MyApp",
    `Domain: ${process.env.NEXT_PUBLIC_SITE_URL}`,
    `Wallet: ${account.toBase58()}`,
    `Nonce: ${nonce}`,
    `Issued: ${issued}`,
  ].join("\n");

  const baseHref = new URL("/api/actions/mint", new URL(req.url).origin).toString();

  return Response.json({
    type: "message",
    message,
    links: {
      next: {
        type: "action",
        label: "Continue to Mint",
        href: `${baseHref}?nonce=${nonce}`,
      },
    },
  }, { headers });
};
```

## Step 2 — Verify signature + execute

After user signs message, blink client calls `links.next` href.

```typescript
import nacl from "tweetnacl";
import bs58 from "bs58";

function verifySignInMessage(
  message: string,
  signature: string,
  publicKey: PublicKey
): boolean {
  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = bs58.decode(signature);
  const publicKeyBytes = publicKey.toBytes();
  return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
}

export const POST = async (req: Request) => {
  const url = new URL(req.url);
  const nonce = url.searchParams.get("nonce");
  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  // Validate nonce from store
  const stored = await getNonce(account.toBase58());
  if (!stored || stored !== nonce) throw "Invalid or expired nonce";
  await deleteNonce(account.toBase58());

  // If client sends signature in body.data (custom flow)
  if (body.data?.signature) {
    const expectedMessage = reconstructMessage(account, nonce!);
    if (!verifySignInMessage(expectedMessage, String(body.data.signature), account)) {
      throw "Invalid signature";
    }
  }

  // Build main action transaction (mint, claim, etc.)
  const transaction = await buildProtectedTransaction(account);
  const payload = await createPostResponse({ fields: { transaction } });
  return Response.json(payload, { headers });
};
```

## Message format requirements

Include in every sign-in message:
- App name
- Domain (anti-phishing)
- Wallet pubkey
- Nonce (replay prevention)
- Timestamp / expiry

```
Sign in to MyApp
Domain: https://myapp.com
Wallet: 7xKX...
Nonce: a8f3b2c1
Issued: 2026-06-30T12:00:00.000Z
Expires: 2026-06-30T12:05:00.000Z
```

## Nonce store (Redis example)

```typescript
// Upstash Redis
await redis.set(`nonce:${wallet}`, nonce, { ex: 300 }); // 5 min TTL
```

## GET for sign-in action

```typescript
return Response.json({
  type: "action",
  icon: new URL("/icon.png", requestUrl.origin).toString(),
  title: "MyApp Sign In",
  description: "Sign a message to verify wallet ownership.",
  label: "Sign In",
} satisfies ActionGetResponse, { headers });
```

## Security

| Rule | Why |
|------|-----|
| Nonce single-use | Prevent replay |
| 5 min expiry | Limit attack window |
| Domain in message | User sees what they're signing |
| Verify before tx | Don't skip signature check on step 2 |
| HTTPS only | Spec requirement |

## Dependencies

```bash
npm add tweetnacl bs58 nanoid
```

(`@solana/actions` already includes tweetnacl + bs58)

## Related

- Action chaining spec → [actions-spec.md](actions-spec.md)
- Security → [callback-security.md](callback-security.md)

# Action Security & Callback Safety

Actions are **public HTTP endpoints**. Anyone can call GET and POST. Security is server-side validation — never trust the blink client or POST body alone.

## Threat model

| Threat | Mitigation |
|--------|------------|
| Wrong recipient in tip/mint | Hardcode recipient/program IDs server-side; never accept from client |
| Inflated transfer amounts | Validate min/max; use fixed amounts or server-side presets |
| Fake account pubkey | Validate base58 + on-curve; must match tx fee payer |
| Replay POST requests | Short-lived blockhash; idempotency keys; optional nonce DB |
| Vote/mint after deadline | Check on-chain + DB state; return `disabled: true` on GET |
| CORS bypass / CSRF-like abuse | Rate limit POST; monitor anomalous volume |
| Malicious linked href | Only emit hrefs you control; validate path allowlist |
| Icon/title phishing | Register with Dialect; use recognizable brand assets |

## Signer validation

POST body always includes `account` (user wallet). This pubkey must be the **fee payer** and **signer** of the returned transaction.

```typescript
import { PublicKey } from "@solana/web3.js";

function parseAccount(raw: unknown): PublicKey {
  if (typeof raw !== "string") throw new ActionError("Missing account");
  try {
    const pk = new PublicKey(raw);
    if (!PublicKey.isOnCurve(pk.toBytes())) throw new Error("off curve");
    return pk;
  } catch {
    throw new ActionError("Invalid account pubkey");
  }
}

// In POST handler:
const user = parseAccount(body.account);
const tx = buildTx(user);
if (!tx.feePayer?.equals(user)) {
  throw new ActionError("Fee payer mismatch");
}
```

Never build a transaction that drains user wallet to an attacker-controlled address from client `data`.

## Input sanitization

```typescript
function parseTipAmount(data: Record<string, unknown> | undefined): number {
  const raw = data?.amount;
  const num = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  if (!Number.isFinite(num) || num < 0.001 || num > 10) {
    throw new ActionError("Amount must be between 0.001 and 10 SOL");
  }
  return Math.floor(num * 1e9); // lamports, avoid float on chain
}
```

Rules:
- Validate type, range, regex **server-side** (mirror client `pattern` but don't rely on it)
- Reject unknown `data` keys
- For select/radio/checkbox — allowlist valid option values
- Sanitize strings (max length, no control chars)

## Hardcode sensitive addresses

```typescript
// GOOD — recipient from env
const TREASURY = new PublicKey(process.env.TREASURY!);

// BAD — recipient from POST body
const recipient = new PublicKey(body.data.recipient); // NEVER
```

Same for: mint authority, program IDs, pool addresses, governance program.

## Blockhash freshness

```typescript
const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
tx.recentBlockhash = blockhash;

// Optional: store lastValidBlockHeight + account + action id to prevent replay
```

Stale blockhash → tx fails safely. Replay of same unsigned tx is harder if you track consumed intents.

## Rate limiting

Public Actions go viral. Protect POST:

```typescript
// Pseudocode — use Redis / Upstash / Cloudflare rate limit
await rateLimit.check(`${clientIp}:${actionName}`, { max: 30, windowSec: 60 });
```

Also rate limit by `account` pubkey for expensive actions (mints, swaps).

## Idempotency (votes, claims)

For one-time actions:
1. On GET — check if `account` already voted (requires optional lookup — don't send wallet on GET; check on POST only)
2. On POST — query DB/on-chain before building tx
3. If already done → HTTP 400 with clear `message` or GET with `disabled: true`

```typescript
if (await hasVoted(proposalId, user)) {
  return Response.json(
    { message: "You already voted on this proposal." },
    { status: 400, headers: ACTIONS_CORS_HEADERS }
  );
}
```

## CORS is not authentication

`Access-Control-Allow-Origin: *` is **required by spec** — it does not mean your API is open to abuse. CORS protects browser blink clients; attackers can still curl POST directly.

→ Validate everything server-side regardless of CORS.

## Error responses

Return user-safe messages — no stack traces:

```typescript
import { ACTIONS_CORS_HEADERS } from "@solana/actions";

function actionError(message: string, status = 400) {
  return Response.json({ message }, { status, headers: ACTIONS_CORS_HEADERS });
}
```

## Message signing security

When returning `type: "message"`:
- Include domain, timestamp, nonce in message text
- Verify signature with `@solana/web3.js` or tweetnacl before step 2
- Expire messages after 5 minutes

Example message:
```
MyApp wants you to sign in.
Domain: myapp.com
Nonce: 8f3a2b
Issued: 2026-06-30T12:00:00Z
```

## Logging & monitoring

Log (without secrets):
- Action name, timestamp, account pubkey (truncated in public logs)
- POST validation failures
- Tx build errors
- Rate limit hits

Alert on spikes — viral blink = traffic spike.

## Security checklist (copy before ship)

```
[ ] Fee payer === body.account
[ ] Recipients/programs from env or on-chain config, not POST data
[ ] All numeric inputs bounded server-side
[ ] Blockhash fetched fresh per POST
[ ] One-time actions check prior completion
[ ] Rate limiting on POST
[ ] HTTPS only in production
[ ] No secrets in client-visible GET metadata
[ ] Error messages don't leak internals
[ ] Tested malicious POST bodies (wrong account, huge amounts, extra fields)
```

## Related

- Program security → solana-dev-skill → security.md
- Inspector testing → [testing-debugging.md](testing-debugging.md)

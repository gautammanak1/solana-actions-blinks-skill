# Solana Actions & Blinks — Specification Reference

Official spec: [Solana Actions guide](https://solana.com/developers/guides/advanced/actions)  
SDK: [@solana/actions](https://www.npmjs.com/package/@solana/actions)  
Types: [@solana/actions-spec](https://www.npmjs.com/package/@solana/actions-spec)

## Core concepts

### Actions
Specification-compliant **HTTP APIs** that return metadata (GET) and signable transactions or messages (POST). Any client — wallet extension, bot, website widget — can introspect the API and prompt the user to sign.

Think: **REST API → unsigned tx → wallet signs → on-chain**.

### Blinks (Blockchain Links)
Client applications that **render UI** for an Action URL. A blink turns an Action into a shareable, metadata-rich link usable on X, Discord, QR codes, or any URL surface.

> Not every Action consumer is a blink. A blink completes the **full lifecycle** including wallet signing UI.

## URL scheme

```
solana-action:<absolute-https-url>
```

Rules:
- `link` must be absolute **HTTPS** URL
- URL-encode the link if it contains query parameters
- Clients URL-decode then fetch the Action API
- Malformed (non-HTTPS) → wallet **must reject**

Example:
```
solana-action:https://actions.example.com/api/tip
```

Encoded blink interstitial:
```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Factions.example.com%2Fapi%2Ftip
```

## HTTP methods

| Method | Purpose |
|--------|---------|
| **OPTIONS** | CORS preflight — required before GET/POST from blink clients |
| **GET** | Return Action metadata — no wallet identity sent |
| **POST** | Accept user account + parameters → return signable tx/message |

## OPTIONS response (required)

Minimum headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,PUT,OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Content-Encoding, Accept-Encoding
```

Tip: return same headers on GET/POST responses. `actions.json` also needs CORS on GET/OPTIONS.

## GET request

- Client sends `GET` with `Accept-Encoding` (supports compression)
- **Must NOT** identify wallet/user
- Client displays Action URL **domain** to user

## GET response body (`ActionGetResponse`)

```typescript
interface ActionGetResponse {
  type?: "action" | "completed";
  icon: string;        // absolute HTTPS URL — SVG, PNG, or WebP
  title: string;       // brand / app name
  description: string; // what this action does
  label: string;       // button text, ≤5 words, start with verb
  disabled?: boolean;  // default false
  error?: { message: string };
  links?: {
    actions: LinkedAction[];
  };
}

interface LinkedAction {
  type: "action" | "completed";
  href: string;        // absolute HTTPS URL for POST target
  label: string;
  parameters?: ActionParameter[];
}
```

### Rendering rules (critical)

1. **No `links.actions`** → render single button with root `label`; POST to same URL as GET
2. **`links.actions` present** → render **only** linked buttons; **do not** render root `label` as button
3. **`disabled: true`** → show button disabled (e.g. "Vote Closed")
4. **`error`** → display to user but may still show UI

### ActionParameter (user input)

```typescript
interface ActionParameter {
  name: string;           // POST body field name
  label?: string;
  type?: "text" | "email" | "url" | "number" | "date" |
         "datetime-local" | "checkbox" | "radio" | "textarea" | "select";
  required?: boolean;
  pattern?: string;       // regex — client-side validation
  patternDescription?: string; // required if pattern set
  min?: string | number;
  max?: string | number;
  options?: { label: string; value: string; selected?: boolean }[];
}
```

**Server must re-validate everything** — client validation is UX only.

## POST request

Body (JSON):
```typescript
interface ActionPostRequest {
  account: string;  // base58 user wallet pubkey
  data?: Record<string, string | number | boolean | string[]>;
}
```

- `account` is the user's wallet public key
- `data` contains values from `parameters` (field names match `name`)

## POST response body (`ActionPostResponse`)

Two variants:

### Transaction (most common)
```typescript
interface ActionPostResponse {
  type: "transaction";
  transaction: string;  // base64 serialized transaction
  message?: string;     // optional human-readable preview
}
```

### Message signing
```typescript
interface ActionPostResponse {
  type: "message";
  message: string;      // UTF-8 string to sign
  links?: { next: LinkedAction }; // optional chaining
}
```

Client signs → submits tx to chain (for `type: "transaction"`).

## Action errors

HTTP 4xx/5xx should return:
```json
{ "message": "Human-readable error for the user" }
```

Non-fatal errors can also appear in GET body as `error.message` alongside `disabled`.

## Action chaining

- GET/POST may return `type: "completed"` for multi-step flows
- POST message responses can include `links.next` for follow-up actions
- Use for: auth → action, preview → confirm, multi-step mint

## Blink detection (3 ways)

1. **Explicit Action URL**: `solana-action:https://...`
2. **actions.json mapping**: `https://yoursite.com/donate` → Action API via rules
3. **Interstitial**: `https://dial.to/?action=<encoded>`

Non-blink clients fall back to underlying website URL.

## actions.json (summary)

Served at domain root: `https://yourdomain.com/actions.json`

Maps website paths to Action API URLs. See [actions-json.md](actions-json.md).

## Dialect registry & social unfurl

- [dial.to](https://dial.to) — universal blink interstitial (works without registry)
- [dial.to/register](https://dial.to/register) — verification for X/Twitter unfurl
- Unregistered Actions on X render as plain URLs (no blink UI)

## SDK quick install

```bash
npm add @solana/actions @solana/kit
```

Reference implementations:
- [transfer-sol example](https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts)
- [All examples](https://github.com/solana-developers/solana-actions/tree/main/examples)

## Lifecycle diagram

```
┌─────────┐  GET   ┌──────────────┐
│  Blink  │───────►│ Action API   │──► metadata (title, icon, buttons)
│ Client  │        │ (your server)│
└────┬────┘        └──────┬───────┘
     │                    │
     │  POST (account)    │
     └───────────────────►│──► unsigned tx (base64)
                          │
     ┌────────────────────┘
     ▼
┌─────────┐  sign   ┌──────────┐  send   ┌──────────┐
│ Wallet  │────────►│ unsigned │────────►│ Solana   │
│         │         │    tx    │         │  chain   │
└─────────┘         └──────────┘         └──────────┘
```

## When reading this file

Use for **spec questions** and **response shape validation**. For implementation code, read [blink-builder.md](blink-builder.md) and [nextjs-integration.md](nextjs-integration.md).

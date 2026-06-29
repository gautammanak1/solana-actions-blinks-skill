# /scaffold-blink — Scaffold a Solana Action + Blink

Generate a new Solana Action endpoint with GET, POST, OPTIONS, actions.json entry, and test checklist.

## Usage

```
/scaffold-blink <name> [--type tip|mint|swap|vote|custom]
```

Examples:
```
/scaffold-blink tip --type tip
/scaffold-blink genesis-mint --type mint
/scaffold-blink usdc-sol --type swap
```

## Procedure

When user invokes `/scaffold-blink`, execute these steps:

### 1. Gather inputs (ask if missing)

| Field | Default |
|-------|---------|
| Action name | from argument (kebab-case) |
| Type | `tip` |
| Framework | Next.js 15 App Router |
| Network | devnet |
| Site URL | from env or ask |

### 2. Create files

```
src/app/api/actions/<name>/route.ts   # GET, POST, OPTIONS
public/actions.json                   # add rule (merge if exists)
.env.example                          # RPC_URL, TREASURY, NEXT_PUBLIC_SITE_URL
```

### 3. Route handler requirements

- Import `createActionHeaders`, `createPostResponse`, `ActionGetResponse` from `@solana/actions`
- Export `GET`, `POST`, `OPTIONS`
- Use `export const dynamic = "force-dynamic"`
- Include try/catch with `{ message }` error responses
- Apply [callback-security.md](../skill/callback-security.md) checklist

### 4. Type-specific templates (REAL code in templates/)

| Type | Skill module | Copy template |
|------|--------------|---------------|
| tip | [tip-jar.md](../skill/tip-jar.md) | `templates/transfer-sol-route.ts` |
| spl | [spl-transfer.md](../skill/spl-transfer.md) | build from tip-jar + spl-token |
| swap | [jupiter-swap.md](../skill/jupiter-swap.md) | `templates/jupiter-swap-route.ts` |
| mint | [nft-mint.md](../skill/nft-mint.md) | custom Metaplex handler |
| vote | [governance-vote.md](../skill/governance-vote.md) | linked actions pattern |
| sign-in | [message-sign.md](../skill/message-sign.md) | message type response |
| custom | [blink-builder.md](../skill/blink-builder.md) | sdk-api.md skeleton |

Use `createActionHeaders()` + `createPostResponse()` — see [reference/sdk-api.md](../skill/reference/sdk-api.md).

### 5. actions.json rule

Add:
```json
{
  "pathPattern": "/<name>",
  "apiPath": "https://<site>/api/actions/<name>"
}
```

Merge with existing rules — don't overwrite other entries.

### 6. Generate blink URLs

Provide user both:
```
solana-action:https://<site>/api/actions/<name>
https://dial.to/?action=<url-encoded solana-action URL>
```

### 7. Deliver test checklist

From [testing-debugging.md](../skill/testing-debugging.md):

```
[ ] curl GET returns valid JSON
[ ] curl OPTIONS shows Access-Control-Allow-Origin: *
[ ] Blinks Inspector GET pass
[ ] Blinks Inspector POST pass
[ ] Devnet wallet sign test
[ ] actions.json resolves site path
```

### 8. Deliverable format

```markdown
## Scaffolded: <name> Action

### Files created
- ...

### Environment
\`\`\`bash
# .env.local
...
\`\`\`

### Test in Inspector
<action-url>

### Share blink
<dial.to-url>

### Security notes
- ...
```

## Do not

- Accept recipient/mint addresses from POST body
- Skip OPTIONS handler
- Use HTTP in production URLs
- Ship without Inspector test steps

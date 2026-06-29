# actions.json — Domain Mapping for Blinks

Official spec section: [actions.json](https://solana.com/developers/guides/advanced/actions#actionsjson)

## Purpose

`actions.json` at your **domain root** tells blink clients how to map **website URLs** to **Action API URLs**.

Example: user shares `https://myapp.com/donate` on X → client reads `https://myapp.com/actions.json` → discovers Action API at `https://api.myapp.com/donate`.

## File location

Must be served at:
```
https://yourdomain.com/actions.json
```

Next.js options:
- Static: `public/actions.json`
- Dynamic: `src/app/actions.json/route.ts` (for env-based URLs)

**Must return CORS headers** on GET and OPTIONS:
```
Access-Control-Allow-Origin: *
```

## Schema (simplified)

```typescript
interface ActionsJson {
  rules: ActionRule[];
}

interface ActionRule {
  /** Path pattern on THIS domain (website) */
  pathPattern: string;
  /** Absolute HTTPS URL of the Action API */
  apiPath: string;
}
```

## Example: single tip page

`public/actions.json`:
```json
{
  "rules": [
    {
      "pathPattern": "/tip",
      "apiPath": "https://api.myapp.com/actions/tip"
    },
    {
      "pathPattern": "/tip/**",
      "apiPath": "https://api.myapp.com/actions/tip/**"
    }
  ]
}
```

- `pathPattern` matches paths on the site serving actions.json
- `apiPath` is the Action API base URL
- `**` wildcard passes subpaths through to API

## Example: multiple actions

```json
{
  "rules": [
    {
      "pathPattern": "/vote/*",
      "apiPath": "https://api.dao.example.com/vote/*"
    },
    {
      "pathPattern": "/mint",
      "apiPath": "https://api.nft.example.com/actions/mint"
    },
    {
      "pathPattern": "/",
      "apiPath": "https://api.myapp.com/actions/home"
    }
  ]
}
```

Order matters — first matching rule wins (verify against spec for your version).

## Subdomain vs separate API domain

Common patterns:

| Pattern | actions.json host | apiPath host |
|---------|-------------------|--------------|
| Same origin | `myapp.com` | `myapp.com/api/actions/...` |
| API subdomain | `myapp.com` | `api.myapp.com/actions/...` |
| Separate API | `myapp.com` | `actions.myapp.com/...` |

All `apiPath` values must be **absolute HTTPS**.

## Next.js static file

`public/actions.json` — deployed automatically at `/actions.json`.

Add OPTIONS route if your host doesn't serve OPTIONS on static files:

`src/app/actions.json/route.ts`:
```typescript
import { ACTIONS_CORS_HEADERS } from "@solana/actions";
import actions from "../../../public/actions.json";

export async function GET() {
  return Response.json(actions, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
```

## Dynamic actions.json (multi-tenant)

For platforms hosting many creators:

```typescript
import { ACTIONS_CORS_HEADERS } from "@solana/actions";

export async function GET() {
  const rules = await db.getActionRules(); // your data source
  return Response.json({ rules }, { headers: ACTIONS_CORS_HEADERS });
}

export async function OPTIONS() {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
```

Cache carefully — stale rules break blink resolution.

## Verification steps

1. `curl -I https://myapp.com/actions.json` → 200, `Content-Type: application/json`
2. Check CORS: `curl -X OPTIONS -I https://myapp.com/actions.json` → `Access-Control-Allow-Origin: *`
3. Open [Blinks Inspector](https://www.blinks.xyz/inspector) → paste site URL `https://myapp.com/tip`
4. Confirm Inspector resolves to correct Action API

## Common failures

| Symptom | Cause |
|---------|-------|
| Link shows normal preview on X | Not in Dialect registry OR no actions.json match |
| Inspector can't resolve path | pathPattern doesn't match shared URL |
| CORS error on actions.json | Missing OPTIONS/GET CORS headers |
| 404 on actions.json | File not at domain root; wrong deploy path |
| Wildcard mismatch | `*` vs `**` pattern typo |

## Relationship to blink URLs

| Share URL type | Needs actions.json? |
|----------------|---------------------|
| `solana-action:https://api...` | No — direct Action URL |
| `dial.to/?action=...` | No — encodes Action URL directly |
| `https://myapp.com/tip` | **Yes** — client uses actions.json to find API |

Always provide a **fallback website** at mapped paths for non-blink browsers.

## Production checklist

- [ ] `actions.json` live at domain root
- [ ] CORS on GET + OPTIONS
- [ ] Every `apiPath` endpoint has its own GET/POST/OPTIONS + CORS
- [ ] pathPattern tested for all marketing URLs you plan to share
- [ ] HTTPS everywhere
- [ ] Dialect registry updated if using social unfurl

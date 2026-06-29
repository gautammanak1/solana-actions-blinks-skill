---
name: solana-actions-blinks
description: Build, secure, test, and ship Solana Actions and Blockchain Links (Blinks). Real @solana/actions SDK patterns (createActionHeaders, createPostResponse), Jupiter API v1, Metaplex mints, Realms votes, SPL transfers, actions.json, Blinks Inspector, dial.to, Dialect registry. Use for Actions, Blinks, solana-action URLs, tip jars, swap blinks, mint blinks, vote blinks.
user-invocable: true
---

# Solana Actions & Blinks Skill

> **Extends**: [solana-dev-skill](../solana-dev/SKILL.md) — Anchor programs, core tx, security reviews.

## What This Skill Is For

| Use case | Skill module |
|----------|--------------|
| SOL tip / donation blink | [tip-jar.md](tip-jar.md) |
| USDC / SPL token tip | [spl-transfer.md](spl-transfer.md) |
| Jupiter swap blink | [jupiter-swap.md](jupiter-swap.md) |
| NFT mint blink | [nft-mint.md](nft-mint.md) |
| DAO vote blink (Realms) | [governance-vote.md](governance-vote.md) |
| Sign-in / message signing | [message-sign.md](message-sign.md) |
| Spec & lifecycle | [actions-spec.md](actions-spec.md) |
| Build endpoints | [blink-builder.md](blink-builder.md) |
| actions.json mapping | [actions-json.md](actions-json.md) |
| Security | [callback-security.md](callback-security.md) |
| Next.js / Express | [nextjs-integration.md](nextjs-integration.md) |
| Inspector & registry | [testing-debugging.md](testing-debugging.md) |

## Default Stack (2026 — use real SDK)

```bash
npm add @solana/actions @solana/web3.js @solana/spl-token
# swap actions also need JUPITER_API_KEY from portal.jup.ag
```

| Component | Choice |
|-----------|--------|
| CORS headers | `createActionHeaders()` from `@solana/actions` |
| POST response | `createPostResponse({ fields: { transaction } })` |
| RPC env var | `SOLANA_RPC` (official examples convention) |
| Framework | Next.js 15 App Router |
| Templates | Copy from `templates/` directory |

**Real constants:** [reference/constants.md](reference/constants.md)  
**SDK API:** [reference/sdk-api.md](reference/sdk-api.md)  
**Jupiter API:** [reference/jupiter-api.md](reference/jupiter-api.md)

## Operating Procedure

### 1. Classify task → read ONE skill module

Don't load everything. Pick the row from the table above.

### 2. Copy template → customize env

| Action type | Template |
|-------------|----------|
| SOL tip | `templates/transfer-sol-route.ts` + `transfer-sol-const.ts` |
| Jupiter swap | `templates/jupiter-swap-route.ts` |
| actions.json | `templates/actions.json` |
| env vars | `templates/env.example` |

### 3. Build checklist

```
[ ] GET, POST, OPTIONS with createActionHeaders()
[ ] createPostResponse() for tx (not manual serialize)
[ ] dynamic = "force-dynamic"
[ ] Treasury/mints hardcoded from env — never from client
[ ] actions.json at domain root with CORS
[ ] Test: curl GET/OPTIONS/POST
[ ] Test: https://www.blinks.xyz/inspector
[ ] dial.to share URL generated
[ ] Dialect registry if X campaign (/register-dialect)
```

### 4. Deliverables

- Route handler code (from templates, customized)
- `.env.example` filled
- curl test commands with expected output
- dial.to URL
- Inspector test report

---

## Progressive Disclosure

### Action type skills (read when building)

- [tip-jar.md](tip-jar.md) — Official transfer-sol pattern, preset amounts
- [spl-transfer.md](spl-transfer.md) — USDC SPL transfer + ATA
- [jupiter-swap.md](jupiter-swap.md) — Live `api.jup.ag/swap/v1` quote + swap
- [nft-mint.md](nft-mint.md) — Metaplex CM/Core mint
- [governance-vote.md](governance-vote.md) — Realms Yes/No/Abstain
- [message-sign.md](message-sign.md) — Sign-in + action chaining

### Infrastructure skills

- [actions-spec.md](actions-spec.md) — GET/POST spec, parameters, errors
- [blink-builder.md](blink-builder.md) — Endpoint patterns, blink URLs
- [actions-json.md](actions-json.md) — Domain mapping
- [callback-security.md](callback-security.md) — Validation, rate limits
- [nextjs-integration.md](nextjs-integration.md) — Deploy, Vercel, tunnels
- [testing-debugging.md](testing-debugging.md) — Inspector, dial.to, registry
- [resources.md](resources.md) — All official links

### Reference (real data)

- [reference/constants.md](reference/constants.md) — Mints, programs, RPC URLs
- [reference/sdk-api.md](reference/sdk-api.md) — createActionHeaders, createPostResponse
- [reference/jupiter-api.md](reference/jupiter-api.md) — Quote/swap curl examples

---

## Task Routing

| User asks... | Read |
|--------------|------|
| SOL tip jar | tip-jar.md |
| USDC tip | spl-transfer.md |
| Jupiter swap blink | jupiter-swap.md |
| NFT mint blink | nft-mint.md |
| DAO vote | governance-vote.md |
| Sign in with Solana | message-sign.md |
| What is a blink? | actions-spec.md |
| CORS error | callback-security.md + sdk-api.md |
| actions.json | actions-json.md |
| Test my action | testing-debugging.md |
| X/Twitter unfurl | testing-debugging.md + /register-dialect |
| Real mint addresses | reference/constants.md |
| Jupiter quote API | reference/jupiter-api.md |

---

## Commands

| Command | File |
|---------|------|
| /build-tip-action | [build-tip-action.md](../commands/build-tip-action.md) |
| /build-swap-action | [build-swap-action.md](../commands/build-swap-action.md) |
| /build-mint-action | [build-mint-action.md](../commands/build-mint-action.md) |
| /build-vote-action | [build-vote-action.md](../commands/build-vote-action.md) |
| /test-blink | [test-blink.md](../commands/test-blink.md) |
| /register-dialect | [register-dialect.md](../commands/register-dialect.md) |
| /scaffold-blink | [scaffold-blink.md](../commands/scaffold-blink.md) |

---

## Agents

| Agent | Purpose |
|-------|---------|
| **actions-architect** | Design endpoint layout, security, actions.json |
| **blink-engineer** | Implement routes, pass Inspector |

See [agents/](../agents/) directory.

---

## Official sources (always prefer over blogs)

- Spec: https://solana.com/developers/guides/advanced/actions
- SDK: https://github.com/solana-developers/solana-actions
- transfer-sol example: https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts
- Inspector: https://www.blinks.xyz/inspector
- dial.to: https://dial.to

---

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Manual CORS headers | Use `createActionHeaders()` |
| Manual base64 serialize | Use `createPostResponse()` |
| Amount from POST body only | Official pattern: URL query params in href |
| `ACTIONS_CORS_HEADERS` (old) | Migrate to `createActionHeaders()` |
| Missing OPTIONS | Blink won't load — CORS preflight fails |
| Client-provided treasury | Hardcode from env |
| Quote in GET handler | Jupiter quote must be in POST only |

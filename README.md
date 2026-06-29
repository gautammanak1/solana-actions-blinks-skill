# solana-actions-blinks-skill

Production-grade AI skill for **Solana Actions** and **Blockchain Links (Blinks)** — spec-compliant shareable on-chain links with real SDK code, live Jupiter API integration, and copy-paste Next.js templates.

Built for the [Superteam Brasil · Solana AI Kit bounty](https://superteam.fun/earn/listing/skills).  
Reference structure: [solana-game-skill](https://github.com/solanabr/solana-game-skill).  
License: [MIT](./LICENSE)

---

## Table of contents

1. [Problem & solution](#problem--solution)
2. [Why this skill is unique](#why-this-skill-is-unique)
3. [Skill modules (6 action types)](#skill-modules-6-action-types)
4. [Infrastructure skills](#infrastructure-skills)
5. [Reference data (real APIs)](#reference-data-real-apis)
6. [Templates (working code)](#templates-working-code)
7. [Commands (7 workflows)](#commands-7-workflows)
8. [Agents (2 roles)](#agents-2-roles)
9. [Install](#install)
10. [Quick start](#quick-start)
11. [Environment variables](#environment-variables)
12. [Testing with Blinks Inspector](#testing-with-blinks-inspector)
13. [CI/CD & infrastructure](#cicd--infrastructure)
14. [Project structure](#project-structure)
15. [Bounty submission](#bounty-submission)
16. [Official resources](#official-resources)

---

## Problem & solution

**Problem:** Solana Actions let builders ship tip, swap, mint, and vote flows as shareable links (Blinks). The spec spans HTTP GET/POST/OPTIONS, CORS, `actions.json`, Jupiter quotes, and wallet signing — docs are spread across multiple repos.

**Solution:** This skill gives coding agents a **progressive playbook** with:
- One skill file per action type (not generic fluff)
- Real `@solana/actions` SDK patterns (`createActionHeaders`, `createPostResponse`)
- Copy-paste TypeScript templates from the [official solana-actions repo](https://github.com/solana-developers/solana-actions)
- Live Jupiter API v1 endpoints (`api.jup.ag/swap/v1`)
- CI/CD so structure and templates never break silently

---

## Why this skill is unique

| Feature | This skill | Typical bounty submissions |
|---------|-----------|----------------------------|
| Niche | **Actions & Blinks** — zero duplicates in 110+ skill-bounty PRs | tx-doctor, auditor, legal (saturated) |
| SDK | Official `createActionHeaders()` + `createPostResponse()` | Hand-rolled CORS / base64 |
| Templates | Working `route.ts` files | Pseudocode markdown only |
| APIs | Jupiter `api.jup.ag`, Helius RPC, Realms | Placeholder URLs |
| Coverage | 6 action types + sign-in | Single generic guide |
| Tooling | 7 commands, 2 agents, CI pipeline | None |
| Kit fit | Matches solana-game-skill shape | Inconsistent structure |

---

## Skill modules (6 action types)

Each module is a **standalone skill file** — agents load only what they need (token-efficient).

| # | Module | File | Builds |
|---|--------|------|--------|
| 1 | **SOL tip jar** | [skill/tip-jar.md](skill/tip-jar.md) | Native SOL transfer blink (official transfer-sol pattern) |
| 2 | **SPL / USDC tip** | [skill/spl-transfer.md](skill/spl-transfer.md) | USDC SPL transfer with ATA creation |
| 3 | **Jupiter swap** | [skill/jupiter-swap.md](skill/jupiter-swap.md) | Live USDC→SOL swap via `api.jup.ag/swap/v1` |
| 4 | **NFT mint** | [skill/nft-mint.md](skill/nft-mint.md) | Metaplex Candy Machine / Core mint blink |
| 5 | **DAO vote** | [skill/governance-vote.md](skill/governance-vote.md) | Realms Yes / No / Abstain linked actions |
| 6 | **Message sign-in** | [skill/message-sign.md](skill/message-sign.md) | Wallet auth + multi-step action chains |

**Entry point:** [skill/SKILL.md](skill/SKILL.md) — routing table + build checklist.

---

## Infrastructure skills

| Module | File | Purpose |
|--------|------|---------|
| Spec reference | [skill/actions-spec.md](skill/actions-spec.md) | GET/POST bodies, parameters, lifecycle |
| Endpoint builder | [skill/blink-builder.md](skill/blink-builder.md) | Linked actions, blink URLs, query params |
| Domain mapping | [skill/actions-json.md](skill/actions-json.md) | `actions.json` rules + CORS |
| Security | [skill/callback-security.md](skill/callback-security.md) | Signer validation, rate limits, abuse |
| Next.js deploy | [skill/nextjs-integration.md](skill/nextjs-integration.md) | App Router, Vercel, tunnels |
| QA & registry | [skill/testing-debugging.md](skill/testing-debugging.md) | Blinks Inspector, dial.to, Dialect |
| Links index | [skill/resources.md](skill/resources.md) | All official URLs |

---

## Reference data (real APIs)

| Reference | File | Contains |
|-----------|------|----------|
| Constants | [skill/reference/constants.md](skill/reference/constants.md) | RPC URLs, USDC/SOL mints, program IDs, devnet test wallet |
| SDK API | [skill/reference/sdk-api.md](skill/reference/sdk-api.md) | `createActionHeaders`, `createPostResponse`, types |
| Jupiter API | [skill/reference/jupiter-api.md](skill/reference/jupiter-api.md) | Quote/swap curl + TypeScript helpers |

### Real mint addresses (mainnet)

| Token | Mint |
|-------|------|
| SOL (wrapped) | `So11111111111111111111111111111111111111112` |
| USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |

### Real Jupiter quote (curl)

```bash
curl -sG "https://api.jup.ag/swap/v1/quote" \
  -H "x-api-key: YOUR_JUPITER_API_KEY" \
  --data-urlencode "inputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" \
  --data-urlencode "outputMint=So11111111111111111111111111111111111111112" \
  --data-urlencode "amount=1000000" \
  --data-urlencode "slippageBps=50" | jq '{inAmount, outAmount, priceImpactPct}'
```

API key (free): https://portal.jup.ag

---

## Templates (working code)

Copy into your Next.js app — no rewriting from scratch.

| Template | File | Source |
|----------|------|--------|
| SOL transfer Action | [templates/transfer-sol-route.ts](templates/transfer-sol-route.ts) | [official transfer-sol](https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts) |
| Constants | [templates/transfer-sol-const.ts](templates/transfer-sol-const.ts) | Official devnet test recipient |
| Jupiter swap Action | [templates/jupiter-swap-route.ts](templates/jupiter-swap-route.ts) | `api.jup.ag/swap/v1` integration |
| Domain mapping | [templates/actions.json](templates/actions.json) | All action path rules |
| Environment | [templates/env.example](templates/env.example) | `SOLANA_RPC`, `JUPITER_API_KEY`, etc. |

### SDK pattern (required in all templates)

```typescript
import { createActionHeaders, createPostResponse } from "@solana/actions";

const headers = createActionHeaders();

export const OPTIONS = async () => Response.json(null, { headers });

const payload = await createPostResponse({
  fields: { transaction, message: "Preview text" },
});
```

---

## Commands (7 workflows)

| Command | File | Use when |
|---------|------|----------|
| `/build-tip-action` | [commands/build-tip-action.md](commands/build-tip-action.md) | Scaffold SOL tip jar |
| `/build-swap-action` | [commands/build-swap-action.md](commands/build-swap-action.md) | Scaffold Jupiter swap blink |
| `/build-mint-action` | [commands/build-mint-action.md](commands/build-mint-action.md) | Scaffold NFT mint blink |
| `/build-vote-action` | [commands/build-vote-action.md](commands/build-vote-action.md) | Scaffold Realms vote blink |
| `/test-blink` | [commands/test-blink.md](commands/test-blink.md) | curl + Inspector QA checklist |
| `/register-dialect` | [commands/register-dialect.md](commands/register-dialect.md) | X/Twitter unfurl registry |
| `/scaffold-blink` | [commands/scaffold-blink.md](commands/scaffold-blink.md) | Generic Action scaffold |

---

## Agents (2 roles)

| Agent | File | Model | Role |
|-------|------|-------|------|
| **actions-architect** | [agents/actions-architect.md](agents/actions-architect.md) | opus | Design endpoints, actions.json, security model |
| **blink-engineer** | [agents/blink-engineer.md](agents/blink-engineer.md) | sonnet | Implement routes, pass Inspector |

---

## Install

```bash
git clone https://github.com/YOUR_USERNAME/solana-actions-blinks-skill.git
cd solana-actions-blinks-skill
./install.sh -y
```

**Install targets:**
- Cursor → `~/.cursor/skills/solana-actions-blinks/`
- Claude Code → `~/.claude/skills/solana-actions-blinks/`

Each install includes: `skill/`, `commands/`, `agents/`, `templates/`.

---

## Quick start

### 1. Install skill

```bash
./install.sh -y
```

### 2. Ask your agent

```
/build-tip-action — scaffold SOL tip jar on Next.js 15 devnet
```

### 3. Copy template

```bash
cp templates/transfer-sol-route.ts  your-app/src/app/api/actions/transfer-sol/route.ts
cp templates/transfer-sol-const.ts  your-app/src/app/api/actions/transfer-sol/const.ts
cp templates/actions.json           your-app/public/actions.json
cp templates/env.example            your-app/.env.local
```

### 4. Test locally

```bash
curl -s http://localhost:3000/api/actions/transfer-sol | jq '.links.actions[].label'
```

### 5. Test in Inspector

Open https://www.blinks.xyz/inspector → paste your Action URL.

### 6. Share blink

```
https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fyourdomain.com%2Fapi%2Factions%2Ftransfer-sol
```

---

## Environment variables

| Variable | Required for | Example |
|----------|--------------|---------|
| `SOLANA_RPC` | All actions | `https://devnet.helius-rpc.com/?api-key=...` |
| `TREASURY_WALLET` | Tip / transfer | Your base58 pubkey |
| `NEXT_PUBLIC_SITE_URL` | Icon URLs | `https://yourdomain.com` |
| `JUPITER_API_KEY` | Swap actions | From https://portal.jup.ag |
| `USDC_MINT` | SPL transfer | Devnet: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU` |
| `COLLECTION_MINT` | NFT mint | Your collection pubkey |
| `CANDY_MACHINE` | NFT mint | Your CM pubkey |
| `PROPOSAL_ID` | DAO vote | Realms proposal pubkey |

Full list: [templates/env.example](templates/env.example)

---

## Testing with Blinks Inspector

| Step | Action |
|------|--------|
| 1 | Deploy Action to HTTPS (Vercel / Cloudflare tunnel) |
| 2 | Open https://www.blinks.xyz/inspector |
| 3 | Paste Action URL |
| 4 | Verify GET metadata + linked buttons |
| 5 | POST with devnet wallet pubkey |
| 6 | Sign in Phantom (devnet mode) |
| 7 | Confirm on https://explorer.solana.com/?cluster=devnet |

Full QA script: [commands/test-blink.md](commands/test-blink.md)

---

## CI/CD & infrastructure

Every push runs automated checks so the skill never ships broken.

### Pipeline (GitHub Actions)

File: [.github/workflows/ci.yml](.github/workflows/ci.yml)

```
┌─────────────────────┐
│  push / pull_request │
└──────────┬──────────┘
           │
     ┌─────┴─────┬─────────────┐
     ▼           ▼             ▼
 validate-   typecheck-    install-
 structure   templates     smoke-test
     │           │             │
     └─────┬─────┴─────────────┘
           ▼
        ci-gate ✓
```

| Job | What it checks |
|-----|----------------|
| **validate-structure** | Required files, SKILL.md frontmatter, SDK patterns, JSON validity, ShellCheck |
| **typecheck-templates** | `tsc --noEmit` on `templates/*.ts` with `@solana/actions` types |
| **install-smoke-test** | `./install.sh -y` + verify files land in skills directory |
| **ci-gate** | All jobs must pass |

### Run locally

```bash
npm install
npm run test:ci          # validate + typecheck
bash scripts/validate-skill.sh
./install.sh -y
```

### Validation script

[scripts/validate-skill.sh](scripts/validate-skill.sh) checks:
- 35+ required files exist
- 6 skill modules + 3 reference files
- 7+ commands, 2 agents
- `createActionHeaders` / `createPostResponse` in templates
- Real Jupiter API URL in swap template
- No deprecated `ACTIONS_CORS_HEADERS`
- `actions.json` valid JSON
- SKILL.md internal links resolve

---

## Project structure

```
solana-actions-blinks-skill/
├── .github/workflows/ci.yml     # CI/CD pipeline
├── scripts/validate-skill.sh      # Local + CI validation
├── skill/
│   ├── SKILL.md                   # Entry point + routing
│   ├── tip-jar.md                 # Action type skills (6)
│   ├── spl-transfer.md
│   ├── jupiter-swap.md
│   ├── nft-mint.md
│   ├── governance-vote.md
│   ├── message-sign.md
│   ├── actions-spec.md            # Infrastructure skills
│   ├── blink-builder.md
│   ├── actions-json.md
│   ├── callback-security.md
│   ├── nextjs-integration.md
│   ├── testing-debugging.md
│   ├── resources.md
│   └── reference/                 # Real constants & APIs
│       ├── constants.md
│       ├── sdk-api.md
│       └── jupiter-api.md
├── templates/                     # Copy-paste route handlers
├── commands/                      # 7 agent commands
├── agents/                        # 2 specialized agents
├── install.sh
├── package.json                   # Template typecheck deps
├── tsconfig.templates.json
├── CLAUDE.md
├── LICENSE
└── README.md
```

---

## Bounty submission

1. **Star & fork** this repo
2. **Open PR** → [solanabr/skill-bounty](https://github.com/solanabr/skill-bounty)
3. **Submit questionnaire** → [Superteam listing](https://superteam.fun/earn/listing/skills)
4. Include: repo link, Inspector screenshot, CI badge

PR title suggestion:
```
Submission: Add solana-actions-blinks-skill — Actions & Blinks with real SDK + Jupiter API
```

---

## Official resources

| Resource | URL |
|----------|-----|
| Solana Actions guide | https://solana.com/developers/guides/advanced/actions |
| solana-actions SDK repo | https://github.com/solana-developers/solana-actions |
| transfer-sol example | https://github.com/solana-developers/solana-actions/blob/main/examples/next-js/src/app/api/actions/transfer-sol/route.ts |
| Blinks Inspector | https://www.blinks.xyz/inspector |
| dial.to | https://dial.to |
| Dialect registry | https://dial.to/register |
| Jupiter docs | https://station.jup.ag/docs |
| Solana AI Kit | https://github.com/solanabr/solana-ai-kit |
| Reference skill shape | https://github.com/solanabr/solana-game-skill |
| Skill bounty | https://github.com/solanabr/skill-bounty |
| Superteam bounty | https://superteam.fun/earn/listing/skills |

---

## License

MIT — see [LICENSE](./LICENSE).

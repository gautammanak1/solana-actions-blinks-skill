# Bounty Submission — solana-actions-blinks-skill

Checklist aligned with [Superteam Brasil · Solana AI Kit bounty](https://superteam.fun/earn/listing/skills) requirements and judging criteria.

---

## Submission requirements ✅

| Requirement | Status | Link / location |
|-------------|--------|-----------------|
| **Public GitHub repo** | ✅ | https://github.com/gautammanak1/solana-actions-blinks-skill |
| **README** — what it does, problem, install | ✅ | [README.md](README.md) → Problem · Solution · Install |
| **SKILL.md entry point** (kit structure) | ✅ | [skill/SKILL.md](skill/SKILL.md) |
| **skill-bounty PR** | ✅ | https://github.com/solanabr/skill-bounty/pull/113 |
| **Superteam questionnaire** | ⏳ | Submit at https://superteam.fun/earn/listing/skills (answers below) |
| **MIT license** | ✅ | [LICENSE](LICENSE) |
| **Working install path** | ✅ | `./install.sh` · `./install-custom.sh` |

---

## Judging criteria — how we address each

### 1. Usefulness — real builder problem?

**Problem:** Builders want users to tip, swap, mint, or vote from a **shareable link** (X, Discord, QR) without building a full dApp first. Actions + Blinks are the official Solana path, but the spec is spread across HTTP APIs, CORS, `actions.json`, Jupiter, Metaplex, and security.

**Evidence:**
- 6 action-type skills (tip, SPL, swap, mint, vote, sign-in)
- Live devnet demo: https://solana-actions-blinks-demo-nine.vercel.app/api/actions/transfer-sol (Phantom on **devnet** for signing)
- Copy-paste templates from [official solana-actions repo](https://github.com/solana-developers/solana-actions)

### 2. Novelty — genuine ecosystem gap?

**Gap:** Zero dedicated Actions/Blinks skills among 110+ [skill-bounty PRs](https://github.com/solanabr/skill-bounty/pulls) (tx-doctor, auditor, legal are saturated).

**Unique angle:** Only skill covering the full Actions lifecycle — spec → build → secure → Inspector → dial.to → Dialect registry.

### 3. Quality — production-grade, tested, documented?

**Evidence:**
| Quality signal | Proof |
|----------------|-------|
| CI pipeline | [![CI](https://github.com/gautammanak1/solana-actions-blinks-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/gautammanak1/solana-actions-blinks-skill/actions/workflows/ci.yml) |
| Template typecheck | `npm run test:ci` — tsc on templates with `@solana/actions` |
| Real SDK | `createActionHeaders()` + `createPostResponse()` (not hand-rolled) |
| Live API | Jupiter `api.jup.ag/swap/v1`, devnet RPC |
| Versioned release | [v1.0.0](https://github.com/gautammanak1/solana-actions-blinks-skill/releases/tag/v1.0.0) |
| Inspector proof | [screenshot](assets/inspector-screenshot.png) + [PR comment](https://github.com/solanabr/skill-bounty/pull/113#issuecomment-4836995275) |

### 4. Fit — slots into standard kit?

Matches [solana-game-skill](https://github.com/solanabr/solana-game-skill) shape:

| Kit component | This repo |
|---------------|-----------|
| `skill/SKILL.md` | ✅ Progressive routing + task table |
| `skill/*.md` modules | ✅ 6 action types + 7 infra + 3 reference |
| `commands/` | ✅ 7 commands |
| `agents/` | ✅ 2 agents |
| `install.sh` | ✅ Standard installer |
| `install-custom.sh` | ✅ Custom installer |
| `CLAUDE.md` | ✅ Claude config |
| `LICENSE` (MIT) | ✅ |
| Extends solana-dev-skill | ✅ Delegates Anchor/security |

---

## Superteam questionnaire — copy-paste answers

Use these when submitting at https://superteam.fun/earn/listing/skills

**Skill name:**  
`solana-actions-blinks-skill`

**Public repo URL:**  
https://github.com/gautammanak1/solana-actions-blinks-skill

**skill-bounty PR URL:**  
https://github.com/solanabr/skill-bounty/pull/113

**What does your skill do? (1–2 sentences)**  
Teaches AI coding agents to build, secure, test, and ship Solana Actions and Blinks — spec-compliant tip, swap, mint, and vote links using `@solana/actions`, live Jupiter API, and copy-paste Next.js templates.

**What problem does it solve?**  
Actions/Blinks require GET/POST/OPTIONS handlers, CORS, actions.json, wallet signing flows, and security validation — docs are fragmented. This skill gives progressive, token-efficient modules so agents ship working blinks on the first try.

**How to install?**  
```bash
git clone https://github.com/gautammanak1/solana-actions-blinks-skill.git
cd solana-actions-blinks-skill
./install.sh -y
```

**Live demo / proof:**  
- Action: https://solana-actions-blinks-demo-nine.vercel.app/api/actions/transfer-sol  
- dial.to: https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fsolana-actions-blinks-demo-nine.vercel.app%2Fapi%2Factions%2Ftransfer-sol  
- Inspector: https://www.blinks.xyz/inspector (fallback: dial.to link above if Inspector is down)  
- Release: v1.0.0

**Novelty vs existing submissions:**  
Only Actions/Blinks-focused skill; no duplicate in 110+ skill-bounty PRs.

---

## Kit structure map

```
skill/SKILL.md          ← entry point (required)
skill/tip-jar.md        ← progressive modules
skill/jupiter-swap.md
skill/actions-spec.md
skill/reference/        ← real API constants
commands/               ← workflow commands
agents/                 ← specialized agents
templates/              ← working route.ts
install.sh              ← installer (required)
demo/                   ← live devnet proof
.github/workflows/ci.yml
```

---

## Pre-submit final check

```
[ ] Repo is public
[ ] README has Problem, Solution, Install
[ ] skill/SKILL.md has frontmatter (name, description, user-invocable)
[ ] MIT LICENSE present
[ ] install.sh works
[ ] npm run test:ci passes
[ ] skill-bounty PR open
[ ] Superteam listing submitted with PR + repo links
[ ] Live demo URL works (curl GET)
```

Run locally:
```bash
npm run test:ci
./install.sh -y
curl -s https://solana-actions-blinks-demo-nine.vercel.app/api/actions/transfer-sol | jq '.title'
```

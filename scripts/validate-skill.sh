#!/usr/bin/env bash
# Validates solana-actions-blinks-skill repo structure and content integrity.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

fail() { echo -e "${RED}FAIL:${NC} $1" >&2; exit 1; }
ok()   { echo -e "${GREEN}OK:${NC} $1"; }

echo "=== Solana Actions & Blinks Skill — Validation ==="

# --- Required top-level files ---
REQUIRED_FILES=(
  "README.md"
  "LICENSE"
  "install.sh"
  "CLAUDE.md"
  "skill/SKILL.md"
  "package.json"
  "templates/transfer-sol-route.ts"
  "templates/jupiter-swap-route.ts"
  "templates/actions.json"
  "templates/env.example"
)

for f in "${REQUIRED_FILES[@]}"; do
  [[ -f "$f" ]] || fail "Missing required file: $f"
done
ok "All required files present"

# --- Required skill modules ---
SKILL_MODULES=(
  "skill/tip-jar.md"
  "skill/spl-transfer.md"
  "skill/jupiter-swap.md"
  "skill/nft-mint.md"
  "skill/governance-vote.md"
  "skill/message-sign.md"
  "skill/actions-spec.md"
  "skill/blink-builder.md"
  "skill/actions-json.md"
  "skill/callback-security.md"
  "skill/nextjs-integration.md"
  "skill/testing-debugging.md"
  "skill/resources.md"
  "skill/reference/constants.md"
  "skill/reference/sdk-api.md"
  "skill/reference/jupiter-api.md"
)

for f in "${SKILL_MODULES[@]}"; do
  [[ -f "$f" ]] || fail "Missing skill module: $f"
done
ok "All skill modules present"

# --- Commands ---
COMMAND_COUNT=$(find commands -name '*.md' 2>/dev/null | wc -l | tr -d ' ')
[[ "$COMMAND_COUNT" -ge 7 ]] || fail "Expected >= 7 commands, found $COMMAND_COUNT"
ok "Commands: $COMMAND_COUNT files"

# --- Agents ---
[[ -f agents/actions-architect.md ]] || fail "Missing agents/actions-architect.md"
[[ -f agents/blink-engineer.md ]] || fail "Missing agents/blink-engineer.md"
ok "Agents present"

# --- SKILL.md frontmatter ---
grep -q '^name: solana-actions-blinks' skill/SKILL.md || fail "SKILL.md missing name frontmatter"
grep -q '^user-invocable: true' skill/SKILL.md || fail "SKILL.md missing user-invocable"
grep -q '^description:' skill/SKILL.md || fail "SKILL.md missing description"
ok "SKILL.md frontmatter valid"

# --- Official SDK patterns in templates ---
grep -q 'createActionHeaders' templates/transfer-sol-route.ts || fail "transfer-sol missing createActionHeaders"
grep -q 'createPostResponse' templates/transfer-sol-route.ts || fail "transfer-sol missing createPostResponse"
grep -q 'createActionHeaders' templates/jupiter-swap-route.ts || fail "jupiter-swap missing createActionHeaders"
grep -q 'api.jup.ag/swap/v1' templates/jupiter-swap-route.ts || fail "jupiter-swap missing real Jupiter API URL"
ok "Templates use official SDK + Jupiter API"

# --- actions.json valid JSON ---
python3 -c "import json; json.load(open('templates/actions.json'))" || fail "templates/actions.json invalid JSON"
ok "actions.json is valid JSON"

# --- install.sh syntax ---
bash -n install.sh || fail "install.sh syntax error"
bash -n scripts/validate-skill.sh || fail "validate-skill.sh syntax error"
ok "Shell scripts syntax valid"

# --- No deprecated patterns in templates ---
if grep -q 'ACTIONS_CORS_HEADERS' templates/*.ts 2>/dev/null; then
  fail "Templates use deprecated ACTIONS_CORS_HEADERS — use createActionHeaders()"
fi
ok "No deprecated CORS patterns in templates"

# --- Internal markdown links in SKILL.md (basic) ---
while IFS= read -r link; do
  path=$(echo "$link" | sed -n 's/.*(\([^)]*\)).*/\1/p')
  [[ "$path" == http* ]] && continue
  [[ "$path" == \#* ]] && continue
  file="${path%%#*}"
  # optional external skill reference
  [[ "$file" == "../solana-dev/"* ]] && continue
  if [[ "$file" == ../* ]]; then
    resolved="${file#../}"
    [[ -f "$resolved" || -d "$resolved" ]] || fail "Broken link in SKILL.md: $path"
  else
    [[ -f "skill/$file" || -f "$file" ]] || fail "Broken link in SKILL.md: $path"
  fi
done < <(grep -oE '\[[^]]+\]\([^)]+\)' skill/SKILL.md || true)
ok "SKILL.md internal links resolve"

echo ""
echo -e "${GREEN}All validations passed.${NC}"

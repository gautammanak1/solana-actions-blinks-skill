#!/bin/bash

# Solana Actions & Blinks Skill — Standard Installer

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="solana-actions-blinks"

install_to() {
  local target="$1"
  local label="$2"

  echo -e "${CYAN}→${NC} ${label}: ${target}"

  rm -rf "$target"
  mkdir -p "$target"

  cp -r "$SCRIPT_DIR/skill/"* "$target/"
  cp -r "$SCRIPT_DIR/commands" "$target/commands"
  cp -r "$SCRIPT_DIR/agents" "$target/agents"
  cp -r "$SCRIPT_DIR/templates" "$target/templates"

  echo -e "  ${GREEN}✓${NC} skill + commands + agents + templates"
}

print_banner() {
  echo ""
  echo -e "${MAGENTA}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${MAGENTA}║${NC}  ${WHITE}Solana Actions & Blinks Skill${NC}                               ${MAGENTA}║${NC}"
  echo -e "${MAGENTA}║${NC}  ${CYAN}6 action types · real Jupiter API · working templates${NC}       ${MAGENTA}║${NC}"
  echo -e "${MAGENTA}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

SKIP=false
[[ "${1:-}" == "-y" || "${1:-}" == "--yes" ]] && SKIP=true

print_banner

echo -e "${WHITE}Installs:${NC}"
echo -e "  ${BLUE}•${NC} ~/.cursor/skills/${SKILL_NAME}"
echo -e "  ${BLUE}•${NC} ~/.claude/skills/${SKILL_NAME}"
echo -e "  ${BLUE}•${NC} Each includes: skill/, commands/, agents/, templates/"
echo ""

if [ "$SKIP" = false ]; then
  read -p "Proceed? [Y/n] " -n 1 -r
  echo
  [[ $REPLY =~ ^[Nn]$ ]] && exit 0
fi

mkdir -p "$HOME/.cursor/skills" "$HOME/.claude/skills"

install_to "$HOME/.cursor/skills/$SKILL_NAME" "Cursor"
install_to "$HOME/.claude/skills/$SKILL_NAME" "Claude Code"

if [ -f "$SCRIPT_DIR/CLAUDE.md" ]; then
  mkdir -p "$HOME/.claude"
  [ -f "$HOME/.claude/CLAUDE.md" ] && cp "$HOME/.claude/CLAUDE.md" "$HOME/.claude/CLAUDE.md.backup.$(date +%s)"
  cp "$SCRIPT_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
  echo -e "${GREEN}✓${NC} CLAUDE.md"
fi

echo ""
echo -e "${GREEN}Done!${NC} Try:"
echo -e "  ${BLUE}/build-tip-action${NC}"
echo -e "  ${BLUE}/build-swap-action${NC}"
echo -e "  ${BLUE}/test-blink https://yourdomain.com/api/actions/transfer-sol${NC}"
echo ""
echo -e "Inspector: ${CYAN}https://www.blinks.xyz/inspector${NC}"
echo -e "Submit PR: ${YELLOW}https://github.com/solanabr/skill-bounty${NC}"
echo ""

#!/bin/bash
# Solana Actions & Blinks Skill — Custom Installer

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
WHITE='\033[1;37m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_NAME="solana-actions-blinks"

copy_skill() {
  local target="$1"
  rm -rf "$target"
  mkdir -p "$target"
  cp -r "$SCRIPT_DIR/skill/"* "$target/"
  cp -r "$SCRIPT_DIR/commands" "$target/commands"
  cp -r "$SCRIPT_DIR/agents" "$target/agents"
  cp -r "$SCRIPT_DIR/templates" "$target/templates"
}

echo ""
echo -e "${WHITE}Solana Actions & Blinks — Custom Install${NC}"
echo ""
echo "1) Personal — ~/.cursor/skills/ + ~/.claude/skills/"
echo "2) Project only — ./.cursor/skills/ (this repo)"
echo "3) Cursor only — ~/.cursor/skills/"
echo "4) Claude only — ~/.claude/skills/"
echo ""
read -r -p "Choice [1-4] (default 1): " choice
choice="${choice:-1}"

case "$choice" in
  1)
    copy_skill "$HOME/.cursor/skills/$SKILL_NAME"
    copy_skill "$HOME/.claude/skills/$SKILL_NAME"
    echo -e "${GREEN}✓${NC} Installed to Cursor + Claude personal skills"
    ;;
  2)
    mkdir -p .cursor/skills
    copy_skill ".cursor/skills/$SKILL_NAME"
    echo -e "${GREEN}✓${NC} Installed to .cursor/skills/$SKILL_NAME"
    ;;
  3)
    copy_skill "$HOME/.cursor/skills/$SKILL_NAME"
    echo -e "${GREEN}✓${NC} Installed to ~/.cursor/skills/$SKILL_NAME"
    ;;
  4)
    copy_skill "$HOME/.claude/skills/$SKILL_NAME"
    echo -e "${GREEN}✓${NC} Installed to ~/.claude/skills/$SKILL_NAME"
    ;;
  *)
    echo "Invalid choice"; exit 1
    ;;
esac

read -p "Install CLAUDE.md to ~/.claude/? [Y/n] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
  mkdir -p "$HOME/.claude"
  [ -f "$HOME/.claude/CLAUDE.md" ] && cp "$HOME/.claude/CLAUDE.md" "$HOME/.claude/CLAUDE.md.backup.$(date +%s)"
  cp "$SCRIPT_DIR/CLAUDE.md" "$HOME/.claude/CLAUDE.md"
  echo -e "${GREEN}✓${NC} CLAUDE.md installed"
fi

echo ""
echo -e "${GREEN}Done.${NC} Entry point: skill/SKILL.md"
echo -e "Test: ${CYAN}/build-tip-action${NC} or ${CYAN}/test-blink <action-url>${NC}"
echo ""

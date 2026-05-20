#!/usr/bin/env zsh

cd "$(dirname "$0")/.."

printf '\e[8;42;85t'

GREEN='\x1b[32m'
YELLOW='\x1b[33m'
NC='\x1b[0m'

clear
echo ""
echo -e "${YELLOW}  ┌──────────────────────────────────────────────────┐${NC}"
echo -e "${YELLOW}  │${NC}          STEVEN CASTEEL // ${GREEN}SOURCE ENGINE${NC}         ${YELLOW}│${NC}"
echo -e "${YELLOW}  │${NC}             Compiling AI Context...              ${YELLOW}│${NC}"
echo -e "${YELLOW}  └──────────────────────────────────────────────────┘${NC}"
echo ""

node scripts/create_source_context.js

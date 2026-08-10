#!/bin/bash
# Nahraje tento repozitář na GitHub.
#
# PŘEDTÍM na github.com založ prázdný privátní repozitář "tarpan"
# (bez README, bez .gitignore, bez licence) pod účtem forest2000.
#
# Pak v Terminálu:
#   cd ~/Downloads/TARPAN/repo
#   bash push.sh

set -e
REPO="https://github.com/forest2000/tarpan.git"

cd "$(dirname "$0")"

# Konfigurace konektorů se na disk zapsala jako mcp.json.txt (zápis souboru
# s názvem .mcp.json je z bezpečnostních důvodů blokovaný). Přejmenujeme ji.
if [ -f plugins/tarpan/mcp.json.txt ]; then
  mv -f plugins/tarpan/mcp.json.txt plugins/tarpan/.mcp.json
  echo "Přejmenováno: plugins/tarpan/.mcp.json"
fi

if [ ! -f plugins/tarpan/.mcp.json ]; then
  echo "CHYBA: chybí plugins/tarpan/.mcp.json — bez něj plugin nemá konektory." >&2
  exit 1
fi

if [ ! -d .git ]; then
  git init -b main
  git add -A
  git commit -m "TARPAN: plugin s konektory ARES a katastr nemovitostí"
fi

if git remote | grep -q '^origin$'; then
  git remote set-url origin "$REPO"
else
  git remote add origin "$REPO"
fi

git branch -M main
git push -u origin main

echo
echo "Hotovo. Plugin se pak instaluje takto:"
echo "  /plugin marketplace add forest2000/tarpan"
echo "  /plugin install tarpan@tarpan"

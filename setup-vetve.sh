#!/bin/bash
# Vytvoří testovací větev dev a nahraje ji na GitHub.
# Spustit jednou, ve složce repozitáře:  bash setup-vetve.sh
set -e
cd "$(dirname "$0")"

git add -A
git diff --cached --quiet || git commit -m "Dokumentace vývoje: větve dev/main, verzování, distribuce firmě"
git push origin main

if git show-ref --verify --quiet refs/heads/dev; then
  git checkout dev
  git merge main -m "sync z main"
else
  git checkout -b dev
fi
git push -u origin dev

echo
echo "Hotovo. Jste ve větvi dev."
echo "  ostrá verze pro firmu : main"
echo "  testování             : dev"
echo
echo "Testovací marketplace si v Claude Code přidáte takto:"
echo "  /plugin marketplace add https://github.com/forest2000/tarpan.git#dev"

# TARPAN — marketplace pluginu

Repozitář slouží jediné věci: distribuci pluginu **TARPAN** do Claude.

## Instalace

V Claude: **Plugins → Add → Add marketplace** a vložit adresu tohoto repozitáře.
Pak plugin `tarpan` nainstalovat ze seznamu.

## Co plugin přináší

Čtyři konektory (ARES, katastr nemovitostí ČR, Sagasu, Salvia) a skill `tarpan`
s metodikou práce s veřejnými rejstříky, judikaturou a výpisy do Wordu
v úpravě TARPAN.

## Vydání nové verze

1. upravit soubory v `plugins/tarpan/`
2. zvednout `version` v `plugins/tarpan/.claude-plugin/plugin.json`
   **i** v `.claude-plugin/marketplace.json` — bez toho se nová verze
   k uživatelům nedostane
3. `git commit` a `git push`
4. uživatelé: **Plugins → marketplace tarpan → Update**

Zdrojové kódy workerů, testy a vývojová dokumentace jsou ve vývojovém
repozitáři `forest2000/tarpan`; sem patří jen to, co se instaluje.

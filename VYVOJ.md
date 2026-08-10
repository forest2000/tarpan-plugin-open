# Vývoj a distribuce

Repozitář je zároveň marketplace. Ostrá verze pro celou firmu je ve větvi
`main`, testovací ve větvi `dev`. Repozitář zůstává **privátní** — organizační
distribuce ho čte přes Claude GitHub App, takže kolegové nepotřebují přístup ke
GitHubu ani vlastní git přihlášení.

```
dev   ──►  testujete sami, kolegové to nevidí
 │
 └─ merge ──►  main  ──►  automaticky celé firmě
```

## Jednorázové nastavení

### 1. Claude GitHub App

github.com → **Settings** → **Applications** → **Installed GitHub Apps** →
u **Claude** dát **Configure** → **Repository access** → přidat `tarpan` → **Save**.

Bez tohohle kroku hlásí Claude „Repository not accessible".

### 2. Distribuce firmě

claude.ai → **Nastavení organizace** → **Pluginy** → přidat marketplace
`forest2000/tarpan` (větev `main`). Od té chvíle plugin dostane každý v týmu
automaticky, včetně dalších změn — nic si nepřidává ani neaktualizuje.

Podmínky, které tahle cesta klade a které tenhle repozitář splňuje: marketplace
musí být privátní nebo interní, plugin leží uvnitř téhož repozitáře a odkazuje
se na něj relativní cestou (`./plugins/tarpan`). Plugin v cizím privátním
repozitáři by se nenačetl.

### 3. Testovací větev u vás

V Claude Code na počítači:

```
/plugin marketplace add https://github.com/forest2000/tarpan.git#dev
/plugin install tarpan@tarpan
/reload-plugins
```

Aby se `dev` sám obnovoval: `/plugin` → záložka **Marketplaces** → vybrat
marketplace → **Enable auto-update**. U privátních repozitářů přes HTTPS umí
obnovování na pozadí selhat, protože nepoužívá uložené přihlašovací údaje.
Pomůžou dvě věci:

```bash
gh auth setup-git
export CLAUDE_CODE_PLUGIN_KEEP_MARKETPLACE_ON_FAILURE=1
```

Druhá proměnná zajistí, že při neúspěšném obnovení zůstane poslední funkční
kopie místo smazání a nového stažení.

## Běžný postup při změně

```bash
cd ~/Downloads/TARPAN/repo
git checkout dev
# … úpravy …
cd workers/tarpan-katastr && node test/offline-test.mjs && cd ../..
git add -A && git commit -m "co se změnilo" && git push
```

Vyzkoušet v Claude (`/plugin marketplace update tarpan`, `/reload-plugins`),
a když to sedí, povýšit:

```bash
git checkout main
git merge dev
git push
git checkout dev
```

## Verzování — na tohle pozor

V `.claude-plugin/marketplace.json` je u pluginu pole `version`. Dokud se jeho
hodnota nezmění, **uživatelé novou verzi nedostanou**, i když do větve pushnete
sebevíc commitů. Je to pojistka proti tomu, aby se lidem plugin měnil pod rukama.

Pravidlo: měníte-li něco, co se má dostat ven, zvedněte `version` v
`.claude-plugin/marketplace.json` i v `plugins/tarpan/.claude-plugin/plugin.json`
(obě čísla držte stejná). Ve větvi `dev` klidně `1.1.0-dev.1`, `1.1.0-dev.2`,
v `main` pak `1.1.0`.

Mění-li se vstupy nástrojů konektoru, musí uživatel konektor vypnout a znovu
zapnout, aby se načetl nový seznam nástrojů — samotná aktualizace pluginu na to
nestačí.

## Co kde leží

| Cesta | Co to je | Kdy se to projeví |
|---|---|---|
| `plugins/tarpan/` | plugin — konektory a skill | po aktualizaci marketplace |
| `.claude-plugin/marketplace.json` | katalog a číslo verze | po aktualizaci marketplace |
| `workers/tarpan-katastr/src/` | kód konektoru katastr | až po `wrangler deploy` |
| `workers/tarpan-ares/` | build konektoru ARES | až po nasazení na Cloudflare |

Workery s pluginem nesouvisí — plugin jen odkazuje na jejich adresy. Změna
v `workers/` se sama nikam nerozšíří, dokud ji nenasadíte na Cloudflare.

## Před každým pushem

Ať se do repozitáře nedostane API klíč:

```bash
git diff --cached | grep -i -E "apikey|secret|token|ghp_" || echo "čisté"
```

Klíč ČÚZK patří výhradně do Cloudflare secretu `CUZK_KN_API_KEY`.

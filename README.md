# TARPAN

Nástroje pro práci s českými veřejnými rejstříky, judikaturou a právními výpočty
v Claude: plugin **TARPAN** a čtyři MCP konektory — **ARES** a **katastr
nemovitostí** (vlastní Cloudflare Workers, zdrojáky jsou v tomto repozitáři),
**Sagasu** (insolvence, DPH, datové schránky, zaniklé subjekty, SK rejstříky,
advokáti, výpočty) a **Salvia** (judikatura a předpisy). Součástí je generování
výpisů do Wordu v jednotné grafické úpravě.

Repozitář je zároveň marketplace, ze kterého se plugin instaluje.

## Instalace pluginu

```
/plugin marketplace add forest2000/tarpan
/plugin install tarpan@tarpan
```

Plugin s sebou přináší oba konektory. Máte-li je přidané ručně v nastavení
konektorů, po instalaci je odeberte — jinak by byly dvakrát.

## Obsah repozitáře

```
.claude-plugin/marketplace.json   katalog pro /plugin marketplace add
plugins/tarpan/                   samotný plugin — konektory + skill
workers/tarpan-katastr/           zdrojáky workeru pro katastr
workers/tarpan-ares/              build workeru pro ARES
```

### plugins/tarpan

`.mcp.json` se všemi čtyřmi konektory a skill `tarpan` s metodikou: kam se kterým
dotazem, jak identifikovat subjekt a nemovitost, jak je propojit přes kód
adresního místa RÚIAN, jak vypadá prověrka protistrany krok za krokem a co která
databáze neposkytuje. Podrobnosti jsou ve čtyřech souborech
v `skills/tarpan/references/`.

`tarpan-ares` a `tarpan-katastr` jsou v `.mcp.json` uvedené adresou, `Sagasu`
a `Salvia` jménem — jde o konektory organizace, jejichž endpoint se nastavuje
při připojení.

### workers/tarpan-katastr

Kompletní zdrojáky. `src/index.js` je MCP server nad všemi 41 endpointy API KN
(18 nástrojů), `src/vypis.js` generátor výpisu do RTF. Nasazení a ověření
popisuje [NASAZENI.md](workers/tarpan-katastr/NASAZENI.md).

```bash
cd workers/tarpan-katastr
node test/offline-test.mjs     # test bez sítě a bez API klíče
npx wrangler deploy
npx wrangler secret put CUZK_KN_API_KEY
```

Test ověřuje, že se parametry nástrojů mapují na skutečné query parametry ČÚZK,
a že vygenerované RTF má vyvážené závorky — běží offline na vzorových datech,
takže nespotřebovává denní limit volání.

### workers/tarpan-ares

Zde je zatím jen sestavený build (`tarpan-ares.bundle.js`), ne původní zdrojáky —
byl vytažen z běžícího workeru. Úpravy, které v něm jsou, a postup, jak je
promítnout do vlastních zdrojáků, popisuje [UPRAVA-ARES.md](workers/tarpan-ares/UPRAVA-ARES.md).
Až sem přibudou původní zdrojáky, tenhle build je nahradí.

## Přístupové údaje

V repozitáři nejsou a nemají tu co dělat. Worker pro katastr čte API klíč ČÚZK
z Cloudflare secretu `CUZK_KN_API_KEY`, worker pro ARES žádné přihlašovací údaje
nepotřebuje. Oba konektory jsou bez OAuth — uživatel v Claude nic nezadává.

## Co je dobré vědět

REST API ČÚZK **neposkytuje jména vlastníků, podíly ani nabývací tituly** —
vrací číslo LV a katastrální území. Vlastníka lze ověřit v Nahlížení do KN nebo
úplným výpisem z katastru; skill na to sám upozorňuje a do výpisu doplňuje
proklik. Přehled vlastnictví pro konkrétní osobu API neumí vůbec — na to je
potřeba dálkový přístup ČÚZK nebo katastrální pracoviště.

API KN má limit **500 volání za den**; zbývající limit vrátí nástroj `kn_sluzba`
s `co: "stav_uctu"`. Vyhledávání polygonem je navíc omezené na 5 000 m².

Výpisy generované těmito nástroji mají informativní charakter, nejsou veřejnou
listinou a nenahrazují výpis vydaný podle § 55 katastrálního zákona.

## Větve a distribuce

`main` je ostrá verze, kterou dostává celá firma přes organizační distribuci
pluginů; `dev` je testovací. Repozitář zůstává privátní — čte ho Claude GitHub
App, kolegové přístup ke GitHubu nepotřebují.

Postup při změnách, verzování a jednorázové nastavení popisuje [VYVOJ.md](VYVOJ.md).
Podstatné je jedno: dokud nezvednete `version` v `.claude-plugin/marketplace.json`,
nová verze se k uživatelům nedostane.

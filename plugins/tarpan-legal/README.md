# TARPAN Legal

Balíček pro advokáty. K základu TARPAN (veřejné rejstříky, katastr, výpočty)
přidává **prameny práva** a metodiku, jak s nimi pracovat, aby výsledek obstál
při kontrole každého slova.

Instaluje se jedním příkazem; základ se doinstaluje sám:

```
/plugin install tarpan-legal@tarpan
```

## Konektory

| Konektor | Zdroj dat |
|---|---|
| `esbirka` | veřejné API systému eSeL — **e-Sbírka** (znění předpisů včetně znění ke dni, konsolidace, historie, novelizace a derogace, nálezy ÚS, souvislosti, upozornění a konsolidační konflikty, CzechVoc) a **e-Legislativa** (legislativní proces, návrhy, vrstvy, připomínková řízení, pozměňovací návrhy) |
| `Salvia` | judikatura obecných soudů, NS, NSS, ÚS a insolvenčního rejstříku, znění českých předpisů |
| `komentar` | komentářová literatura k deseti předpisům — OZ, ZOK, ZPr, OSŘ, TrZ, TrŘ, InsZ, ZMPS, VerRej, ER; umí i porovnat výklad téhož § ve více publikacích |
| `tarpan-eurlex` | `eu_*` — unijní právo: nařízení a směrnice, konsolidovaná znění, platnost, judikatura SDEU, transpozice do ČR (EUR-Lex a CELLAR) |

`esbirka`, `komentar` a `tarpan-eurlex` běží jako Cloudflare Workers. Zdrojáky, testy
a postup nasazení jsou ve vývojovém repozitáři `forest2000/tarpan` (`workers/tarpan-esbirka/`, `workers/tarpan-eurlex/`). Veřejné API eSeL vyžaduje
registraci klienta u MV ČR; TARPAN Legal ji má a autorizační klíč drží worker
jako secret — uživatel v Claude nic nezadává. `Salvia` je konektor organizace.

## Skilly

| Skill | K čemu |
|---|---|
| `advokat` | metodika právní práce: od skutku k normě, výklad předpisu, práce s judikaturou, formát kanceláře |
| `pravni-reserse` | důkladná rešerše tam, kde záleží na úplnosti pokrytí a na podloženosti každého tvrzení |
| `kontrola-smlouvy` | kontrola a připomínkování smlouvy pro konkrétní stranu, s návrhy znění a ústupovými pozicemi |
| `nda` | rychlé posouzení dohody o mlčenlivosti — deset okruhů, klasifikace, redliny |
| `triaz-zadani` | co je nová věc zač, jaké lhůty běží, co doptat, než se začne |
| `gdpr` | posouzení zpracování osobních údajů, zpracovatelská smlouva, žádost subjektu údajů |

Detailní metodika je v `references/` u každého skillu a načítá se až ve chvíli,
kdy je potřeba — tělo skillu je rozcestník.

**`advokat` a `pravni-reserse` se doplňují:** první je způsob, jak přemýšlet,
druhý postup, jak nic nepřehlédnout. U krátké otázky stačí první, u rešerše
běží oba.

Skilly `kontrola-smlouvy`, `nda`, `triaz-zadani` a `gdpr` vycházejí strukturou
z pluginu `legal` od Anthropicu ([knowledge-work-plugins][kwp], Apache-2.0).
Obsah je přepsaný na české právo a na roli **externí advokátní kanceláře** —
původní verze jsou psané pro podnikové právní oddělení v USA, kde platí jiné
právo i jiné role. Uvedení zdroje je v patě každého z těch čtyř souborů.

[kwp]: https://github.com/anthropics/knowledge-work-plugins

## Co je dobré vědět

Veřejné API e-Sbírky poskytuje **znění předpisů, jejich strukturu a vazby**,
nikoli komentáře ani judikaturu. Právě proto jsou v balíčku tři konektory:
`esbirka` na přesné znění, `Salvia` na rozhodnutí soudů, `komentar` na výklad.

**Komentář stárne jinak než zákon.** `get_commentary` vrací u každé publikace
datum poslední aktualizace; je-li starší než poslední novela dotčeného §, může
být výklad překonaný. Skilly na to upozorňují a vedou k ověření přes
`esbirka_historie`.

**Unijní právo má vlastní konektor.** e-Sbírka je české právo; nařízení a směrnice
řeší `tarpan-eurlex` (EUR-Lex a CELLAR). Obojí se nepřebíjí — u otázky, která má
unijní i českou vrstvu, se volají oba a ve výstupu se rozliší, co je unijní a co
české. Pro českou prováděcí úpravu (např. zákon č. 110/2019 Sb.) slouží e-Sbírka
a Salvia normálně.

**Nejdřív `eu_identifikace`, teprve pak čti.** Jen tenhle nástroj existenci aktu
ověří dotazem; ostatní berou CELEX jako vstup. Zkonstruovaný a neověřený CELEX je
nepravdivé tvrzení o právu — skilly proto ověření vyžadují.

**Fulltext v předpisech EU má denní kvótu 1 000 volání.** Po vyčerpání (a dokud
nejsou nastavené přihlašovací údaje k EUR-Lex webservice) `eu_vyhledat` nepadá —
degraduje na hledání pouze v názvech aktů a napíše to do odpovědi. Zbytek kvóty
ukáže `eu_sluzba`. Ostatních sedm nástrojů žádné přihlašovací údaje nepotřebuje.

**Konsolidovaná znění nejsou autentická.** Autentický je jen text vyhlášený
v Úředním věstníku; konsolidace se cituje s datem a s poznámkou, že nemá právní
hodnotu. Stejně tak „v platnosti" není totéž co „použitelné" — konektor vrací jen
to, co je v datech, a výklad nechává na advokátovi.

**NIM (transpozice) je neúplný.** Vnitrostátní prováděcí opatření notifikují
členské státy samy; data jsou neúplná, nezávazná a neobsahují mapování na
jednotlivé paragrafy — to existuje jen ve srovnávacích tabulkách ISAP, které
nemají API. U nařízení se NIM nevede vůbec.

Identifikátor ustanovení (`fragmentId`) platí ke konkrétnímu znění. Neukládá se
natrvalo — ke znění se vracejte přes stálé URL předpisu.

Návrhy z e-Legislativy nejsou platné právo. Skill je nechává označovat jako
návrh ve fázi legislativního procesu, se stavem.

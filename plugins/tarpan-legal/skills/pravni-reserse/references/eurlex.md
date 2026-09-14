# EUR-Lex a CELLAR — identifikátory, citace a pasti

Referenční list ke konektoru `tarpan-eurlex`. Slouží k tomu, abys **rozuměl** tomu, co
ti nástroje vracejí, a uměl to správně citovat. **Neslouží k tomu, aby sis podle něj
identifikátory konstruoval a rovnou je použil** — ověřený CELEX dává jedině
`eu_identifikace`.

## CELEX — jak je poskládaný

CELEX je hlavní identifikátor dokumentu v EUR-Lexu: **sektor + rok + deskriptor + číslo**.

### Sektory

| Sektor | Co obsahuje |
|---|---|
| 1 | Smlouvy |
| 2 | mezinárodní smlouvy |
| 3 | legislativa |
| 4 | doplňkové právo |
| 5 | přípravné akty |
| 6 | judikatura |
| 7 | vnitrostátní prováděcí předpisy |
| 8 | vnitrostátní judikatura |
| 9 | parlamentní otázky |
| 0 | konsolidovaná znění |

### Deskriptory sektoru 3 (legislativa)

`R` nařízení · `L` směrnice · `D` rozhodnutí · `H` doporučení

### Deskriptory sektoru 6 (judikatura)

`CJ` rozsudek Soudního dvora · `CO` usnesení · `CC` stanovisko generálního advokáta ·
`CV` posudek · `CN` / `CA` oznámení · `TJ` / `TO` Tribunál · `FJ` / `FO` Soud pro
veřejnou službu.

## Od citace k CELEXu

Tohle je čtení, ne návod na hádání. Ověřuje se přes `eu_identifikace`.

| Citace | CELEX | Proč |
|---|---|---|
| nařízení (EU) 2016/679 | `32016R0679` | číslo se doplní nulami na 4 místa |
| směrnice 2014/24/EU | `32014L0024` | přípona `/EU` se zahazuje |
| nařízení (EU) č. 1215/2012 | `32012R1215` | starý režim `č. N/RRRR` |
| nařízení (EHS) č. 1408/71 | `31971R1408` | rok se doplní na 4 místa |

Opravy mají příponu `R(NN)` — například `32013L0053R(01)`. Od 1. 10. 2023 mohou mít
čísla **pět míst s vedoucí nulou** (`32025D03441`).

## Judikatura — číslo věci, ECLI, CELEX

- **Číslo věci → CELEX:** „C-311/18“ → `62018CJ0311`. Rok v CELEXu je rok **podání**
  věci, nikoli rok rozsudku.
- **ECLI se algoritmicky nepřevádí.** `ECLI:EU:C:2020:559` = `62018CJ0311` — ECLI nese
  rok rozhodnutí, CELEX rok podání. Převod jde **jen lookupem** (`eu_identifikace`).
- **Jedna věc = víc dokumentů s různým CELEXem:** rozsudek `62018CJ0311`, stanovisko
  generálního advokáta `62018CC0311`, oznámení o nové věci `62018CN0311`, oznámení
  v Úředním věstníku `62018CA0311`. Celý balík vrací `eu_vec`.

## Citační norma

**Úřední věstník má dva režimy** podle data vyhlášení:

- do 30. 9. 2023 — `Úř. věst. L 119, 4. 5. 2016, s. 1`
- od 1. 10. 2023 — `Úř. věst. L, 2023/2854, 22. 12. 2023` (bez čísla vydání a bez stran)

**Judikatura:**

> rozsudek Soudního dvora ze dne 16. července 2020, Data Protection Commissioner
> v. Facebook Ireland a Schrems, C-311/18, EU:C:2020:559, bod 184

ECLI se píše **bez prefixu „ECLI:“** — tak ho používá i soud sám.

**Ustanovení:** u předpisů EU `čl. 6 odst. 1 písm. f)`, u českých zákonů `§`.

## Konsolidovaná znění

Konsolidované znění má CELEX sektoru 0 ve tvaru `02016R0679-20160504` a existuje **jen
k datům, kdy nabyla účinnosti nějaká novela** — ne ke každému dni, který si vymyslíš.
Seznam existujících konsolidací vrací `eu_predpis`.

**Konsolidované znění nemá právní hodnotu.** Autentický je pouze text vyhlášený
v Úředním věstníku. Konsoliduje-li se, cituj vždy s datem konsolidace a s touto
poznámkou. Konektor disclaimer připojuje sám — nesmíš ho ve výstupu zamlčet ani
shrnout pryč.

## Platnost není použitelnost

„V platnosti“ a „použitelné“ jsou dvě různé věci — řada aktů má odloženou nebo
odstupňovanou použitelnost. Konektor vrací **jen to, co je v datech** (vstup
v platnost, konec platnosti). Odloženou použitelnost si nedovozuj: napiš, co je
v datech, a výklad nech na advokátovi.

## Druh vazby u judikatury

`eu_judikatura` u každého rozhodnutí vrací pole `vazba`:

- `vyklad` — rozhodnutí ustanovení **vykládá**; nejsilnější signál pro rešerši
- `predbezna_otazka` — řízení o předběžné otázce k tomuto aktu
- `nesplneni_povinnosti` — rozsudek o nesplnění povinnosti
- `citace` — akt je jen citován

Řadí se od výkladu k pouhé citaci; `jen_vyklad: true` citace vynechá. Rozdíl je
řádový: u GDPR přes 3 000 rozhodnutí akt cituje, ale jen kolem 140 ho vykládá.
**Při rešerši sahej nejdřív po výkladu**; k pouhým citacím teprve tehdy, když výklad
na otázku neodpovídá.

Vazba je v datech na úrovni **celého aktu, nikoli článku**. Filtr `clanek` je textový
dofiltr nad staženými rozhodnutími a může být neúplný — nástroj to v odpovědi hlásí
a ty to musíš brát v úvahu, než prohlásíš, že k článku judikatura není.

## Transpozice (NIM)

Vnitrostátní prováděcí opatření notifikují **členské státy samy**. Data jsou proto
**neúplná, nezávazná** a **neobsahují mapování na jednotlivé paragrafy**. To existuje
pouze ve srovnávacích tabulkách ISAP, které nemají API.

**U nařízení se NIM nevede vůbec** — adaptační zákony (například zákon č. 110/2019 Sb.
ke GDPR) tam nehledej; konektor to výslovně říká, místo aby vrátil prázdný seznam.

Praktický postup: `eu_transpozice` řekne, **který český předpis** směrnici provádí;
jeho znění si pak načti ze Salvie nebo e-Sbírky. Přiřazení konkrétního § ke konkrétnímu
článku směrnice je **tvůj závěr** a jako takový ho musíš označit.

## Jazyk

Dostupnost jazykových verzí závisí na datu přijetí aktu — u starších aktů české znění
nemusí existovat vůbec. CELLAR v takovém případě tiše podstrčí jiný jazyk, proto
`eu_text` vrací pole `vraceny_jazyk` a `jazyk_odpovida`. **Liší-li se vrácený jazyk od
požadovaného, musí to být v odpovědi klientovi vidět** — citovat anglické znění jako
české je vada.

## Fulltextové vyhledávání (eu_vyhledat)

`eu_vyhledat` je od verze 1.1.0 plná expert-search, ne jen hledání v předpisech. Výchozí
je fulltext předpisů; ostatní schopnosti zapneš parametry:

- `kolekce` — kde hledat: `predpisy` (výchozí), `judikatura` (rozhodnutí SDEU a Tribunálu),
  `mezinarodni_smlouvy`, `pripravne_akty`, `vnitrostatni_transpozice`, `parlamentni_otazky`,
  `efta`. **Fulltext judikatury SDEU dělej přes `kolekce: "judikatura"`** — je to jiná věc
  než `eu_judikatura`, které vrací vazby judikatury ke konkrétnímu aktu z grafu
  (citace/výklad/předběžná otázka), nikoli fulltext.
- `pole` — `text` (výchozí) / `nazev` / `text_i_nazev`.
- `operator` — `vse` (všechna slova, výchozí) / `libovolne` / `fraze` (přesná fráze) / `blizkost`.
- `typ` (nařízení/směrnice/rozhodnutí), `autor`, `eurovoc`, `predmet`, `pravni_zaklad` — zúžení.
- `razeni`, `velikost` (1–100), `stranka` — stránkování; `stranka × velikost` nesmí překročit
  10 000, jinak konektor vrátí chybu (dotaz je pak nutné zúžit datem/kolekcí/typem).
- `bez_konsolidaci`, `jen_posledni_konsolidace` — práce s konsolidovanými zněními.
- `expert` — syrový EUR-Lex expert dotaz (např. `TI ~ emise AND AU = comm`), když parametry
  nestačí; při jeho zadání se ostatní filtry ignorují.

Ve výsledku je u položek navíc `typ`, `autor` a `odkaz`. Shrnuto: vazby judikatura↔akt řeš
`eu_judikatura`, fulltext napříč kolekcemi `eu_vyhledat`.

## Kvóta fulltextu

`eu_vyhledat` běží přes EUR-Lex webservice s **kvótou 1 000 volání za den** (reset
o 00:00 UTC; identické dotazy jdou z cache a kvótu nespotřebují). Zbytek kvóty a stav
přihlašovacích údajů ukáže `eu_sluzba` s `co: "stav_uctu"`.

Při vyčerpání kvóty — nebo dokud nejsou nastavené přihlašovací údaje — `eu_vyhledat`
**nepadá**, ale degraduje na hledání pouze v názvech aktů a napíše to do odpovědi.
Degradovaný výsledek nevydávej za fulltext.

## Časté akty

| Akt | CELEX | České provedení |
|---|---|---|
| GDPR | `32016R0679` | — (nařízení; adaptační zákon NIM nevede) |
| zadávací směrnice | `32014L0024` | zákon č. 134/2016 Sb. |
| NIS2 | `32022L2555` | zákon č. 264/2025 Sb. |
| DORA | `32022R2554` | — |
| AI Act | `32024R1689` | — |
| Data Act | `32023R2854` | — |
| Brusel I bis | `32012R1215` | — |

Cokoli, co tady není, **si nevymýšlej** — nech si to najít přes `eu_identifikace`.

## Atribuce

Podle rozhodnutí 2011/833/EU jsou texty EUR-Lexu CC BY 4.0 a metadata CC0. Každá
odpověď konektoru nese `© Evropská unie, 1998–2026 — zdroj: EUR-Lex`.

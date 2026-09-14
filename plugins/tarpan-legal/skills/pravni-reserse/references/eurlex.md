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

## Fulltext (`eu_vyhledat`)

Od verze 1.1.0 je `eu_vyhledat` plná expert-search nad EUR-Lex webservice, ne jen
hledání v předpisech. Následující postup je závazný — hledání „prostě napíšu slovo“
vrací šum a u rešerše vede k závěru „nic k tomu není“, který neplatí.

### Nejdřív: je tohle vůbec práce pro fulltext?

| Co máš | Co použij |
|---|---|
| citaci aktu nebo věci („GDPR“, „C-311/18“) | `eu_identifikace` — fulltext na tohle neplýtvej |
| akt a chceš novely, konsolidace, platnost | `eu_predpis` |
| akt a chceš judikaturu **k němu** | `eu_judikatura` (graf vazeb — výklad, předběžné otázky) |
| číslo věci a chceš celý balík dokumentů | `eu_vec` |
| **jen slova** — pojem, formulaci, téma | `eu_vyhledat` |

`eu_judikatura` a `kolekce: "judikatura"` nejsou totéž: první jde po vazbě
rozhodnutí↔akt z grafu CELLAR, druhá hledá slova v textech rozhodnutí. Ptáš-li se
„co SDEU řekl k čl. 6 odst. 1 písm. f) GDPR“, je to práce pro `eu_judikatura`.
Ptáš-li se „kde se mluví o oprávněném zájmu“, je to fulltext.

### Postup v pěti krocích

1. **Zvol kolekci.** Bez ní hledáš napříč vším a prvních dvacet výsledků bývá šum
   z přípravných aktů a parlamentních otázek.
2. **Začni úzce.** U ustáleného pojmu `operator: "fraze"`; teprve když to nic
   nevrátí, povol `vse` (všechna slova) nebo `blizkost` (slova do deseti slov od
   sebe). `libovolne` je poslední možnost — vrací nejvíc balastu.
3. **Rozhodni pole.** Hledáš-li *akt* („směrnice o praní peněz“), `pole: "nazev"`.
   Hledáš-li, *kde se o něčem mluví*, nech `text` (výchozí).
4. **Zužuj metadaty, ne slovy.** `typ`, `autor`, `eurovoc`, `predmet`,
   `pravni_zaklad`, `datum_od` / `datum_do`. Zúžení metadatem je vždy lepší než
   přidání dalšího slova do dotazu.
5. **Nález ověř.** Výsledek nese `celex`, `nazev`, `datum`, `typ`, `autor`, `odkaz` —
   **ne text**. Než akt zacituješ, protáhni ho přes `eu_identifikace` (existence
   a přesná citace) a `eu_text` (znění).

### Parametry

| Parametr | Hodnoty | Poznámka |
|---|---|---|
| `dotaz` | text, min. 3 znaky | není povinný, máš-li aspoň jeden filtr |
| `kolekce` | `predpisy` (výchozí), `judikatura`, `mezinarodni_smlouvy`, `pripravne_akty`, `vnitrostatni_transpozice`, `parlamentni_otazky`, `efta` | mapuje se na sektor CELEXu |
| `pole` | `text` (výchozí), `nazev`, `text_i_nazev` | |
| `operator` | `vse` (výchozí), `fraze`, `blizkost`, `libovolne` | `blizkost` = `NEAR10` |
| `typ` | nařízení / směrnice / rozhodnutí | česky i anglicky |
| `autor`, `eurovoc`, `predmet`, `pravni_zaklad` | kódy EUR-Lexu | `comm`, `council`… |
| `datum_od`, `datum_do` | `RRRR-MM-DD` | konektor přepíše do formátu EUR-Lexu |
| `razeni` | `datum_sestupne` (výchozí), `datum_vzestupne`, `relevance` | |
| `velikost`, `stranka` | 1–100, od 1 | `stranka × velikost ≤ 10 000`, jinak chyba |
| `bez_konsolidaci`, `jen_posledni_konsolidace` | ano/ne | práce s konsolidovanými zněními |
| `expert` | syrový dotaz | viz níže |

### Recepty

**Kde se v unijním právu mluví o skutečném majiteli**
`dotaz: "skutečný majitel"`, `operator: "fraze"`, `kolekce: "predpisy"`.

**Rozsudky SDEU k oprávněnému zájmu od roku 2020**
`dotaz: "oprávněný zájem"`, `operator: "fraze"`, `kolekce: "judikatura"`,
`datum_od: "2020-01-01"`, `razeni: "datum_sestupne"`.

**Všechny směrnice Komise k praní peněz podle názvu**
`dotaz: "praní peněz"`, `pole: "nazev"`, `typ: "směrnice"`, `autor: "comm"`.

**Co k tématu teprve leží na stole**
`kolekce: "pripravne_akty"` — návrhy a stanoviska. Nikdy to necituj jako platné
právo; je to podklad k úmyslu zákonodárce, nic víc.

**Výčet bez hledaného výrazu**
`dotaz` můžeš vynechat a nechat jen filtry (`typ`, `autor`, `datum_od`) — dostaneš
seznam aktů daného druhu za období. Hodí se na přehledy, ne na rešerši pojmu.

**Víc než dvacet výsledků**
`velikost: 100` a pak `stranka: 2, 3…`, dokud `dalsi_stranka` není `false`. Přes
10 000 (stránka × velikost) se nedostaneš — tam už se dotaz musí zúžit datem.

### Expert dotaz

Když parametry nestačí (závorky, `NOT`, kombinace polí), pošli syrový dotaz
v `expert`. Konektor ho předá webservice tak, jak je — **a všechny ostatní filtry
tím ignoruje**: `dotaz`, `pole`, `operator`, `kolekce`, `typ`, `autor`, `eurovoc`,
`predmet`, `pravni_zaklad`, `datum_od/do` i `razeni` si musíš napsat do dotazu sám.
Stránkování, jazyk a přepínače konsolidací platí dál.

| Pole | Co je | Příklad |
|---|---|---|
| `TI` | název | `TI ~ "money laundering"` |
| `TE` | text dokumentu | `TE ~ beneficial NEAR10 owner` |
| `DN` | CELEX | `DN = "32015L0849"` |
| `DTS` | sektor (3 legislativa, 6 judikatura, 5 přípravné akty, 7 transpozice) | `DTS = 6` |
| `FM_CODED` | druh aktu | `FM_CODED = DIR` (REG / DIR / DEC) |
| `AU_CODED` | autor | `AU_CODED = comm` |
| `DC` | EuroVoc deskriptor | `DC = 1459` |
| `CT` | věcná oblast | `CT = 09` |
| `LB` | právní základ | `LB = 12016E114` |
| `DD` | datum dokumentu — **formát `DD/MM/RRRR`** | `DD >= 01/01/2020` |

Operátory: `=` na kódovaná pole, `~` na text, dále `AND`, `OR`, `NOT`, `NEAR10`
a uvozovky pro přesnou frázi. **Zástupný znak `*` ani `?` nesmí stát na začátku
slova** — konektor takový dotaz odmítne dřív, než spotřebuje kvótu.

```
TI ~ "money laundering" AND FM_CODED = DIR AND DD >= 01/01/2020
```

Nezadáš-li `expert`, konektor si z parametrů poskládá totéž ve tvaru
`SELECT DN, TI_DISPLAY, DD, FM_DECODED, AU_DECODED WHERE … ORDER BY DD DESC`.
Vrácený dotaz je ve výstupu v poli `dotaz_expert` — **přečti si ho**, když
výsledek nesedí; bývá v něm vidět, že se filtr nechytil.

### Kvóta a degradovaný režim

Fulltext běží přes webservice s **kvótou 1 000 volání za den** (reset o 00:00 UTC).
Identické dotazy jdou šest hodin z cache a kvótu nespotřebují — opakovat tentýž
dotaz tedy nic nestojí, měnit v něm jedno slovo stojí volání. Zbytek kvóty ukáže
`eu_sluzba` s `co: "stav_uctu"`; je i v každé odpovědi jako `zbyva_volani_dnes`.

Při vyčerpané kvótě — nebo dokud nejsou nastavené přihlašovací údaje —
`eu_vyhledat` **nepadá, ale degraduje**: hledá pouze v **názvech** aktů přes
SPARQL a napíše to do odpovědi (`rezim: "degradovaný…"`). V tom režimu se
neuplatní ani expert dotaz, ani věcné filtry. **Degradovaný výsledek nikdy
nevydávej za fulltext** a nezakládej na něm tvrzení „k tomu nic není“ — akt, který
hledaný pojem má jen v těle, se v něm neobjeví.

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

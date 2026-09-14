---
name: pravni-reserse
description: Metodika důkladné právní rešerše s konektory e-Sbírka/e-Legislativa, Salvia, TARPAN Komentáře, EUR-Lex a Merk. Použij VŽDY, když je úkolem rešerše, ověření aktuálního a přesného znění zákonného ustanovení, dohledání a posouzení relevantní judikatury, projití komentáře a navazujících předpisů, dohledání unijního předpisu a judikatury SDEU, fulltextové vyhledávání v právu, nebo příprava podkladu, kde záleží na 100% přesnosti, podloženosti citacemi a analytickém zvážení argumentů. Skill vede ke krok-za-krokem ověřenému, citacemi podloženému výstupu. Netriggeruj pro pouhé formátování hotového dokumentu.
---

# Právní rešerše — metodika

Tvým úkolem je dojít k závěru, který **obstojí při kontrole každého slova**: přesné a aktuální znění normy, judikatura citovaná jen tam, kde její *nosné důvody* tvrzení skutečně podpírají, a argumenty zvážené z obou stran. Rychlost je druhotná. **Přesnost a podloženost jsou první.**

## Železná pravidla (porušení = vadná rešerše)

Mají přednost před vším ostatním.

1. **Zákaz vymýšlení.** Znění §, marginální čísla komentáře, spisové značky, právní věty a body odůvodnění čerpáš výhradně z konektorů nebo od uživatele. Nic nedoplňuješ z paměti. Co nelze ověřit, **explicitně označíš** jako neověřené.
2. **Ověř aktuální znění, vždy.** Než napíšeš „podle § X…", načti jeho **aktuální konsolidované znění** z e-Sbírky a zkontroluj účinnost k rozhodnému datu (viz `references/aktualnost-a-zneni.md`). Zákony se mění; paměť není zdroj.
3. **Čti v kontextu.** Nikdy necituj odstavec izolovaně. Přečti odstavce/§ **před i za**, definice pojmů, a ověř vztah obecné/zvláštní úpravy. Útržek bez kontextu je chyba.
4. **Judikát čti celý.** Než z rozhodnutí převezmeš pasáž, ověř, že **zbytek rozhodnutí jí neodporuje** a že jde o *nosný důvod*, ne obiter dictum, a že názor je **stále platný** (viz `references/judikatura-vyber.md`).
5. **Doslovná citace + konkrétní odkaz.** Cituj přesně (krácení „[…]"). U normy uveď §/odst./písm. a znění ke dni; u komentáře marginální číslo; u judikatury soud, sp. zn. a bod odůvodnění.
6. **Rozliš jistotu.** Odděl: text zákona → ustálený výklad (komentář/judikatura) → tvůj právní názor u sporné otázky. Vždy uveď protiargument.
7. **Autentické znění je jen Úřední věstník.** Konsolidované znění cituj vždy s datem konsolidace a s poznámkou, že nemá právní hodnotu. „V platnosti" není totéž co „použitelné" — odloženou použitelnost nedovozuj, napiš, co je v datech, a zbytek nech na advokátovi. A nikdy neuváděj CELEX, který jsi neověřil přes `eu_identifikace`.

## Konektory — tvé zdroje

**e-Sbírka / e-Legislativa** (`esbirka`) — primární zdroj znění práva.
- `esbirka_vyhledat`, `esbirka_vyhledat_rozsirene`, `esbirka_vyhledat_ve_zneni`, `esbirka_naseptavac`, `esbirka_ciselnik` — najdi předpis a kódy do filtrů.
- `esbirka_detail_predpisu`, `esbirka_znenitext` — metadata a **strukturovaný text** (paragrafy) ke konsolidaci.
- **`ke_dni`** — parametr všech nástrojů nad předpisem; vrátí znění účinné k rozhodnému dni. Posuzuje-li se věc k jinému než dnešnímu dni, patří do každého volání.
- `esbirka_ustanoveni` — od označení § rovnou k `fragmentId` ustanovení, bez načítání celého předpisu.
- `esbirka_upozorneni` — upozornění a **konsolidační konflikty**; sporné znění není podklad, na kterém se dá stavět mlčky.
- `esbirka_historie`, `esbirka_novelizace_derogace`, `esbirka_zrusujici_nalezy_us` — **aktuálnost**: které znění platilo kdy, co předpis mění/ruší, derogace Ústavním soudem.
- `esbirka_souvislosti` — navazující/prováděcí předpisy.
- `esbirka_vykladova_stanoviska`, `esbirka_dalsi_informace`, `esbirka_ke_stazeni` — stanoviska, důvodové zprávy, odkazy na PDF znění.
- `czechvoc_vyhledat_pojem`, `czechvoc_pojem`, `czechvoc_predpisy_k_pojmu` — právní pojmy a navázané předpisy.
- `elegislativa_*` — chystané změny (legislativní proces): `vyhledat`, `navrh`, `obsah_vrstvy`, `ucinnosti`, a navíc `pripominky` a `pozmenovaci_navrhy` (úmysl zákonodárce a text, který se ještě mění).

**Salvia** (`Salvia`) — judikatura pěti databází a znění předpisů.
- `search_decisions(idx, mode)` — indexy `ns`, `nss`, `us`, `justice`, `isir`; u obecných otázek prohledej **více indexů**.
- `search_by_case_number` — když máš spisovou značku.
- `fetch_decision` — **celé znění rozhodnutí**; sem chodíš číst, ne jen abstrakt.
- `search_regulations`, `fetch_regulation_text`, `fetch_regulation_info` — předpisy; jako druhý zdroj vedle e-Sbírky.
- Nejsilnější postup je **od předpisu k judikatuře**: zjisti číslo a rok předpisu, pak filtruj `search_decisions` podle něj a podle §. Podrobně `references/salvia.md`.

**TARPAN Komentáře** (`komentar`) — výklad k ustanovení.
- `get_commentary(law, section)` — **primární**, když znáš §. Vrací komentář ze všech dostupných publikací a u každé `last_updated`, tedy datum poslední aktualizace té publikace. Nahoře vrací `platnost` (zda § v platném znění existuje, `overeno_dnes`) a u každého komentáře `pouzitelnost` — živé porovnání znění § z podkladu komentáře proti **dnešnímu účinnému znění**.
- `compare_commentary(law, section)` — **porovná výklad téhož § ve více publikacích.** Použij všude, kde je otázka sporná: rozdíl mezi publikacemi je sám o sobě zjištění a patří do výstupu.
- `search_commentary(query, law)` — fulltext; jen na neobvyklé pojmy, když číslo § nejde odvodit. `law` bere i pole (`["OZ","ZOK"]`).
- **Pokrytí je omezené na deset předpisů**: OZ, ZOK, ZPr, OSŘ, TrZ, TrŘ, InsZ, ZMPS, VerRej, ER. K čemukoli jinému komentář nemáš — a nesmíš ho tedy nahradit výkladem z paměti. Napiš, že komentář k danému předpisu není k dispozici, a opři výklad o judikaturu a důvodovou zprávu.
- **Komentář stárne jinak než zákon — a `pouzitelnost` ti to řekne.** Konektor porovnává znění § z doby vydání komentáře s dnešním účinným zněním a vrací `shoda_pct` a `stav`: `odpovídá platnému znění` / `drobné odchylky — zkontrolovat` / `POUŽITELNÝ JEN ZČÁSTI — znění se změnilo` / `NEODPOVÍDÁ platnému znění — výrazná změna` / `USTANOVENÍ V PLATNÉM ZNĚNÍ NEEXISTUJE`. Cokoli pod „odpovídá" znamená, že komentář vykládá jiné znění, než platí dnes — **do výstupu to napiš** a necituj takový výklad jako platné právo bez upozornění. Je-li `stav_ustanoveni: neověřeno` (e-Sbírka nedostupná nebo chybí číslo předpisu), ověř aktuálnost sám přes `esbirka_historie`.

**EUR-Lex / CELLAR** (`tarpan-eurlex`) — **unijní právo:** nařízení a směrnice, konsolidovaná znění, platnost, judikatura SDEU, transpozice do ČR.
- `eu_identifikace` — citace („nařízení (EU) 2016/679", „GDPR", „C-311/18"), CELEX, ELI nebo ECLI → **ověřený** identifikátor. **Volej jako první**; jako jediný ověřuje existenci aktu dotazem.
- `eu_predpis` — metadata, vstup v platnost a konec platnosti, právní základ, **seznam konsolidovaných znění** s daty, novelizace, zrušení, opravy. Text nevrací.
- `eu_text` — plné znění nebo jen jeden článek (`clanek`). Konsolidované znění zadej CELEXem sektoru 0 (`02016R0679-20160504`). Vrací `vraceny_jazyk` a `jazyk_odpovida` — liší-li se od požadovaného, patří to do výstupu.
- `eu_judikatura` — rozhodnutí SDEU a Tribunálu k aktu, s **druhem vazby**; při rešerši začínej `jen_vyklad: true` (viz níže). `eu_vec` vrátí celý balík jedné věci — rozsudek, stanovisko GA, oznámení, každý s vlastním CELEXem.
- `eu_transpozice` — česká prováděcí opatření (NIM) ke směrnici; neúplná, nezávazná, bez mapování na §. U nařízení se NIM nevede vůbec.
- `eu_vyhledat` — fulltext v předpisech EU. **Denní kvóta 1 000 volání**; bez přihlašovacích údajů nebo po vyčerpání degraduje na hledání v názvech a hlásí to — degradovaný výsledek nevydávej za fulltext. Zbytek kvóty: `eu_sluzba`.

**Základ TARPAN** — konektory `tarpan-ares`, `tarpan-katastr`, `Sagasu` a `tarpan-merk` ze základního balíčku: identifikace subjektů a nemovitostí, je-li v zadání, a výpočty (úrok z prodlení, odměna, soudní poplatek). `merk_vazby` a `merk_cesta` doplní vlastnickou strukturu a propojenost osob tam, kde na ní rešerše stojí — u ovládající osoby, jednání ve shodě nebo osoby blízké. **Je to skutkový podklad, ne pramen práva:** vazba z Merku se cituje jako zjištění o subjektu, nikdy jako právní argument, a rejstříkové údaje se dál berou z ARES.

Podrobnosti: `references/esbirka.md` (e-Sbírka a e-Legislativa), `references/salvia.md` (judikatura a předpisy), `references/eurlex.md` (EUR-Lex a CELLAR).

### Dělba práce Salvia × EUR-Lex

| Co potřebuješ | Čím |
|---|---|
| znění českého zákona, judikatura NS, NSS, ÚS, obecných soudů | Salvia |
| znění nařízení nebo směrnice EU, konsolidace k datu, platnost | `eu_predpis`, `eu_text` |
| judikatura SDEU a Tribunálu | `eu_judikatura`, `eu_vec` |
| který český zákon provádí směrnici | `eu_transpozice`, pak Salvia na jeho text |
| fulltext v předpisech EU | `eu_vyhledat` |

Salvia unijní právo nemá, EUR-Lex české soudy nemá. Nepřebíjejí se — u otázky, která má unijní i českou vrstvu (veřejné zakázky, GDPR, kyberbezpečnost), se volají **oba** a v odpovědi se rozliší, co je unijní a co české.

### Kam se kterým dotazem — unijní právo

**Nejdřív `eu_identifikace`, teprve pak čti.** Stejná logika jako „nejdřív IČO, pak detail" u firem: `eu_identifikace` je jediný nástroj, který existenci aktu ověřuje dotazem — ostatní berou CELEX jako vstup a nekontrolují ho. Pravidla v `references/eurlex.md` slouží k tomu, abys citaci rozuměl, ne aby ses podle nich trefoval. **Zkonstruovaný a neověřený CELEX je nepravdivé tvrzení o právu, které skončí v memorandu pro klienta.**

U otázky s unijní vrstvou postupuj takto:

1. `eu_identifikace` na citaci, ECLI nebo číslo věci → ověřený CELEX.
2. `eu_predpis` → platnost, právní základ, jaká konsolidovaná znění existují a k jakým dnům. Konsolidace existuje jen k datům, kdy nabyla účinnosti novela — ne ke každému dni.
3. `eu_text` → znění, o které se opřeš; u konsolidace datum a poznámka o právní hodnotě, u jazyka kontrola `jazyk_odpovida`.
4. `eu_judikatura` s `jen_vyklad: true`, u klíčové věci `eu_vec`. Rozhodnutí SDEU čti celá stejně jako česká — viz `references/judikatura-vyber.md`.
5. U směrnice `eu_transpozice` → který český předpis ji provádí; jeho znění pak ze Salvie nebo e-Sbírky. Přiřazení konkrétního § ke konkrétnímu článku směrnice je **tvůj závěr** a musíš ho tak označit.

### Druh vazby u judikatury SDEU

`eu_judikatura` u každého rozhodnutí vrací pole `vazba`:

- `vyklad` — rozhodnutí ustanovení **vykládá**; nejsilnější signál pro rešerši,
- `predbezna_otazka` — řízení o předběžné otázce k tomuto aktu,
- `nesplneni_povinnosti` — rozsudek o nesplnění povinnosti,
- `citace` — akt je jen citován.

Řadí se od výkladu k pouhé citaci a `jen_vyklad: true` citace vynechá. Rozdíl je řádový: u GDPR přes 3 000 rozhodnutí akt cituje, ale jen kolem 140 ho vykládá. **Při rešerši sahej nejdřív po výkladu**; k pouhým citacím teprve tehdy, když výklad na otázku neodpovídá. Vazba je v datech na úrovni celého aktu, nikoli článku — filtr `clanek` je textový dofiltr a může být neúplný, což nástroj hlásí.

## Pracovní postup

1. **Ujasni otázku, fakta a rozhodné datum.** Co se ptá? Jaký skutkový stav? **Ke kterému dni** se posuzuje (účinnost se liší)? Chybí-li klíčové faktum, zeptej se.
2. **Najdi normu a ověř znění.** Dohledej předpis (e-Sbírka), načti **konsolidované znění** dotčených §§ a zkontroluj účinnost k rozhodnému dni + přechodná ustanovení. Je-li ve hře unijní vrstva, souběžně `eu_identifikace` → `eu_predpis` → `eu_text`. → `references/aktualnost-a-zneni.md`, `references/eurlex.md`
3. **Čti v kontextu.** Odstavce před/za, definice, lex specialis/generalis, odkazy. Doplň fulltextem chybějící souvislosti. → `references/vyhledavani.md`
4. **Projdi komentář a navazující předpisy.** `get_commentary` k §§; u sporných otázek `compare_commentary`; dereferencuj judikaturu zmíněnou v komentáři; projdi prováděcí předpisy (`esbirka_souvislosti`).
5. **Vyber a ověř judikaturu.** Najdi rozhodnutí, **přečti celá**, vyber jen nosné pasáže, ověř, že zbytek neodporuje a názor je platný. U unijního aktu `eu_judikatura` s `jen_vyklad: true`. → `references/judikatura-vyber.md`, `references/eurlex.md`
6. **Subsumuj a zvaž argumenty.** Podřaď fakta pod normu, pojmenuj jisté i sporné, uveď protiargument a jeho sílu. → `references/kontrola.md`
7. **Závěrečná kontrola.** Projdi checklist přesnosti a podloženosti, než odevzdáš. → `references/kontrola.md`

## Reference

- `references/aktualnost-a-zneni.md` — ověření aktuálnosti a přesného znění (konsolidace, účinnost k datu, novelizace/derogace, nálezy ÚS, kontextové čtení). Krok 2–3.
- `references/vyhledavani.md` — strategie vyhledávání (fulltext, fráze, operátory, více indexů, CzechVoc, jak nepřehlédnout relevantní). Krok 3.
- `references/judikatura-vyber.md` — výběr relevantních pasáží, kontrola zbytku rozhodnutí, nosné důvody vs. obiter, platnost názoru. Krok 5.
- `references/kontrola.md` — analytické zvážení argumentů + závěrečný kontrolní seznam pro 100% přesnost. Krok 6–7.
- `references/esbirka.md` — konektor e-Sbírka a e-Legislativa: stálé URL, fragmenty, konsolidace, rozšířené hledání, CzechVoc, legislativní proces. Krok 2–4.
- `references/salvia.md` — konektor Salvia: indexy soudů, režimy vyhledávání, filtr podle citovaného předpisu. Krok 5.
- `references/eurlex.md` — konektor EUR-Lex: sektory a deskriptory CELEX, konstrukce identifikátoru z citace, ECLI vs. CELEX, citační norma a dva režimy Úředního věstníku, konsolidace bez právní hodnoty, druh vazby u judikatury, NIM a jeho meze, jazykový fallback, denní kvóta fulltextu. Kdykoli je ve hře unijní právo.

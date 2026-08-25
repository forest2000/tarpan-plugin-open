---
name: tarpan
description: Použij VŽDY, když je potřeba zjistit údaje o firmě, podnikateli, osobě nebo nemovitosti z veřejných rejstříků, nebo spočítat úrok z prodlení, odměnu advokáta a soudní poplatek. Také na vyhotovení výpisu z ARES nebo z katastru do Wordu, na kontrolu a doplnění údajů ve smlouvě a na prověrku protistrany. Triggery: „ARES“, „rejstřík“, „IČO“, „jednatel“, „statutární orgán“, „způsob jednání“, „společníci“, „sídlo firmy“, „výpis“, „insolvence“, „nespolehlivý plátce“, „datová schránka“, „sbírka listin“, „účetní závěrka“, „advokát“, „katastr“, „parcela“, „LV“, „list vlastnictví“, „vlastník nemovitosti“, „stavba“, „byt“, „jednotka“, „katastrální území“, „právo stavby“, „plomba“, „vklad do KN“, „úrok z prodlení“, „odměna advokáta“, „soudní poplatek“, „prověřit protistranu“, „due diligence“, „Merk“, „finanční ukazatele“, „účetní výkazy“, „rozvaha“, „výsledovka“, „obrat“, „hospodářský výsledek“, „zadluženost“, „likvidita“, „bonita“, „vlastnická struktura“, „vazby firem“, „propojené osoby“, „veřejné zakázky“, „provozovny“.
---

# TARPAN — veřejné rejstříky, katastr a výpočty

Čtyři sady nástrojů. Nepoužívej je odděleně — většina reálných dotazů se dotýká
dvou i tří najednou.

| Nástroje | K čemu |
|---|---|
| `ares_*` | české ekonomické subjekty, obchodní a živnostenský rejstřík, RES, historie zápisů, **výpis do Wordu** |
| `kn_*` | katastr nemovitostí ČR — parcely, stavby, jednotky, právo stavby, řízení, **výpis do Wordu** |
| Sagasu | to, co ARES neumí: insolvence, DPH a účty, datové schránky, zaniklé subjekty, osoba → firmy, SK rejstříky, advokáti, plné texty listin, **výpočty** |
| `merk_*` | ekonomika a vazby: obrat a zisk, finanční ukazatele, účetní výkazy, **graf vlastnických a personálních vazeb**, veřejné zakázky, provozovny — CZ i SK |

Judikaturu a znění předpisů tenhle balíček neobsahuje — jsou v balíčku **TARPAN
Legal** (konektory Salvia a e-Sbírka). Nemáš-li je k dispozici, na dotaz po
judikatuře nebo znění zákona odpověz, že na to nemáš zdroj, a neodpovídej
z paměti.

## Železná pravidla

1. **Nikdy neodpovídej z paměti.** Každý údaj o konkrétní firmě, osobě,
   nemovitosti nebo rozhodnutí musí pocházet z volání nástroje v této relaci.
2. **Nejdřív identifikuj, pak čti.** Subjekt převeď na IČO, nemovitost na kód
   katastrálního území nebo části obce, rozhodnutí na spisovou značku. Při více
   shodách si nech potvrdit správnou; nehádej.
3. **Rozlišuj aktuální a historický údaj.** Vymazaného jednatele, bývalé sídlo,
   zaniklý subjekt nebo skončené právo stavby označ jako neaktuální a uveď datum.
4. **Rizika hlas jako první.** Insolvence, likvidace, nespolehlivý plátce DPH,
   plomba na nemovitosti — tohle patří na začátek odpovědi, ne na konec.
5. **Rozlišuj „rejstřík uvádí" a „lze dovodit".** Co v datech není, není.
6. **Merk není rejstřík.** Ekonomiku a vazby ber z `merk_*`, ale kdo je zapsaný
   jako statutární orgán, jak jedná a co bylo zapsáno kdy, čti **jen z ARES** —
   jedině ten má historii zápisů. Company index je bonitní skóre Merku, tedy
   model, ne zjištěný fakt; insolvenci z Merku vždy ověř v ISIR přes Sagasu.
7. **Placená volání hlídej.** Část nástrojů `merk_*` ubírá z měsíčního limitu
   předplatného — konektor to u každé takové odpovědi hlásí. Než pustíš dávku
   dotazů nebo prověrku většího seznamu, zavolej `merk_limity`.

## Kam se kterým dotazem

**Česká firma, základní obraz a výpis** → `ares_vyhledat` (název → IČO), pak
`ares_detail_vse`. Tohle je výchozí cesta. Sagasu má vlastní `firma_detail`
a `obchodni_rejstrik` a v aktuálních údajích se s ARES kryje, ale **nedává
historii zápisů** — bývalá sídla, dřívější firmu, vymazané členy orgánů ani data
vzniku a zániku funkce. Právě to potřebuješ, když ověřuješ, zda osoba směla
jednat k datu podpisu; proto na subjekt vždy `ares_*`.

### Dělba práce ARES × Sagasu

Obě sady sahají na ARES a v aktuálních údajích se kryjí. Aby se nepřebíjely,
drž se tohoto rozdělení a **netahej týž údaj z obou**:

| Co potřebuješ | Čím |
|---|---|
| identifikace, sídlo, DIČ, statutární orgán, způsob jednání, kapitál | `ares_detail_vse` |
| **historie** — dřívější firma, bývalá sídla, vymazaní členové, data funkcí, akcie | `ares_detail_vse` (Sagasu ji nemá) |
| výpis do Wordu, číselníky, notifikace o změnách | `ares_vypis`, `ares_ciselnik`, `ares_notifikace_*` |
| insolvence | `insolvence_vyhledat` |
| DPH, nespolehlivost, zveřejněné účty | `dph_status` |
| datová schránka | `datova_schranka_vyhledat` |
| **zaniklý** subjekt (ARES ho nedrží) | `verejny_rejstrik` |
| osoba → firmy a spolky, i zaniklé | `verejny_rejstrik_osoba` |
| živnostenský rejstřík **s historií adres** | `zivnostensky_rejstrik` (Sagasu) |
| slovenské subjekty | `firma_sk_*` |
| advokáti a koncipienti ČAK, SAK | `advokat_cz_*`, `advokat_sk_*` |
| **listiny a jejich plný text** | `sbirka_listin` → `listina_text` |

Sagasu nástroje `firma_detail` a `obchodni_rejstrik` tedy běžně nevolej — na
subjekt jde `ares_detail_vse`. Výjimka: subjekt, který ARES nenajde (zaniklý).

### Dělba práce s Merkem

Merk se s ARES a Sagasu překrývá v aktuálních údajích o firmě, ale **nemá historii
zápisů** a rejstříkové údaje z něj proto neber. Zato umí to, co ani ARES, ani Sagasu:

| Co potřebuješ | Čím |
|---|---|
| obrat, zisk, EBITDA, velikostní kategorie a jejich trend | `merk_firma` |
| finanční ukazatele — likvidita, zadluženost, ROA, ROE, marže, Z-skóre, index bonity | `merk_ukazatele` |
| rozvaha a výsledovka po letech, po řádcích | `merk_vykazy` |
| **kdo v firmě má podíl a jaký, kdo je ve funkci a od kdy** | `merk_vazby` |
| **jak spolu dvě firmy nebo osoby souvisejí** | `merk_osoba` → `merk_cesta` |
| veřejné zakázky subjektu | `merk_zakazky` |
| provozovny, živnosti, vozový park, inzeráty, odpady | `merk_provozovny`, `merk_licence`, `merk_vozidla`, `merk_inzeraty`, `merk_odpady` |
| vyhledání firem podle oboru, okresu, obratu nebo zisku | `merk_ciselnik` → `merk_hledat` |
| kolik placených volání zbývá | `merk_limity` |

**Původní účetní závěrku má Sagasu** (`sbirka_listin` → `listina_text`), Merk z ní
dopočítává ukazatele. Potřebuješ-li citovat listinu, cituj listinu ze sbírky; Merk je
na rychlý obraz a na srovnání v čase. Podrobnosti a pasti: `references/merk.md`.

### Sbírka listin a rozbor dokumentů

Rejstřík říká, **co je zapsáno**; listiny říkají, **co se stalo a proč**. Když
je otázka „kdy a jak se to změnilo", „kdo to schválil", „jaké má společnost
stanovy" nebo „jak si stojí hospodářsky", sáhni po listinách.

1. `sbirka_listin(ico)` → seznam s popisem, datem vzniku, zveřejnění a počtem
   listů. Funguje i pro **vymazané** společnosti. Stránkuje se (`pocet_celkem`,
   `strana`) — projdi všechny strany, ne jen první.
2. Má-li položka pole `casti`, je listina rozdělená na víc digitálních částí,
   každá s vlastním `dokument` ID. Účetní závěrka podaná přes finanční správu
   bývá `.doc` (příloha) + `.xml` (strojově čitelná závěrka) + `.pdf` (rozvaha
   a výsledovka). Pole `dokument` míří jen na první část — rozvahu čti z `.pdf`
   nebo `.xml` v `casti`.
3. `listina_text(dokument)` → plný text. Stránkuje se; jdi podle `_dalsi`, dokud
   je co číst. Vypadá-li text rozsypaně (přeházená písmena, mojibake), zavolej
   znovu s `force_ocr=True` — pak se čte po jednotlivých stránkách PDF.
4. `digitalizovan: false` znamená, že listina digitální podobu nemá; napiš to.

Z listin si ověřuj to, co z rejstříku nevyčteš: znění stanov a způsob jednání
v konkrétní době, kdo valnou hromadu svolal a kdo na ní hlasoval, jestli byl
notářský zápis pořízen, hospodářské výsledky. Vždy uveď, ze které listiny údaj
pochází — značku a datum, například „notářský zápis NZ 855/2023 z 22. 6. 2023".
A rozlišuj, co listina výslovně uvádí, od toho, co z ní dovozuješ.

**Nemovitost** → `kn_uzemi` (název → kód), pak `kn_parcela_vyhledani`,
`kn_stavba_vyhledani` nebo `kn_jednotka_vyhledani`. Podrobnosti a pasti:
`references/katastr.md`.

**Judikatura a předpisy** → jen s balíčkem TARPAN Legal. Máš-li konektor Salvia,
použij `search_regulations` (název zákona → číslo a rok) a `search_decisions`
(rozhodnutí; indexy `ns`, `nss`, `us`, `justice`, `isir`) a u obecné otázky
prohledej několik indexů, ne jeden; na přesné znění § je tam navíc konektor
`esbirka`. Bez těchto konektorů judikaturu ani znění předpisu neuváděj.

**Výpočty** → Sagasu: `urok_z_prodleni`, `odmena_advokata`, `soudni_poplatek`.
Vrací i sazbu a rozpis — uveď obojí, nejen výsledek. U úroku z prodlení je
vstupem **první den prodlení**, nikoli datum splatnosti; ten den urči sám podle
okolností a nepočítej ho mechanicky jako splatnost + 1.

## Prověrka protistrany

Tohle je nejčastější složený úkol. Projdi celý seznam, i když se uživatel ptal
jen na část — a co jsi neověřil, napiš, že jsi neověřil.

1. `ares_vyhledat` → IČO, ověř, že jde o správný subjekt
2. `ares_detail_vse` → firma, sídlo, spisová značka, statutární orgán, **způsob
   jednání**, společníci, základní kapitál, historie
3. `insolvence_vyhledat` (IČO) → probíhá insolvence?
4. `dph_status` (IČO nebo DIČ) → plátce DPH, nespolehlivost, zveřejněné účty —
   platí-li se na účet mimo zveřejněné, hrozí ručení za nezaplacenou DPH
5. `datova_schranka_vyhledat` → ID schránky pro doručování
6. `merk_firma` → ekonomický obraz: obrat a jeho trend, zisk, velikost, bonitní
   index. `merk_ukazatele` doplní likviditu a zadluženost, jde-li o plnění, které
   se bude teprve poskytovat
7. `merk_vazby` → kdo firmu ovládá a přes koho je propojená; u sporu nebo střetu
   zájmů `merk_osoba` → `merk_cesta` mezi stranami
8. jde-li o nemovitostní transakci: `kn_*` → LV, plomby, způsoby ochrany, právo
   stavby, vazba stavby k pozemku
9. je-li spor nebo sporná otázka a máš balíček Legal: Salvia → judikatura k tomu
   typu vztahu

## Propojení rejstříků

Spojkou mezi subjektem a nemovitostí je **kód adresního místa RÚIAN**, který
ARES vrací v adrese sídla: `ares_detail_vse` → kód → `kn_stavba_adresni_misto`
→ `kn_stavba_detail`. Pozor: sídlo na adrese neznamená vlastnictví budovy.

Opačným směrem katastr vlastníka nedá — viz níže. Zná-li uživatel IČO, ověř
subjekt v ARES a označ to jako údaj z ARES, ne z katastru.

Osoba → firmy jde jen přes Sagasu (`verejny_rejstrik_osoba`), včetně zaniklých
angažmá. Užitečné u prověrky jednatele protistrany.

## Co katastr NEDÁVÁ

REST API ČÚZK **neposkytuje jména a adresy vlastníků, podíly ani nabývací
tituly** — vrací číslo LV a katastrální území. Vlastníka nikdy nedomýšlej; uveď
LV, odkaz do Nahlížení do KN a napiš, že jména se ověřují tam nebo úplným
výpisem. Přehled vlastnictví pro danou osobu API neumí vůbec; na to je dálkový
přístup ČÚZK nebo katastrální pracoviště.

## Výpisy do Wordu

### Dokument nikdy nesestavuj sám

Wordovský výstup vzniká **výhradně** z generátorů v těchhle konektorech:

| Co | Čím |
|---|---|
| firma, podnikatel, prověrka protistrany, přehled sbírky listin | `ares_vypis` |
| nemovitost — parcela, stavba, jednotka, právo stavby | `kn_vypis` |

Nikdy nesestavuj výpis ani přehled sbírky listin vlastními silami — **žádný skill
`docx`, žádné python-docx, žádný markdown převedený na Word, žádné vlastní
nadpisy a tabulky.** Tyhle dokumenty odcházejí klientům a do spisu; jednotná
úprava TARPAN je jejich součástí, ne kosmetika. Dokument, který si vyrobíš sám,
je vadný, i kdyby obsahoval správná data.

Přehled sbírky listin **není samostatný dokument** — je to sekce výpisu. Data
z listin předej do `ares_vypis` v parametru `doplnky` (pole `listiny`,
`ucetniZaverky`) a generátor je vysází sám, včetně tabulky účetních závěrek
a shrnutí u jednotlivých listin.

Vrátí-li generátor chybu, nebo místo dokumentu jen odkaz, **napiš to uživateli
i s tou chybou** a skonči. Náhradní dokument nedělej — jiná grafická úprava je
horší než žádný dokument. Typická příčina bývá nenasazená verze workeru nebo
zastaralý popis nástroje v relaci; obojí se řeší mimo skill.

### Napřed se vždy zeptej, který výpis

Řekne-li uživatel „poskytni výpis", „udělej výpis", „výpis z ARES" nebo cokoli
podobného o firmě či podnikateli, **vždy** mu nejdřív polož otázku nástrojem
`AskUserQuestion` a nabídni dvě možnosti. Druhá obsahuje celou první a přidává
k ní čtení listin:

- **Úplný výpis** — všechno, co jde z konektorů získat bez čtení listin:
  `ares_detail_vse` (základní údaje, sídlo, statutární orgán a způsob jednání,
  společníci, historie zápisů, živnostenská oprávnění, evidence v registrech),
  `insolvence_vyhledat`, `dph_status`, `datova_schranka_vyhledat` a `sbirka_listin`
  jako **seznam** listin — značka, popis, datum, počet listů, bez obsahu.
- **Úplný výpis a analýza sbírky listin** — totéž a navíc se každá listina přes
  `listina_text` opravdu přečte: u neúčetních listin shrnutí, co listina
  způsobila (`udalosti`), u účetních závěrek tabulka `ucetniZaverky` s výsledkem
  hospodaření, tržbami, aktivy a vlastním kapitálem po letech. Trvá výrazně déle.

Ptej se i tehdy, když se ti volba zdá zřejmá — u prověrky protistrany stejně
jako u rychlého dotazu. Výjimka je jediná: uživatel už v zadání sám řekl, kterou
z těch dvou věcí chce („výpis včetně analýzy listin", „jen seznam listin, nečti
je"). Pak se neptej a rovnou to udělej.

### ARES

`ares_vypis` bez dalších parametrů vrátí odkaz; ten předej uživateli.

Chce-li uživatel **prověrku** nebo výpis „se vším", posbírej nejdřív data ze
Sagasu a předej je témuž nástroji v parametru `doplnky`: `insolvence` (výsledek
`insolvence_vyhledat`, i prázdný — vytiskne se zeleně jako čistý stav), `dph`
(`dph_status`), `datovaSchranka` (`datova_schranka_vyhledat`) a `listiny`
(`sbirka_listin`). Výpis pak obsahuje navíc sekce Insolvenční řízení, DPH
a bankovní účty, Datová schránka a Sbírka listin, rizika červeně, a v patičce
přiznané zdroje. V tomhle režimu nevrací odkaz, ale hotový dokument v poli
`soubor_gzip_base64` — nalož s ním stejně jako s výpisem z katastru níže.

Data ze Sagasu předávej **beze změny**, tak jak přišla. Platí tu tvrdší pravidlo
než jinde, protože výsledkem je dokument s IČO a firmou konkrétní společnosti,
který vypadá jako úřední listina:

- **Nikdy si žádnou položku nevymýšlej ani neupravuj.** Spisová značka
  insolvenčního řízení, které neexistuje, nebo obrácené `nespolehlivyPlatce`
  je o té společnosti nepravdivé tvrzení, ne technická nepřesnost.
- **Předávej seznam listin celý**, ze všech stránek, a přidej `listinyCelkem`
  z pole `pocet_celkem`. Nesedí-li počty, výpis to sám červeně ohlásí.
- Nezavolal-li jsi nástroj, sekci **nevyplňuj** — chybějící sekce je poctivá,
  vymyšlená není. Prázdná insolvence se tiskne zeleně jako doložené zjištění;
  proto ji smíš vyplnit jen tehdy, když `insolvence_vyhledat` opravdu proběhl.
- Ukázkový nebo testovací dokument nikdy nedělej na skutečnou firmu — použij
  smyšlené IČO a název.

**Shrnutí obsahu listin.** U každé listiny, kterou jsi přes `listina_text`
skutečně přečetl, vyplň pole `udalosti` — číslovaný výčet toho, co listina
způsobila, ne převyprávění jejího textu. Piš konkrétně a se jmény, funkcemi
a daty účinnosti:

- „změna zastupování — nově ‚za společnost ve všech věcech navenek samostatně
  jedná člen správní rady‘" (u změny způsobu jednání uveď původní i nové znění)
- „odvolán Martin Bernát z funkce člena správní rady s účinností k 19. 10. 2022"
- „jmenován Tomáš Hasman, nar. 12. 7. 1985, členem správní rady"
- „změna firmy z ‚Masná a.s.‘ na ‚Mincovní, a.s.‘"
- „přijato nové úplné znění stanov nahrazující stanovy ze 3. 4. 2017"

Listinu, kterou jsi nečetl, nech **bez** `udalosti` — výpis u ní sám napíše
„obsah listiny nebyl čten". Byl-li text nečitelný i po OCR, vyplň `nejisty: true`
a shrnutí označ jako předběžné.

**Účetní závěrky** dej zvlášť do pole `ucetniZaverky`: za každý rok `vysledek`
(zisk nebo ztráta s částkou), `trzby`, `aktiva`, `vlastniKapital` a `poznamka`
(například chybějící příloha nebo pozdní podání). Čísla ber z `.pdf` nebo `.xml`
části závěrky, ne z přílohy ve Wordu.

**Katastr** — `kn_vypis` vrací ve výchozím nastavení **hotový dokument přímo
v odpovědi** (pole `soubor_gzip_base64`). Nikdy jeho obsah nevypisuj do chatu.
Ulož, rozbal, převeď a pošli:

```bash
tr -d '\n' < blob.b64 | base64 -d | gunzip > vypis.rtf
soffice --headless --convert-to docx vypis.rtf --outdir .
```

Výsledek pošli nástrojem SendUserFile pod názvem z pole `nazev_souboru`.
Ohlásí-li `gunzip` chybu CRC nebo délky, přenos se poškodil — zavolej `kn_vypis`
znovu, soubor neopravuj. Není-li LibreOffice k dispozici, přejmenuj RTF na `.doc`.
Odkaz místo dokumentu vrátí `format: "odkaz"`.

Výpis z katastru není veřejnou listinou a nenahrazuje výpis podle § 55
katastrálního zákona. Řekni to uživateli, pokud by z něj chtěl vycházet v podání.

## Hospodaření s limitem

Katastrální API má **500 volání za den**. Číselníky nevolej opakovaně, ISKN ID
si drž a používej pro navazující dotazy. Zbývající limit: `kn_sluzba` s
`co: "stav_uctu"`. Ostatní konektory takový limit nemají.

## Jak psát odpovědi

Kódy překládej do češtiny a původní kód nech v hranatých závorkách. PSČ ve tvaru
„110 00". Výměry v m² s mezerou po tisících. U právnických osob uváděj firmu,
IČO, sídlo, spisovou značku a jednající osobu s funkcí a způsobem jednání.
U nemovitostí parcelní číslo nebo č. p., katastrální území, obec a číslo LV —
tak, jak se nemovitost označuje ve smlouvě.

Podrobnosti k jednotlivým sadám: `references/ares.md`, `references/katastr.md`,
`references/sagasu.md`.

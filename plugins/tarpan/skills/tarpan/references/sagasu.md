# Sagasu — referenční přehled

Živá data z veřejných API ČR a SR, zdarma, plus deterministické výpočty. To, co
ARES neumí, bývá tady.

## Rejstříky

| Nástroj | K čemu | Poznámka |
|---|---|---|
| `firma_vyhledat` / `firma_detail` | české subjekty (ARES) podle IČO nebo názvu | pro plný obraz i výpis raději `ares_detail_vse` |
| `obchodni_rejstrik` | statutární orgány, společníci, základní kapitál (CZ) | |
| `zivnostensky_rejstrik` | živnostenská oprávnění subjektu | |
| `verejny_rejstrik` | právnická osoba podle IČO nebo názvu **včetně zaniklých** | ARES vymazané záznamy nedrží |
| `verejny_rejstrik_osoba` | firmy, spolky a družstva, kde figuruje **osoba** | jediná cesta osoba → firmy; obsahuje i zaniklá angažmá (`vymazano`) |
| `firma_sk_vyhledat` / `firma_sk_detail` | slovenské subjekty (RPO) | |
| `advokat_cz_vyhledat` / `advokat_cz_detail` | ČAK — advokáti i koncipienti (pole `typ`) | |
| `advokat_sk_vyhledat` / `advokat_sk_detail` | SAK; detail vyžaduje i `meno` | |
| `dph_status` | nespolehlivý plátce DPH + zveřejněné účty (MFČR) | není v ARES |
| `datova_schranka_vyhledat` | ID datové schránky + adresa — úřady, firmy, OSVČ | nejspolehlivěji podle IČO |
| `standardizace_adresy` | validace a doplnění adresy podle RÚIAN | |
| `sbirka_listin` → `listina_text` | listiny z obchodního rejstříku a jejich **plný text** | účetní závěrky, smlouvy, zápisy |
| `insolvence_vyhledat` → `insolvence_detail` → `insolvence_dokument_text` | insolvenční řízení (ISIR), události, dokumenty a jejich text | |

## DPH — na tohle pozor

`dph_status` se dotazuje podle **DIČ**. Zadáš-li IČO, nástroj si DIČ dohledá
v ARES. **Nikdy DIČ neskládej ručně jako CZ + IČO** — u fyzických osob je DIČ
CZ + rodné číslo, takže ručně složené DIČ by neexistovalo a subjekt by vyšel
jako neplátce. Buď předej `dic` z ARES, nebo rovnou IČO.

Ve výsledku sleduj `platceDPH` (registrovaný plátce), `nespolehlivyPlatce`
(ANO / NE / NENALEZEN, přičemž NENALEZEN znamená neplátce) a `zverejneneUcty`.
Praktický dopad: platba na účet, který není zveřejněný, zakládá riziko ručení
za nezaplacenou DPH — u prověrky protistrany to uveď.

## Insolvence

`insolvence_vyhledat` hledá podle příjmení a jména, názvu společnosti, IČO,
rodného čísla, data narození, obce, adresy nebo spisové značky; kritéria lze
kombinovat. Klíčem k detailu je **spisová značka**, ne interní ID (to je
nestálé). Prázdný výsledek u IČO znamená, že řízení není vedeno — to je dobrá
zpráva a je vhodné ji výslovně napsat.

U velmi častého příjmení bez dalšího údaje rejstřík dotaz odmítne; přidej jméno,
datum narození nebo obec.

## Sbírka listin — ověřeno

`sbirka_listin(ico)` vrátil u testovaného subjektu šest listin od roku 2017 do
2023 se značkou (`B 22653/SL6/MSPH`), popisem, datem vzniku i zveřejnění,
počtem listů a příznakem `digitalizovan`. `listina_text` na notářský zápis
o pěti stranách vrátil kompletní čitelný text včetně jmen, dat, počtu hlasů
a přijatého usnesení.

Stránkování je na dvou místech: seznam listin (`pocet_celkem`, `strana`) a text
listiny (`_dalsi`). Obojí je potřeba projít celé.

Vícedílné listiny mají pole `casti`; typicky účetní závěrka = `.doc` příloha
+ `.xml` strojová závěrka + `.pdf` rozvaha a výsledovka. `dokument` v hlavičce
míří jen na první část.

Naskenované listiny se poznají podle rozsypaného textu — `force_ocr=True` je
přečte obrazově, po jednotlivých stránkách.

## Výpočty

`urok_z_prodleni` — CZ podle nařízení 351/2013 Sb. z repo sazby ČNB, SK podle
sazby ECB. Sazby se tahají živě. Vstupem je **první den prodlení**, ne datum
splatnosti; ten den urči podle práva a okolností (posun splatnosti na nejbližší
pracovní den, smluvní ujednání, druh pohledávky) a nepočítej ho mechanicky jako
splatnost + 1. Počítá se včetně prvního i posledního dne. U SK rozlišuj `druh`:
`obciansky` (+5 p.b.), `obchodny` (+9 p.b., výchozí), `obchodny_variabilni`
(+8 p.b.). Ve výsledku vždy uveď nejen částku, ale i roční sazbu, referenční
sazbu a připočet.

`odmena_advokata` — mimosmluvní odměna za **jeden úkon** podle vyhlášky
177/1996 Sb.

`soudni_poplatek` — podle zákona 549/1991 Sb.

Všechny tři vracejí rozpis a odkaz na ustanovení; přenes je do odpovědi, ať je
výpočet ověřitelný.

## Překryv s ARES — ověřeno porovnáním

Obojí sahá na ARES a v **aktuálních** údajích se kryje. `firma_detail` vrací
totéž co registr `zaklad` v `ares_detail_vse`, včetně `kodAdresnihoMista`
(spojka na katastr) a DIČ. `obchodni_rejstrik` dá firmu, spisovou značku,
sídlo, základní kapitál, statutární orgán se způsobem jednání a společníky.

Co Sagasu **nedává** a `ares_detail_vse` ano:

| Údaj | Proč na tom záleží |
|---|---|
| historie zápisů (od/do, výmazy) | `obchodni_rejstrik` vrací jen aktuální stav a příznak `maHistorii: true`, samotnou historii nezpřístupní |
| dřívější obchodní firmy a bývalá sídla | identifikace subjektu ve starší smlouvě |
| vymazaní členové orgánů, zaniklé orgány, data vzniku a zániku funkce | **klíčové pro ověření, zda osoba byla oprávněna jednat k datu podpisu** |
| akcionáři a akcie (počet, podoba, jmenovitá hodnota) | struktura společnosti |
| generátor výpisu do Wordu | `ares_vypis` |
| číselníky (`ares_ciselnik`) a notifikace o změnách | překlad kódů, monitoring |

Pravidlo tedy zůstává: pro obraz české firmy, historii a výpis používej `ares_*`.
Sagasu sáhni po tom, co v ARES není — insolvence, DPH, datové schránky, zaniklé
subjekty, osoba → firmy, Slovensko, advokáti, plné texty listin, výpočty.

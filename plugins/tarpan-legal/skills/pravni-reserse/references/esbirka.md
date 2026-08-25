# e-Sbírka a e-Legislativa — referenční přehled

Konektor `esbirka` sahá na veřejné API systému eSeL. Dvě části: **e-Sbírka**
(vyhlášené právo — znění, konsolidace, vazby) a **e-Legislativa** (právo, které
se teprve chystá — návrhy v legislativním procesu).

Tohle je zdroj **doslovného znění**. Judikatura tu není — na tu je Salvia.

## Stálé URL: adresa předpisu

Každý předpis má stálé URL ve tvaru `/{sbírka}/{rok}/{číslo}`:

| Předpis | Stálé URL |
|---|---|
| zákon č. 89/2012 Sb., občanský zákoník | `/sb/2012/89` |
| zákon č. 99/1963 Sb., občanský soudní řád | `/sb/1963/99` |

`sb` je Sbírka zákonů, `sm` Sbírka mezinárodních smluv. Úvodní lomítko je
součástí adresy.
Všechny nástroje přijímají buď `stale_url`, nebo trojici `sbirka` / `rok` /
`cislo` — znáš-li citaci „89/2012 Sb.“, nemusíš nic hledat a jdeš rovnou na
`esbirka_detail_predpisu`.

### `ke_dni` — nejdůležitější parametr celého konektoru

Se čtvrtým segmentem míří stálé URL na znění účinné k danému dni. Parametr
`ke_dni: "2020-06-30"` ho doplní sám a berou ho **všechny** nástroje pracující
s předpisem.

Posuzuje-li se věc k jinému než dnešnímu dni — a to je u sporu skoro vždy —
**patří `ke_dni` do každého volání**. Bez něj dostaneš dnešní znění, citace
bude vypadat správně a bude vadná. Rozhodné datum si ujasni hned na začátku
(krok 1 metodiky) a drž ho v celé rešerši.

## Postup ke znění §

1. **Najdi předpis** — `esbirka_vyhledat` (téma či název), nebo rovnou stálé
   URL, znáš-li číslo. Nejistý název dolaď `esbirka_naseptavac`.
2. **Ověř stav a účinnost** — `esbirka_detail_predpisu`. Zajímá tě
   `stavDokumentuSbirky`: `AKTUALNE_PLATNY`, `ZRUSENY`, `VYHLASENY_BUDOUCI`,
   `VYHLASENY_BEZ_UCINNOSTI`. Zrušený předpis necituj jako platné právo.
3. **Ke správnému znění** — posuzuješ-li věc k jinému než dnešnímu dni,
   `esbirka_historie` ukáže, která znění kdy platila. Vyber to účinné
   k rozhodnému dni, ne poslední.
4. **Načti text** — `esbirka_znenitext` vrací fragmenty (§, odstavce, přílohy)
   včetně `fragmentId`. U rozsáhlých předpisů stránkuj (`cislo_stranky`) nebo
   filtruj (`fraze`, `vsechna_slova`). Znáš-li označení §, je rychlejší
   `esbirka_ustanoveni` — z „2079“ udělá `fragmentId`.
5. **Čti v kontextu** — načti i odstavce před a za, definiční ustanovení
   a přechodná ustanovení (`esbirka_souvislosti` s typem
   `PRECHODNA_USTANOVENI_ZAVADI`).

## Kontrola aktuálnosti — tři dotazy, které nesmíš vynechat

| Otázka | Nástroj |
|---|---|
| Odkdy platí právě tahle podoba §? | `esbirka_novelizace_derogace` (potřebuje `fragment_id`) |
| Nezrušil ustanovení Ústavní soud? | `esbirka_zrusujici_nalezy_us` |
| Co na předpis navazuje, co ho provádí, co ho mění? | `esbirka_souvislosti` |
| Není s tím zněním něco v nepořádku? | `esbirka_upozorneni` |

`esbirka_upozorneni` s `co: "konflikty"` vrací **konsolidační konflikty** — místa,
kde se novela do textu nepromítla jednoznačně. Takové ustanovení není spolehlivý
podklad: buď ho ověř v částce (`esbirka_castka`), nebo v odpovědi napiš, že je
znění v tomto bodě sporné. Totéž platí pro znění stažené z publikace, které
vrací `esbirka_zmeny_zneni` s `co: "depublikovana"`.

Derogační nález ÚS znamená, že ustanovení pozbylo platnosti — ověř to vždy,
než o § opřeš argument. `esbirka_souvislosti` bez parametrů vrátí přehled všech
vazeb; s `typ` a `souvisejici_stale_url` vrátí přímo znění té vazby.

Typy vazeb: `MENI`, `JE_MENEN`, `RUSI`, `JE_RUSEN`, `PROVADI`, `JE_PROVADEN`,
`ODKAZUJE`, `JE_ODKAZOVAN`, `NALEZY_US_ROZHODOVAN`, `IMPLEMENTOVANE_EU`,
`PRECHODNA_USTANOVENI_ZAVADI`, `UPLNA_ZNENI_REPUBLIKOVAN`,
`REDAKCNI_OPRAVY_OPRAVOVAN`.

## Rozšířené hledání

`esbirka_vyhledat_rozsirene` je na dotazy, kde jednoduché hledání vrací příliš
mnoho. Kombinuj:

- `fraze` — přesná fráze; nejsilnější kritérium pro ustálené obraty a citace.
- `rozsah` — pro platné právo obvykle `["AKTUALNI_ZNENI", "POUZE_UCINNE"]`.
  Dál `VSECHNA_ZNENI`, `NOVELY`, `VYHLASENE_ZNENI`, `BEZ_NOVEL`, `PLATNE`,
  `POUZE_CR`.
- `dalsi_podminky` — strukturované podmínky nad vlastnostmi, například
  `{polozka: "DATUM_UCINNOSTI_OD", operace: "VETSI_ROVNO_NEZ", hodnota_datum: "2024-01-01"}`.
  Položky: `CISLO_PRAVNIHO_AKTU`, `NAZEV_PRAVNIHO_AKTU`, `ROK_VYHLASENI`,
  `TYP_PRAVNIHO_AKTU`, `DATUM_VYHLASENI`, `DATUM_UCINNOSTI_OD`,
  `DATUM_UCINNOSTI_DO`, `DATUM_ZRUSENI`, `REJSTRIK_POJMU_CZECHVOC`.

Kódy typů a podtypů aktu ber z `esbirka_ciselnik` (`typy_aktu`, `podtypy_aktu`,
`sbirky`, `pravni_oblasti`, …), nevymýšlej je.

Hledáš-li uvnitř jednoho předpisu, je přesnější `esbirka_vyhledat_ve_zneni` —
prohledá i dokumenty s ním související, ne jen jeho vlastní text.

`esbirka_chronologie` odpovídá na „co vyšlo v roce X“: nejdřív `co: "roky"`,
pak `dokumenty` nebo `castky` pro konkrétní rok.

## CzechVoc — právní pojmy

Když nevíš, kterým termínem se věc v právu označuje, nebo hledáš legální
definici: `czechvoc_vyhledat_pojem` → `czechvoc_pojem` (definice a vztahy) →
`czechvoc_predpisy_k_pojmu` (ve kterých předpisech se pojem vyskytuje). Poslední
krok je nejcennější — vede od pojmu k ustanovením, která ho používají, včetně
těch, která bys fulltextem nenašel.

## e-Legislativa — co se chystá

Ptá-li se klient dopředu („platí to i příští rok?“, „nemění se to?“), samotná
e-Sbírka nestačí — vyhlášené právo neví nic o návrhu, který leží ve sněmovně.

1. `elegislativa_vyhledat` — návrhy právních aktů, věcné a legislativní záměry.
2. `elegislativa_navrh` s `co: "historie"` — fáze procesu a identifikátory vrstev.
3. `elegislativa_obsah_vrstvy` — navrhované znění; `co: "predpisy"` ukáže, které
   předpisy návrh zasahuje. Text po úrovních (výchozí znění / návrh /
   připomínky) vrací `elegislativa_vrstva_obsahu`.
4. `elegislativa_ucinnosti` — odkdy má co platit.

Dvě věci navíc, které jinde nenajdeš:

- `elegislativa_pripominky` — kdo co namítal a jak to bylo vypořádáno. U
  ustanovení, které se v procesu měnilo, je to nejlepší dostupný zdroj úmyslu
  zákonodárce; použij ho jako podpůrný argument, ne jako závazný výklad.
- `elegislativa_pozmenovaci_navrhy` — text se nejvíc mění právě tady, takže
  odpověď „ve sněmovně leží novela“ bez pohledu na PN může být zastaralá.

`elegislativa_dokumenty` vrací navázané soubory (důvodové zprávy, stanoviska)
jako metadata; binární obsah konektor netahá.

Kódy pro filtry vrací `elegislativa_ciselnik` (`TypDokumentu`,
`TypProcesuNavrhu`, `PodtypAktu`, `DruhAktu`, `AutorAktu`, `Instituce`,
`VerejneDefiniceStavu`).

**Návrh není právo.** Cokoli odsud označ jako *návrh ve fázi X*, nikdy jako
platnou úpravu, a uveď, v jakém stavu proces je.

## Sledování změn

`esbirka_zmeny_zneni` s parametrem `od` vrátí předpisy, jejichž znění se od té
doby změnilo — na periodickou kontrolu, zda dřívější rešerše ještě platí.

## Meze

- API nedává komentáře ani judikaturu; dává znění, strukturu a vazby.
- `fragmentId` je identifikátor konkrétního ustanovení v konkrétním znění.
  **Neukládej ho natrvalo** — ke znění se vracej přes stálé URL a fragment si
  dohledej znovu.
- Konektor běží proti registrovanému přístupu k veřejnému API; hlásí-li
  autentizační chybu, není to chyba dotazu — nahlas ji a nepokoušej se údaj
  doplnit z paměti.

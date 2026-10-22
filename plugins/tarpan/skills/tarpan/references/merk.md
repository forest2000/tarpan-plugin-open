# Merk — ekonomika a vazby, a čím se liší od rejstříků

Referenční list ke konektoru `merk` — oficiální MCP server Saleskitu
(`https://mcp.saleskit.com/merk/`, s lomítkem na konci). Merk je komerční databáze firem pro Česko
a Slovensko. V TARPANu je zdrojem **ekonomiky a vazeb**, ne zdrojem rejstříkových
údajů.

**Přihlášení:** konektor používá OAuth. Uživatel ho v Claude připojí tlačítkem
Connect a přihlásí se svým účtem Saleskit. Není-li připojený (nástroje chybí nebo
vrací chybu přihlášení), napiš to uživateli a ekonomiku nedomýšlej.

**Na začátku konverzace zavolej `read_merk_guide_first`** — vrací aktuální návod
provozovatele (identifikátory, jednotky, limity). Před prvním vyhledáváním ještě
`read_merk_guide_first(topic="search-filters")`.

## Co Merk je a co není

| Otázka | Kam patří |
|---|---|
| Kdo je zapsaný jako jednatel a jak jedná? | **ARES** (`ares_detail_vse`) |
| Kdy byl kdo zapsán a vymazán, jaké bylo dřívější sídlo? | **ARES** — historii zápisů má jen on |
| Probíhá insolvence? | **Sagasu** (`insolvence_vyhledat`), ISIR je závazný |
| Znění stanov, notářský zápis, originál závěrky | **Sagasu** (`sbirka_listin` → `listina_text`) |
| Jak si firma stojí hospodářsky? | **Merk** (`company_get_details`, `company_get_financial_indicators_cz`, `company_get_financial_statements_cz`) |
| Kdo firmu ovládá a přes koho je propojená? | **Merk** (`relations_get_company`, `relations_get_shortest_path`) |

Merk vrací i sídlo, právní formu, stav a statutární orgán (`body.persons`) — ale
**bez historie zápisů**. Pro otázku „směla ta osoba k datu podpisu jednat?" je to
nepoužitelné; ber to z ARES.

## Identifikátory

- `regno` = IČO (s nulami i bez). Uživateli ukazuj `regno_str` („01572377").
- `company_id` = `"cz-<IČO>"` nebo `"sk-<IČO>"` pro nástroje `relations_*`.
- `person_id` vrací `relations_search_person` nebo uzel grafu.
- Slovenské firmy potřebují `country_code="sk"` nebo variantu `_sk`.

## Nástroje podle úlohy

| Úloha | Nástroj |
|---|---|
| firma podle názvu, e-mailu nebo účtu → IČO | `suggest_suggest_get_companies` (placené) |
| profil firmy: obrat a velikost (pásma), zisk, EBITDA, company index, DPH, účty, statutáři, kontakty | `company_get_details` |
| profily více firem najednou (až 500 IČO) | `company_get_companies` |
| finanční ukazatele po letech | `company_get_financial_indicators_cz` / `_sk` |
| rozvaha a výsledovka po řádcích | `company_get_financial_statements_cz` / `_sk` (placené) |
| vlastníci, statutáři, propojené firmy | `relations_get_company` |
| vše, kde osoba je nebo byla | `relations_search_person` → `relations_get_person` |
| jak spolu dvě firmy nebo osoby souvisejí | `relations_get_shortest_path` |
| veřejné zakázky | `company_get_gov_contracts` (placené) |
| provozovny, živnosti, zaměstnanci, vozidla, inzeráty, odpady | `company_get_business_premises`, `company_get_licenses`, `company_get_employees`, `company_get_fleet` / `_fleet_stats`, `company_get_job_ads`, `company_get_waste_facilities` / `_waste_trader` (většinou placené) |
| události v rejstřících, nové a změněné firmy | `company_get_events`, `company_get_new_companies`, `company_get_updated_companies` |
| vyhledání firem podle oboru, okresu, obratu | `enums_enums_get_values` → `search_search_cz` / `_sk` |

## Placená volání a limity

Část nástrojů ubírá z **měsíčního limitu předplatného**: `suggest_*`,
`company_get_employees`, `_licenses`, `_fleet`, `_fleet_stats`, `_gov_contracts`,
`_waste_*`, `_business_premises` a `_financial_statements_*`. Volej je jen tehdy,
když je věc opravdu potřebuje. Profil firmy, ukazatele, vazby a vyhledávání placené
nejsou. Nástroj na zůstatek limitu konektor nemá.

Limity za minutu: 10 u ukazatelů, výkazů, událostí, nových firem, provozoven,
inzerátů a číselníků; 30 u `relations_*`.
Přiškrcené volání řekne, kolik sekund čekat — počkej, neopakuj hned. Hláška
„Merk API denied access" (vypršelý účet, vyčerpaný limit) se opakováním nespraví;
řekni uživateli důvod.

## Ekonomické údaje

**Obrat a velikost jsou pásma, ne čísla** (`turnover`, `magnitude`, s `trend`).
Do výstupu je piš jako pásmo.

**Zisk, EBITDA (`ebidta`) a zůstatky účtů** jsou konkrétní čísla s rokem
(`{amount, year}`). Vždy uveď rok.

**Jednotky: CZ v TISÍCÍCH Kč, SK v celých EUR.** `2297883` u české firmy je
2,3 mld. Kč. Konektor nepřepočítává — **do podání vždy přepočti na koruny sám**
a ukaž, z čeho vycházíš. Totéž platí pro `company_get_financial_statements_cz`.

**Company index** je vlastní bonitní skóre Merku (A+++ ≥ 95 … FX < 35). **Není**
to rating ani úvěrové hodnocení; uváděj ho jen s označením, že jde o skóre Merku.

`is_unreliable_vatpayer` a `insolvency_cases` jsou jen signál — nespolehlivého
plátce ověř v Sagasu (`dph_status`), insolvenci v ISIR (`insolvence_vyhledat`).

Ukazatele i výkazy jsou **dopočtené z účetní závěrky ve sbírce listin**. Potřebuješ-li
citovat, cituj listinu ze sbírky (Sagasu), ne Merk.

## Graf vazeb

- `relations_get_company(company_id, relation_type)` — `relation_type="current"`
  jen trvající vazby, `"any"` i historické. `hops` rozšíří graf přes prostředníky;
  začni na 1 a zvyšuj opatrně, graf velké firmy na 2 kroky má tisíce prvků.
- `relations_search_person(name, birth_date)` — **jmenovci jsou běžní.** Bez data
  narození osobu neztotožňuj; jinak ji hledej přes firmu, u které má být ve funkci.
- `relations_get_shortest_path` — propojenost stran, střet zájmů, osoby blízké
  (§ 22 OZ).

**Nenalezená cesta nic nedokazuje** — jen že v datech Merku do zadaného počtu kroků
není. Nalezená vazba sama o sobě neprokazuje ovládání ani jednání ve shodě; to je
právní kvalifikace, kterou musíš odůvodnit.

**Graf vazeb i kontakty z `company_get_details` (statutáři, telefony, e-maily)
obsahují osobní údaje.** Zpracovávej je jen v rozsahu nutném pro věc; plošný
výpis osob nebo kontaktů kolem firmy do výstupu nepatří.

## Prázdná odpověď

`null`, `{}` nebo `[]` znamená, že Merk data nemá — **ne že neexistují.** U firmy bez
závěrky ve sbírce listin ukazatele ani výkazy nebudou; u slovenských firem často
chybí finance. `vzp_debt` je jen pro SK; `null` u české firmy neznamená „bez dluhu".

## Oslovení

`company_get_details` vrací `salutation` (firma v 5. pádě) a u statutárů hotové
„Vážený pane …". Hodí se do dopisu; v podání se strana označuje 1. pádem.

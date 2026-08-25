# Vyhledávání — jak nepřehlédnout nic relevantního

Cíl: pokrýt téma tak, abys **nepřehlédl** klíčový předpis, ustanovení ani rozhodnutí. Rešerše stojí a padá s tím, co najdeš.

## Předpisy a ustanovení (e-Sbírka)

- **Konkrétní předpis/§:** `esbirka_naseptavac` (např. „106/1999"), pak `esbirka_detail_predpisu` + `esbirka_znenitext`.
- **Tematicky:** `esbirka_vyhledat` (fulltext) a `esbirka_vyhledat_rozsirene`:
  - `fraze` — přesná fráze („výpověď z nájmu bytu"),
  - `vsechna_slova` — všechna slova musí být přítomna,
  - `jedno_ze_slov` — synonyma/varianty,
  - `neobsahuje` — odfiltruj šum,
  - `kody_typ_aktu` (viz `esbirka_ciselniky`), `predmetne_datum_od/do`, `rozsah`.
- **Pojmy:** `czechvoc_vyhledat_pojem` — právní tezaurus; vrací navázané předpisy/ustanovení a definice. Dobré pro ujasnění terminologie a objevení souvisejících §§.
- **Varianty dotazu:** zkus synonyma a právní i laické označení (např. „odstoupení" vs. „zrušení závazku"). Hledej i podle kódu i podle názvu.

## Komentář (TARPAN Komentáře)

- `get_commentary(law, section)` k relevantním §§. Komentář je rozcestník: dává výklad, podmínky aplikace, sporné otázky a **odkazy na judikaturu** — ty dereferencuj.
- `compare_commentary(law, section)` u sporných otázek — rozdíl mezi publikacemi je zjištění, ne šum.
- Komentáře jsou jen k deseti předpisům (OZ, ZOK, ZPr, OSŘ, TrZ, TrŘ, InsZ, ZMPS, VerRej, ER). Jinde se ptej rovnou judikatury a důvodové zprávy.

## Judikatura (Salvia)

- `search_decisions(idx, mode)`:
  - **Více indexů** u obecných otázek: `ns` (NS), `us` (ÚS), `justice` (obecné soudy); správní právo `nss`; insolvence `isir`. Každý index obsahuje jiná rozhodnutí — jeden nestačí.
  - `mode`: `bm25` pro přesné termíny/citace, `knn` pro popisné dotazy, `hybrid` jinak.
- `search_by_case_number` když máš sp. zn.
- Hledej i podle **dotčeného ustanovení** (rozhodnutí k § X) i podle **právního problému**.

## Postup proti slepým místům

1. Začni od ustanovení → komentář → judikatura z komentáře.
2. Pak nezávisle fulltextem ověř, zda existuje judikatura/předpis, který komentář neuvádí (komentář může být starší).
3. Zkontroluj navazující a prováděcí předpisy (`esbirka_souvislosti`).
4. Když se objeví nový pojem, vrať se a vyhledej znovu (iteruj, dokud nové dotazy nepřinášejí nic nového).

## Kdy přestat

Když dvě nezávislé cesty (od ustanovení přes komentář a nezávisle fulltextem) vedou ke stejné množině rozhodnutí a nový dotaz už nepřináší nic nového. Dokud se objevují nové §§ nebo nové sp. zn., iteruj dál.

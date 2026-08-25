# Salvia — referenční přehled

Vyhledávač českých soudních rozhodnutí z pěti databází a českých právních
předpisů.

## Indexy (parametr `idx`)

| Index | Co obsahuje |
|---|---|
| `justice` | obecné soudy — okresní, krajské, vrchní (rozhodnuti.justice.cz). Nejširší pokrytí: civilní, trestní, rodinné, obchodní, spotřebitelské a pracovní věci v prvním a druhém stupni |
| `ns` | Nejvyšší soud — judikatura, dovolání, stanoviska; obsahuje právní věty |
| `nss` | Nejvyšší správní soud a správní senáty krajských soudů — kasační stížnosti, daně, cizinecké právo, sociální zabezpečení, veřejné zakázky, územní plánování, právo životního prostředí; obsahuje právní věty |
| `us` | Ústavní soud — nálezy, usnesení, stanoviska pléna; ústavní přezkum a základní práva |
| `isir` | insolvenční rejstřík — oddlužení, konkursy, reorganizace včetně procesních úkonů; vyhledání podle sp. zn. „INS …" vrátí celý spis |

**Prohledávej víc indexů.** U obecné otázky nestačí jeden — „judikatura
k náhradě škody" znamená `ns` + `us` + `justice`, správní věc navíc `nss`,
insolvenční věc `isir`. Každý index obsahuje jiná rozhodnutí.

## Režimy vyhledávání (`mode`)

`hybrid` (výchozí) kombinuje fulltext a sémantické vyhledávání — pro většinu
dotazů nejlepší. `bm25` je čistý fulltext s českou lemmatizací; vhodný pro
přesné právní termíny, doslovné fráze a citace předpisů. `knn` je čistě
sémantický; vhodný, když popisujete situaci vlastními slovy a na přesném znění
nezáleží.

## Nástroje

`search_regulations` — najde předpis podle názvu, zkratky nebo klíčového slova
a vrátí číslo, rok, název a odkaz. Vrácené `num` a `year` se dají rovnou použít
jako filtr ve `search_decisions`.

`search_decisions` — hledá rozhodnutí. Kromě dotazu a indexu umí filtrovat podle
citovaného předpisu (`reg_num`, `reg_year`, volitelně `reg_par`) a podle data
(`date_from`, `date_to`). Kombinace dotazu s filtrem předpisu je nejsilnější
nástroj, jaký tu je: „rozhodnutí k tématu X, která citují § Y zákona Z".

`search_by_case_number` — rozhodnutí podle spisové značky.

`fetch_decision` — plný text rozhodnutí.

`fetch_regulation_text` — znění předpisu.

## Jak s tím pracovat

Postupuj od předpisu k judikatuře: nejdřív `search_regulations`, ať máš správné
číslo a rok, pak `search_decisions` s filtrem na ten předpis a paragraf. Ušetří
to spoustu falešných shod.

Rozhodnutí, o které se chceš opřít, **přečti celé** přes `fetch_decision` —
z anotace nebo úryvku nelze poznat, zda se skutkově kryje s vaším případem.
Právní věta je vodítko, ne závěr.

V odpovědi vždy uveď soud, spisovou značku, datum a odkaz, u předpisu jeho plný
název a odkaz. Bez toho je citace neověřitelná.

Rozlišuj, co rozhodnutí výslovně říká, a co z něj dovozuješ. A hlídej si, zda
nejde o rozhodnutí překonané pozdější judikaturou nebo změnou zákona — datum
rozhodnutí porovnej s účinností novel.

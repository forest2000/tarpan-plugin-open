# Aktuálnost a přesné znění ustanovení

Cíl: mít jistotu, že citované ustanovení je **přesné** a **platné ke dni, který je pro věc rozhodný**. Toto je nejčastější zdroj chyb — ber ho vážně.

## 1. Rozhodný den

Nejprve si ujasni, **ke kterému dni** se právní stav posuzuje:
- u smlouvy obvykle den uzavření / vzniku závazku,
- u deliktu/jednání den jednání,
- u procesního úkonu den úkonu,
- u dotazu „jak je to dnes" aktuální den.

Účinnost znění se k různým dnům liší. Bez rozhodného dne nelze určit správné znění.

## 2. Načti konsolidované znění, ne paměť

1. Najdi předpis: `esbirka_naseptavac` / `esbirka_vyhledat` (např. „89/2012" → o. z.).
2. Načti detail: `esbirka_detail_predpisu` (staleUrl, např. `/sb/2012/89`).
3. Načti **strukturovaný text** dotčených §§: `esbirka_znenitext`. Cituj přesně podle něj.

## 3. Ověř účinnost k rozhodnému dni

- `esbirka_historie` — časová osa znění (která konsolidace platila kdy, data účinnosti).
- Vyber znění účinné k rozhodnému dni; pokud se od té doby měnilo, **uveď to**.
- Zkontroluj **přechodná (intertemporální) ustanovení** novel — často určují, které znění se použije na starší poměry.
- `esbirka_vyhledat_rozsirene` s `rozsah = POUZE_UCINNE` / `AKTUALNI_ZNENI` pomáhá zúžit.

## 4. Zkontroluj derogaci a změny

- `esbirka_novelizace_derogace` — čím byl § novelizován / zda byl zrušen.
- `esbirka_zrusujici_nalezy_us` — zda (část) ustanovení **zrušil Ústavní soud** (a k jakému dni). Zrušené ustanovení necituj jako platné.
- `elegislativa_vyhledat_navrh` — je-li relevantní, ověř, zda neběží **chystaná změna** (a upozorni na ni jako na riziko do budoucna).

## 5. Čti v kontextu (povinné)

Nikdy necituj jeden odstavec izolovaně:
- přečti **odstavce před i za** a celý § (často je výjimka/definice/odkaz vedle),
- najdi **legální definice** použitých pojmů (v tomtéž předpise i v obecném předpise),
- zvaž **lex specialis vs. lex generalis** (zvláštní úprava má přednost),
- projdi **odkazy a poznámky** na jiná ustanovení/předpisy a dereferencuj je,
- u prováděcích vztahů použij `esbirka_souvislosti` (vyhláška k zákonu apod.).

## 6. Co si u každého ustanovení poznamenat

U každého §, o který se opřeš, drž pohromadě **stálé URL předpisu** a **znění a účinnost, ze kterých jsi čerpal**. Do výstupu patří obojí: bez data účinnosti není citace ověřitelná a za rok už nikdo nezjistí, které znění jsi četl.

`fragmentId` ustanovení platí ke konkrétnímu znění a neukládá se natrvalo — zpátky se chodí přes stálé URL.

## Časté chyby

- Citace znění, které už neplatí k rozhodnému dni.
- Přehlédnutí přechodného ustanovení novely.
- Citace ustanovení zrušeného nálezem ÚS.
- Vytržení odstavce bez výjimky/definice ve vedlejším odstavci.
- Záměna obecné a zvláštní úpravy.

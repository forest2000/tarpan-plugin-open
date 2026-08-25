# Jak pracovat s judikaturou a číst celé rozsudky

Načti tento soubor v kroku 4 (ověření výkladu judikaturou).

## Obsah
1. Jak hledat — výběr indexu a režimu
2. Anatomie rozhodnutí a jak ho číst celé
3. Co je nosné a co ne (ratio vs. obiter)
4. Je názor stále platný? (váha a hierarchie)
5. Citace judikatury
6. Časté chyby

---

## 1. Jak hledat — výběr indexu a režimu

Přes Salvii (`search_decisions`) volíš index podle povahy otázky. U obecné otázky prohledej **více indexů** — každý obsahuje jiná rozhodnutí a hledání v jednom přehlédne relevantní praxi.

- `ns` — Nejvyšší soud: sjednocující judikatura, dovolání, stanoviska; obsahuje právní věty. Pro civilní a trestní hmotné i procesní právo.
- `nss` — Nejvyšší správní soud + správní senáty KS: kasační stížnosti, daně, cizinci, sociální zabezpečení, veřejné zakázky, územní plánování, životní prostředí.
- `us` — Ústavní soud: nálezy, usnesení, stanoviska pléna; ústavní právo, základní práva, přezkum předpisů.
- `justice` — obecné soudy (okresní/krajské/vrchní): nejširší pokrytí prvních a druhých instancí.
- `isir` — insolvenční rejstřík: oddlužení, konkurs, reorganizace, přihlášky.

Příklad: „náhrada škody" → `ns` + `us` + `justice`. Správní věc → přidej `nss`. Insolvence → přidej `isir`.

Režim (`mode`): `hybrid` (výchozí, nejlepší pro většinu dotazů), `bm25` (přesné termíny, citace předpisu, exaktní fráze), `knn` (přirozený popis, kde nezáleží na přesném znění).

Máš-li spisovou značku, použij `search_by_case_number`.

## 2. Anatomie rozhodnutí a jak ho číst celé

Abstrakt ani právní věta nestačí — abstrakt může být zavádějící a nosný důvod často leží jinde. U klíčových rozhodnutí načti **celé znění** (`fetch_decision`) a čti strukturovaně:

- **Záhlaví** — soud, spisová značka, datum, typ rozhodnutí (rozsudek/usnesení/nález).
- **Výrok** — co soud rozhodl. Závazná je výroková část; u ÚS i nosné důvody nálezu.
- **Rekapitulace** — co tvrdily strany a jak rozhodly nižší soudy. Pozor: tvrzení stran a názory nižších soudů NEjsou názorem rozhodujícího soudu — nezaměň je.
- **Odůvodnění** — vlastní právní posouzení soudu, členěné do bodů (odstavců). Tady je jádro.
- **Právní věta** (u NS/NSS/ÚS) — stručná teze; ber ji jako rozcestník, ne jako náhradu odůvodnění.

Při čtení si u nosné teze poznamenej **konkrétní bod odůvodnění** — na něj se pak odkazuje.

## 3. Co je nosné a co ne (ratio vs. obiter)

- **Nosné důvody (ratio decidendi)** — právní názor, na němž rozhodnutí skutečně stojí; ten má precedenční váhu.
- **Obiter dictum** — poznámka nad rámec nutného; má jen přesvědčovací sílu, ne závaznost.
- Vždy zkontroluj **skutkový kontext** rozhodnutí. Teze platí pro srovnatelný skutkový základ; na odlišný skutek ji nelze mechanicky přenést (rozlišení — distinguishing).

## 4. Je názor stále platný? (váha a hierarchie)

Před citací ověř, že názor nebyl překonán:
- **Sjednocující stanoviska** (NS, NSS) a rozhodnutí **velkého senátu** NS / **rozšířeného senátu** NSS mají vyšší sjednocující váhu než rozhodnutí tříčlenného senátu a mohou starší praxi překonat.
- **Plénum ÚS** a nálezy ÚS váží v ústavní rovině; obecné soudy jsou nosnými důvody nálezů vázány.
- Hledej **pozdější odklon** — novější rozhodnutí může dřívější názor opustit. U starších judikátů ověř, zda nedošlo ke změně právní úpravy (judikát k starému obč. zák. nemusí platit za účinnosti nového).
- Více shodných rozhodnutí = ustálená judikatura (silnější opora) než jediné izolované rozhodnutí.

Když narazíš na protichůdná rozhodnutí, pojmenuj rozpor, uveď obě linie a jejich váhu — nepředstírej jednotu, která neexistuje.

## 5. Citace judikatury

Cituj v tomto formátu (přesně podle house-style kanceláře):

> rozsudek Nejvyššího soudu ze dne 5. října 2022, sp. zn. 31 Cdo 1640/2022

Tedy: typ rozhodnutí + soud + „ze dne [den slovy měsíc rok]" + „sp. zn. [značka]". U konkrétní teze doplň bod odůvodnění.

Citace z odůvodnění uváděj **doslovně**, beze změn; zkrácení vyznač „[…]“. Necituj judikát podle cizí parafráze — vždy ověř ve znění (`fetch_decision`), že říká to, co tvrdíš.

## 6. Časté chyby

- Citace pouze podle abstraktu / právní věty bez čtení odůvodnění.
- Záměna tvrzení strany nebo názoru nižšího soudu (z rekapitulace) za názor rozhodujícího soudu.
- Přenos teze na skutkově odlišný případ bez rozlišení.
- Citace překonaného nebo derogovaného názoru (změna zákona, pozdější odklon, sjednocení velkým senátem).
- Vymyšlená nebo nepřesná spisová značka — vždy ověř.
- Citace obiter dicta, jako by šlo o nosný důvod.

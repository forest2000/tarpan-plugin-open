# Sbírka listin — čtení a shrnutí do výpisu

Postup, jak listiny ze sbírky projít a přečíst, a jak jejich obsah předat do
`ares_vypis` v parametru `doplnky`. Rozcestník je v `SKILL.md`, sekce
„Sbírka listin a rozbor dokumentů" a „Výpisy do Wordu".

## Čtení listin

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

## Shrnutí do výpisu (`doplnky`)

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

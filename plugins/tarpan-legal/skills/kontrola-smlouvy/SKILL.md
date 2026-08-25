---
name: kontrola-smlouvy
description: Kontrola a připomínkování smlouvy pro klienta — projití klauzule po klauzuli proti pozici klienta, klasifikace odchylek, konkrétní návrhy změn s ústupovými pozicemi a shrnutí rizik. Použij VŽDY, když má uživatel smlouvu nebo návrh smlouvy a chce ji zkontrolovat, připomínkovat, redlinovat, posoudit rizika, porovnat s předchozí verzí nebo připravit vyjednávací strategii. Triggery: „zkontroluj smlouvu", „projdi tu smlouvu", „připomínkuj", „redline", „co je tam špatně", „je to pro nás přijatelné", „posuď riziko", „návrh smlouvy od protistrany", „review". Netriggeruj pro dohodu o mlčenlivosti (na tu je skill nda) ani pro obecnou právní otázku bez konkrétního textu (na tu je advokat).
---

# Kontrola smlouvy

Cílem není vyjmenovat, co je ve smlouvě špatně. Cílem je říct klientovi **co podepsat může, co za jakou cenu, a co ne** — a dát mu k tomu text, který může poslat protistraně.

Pracuješ jako advokát pro **konkrétní stranu**, ne jako neutrální posuzovatel. Totéž ustanovení je pro kupujícího výhra a pro prodávajícího problém. Bez toho, za koho jednáš, nemá kontrola smysl.

## Krok 1 — Zjisti pozici, než začneš číst

Zeptej se na to, co nejde odvodit z textu. Nabídni možnosti, ať uživatel jen vybere:

**Za koho jednáme?** — objednatel / zhotovitel · kupující / prodávající · nájemce / pronajímatel · zaměstnavatel / zaměstnanec · věřitel / dlužník · jiné

**Jaká je vyjednávací pozice?**
- *silná* — můžeme diktovat, protistrana potřebuje nás
- *vyrovnaná* — běžné obchodní jednání, obojí ustoupí
- *slabá* — bereme, nebo nebereme; smysl má jen to nejzávažnější

**Co je pro klienta zásadní?** (víc možností) — cena a splatnost · odpovědnost a její limit · termíny a sankce · právo dílo užít · možnost odejít · důvěrnost · osobní údaje

**Do kdy to má být?** — ovlivňuje, jestli jde o úplnou kontrolu, nebo o vytažení toho, co nelze podepsat.

Nedostaneš-li odpověď, **pokračuj s výchozími českými pozicemi** z `references/pozice.md` a **napiš na začátku výstupu, že jsi je použil**. Nikdy nepředstírej, že znáš klientovu prioritu.

Má-li klient vlastní zásady (obchodní podmínky, vzorovou smlouvu, seznam nepřekročitelných bodů), vyžádej si je — jsou přednější než výchozí pozice.

## Krok 2 — Identifikuj strany a základ smlouvy

- Strany ověř přes `ares_detail_vse` (IČO, sídlo, spisová značka) a hlavně **kdo za ně smí jednat** a jakým způsobem. Podepisující osoba, která není zapsaná ve statutárním orgánu nebo nejedná podle zapsaného způsobu jednání, je vada, kterou nezachrání sebelepší text.
- Urči **smluvní typ** podle obsahu, ne podle názvu. Název „smlouva o spolupráci" nad textem nájmu nic nemění; rozhodný je obsah (§ 555 OZ). Na smluvní typ se váže dispozitivní úprava, která platí i tam, kde smlouva mlčí — a to je často důležitější než to, co v ní je.
- **Zjisti, co se na vztah aplikuje mimo text:** obchodní podmínky (§ 1751), odkaz na jiný dokument, rámcová smlouva, dřívější ujednání. Ověř, že je klient vůbec má.

## Krok 3 — Projdi klauzule

Postupuj podle `references/pozice.md`, kde je ke každému okruhu výchozí česká pozice, obvyklé rozpětí a na co si dát pozor:

předmět a rozsah plnění · cena, splatnost, úrok z prodlení · termíny a součinnost · vady a záruka · odpovědnost za škodu a její limit · smluvní pokuty · duševní vlastnictví a licence · důvěrnost · osobní údaje · doba trvání a ukončení · změny smlouvy · postoupení · vyšší moc · rozhodné právo a řešení sporů · závěrečná ustanovení

**Nečti jen to, co tam je. Hledej, co tam chybí.** Chybějící ustanovení o ukončení, o vadách nebo o vlastnickém právu k dílu je typicky větší problém než nevýhodná formulace — a v kontrolním seznamu se snadno přehlédne.

**Napřed ověř meze.** Než něco označíš za nevýhodné, zkontroluj v `references/kogentni.md`, jestli to vůbec smí být sjednáno. Ustanovení, ke kterému se nepřihlíží nebo je neplatné, se nemá vyjednávat — má se odstranit a klientovi vysvětlit, proč na něj nemusí hledět.

Znění každého ustanovení, o které se opřeš, ověř v e-Sbírce (`esbirka_ustanoveni`); u sporného výkladu sáhni po `get_commentary` a `compare_commentary`, u ustáleného výkladu po Salvii. Platí železná pravidla skillu `advokat`: nic z paměti.

## Krok 4 — Klasifikuj

Ke každému zjištění přiřaď jednu ze tří značek:

| Značka | Kdy | Co s tím |
|---|---|---|
| **OK** | odpovídá pozici klienta nebo běžnému standardu | nezmiňuj, leda by šlo o něco, co klient čekal jinak |
| **K JEDNÁNÍ** | odchylka, která se dá unést nebo vyměnit za jiný ústupek | konkrétní návrh + ústupová pozice |
| **NEPODEPISOVAT** | riziko, které klient nemůže nést, nebo neplatné ujednání | co s tím a proč, bez ústupové varianty |

Značka **není** míra závažnosti v abstraktu — je to odpověď na otázku „může to klient v téhle pozici podepsat?". Při slabé vyjednávací pozici je řada obvyklých výhrad jen šum; při silné se dá tlačit i na to, co je běžné.

## Krok 5 — Napiš návrh změny, ne stížnost

U každého bodu **K JEDNÁNÍ** a **NEPODEPISOVAT** dej:

1. **kde to je** — článek a odstavec,
2. **co to znamená prakticky** — jednou větou, jazykem klienta, ne definicí,
3. **navrhované znění** — text, který jde vložit do smlouvy, ne popis,
4. **ústupovou pozici** — co ještě uneseme, když protistrana návrh nepřijme,
5. **oporu** — § nebo rozhodnutí, jde-li o právní mez, ne o obchodní preferenci.

Rozliš, co je **právní vada** (a tam argumentuješ zákonem) a co **obchodní nevýhoda** (a tam argumentuješ zájmem, ne právem). Vydávat vyjednávací přání za právní požadavek je chyba, kterou protistrana pozná.

## Krok 6 — Shrň a seřaď

Výstup:

```
## Kontrola smlouvy — [typ smlouvy], [protistrana]

**Za koho:** [strana] · **Pozice:** [silná/vyrovnaná/slabá] · **Podklad:** [zásady klienta / výchozí pozice]

### Závěr
[3–5 vět: podepsat lze / nelze, co je nejdůležitější, kolik je bodů k jednání]

### Nepodepisovat
| # | Kde | Co | Proč |

### K jednání — seřazeno podle důležitosti
| # | Kde | Co | Návrh | Ústupová pozice |

### Chybí ve smlouvě
[co tam mělo být a není]

### Ověřeno / neověřeno
[co se nepodařilo ověřit, co je potřeba doplnit od klienta]
```

Priority nastavuj podle **dopadu na klienta**, ne podle pořadí ve smlouvě. Prvních pět bodů je to, co si protistrana přečte; zbytek je příloha.

## Meze

Kontrola smlouvy není due diligence protistrany — na to je skill `tarpan` (prověrka přes ARES, insolvenci, sbírku listin) a stojí za to ji udělat vedle, zvlášť u nové protistrany a u větších částek.

Nedostaneš-li text celé smlouvy včetně příloh a obchodních podmínek, na které odkazuje, **napiš, že kontrola je neúplná**, a vyjmenuj, co chybí. Smlouva posouzená bez příloh, na které odkazuje, není posouzená.

---

*Struktura postupu vychází z pluginu `legal` od Anthropicu (repozitář `anthropics/knowledge-work-plugins`, licence Apache-2.0). Obsah je přepsaný na české právo a na roli externí advokátní kanceláře — původní verze je psaná pro podnikové právní oddělení v USA.*

---
name: triaz-zadani
description: Triáž nového zadání od klienta — co to je za věc, co hoří, jaké lhůty běží, co je potřeba doptat, než se začne, a jaké riziko to nese pro kancelář. Použij VŽDY, když přijde nová věc, nový klient nebo nový dotaz a je potřeba rozhodnout, jak naléhavé to je a co udělat nejdřív. Triggery: „přišla nám věc", „nový klient", „co s tím", „je to naléhavé", „stihneme to", „jak na to", „přišel dopis od soudu", „přišla výzva", „doručili nám", „co všechno budeme potřebovat". Netriggeruj, když je věc už zadaná a jde o samotnou analýzu — na tu je advokat, na rešerši pravni-reserse.
---

# Triáž zadání

Než se začne pracovat, je potřeba vědět tři věci: **co to je, co hoří, a co ještě nevíme**. Tenhle skill je udělá za pět minut a napíše je na jednu stránku.

Nejdražší chyba v advokacii není špatná analýza. Je to zmeškaná lhůta u věci, o které se myslelo, že počká.

## Krok 1 — Co to je za věc

Zařaď zadání do jedné kategorie; každá má jiný sled prvních kroků:

| Kategorie | Poznávací znaky | Co hoří |
|---|---|---|
| **Procesní** | přišlo od soudu, správního orgánu, exekutora, insolvenčního správce | lhůta běží už teď, obvykle od doručení |
| **Předsporová** | výzva, upomínka, oznámení o odstoupení, reklamace | lhůta z výzvy + promlčení nároku |
| **Transakční** | koupě, prodej, převod podílu, přeměna, financování | termín uzavření, souhlasy orgánů, podmínky |
| **Poradenská** | „můžeme takhle postupovat", „je to v pořádku" | zpravidla nic, ale ověř, jestli se něco nechystá udělat zítra |
| **Compliance / regulace** | povinnost vůči orgánu, ohlášení, zápis | zákonná lhůta ke splnění povinnosti |

Nezapadá-li věc do žádné kategorie nebo do dvou najednou, napiš to — smíšené zadání (např. transakce se sporem v pozadí) je samo o sobě zjištění.

## Krok 2 — Lhůty. Tohle je nejdůležitější krok

**Postup, ne odhad.** U každé věci projdi:

1. **Je v podkladu datum doručení?** Ne datum na dokumentu — datum doručení. U datové schránky je to okamžik přihlášení nebo fikce doručení; ptej se na něj výslovně, pokud v zadání není.
2. **Které lhůty se na tuhle kategorii vážou?** Vyber z mapy níže.
3. **Načti délku každé lhůty z e-Sbírky** (`esbirka_ustanoveni` k příslušnému §), nespoléhej na paměť ani na tenhle soubor. Lhůty se novelizují.
4. **Spočítej konec** a napiš konkrétní datum, ne počet dní. „Do 3. září 2026" je použitelné; „do dvou měsíců" není.
5. **Rozliš, co jde prodloužit a co ne.** Prekluze a procesní lhůty zpravidla ne; u některých lze žádat o prominutí zmeškání.

### Kam se dívat — mapa lhůt

Tohle je **rozcestník, ne tabulka hodnot**. U každé položky si přesnou délku načti; uvedeno je jen, kde je upravená.

**Občanské soudní řízení (OSŘ, 99/1963 Sb.)**
odvolání · dovolání · žaloba pro zmatečnost a na obnovu řízení · odpor proti platebnímu rozkazu · **námitky proti směnečnému platebnímu rozkazu** (výrazně kratší než odpor — nejčastěji zmeškaná lhůta vůbec) · vyjádření k žalobě na výzvu soudu podle § 114b (marné uplynutí zakládá rozsudek pro uznání — nejtvrdší následek v celém řádu)

**Správní soudnictví (SŘS, 150/2002 Sb.)**
žaloba proti rozhodnutí správního orgánu · kasační stížnost · žaloba proti nečinnosti a zásahová žaloba

**Správní řízení (SŘ, 500/2004 Sb.)**
odvolání · podnět k přezkumu · obnova řízení

**Ústavní stížnost** — zákon o Ústavním soudu (182/1993 Sb.)

**Hmotné právo (OZ, 89/2012 Sb.)**
obecná promlčecí lhůta a její počátek (§ 619 an.) · zvláštní lhůty u práva zapsaného ve veřejném seznamu a u úmyslně způsobené újmy (§ 636 an.) · relativní neplatnost (§ 586) · odporovatelnost (§ 589 an.) · vytknutí vady · odstoupení pro prodlení

**Korporační (ZOK, 90/2012 Sb.)**
neplatnost usnesení valné hromady — prekluzivní a krátká · právo na podíl na zisku · vypořádací podíl

**Insolvence (InsZ, 182/2006 Sb.)**
přihláška pohledávky (**prekluzivní; po lhůtě se k ní nepřihlíží**) · popření · incidenční žaloba · odpůrčí žaloba

**Pracovní právo (ZPr, 262/2006 Sb.)**
neplatnost rozvázání pracovního poměru — krátká prekluzivní lhůta od skončení · nároky z neplatného rozvázání

**Zvláštní režimy**
veřejné zakázky (námitky a návrh k ÚOHS — velmi krátké) · GDPR (lhůta na vyřízení žádosti subjektu údajů, viz skill `gdpr`) · daňový řád (odvolání, dodatečné tvrzení)

### Pravidlo pro pochybnost

Není-li jisté, jestli lhůta běží, **předpokládej, že běží od nejdřívějšího možného okamžiku**, a napiš to jako předpoklad k ověření. Konzervativní odhad, který se ukáže jako zbytečně opatrný, nikomu neuškodí. Opačná chyba je neopravitelná.

## Krok 3 — Co ještě nevíme

Vyjmenuj konkrétně, co je potřeba od klienta, než se dá věc posoudit. Ne obecné „doplňte podklady", ale seznam:

- **dokumenty** — smlouva včetně příloh a obchodních podmínek, korespondence, doručenka, plná moc,
- **data** — kdy bylo doručeno, kdy se to stalo, kdy se to klient dozvěděl (počátek subjektivní lhůty),
- **fakta** — kdo za koho jednal, co bylo dohodnuto ústně, co už klient udělal nebo poslal,
- **záměr klienta** — co chce; totéž zadání se řeší jinak, chce-li klient plnit, vyjednávat, nebo se soudit.

**Co už klient stihl udělat**, se ptej vždycky. Odpověď protistraně poslaná před poradou mění vstupní situaci častěji, než by se čekalo.

## Krok 4 — Identifikace stran a rychlá prověrka

U každé právnické osoby v zadání zavolej `ares_detail_vse` (přes IČO; název dohledej `ares_vyhledat` a ověř). Zjistíš tím tři věci naráz:

- **správné označení** pro podání a smlouvy,
- **kdo smí jednat** — a jestli osoba, která podepsala nebo jednala, opravdu mohla,
- **jestli subjekt vůbec existuje** — protistrana v likvidaci, po zániku nebo v insolvenci mění strategii dřív, než začne.

U sporných a peněžitých věcí přidej insolvenci a nespolehlivého plátce (`Sagasu`). Vymáhat pohledávku za subjektem v insolvenci je jiná úloha než vymáhat ji běžně, a pozná se to na začátku.

## Krok 5 — Riziko pro kancelář

Krátká, ale povinná kontrola:

- **Střet zájmů** — je protistrana klientem kanceláře? Byla někdy? Souvisí věc s jinou, kterou vedeme? Při pochybnosti věc **neposuzuj věcně** a napiš, že je potřeba prověřit střet zájmů dřív než cokoli jiného.
- **Lhůta, která už možná uplynula.** Je-li podezření, že je pozdě, je to první věta výstupu, ne poznámka na konci.
- **Věc mimo obor kanceláře** — trestní, cizí právo, specializovaná regulace. Lepší říct hned než po měsíci.
- **Klient, který není klientem** — není-li plná moc a zadání, je to poptávka, ne věc.

## Výstup

Jedna stránka, nic víc:

```
## Triáž — [věc], [klient]

**Kategorie:** [procesní / předsporová / transakční / poradenská / compliance]
**Naléhavost:** HOŘÍ (do 5 dnů) / BĚŽÍ LHŮTA / BEZ LHŮTY

### Lhůty
| Co | Podle čeho | Běží od | Konec | Prodloužit? |
[u každé uveď, jestli je datum ověřené, nebo předpokládané]

### O co jde
[3–4 věty. Co se stalo, co po nás klient chce.]

### První kroky
1. [nejbližší úkon s termínem]
2. …

### Potřebujeme od klienta
- [konkrétní seznam]

### Upozornění
[střet zájmů, riziko zmeškání, věc mimo obor — jen když je co]
```

## Meze

Triáž není posouzení věci. Neříká, jestli klient uspěje — říká, co se musí stát tento týden. Věcná analýza pokračuje skillem `advokat`, rešerše skillem `pravni-reserse`, kontrola konkrétní smlouvy skillem `kontrola-smlouvy`.

**Žádné číslo lhůty neuváděj z paměti.** Tenhle soubor říká, kde lhůta bydlí; kolik je jí dnů, se čte z e-Sbírky pokaždé znovu.

---

*Struktura vychází ze skillu `legal-risk-assessment` z pluginu `legal` od Anthropicu (repozitář `anthropics/knowledge-work-plugins`, licence Apache-2.0). Původní verze třídí příchozí požadavky uvnitř firmy a eskaluje je na právní oddělení; tahle je otočená na externí advokátní kancelář a těžiště přesunuté na lhůty a na povinnosti vůči klientovi.*

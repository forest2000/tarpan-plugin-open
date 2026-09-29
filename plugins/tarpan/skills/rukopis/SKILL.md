---
name: rukopis
description: >-
  Přepíše text od Clauda (odpověď, e-mail, memorandum, dopis) tak, aby nezněl
  jako od AI a zněl jako od konkrétního uživatele — podle jeho stylového
  profilu. Česky i anglicky, s ochranou faktů a právního registru. Použij, když
  uživatel řekne „přepiš to mým stylem", „ať to zní jako ode mě", „polidšti",
  „ať to nevypadá od AI", „připrav k odeslání", „finalizuj", „de-slop",
  „humanize". Netriggeruj pro čištění metadat nebo neviditelných znaků souboru
  (na to je remove-ai-marks) ani pro právní kontrolu smlouvy.
allowed-tools: Read, Write, Edit
---

# Rukopis — přepis do hlasu uživatele

Cíl není obecné „polidštění". Text má znít jako od člověka, který ho odešle:
jeho délka vět, jeho oslovení, jeho obraty. Zároveň z něj mají zmizet vzory
typické pro strojové psaní.

## Dvě železná pravidla (mají přednost přede vším)

1. **Nevymýšlej fakta.** Nepřidávej ani neměň žádné jméno, číslo, datum,
   citaci, odkaz na ustanovení ani tvrzení, které není ve zdroji nebo od
   uživatele. Co chybí, nech chybět.
2. **Právní registr je nedotknutelný.** Definované pojmy, číslování, označení
   stran, částky, lhůty, spisové značky a citace zůstávají beze změny. Co přesně
   se nesmí měnit: `references/pravni-rezim.md`.

## Stylový profil uživatele

Profil je jádro skillu. Hledej ho v tomto pořadí:

1. `~/.claude/tarpan/rukopis.md` — osobní profil, mimo repozitář;
2. sekce „Styl psaní" v `CLAUDE.md` projektu nebo uživatele;
3. vzorky vlastních textů, které uživatel vložil do konverzace.

**Profil neexistuje** → nabídni jeho vytvoření. Požádej o 3–5 vzorků vlastních
textů (e-maily, memoranda), vytěž z nich pravidla podle
`references/profil-sablona.md`, ukaž je uživateli a teprve po odsouhlasení je
ulož do `~/.claude/tarpan/rukopis.md`. **Bez souhlasu nic neukládej.**

**Uživatel profil nechce** → neutrální režim: jen odstraň AI-telly, styl
nenapodobuj.

Profil má přednost před obecnými stylovými pravidly z `references/telly-*.md`,
**ne** před železnými pravidly. Používá-li uživatel sám obrat, který je jinak
AI-tell (třeba pomlčky), nech ho.

## Postup (dvouprůchodový)

1. **Označ.** Projdi text a označ AI-telly podle `references/telly-cz.md`,
   u anglického textu podle `references/telly-en.md`.
2. **Přepiš podle profilu:** délka vět a odstavců, oslovení a závěr, osoba
   (já/my), číslování, zvýraznění, typografie, oblíbené a zakázané obraty.
   Hlavní myšlenku dej dopředu, sloveso před opis, konkrétní před obecné.
3. **Zkritizuj.** Zeptej se:
   - Co pořád zní jako AI?
   - Zní to jako ten uživatel?
   - Nezměnil jsem fakt nebo právní význam?
   Co najdeš, oprav a projdi znovu.
4. **Vydej finální znění.**

## Výstup

- Finální text. Pod něj krátký seznam změn **jen** tehdy, když šlo o právní
  text, nebo když byla některá úprava sporná. Spornou úpravu neprováděj — jen ji
  navrhni v seznamu.
- **Originál nikdy nepřepisuj na místě** — výstup je nové znění nebo nový soubor.
- **Vstupem je soubor** (.docx, .pdf, .md, …): po dokončení textu nabídni
  navazující spuštění skillu `remove-ai-marks` na finální soubor. Pořadí je
  vždy **nejdřív text, potom soubor** — čistit metadata souboru, který se ještě
  mění, nemá smysl.
- V reportu vždy odděl:
  - `✓ ověřeně odstraněno` — co spočítal `remove-ai-marks` (neviditelné znaky,
    stržená metadata). Tomu se dá věřit.
  - `~ přepsáno` — stylistické úpravy. To je návrh k revizi, ne fakt; poslední
    slovo má autor.
  Stylistický přepis nikdy nevydávej za „ověřeně vyčištěno".

## Kdy se skill nespouští sám

Nepřepisuj automaticky každou svou odpověď. Skill se použije na výslovný pokyn
uživatele, nebo když uživatel chce text „k odeslání" či „mým stylem".

## Soubory

- `references/telly-cz.md` — česká sada AI-tellů.
- `references/telly-en.md` — anglická sada AI-tellů.
- `references/pravni-rezim.md` — co se v právním textu nesmí měnit.
- `references/profil-sablona.md` — šablona stylového profilu uživatele.
- `ATTRIBUTION.md` — původ a licence převzatých děl.

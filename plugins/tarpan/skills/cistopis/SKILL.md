---
name: cistopis
description: >-
  Připraví text nebo dokument k odeslání ven z kanceláře — zbaví ho stop po AI.
  Orchestruje dvě vrstvy: stylistickou (skill humanizer) a technickou (skill
  remove-ai-marks), ve správném pořadí, a vydá přehledný report. Použij VŽDY,
  když uživatel chce "připravit / vyčistit / finalizovat" text nebo soubor před
  odesláním, nebo řekne, že to "nemá vypadat jako od AI". Triggery: „připrav k
  odeslání", „finalizuj", „vyčisti dokument", „projeď to před odesláním",
  „očisti od AI", „zkontroluj, ať to nevypadá od AI", „clean this up before I
  send it". Netriggeruj pro pouhé psaní nového textu (na to jsou psací skilly)
  ani pro samotnou právní kontrolu smlouvy.
---

# Čistopis — orchestrace čištění výstupu

Cíl: z hotového textu nebo souboru udělat čistopis, který nenese stopy po AI —
ani ve stylu, ani ve skryté vrstvě souboru — a nikdy přitom neztratí věcný obsah
ani právní přesnost.

Pracuješ ve dvou vrstvách a **záleží na pořadí**: nejdřív styl, potom soubor.
Kdybys čistil metadata dřív, než je text hotový, čistil bys soubor, který se
ještě mění.

## Rozhodovací strom

1. **Zjisti, co máš na vstupu.**
   - Čistý text vložený do chatu → jde jen o stylistickou vrstvu.
   - Soubor (.docx, .pdf, .md, .html, .txt, obrázek) → obě vrstvy.

2. **Vrstva 1 — styl (skill `humanizer`).**
   Přepiš text tak, aby nezněl jako od AI, podle skillu `humanizer`.
   Drž jeho dvě železná pravidla: **nevymýšlet fakta** (žádné jméno, číslo, datum,
   citace ani ustanovení navíc, než co je ve zdroji) a **nesahat na právní
   registr** (definované pojmy, číslování (i)/(ii)/(iii), označení stran, částky
   a odkazy zůstávají beze změny).
   U právního textu je výchozí režim konzervativní: měň jen to, co je prokazatelně
   AI-tell, ne autorův styl.

3. **Vrstva 2 — soubor (skill `remove-ai-marks`).**
   Až je text finální, spusť technické čištění podle skillu `remove-ai-marks`:
   neviditelné znaky (zero-width, obousměrné řízení, tag-znaky) a metadata s AI
   provenience (C2PA, EXIF, XMP, vlastnosti dokumentu).
   Pro text tuto vrstvu pusť rovnou na finální znění; pro soubor na finální
   soubor (ideálně po exportu z Wordu).

4. **Report.** Na konci vždy odděl:
   - `✓ ověřeně odstraněno` — spočitatelné a nevratné (počet neviditelných znaků,
     stržená metadata). Tomu se dá věřit.
   - `~ přepsáno` — stylistické úpravy textu. To je návrh k revizi, ne fakt;
     autor má poslední slovo.
   Nikdy nevydávej stylistický přepis za „ověřeně vyčištěno".

## Zásady

- Originál nikdy nepřepisuj na místě — výstup je nový soubor / nové znění.
- Když si u právního textu nejsi jistý, zda úprava nemění význam, úpravu neprováděj
  a jen ji označ jako návrh.
- Když nejsou k dispozici systémové nástroje pro metadata (exiftool/qpdf/gs),
  řekni to a odděl, co se přesto podařilo (textová vrstva funguje vždy).

---
name: remove-ai-marks
description: >-
  Odstraní technické stopy po AI ze souboru nebo textu — neviditelné a
  steganografické znaky (zero-width, obousměrné řízení, tag-znaky) a metadata
  s AI proveniencí (C2PA, EXIF, XMP, vlastnosti dokumentu). Deterministické a
  ověřitelné (spočítá, co odstranilo). Použij VŽDY, když jde o „vodoznak",
  „metadata", „C2PA", „neviditelné znaky", „skryté znaky", „vyčisti PDF/DOCX/
  obrázek před odesláním", „strip metadata". Netriggeruj pro stylistický přepis
  textu — na to je rukopis, který se spouští jako první; tento skill až po něm
  na finální soubor.
allowed-tools: Read, Write, Bash(python3:*), Bash(exiftool:*), Bash(qpdf:*)
---

# Remove AI marks — technická vrstva čištění

Odstraňuje jen to, co jde **spočítat a ověřit**. Nic nevymýšlí, nic nepřepisuje
stylisticky. Originál nechává být — píše vždy nový soubor.

Nástroj: `scripts/clean_marks.py` (Python 3.10+, jen standardní knihovna;
pro metadata volitelně systémové `exiftool`, `qpdf`, `ghostscript`).

## Postup

1. **Zajisti nástroje na metadata** (jen pro binární soubory — PDF/DOCX/obrázky).
   V sandboxu Coworku:
   ```bash
   apt-get update -qq && apt-get install -y libimage-exiftool-perl qpdf ghostscript
   ```
   Pro čistě textové soubory (.txt/.md/.html/.csv) není potřeba nic — jede stdlib.

2. **Nejdřív inspekce, ukaž nález:**
   ```bash
   python3 clean_marks.py inspect <cesta>
   ```
   Report vypíše, kolik a jakých neviditelných znaků soubor obsahuje (u binárních
   souborů řekne, zda jsou nástroje na metadata k dispozici).

3. **Pak čištění do nového souboru:**
   ```bash
   python3 clean_marks.py clean <cesta> --out <cesta>.clean.<pripona>
   ```
   - Textová vrstva (vždy): smaže zero-width, bidi, tag-znaky, variation selectors.
   - Souborová vrstva (když jsou nástroje): strhne EXIF/XMP/IPTC a u PDF přeuloží
     soubor přes qpdf.

4. **Report uživateli.** Uváděj jen `✓ ověřeně odstraněno` s počty. Když nástroj
   na metadata chyběl, řekni to otevřeně — nevydávej nehotové za hotové.

## Důležité pro právní texty

- **Nedělitelnou mezeru (NBSP) a normální mezery výchozí režim NEmění** — v právu
  jsou často záměrné („§ 123", „5 000 Kč"). Exotické mezery normalizuj jen na
  explicitní `--spaces`.
- Metadata dokumentu mohou mít i legitimní/důkazní hodnotu — čisti jen výstup
  určený k odeslání, ne originál v spisu.

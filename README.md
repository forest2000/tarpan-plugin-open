# TARPAN — marketplace pluginů

Repozitář slouží jediné věci: distribuci pluginů **TARPAN** do Claude Code.

## Instalace

```
/plugin marketplace add forest2000/tarpan-plugin-open
```

Pak podle toho, co děláš:

```
/plugin install tarpan-legal@tarpan      # advokáti a koncipienti
/plugin install tarpan-partners@tarpan   # kancelář, asistentky, sekretariát
```

Balíček **tarpan** (základ) se doinstaluje sám jako závislost — samostatně ho
instalovat nemusíš.

## Co je v čem

| Balíček | Pro koho | Co přináší |
|---|---|---|
| **tarpan** (základ) | všichni | ARES, katastr nemovitostí ČR, Sagasu (insolvence, DPH, datové schránky, zaniklé subjekty, SK rejstříky, advokáti, výpočty úroku, odměny a soudního poplatku) a Merk (finanční ukazatele, účetní výkazy, graf vlastnických a personálních vazeb). Výpisy do Wordu v úpravě TARPAN. Skilly `tarpan`, `rukopis` (přepis textu do tvého stylu) a `remove-ai-marks` (čištění souboru před odesláním). |
| **tarpan-legal** | advokáti, koncipienti | Navíc judikatura (Salvia), e-Sbírka a e-Legislativa, komentářová literatura a unijní právo (EUR-Lex/CELLAR). Skilly: metodika advokáta, právní rešerše, kontrola smlouvy, NDA, triáž zadání, GDPR. |
| **tarpan-partners** | kancelář | Zatím základ TARPAN (rejstříky, katastr, Merk, výpisy do Wordu); kancelářské skilly přibudou. |

## Aktualizace

```
/plugin marketplace update tarpan
```

Musí být vidět tři položky: `tarpan`, `tarpan-legal`, `tarpan-partners`.

## Změny

**tarpan 3.0.0 · tarpan-legal 1.7.4 · tarpan-partners 1.0.1**

- Skilly `cistopis` a `humanizer` jsou sloučené do nového skillu **`rukopis`**.
  Přepisuje text od Clauda tak, aby nezněl jako od AI a zněl jako od tebe —
  podle stylového profilu, který si skill s tvým souhlasem vytvoří ze vzorků
  tvých textů (`~/.claude/tarpan/rukopis.md`). Kdo používal `cistopis` nebo
  `humanizer`, říká teď totéž a spustí se `rukopis`.
- `remove-ai-marks` zůstává samostatný a navazuje na `rukopis`: nejdřív text,
  potom soubor.
- Přesnější popisy skillů, aby se u právní otázky nenačítaly zbytečně dva
  (`advokat` × `pravni-reserse`).
- TARPAN Partners už neslibuje prověrky protistran navíc — zatím obsahuje
  základ, kancelářské skilly přibudou.

## Meze

Konektory vracejí údaje z veřejných rejstříků a databází, ne právní stanovisko.
Co z nich přijde, je podklad — právní kvalifikaci a odpovědnost za výstup nese
advokát. U ekonomických a vazebních dat platí navíc, že vypovídají o tom, co je
zapsané; nezapsaný stav v nich není.

## Kde jsou zdrojáky

Zdrojové kódy workerů, testy a vývojová dokumentace jsou ve vývojovém
repozitáři `forest2000/tarpan`. Sem se překlápí jen to, co se instaluje.

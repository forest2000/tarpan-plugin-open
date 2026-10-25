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
| **tarpan** (základ) | všichni | ARES, katastr nemovitostí ČR, Sagasu (insolvence, DPH, datové schránky, zaniklé subjekty, SK rejstříky, advokáti, výpočty úroku, odměny a soudního poplatku), Merk (finanční ukazatele, účetní výkazy, graf vlastnických a personálních vazeb), Leady (firmy na webu kanceláře; oba s přihlášením účtem Saleskit) a vyhledávání na webu (Parallel Search). Výpisy do Wordu v úpravě TARPAN. Skilly `tarpan`, `rukopis` (přepis textu do tvého stylu) a `remove-ai-marks` (čištění souboru před odesláním). |
| **tarpan-legal** | advokáti, koncipienti | Navíc judikatura (Salvia), e-Sbírka a e-Legislativa, komentářová literatura a unijní právo (EUR-Lex/CELLAR). Skilly: metodika advokáta, právní rešerše, kontrola smlouvy, NDA, triáž zadání, GDPR. |
| **tarpan-partners** | kancelář | Zatím základ TARPAN (rejstříky, katastr, Merk, výpisy do Wordu); kancelářské skilly přibudou. |

## Aktualizace

```
/plugin marketplace update tarpan
```

Musí být vidět tři položky: `tarpan`, `tarpan-legal`, `tarpan-partners`.

## Změny

**tarpan 4.1.1**

- Návod k Leady podle skutečných nástrojů: jen návštěvy firem, návštěvy osob se
  nepoužívají; štítky v Saleskitu Claude nemění (to zůstává v aplikaci).

**tarpan 4.1.0 · tarpan-legal 1.8.1 · tarpan-partners 1.0.3**

- Nový konektor **Parallel Search** (`parallel-search`): vyhledávání na veřejném
  webu a stažení stránek, bez přihlášení. Do dotazu se nikdy nedávají údaje
  o klientovi; osoby se dohledávají jen pro konkrétní věc. Web je jen doplněk
  rejstříků, vždy s odkazem na zdroj; znění předpisů a judikaturu z něj Claude
  nebere.
- Opravená adresa konektorů `merk` a `leady` (lomítko na konci), bez níž se
  přihlášení k Saleskitu nepodařilo.

**tarpan 4.0.0 · tarpan-legal 1.8.0 · tarpan-partners 1.0.2**

- Konektor Merk je nově **oficiální Merk od Saleskitu** (`merk`) místo našeho
  `tarpan-merk`. Přibyl konektor **Leady** (`leady`): ukáže, které firmy
  navštívily web kanceláře, co si prohlížely a jak dlouho.
- **Oba je potřeba jednou připojit:** v Claude u konektoru `merk` i `leady`
  klikni na **Connect** a přihlas se svým účtem Saleskit (API klíč se zadává
  tam). Bez připojení prověrky firem přes Merk nefungují.
- Leady ukazuje data jen tehdy, je-li na webu kanceláře vložený jeho měřicí kód.
- Částky z Merku u českých firem chodí v tisících Kč; skill je přepočítává.
- **Komentáře** (TARPAN Legal) pokrývají nově 14 předpisů: přibyl zákon
  o podnikání na kapitálovém trhu, zákon o advokacii, advokátní tarif
  a etický kodex ČAK (hledá se podle článku, např. „čl. 9a“). U etického
  kodexu Claude upozorní, že platné znění článku ověřené není.
- Skilly `advokat` a `pravni-reserse` používají nový konektor Merk.

**tarpan 3.0.1 · tarpan-legal 1.7.4 · tarpan-partners 1.0.1**

- `remove-ai-marks` v hlášení uvádí jen znaky, které opravdu odstranil;
  co v textu zůstalo (např. pevné mezery bez `--spaces`), vypíše zvlášť.
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

Konektory vracejí údaje z veřejných rejstříků a databází a z veřejného webu, ne
právní stanovisko. Informace z webu jsou neověřené a vždy s odkazem na zdroj.
Co z nich přijde, je podklad — právní kvalifikaci a odpovědnost za výstup nese
advokát. U ekonomických a vazebních dat platí navíc, že vypovídají o tom, co je
zapsané; nezapsaný stav v nich není.

## Kde jsou zdrojáky

Zdrojové kódy workerů, testy a vývojová dokumentace jsou ve vývojovém
repozitáři `forest2000/tarpan`. Sem se překlápí jen to, co se instaluje.

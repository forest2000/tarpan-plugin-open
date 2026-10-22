# TARPAN — základ

Veřejné rejstříky, katastr a právní výpočty, včetně generování výpisů do Wordu
v grafické úpravě TARPAN. Tenhle plugin je **základ obou balíčků** — instaluje
se sám jako závislost balíčku TARPAN Legal i TARPAN Partners a není potřeba ho
instalovat zvlášť.

## Konektory

| Konektor | Zdroj dat |
|---|---|
| `tarpan-ares` | ARES (Ministerstvo financí ČR) — obchodní a živnostenský rejstřík, RES, RÚIAN, historie zápisů, výpis do Wordu |
| `tarpan-katastr` | REST API dálkového přístupu k datům KN (ČÚZK) — parcely, stavby, jednotky, právo stavby, řízení, výpis do Wordu |
| `Sagasu` | insolvenční rejstřík, nespolehliví plátci DPH a zveřejněné účty, datové schránky, zaniklé subjekty, osoba → firmy, slovenské rejstříky, ČAK a SAK, plné texty listin, výpočty úroku z prodlení, odměny advokáta a soudního poplatku |
| `merk` | oficiální MCP Merk (Saleskit) — ekonomika firem v ČR a SR: obrat a zisk, finanční ukazatele, účetní výkazy, **graf vlastnických a personálních vazeb**, veřejné zakázky, provozovny, živnosti, vozový park |
| `leady` | oficiální MCP Leady (Saleskit) — které firmy navštívily web kanceláře, co si prohlížely a jak dlouho |
| `parallel-search` | Parallel Search — vyhledávání na veřejném webu a stažení stránek či PDF (bez přihlášení, s limitem dotazů); jen doplněk rejstříků |

`tarpan-ares` a `tarpan-katastr` běží jako Cloudflare Workers a přístupové údaje
si drží samy. `Sagasu` je konektor organizace. **`merk` a `leady` provozuje
Saleskit:** každý uživatel je v Claude připojí tlačítkem Connect a přihlásí se
svým účtem Saleskit (API klíč zadává tam, ne do pluginu). Leady vrací data, jen
pokud je na webu kanceláře vložený jeho měřicí kód. **`parallel-search` provozuje
Parallel (USA)** bez přihlášení, s nižším limitem dotazů; dotazy odcházejí k němu,
proto se do nich nedávají údaje o klientovi.

Judikatura a znění předpisů tu **nejsou** — patří do balíčku TARPAN Legal
(konektory `Salvia` a `esbirka`).

## Skill `tarpan`

Metodika, která ty sady drží pohromadě: kam se kterým dotazem, jak
identifikovat subjekt a nemovitost, jak je propojit přes kód adresního místa
RÚIAN, jak vypadá prověrka protistrany krok za krokem, co která databáze
neposkytuje a jak psát výsledek, aby byl ověřitelný.

Podrobnosti k jednotlivým sadám jsou v `skills/tarpan/references/` a načítají se
až ve chvíli, kdy jsou potřeba.

## Skilly `rukopis` a `remove-ai-marks`

Dvě vrstvy přípravy textu k odeslání, v tomto pořadí:

| Skill | K čemu |
|---|---|
| `rukopis` | přepíše text od Clauda tak, aby nezněl jako od AI a zněl jako od uživatele — podle jeho stylového profilu (`~/.claude/tarpan/rukopis.md`); fakta a právní registr nemění |
| `remove-ai-marks` | z hotového souboru odstraní neviditelné znaky a metadata s AI proveniencí; ověřitelně, s počty |

`rukopis` nahradil dřívější skilly `cistopis` a `humanizer`.

## Co je dobré vědět

REST API ČÚZK **neposkytuje jména vlastníků, podíly ani nabývací tituly** —
vrací číslo LV a katastrální území. Vlastník se ověřuje v Nahlížení do KN nebo
úplným výpisem; skill na to sám upozorňuje a do výpisu doplňuje proklik.
Přehled vlastnictví pro konkrétní osobu API neumí vůbec.

**Merk není rejstřík.** Vrací aktuální údaje o firmě, ale **nemá historii zápisů**
— dřívější firmu, bývalá sídla, vymazané členy orgánů ani data vzniku a zániku
funkce. Kdo směl jednat k datu podpisu, se zjistí jedině z ARES. Company index
je bonitní skóre Merku, tedy model, ne zjištěný fakt, a insolvence z Merku je
přebraná — závazný je ISIR přes Sagasu.

**Část volání Merku je placená** a ubírá z měsíčního limitu předplatného
(našeptávač, účetní výkazy, veřejné zakázky, provozovny, živnosti, zaměstnanci,
vozový park, odpady). Finanční ukazatele, profil firmy a graf vazeb placené
nejsou. **Částky u českých firem chodí v tisících Kč.**

API KN má limit **500 volání za den** (`kn_sluzba` s `co: "stav_uctu"` vrátí
zbytek) a vyhledávání polygonem je omezené na 5 000 m². Limity mají i Merk
a bezplatný Parallel Search.

`dph_status` se ptá podle DIČ; u fyzických osob je DIČ CZ + rodné číslo, takže
se nesmí skládat ručně jako CZ + IČO. Skill to hlídá.

Výpisy generované tímto pluginem mají informativní charakter, nejsou veřejnou
listinou a nenahrazují výpis vydaný podle § 55 katastrálního zákona.

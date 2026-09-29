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
| `tarpan-merk` | Merk (api.merk.cz) — ekonomika firem v ČR a SR: obrat a zisk, 42 finančních ukazatelů, účetní výkazy po řádcích, **graf vlastnických a personálních vazeb**, veřejné zakázky, provozovny, živnosti, vozový park |

`tarpan-ares`, `tarpan-katastr` a `tarpan-merk` běží jako Cloudflare Workers
a přístupové údaje si drží samy. `Sagasu` je konektor organizace.

Judikatura a znění předpisů tu **nejsou** — patří do balíčku TARPAN Legal
(konektory `Salvia` a `esbirka`).

## Skill `tarpan`

Metodika, která ty čtyři sady drží pohromadě: kam se kterým dotazem, jak
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
(našeptávač, účetní výkazy, veřejné zakázky, provozovny, živnosti, kontaktní
osoby, vozový park, odpady). Konektor to u každé takové odpovědi hlásí a nástroj
`merk_limity` ukáže zůstatek. Finanční ukazatele a graf vazeb placené nejsou.

API KN má limit **500 volání za den** (`kn_sluzba` s `co: "stav_uctu"` vrátí
zbytek) a vyhledávání polygonem je omezené na 5 000 m². Ostatní konektory
takový limit nemají.

`dph_status` se ptá podle DIČ; u fyzických osob je DIČ CZ + rodné číslo, takže
se nesmí skládat ručně jako CZ + IČO. Skill to hlídá.

Výpisy generované tímto pluginem mají informativní charakter, nejsou veřejnou
listinou a nenahrazují výpis vydaný podle § 55 katastrálního zákona.

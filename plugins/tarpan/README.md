# TARPAN

Veřejné rejstříky, judikatura a právní výpočty v jednom balíčku, včetně
generování výpisů do Wordu v grafické úpravě TARPAN.

## Konektory

| Konektor | Zdroj dat |
|---|---|
| `tarpan-ares` | ARES (Ministerstvo financí ČR) — obchodní a živnostenský rejstřík, RES, RÚIAN, historie zápisů, výpis do Wordu |
| `tarpan-katastr` | REST API dálkového přístupu k datům KN (ČÚZK) — parcely, stavby, jednotky, právo stavby, řízení, výpis do Wordu |
| `Sagasu` | insolvenční rejstřík, nespolehliví plátci DPH a zveřejněné účty, datové schránky, zaniklé subjekty, osoba → firmy, slovenské rejstříky, ČAK a SAK, plné texty listin, výpočty úroku z prodlení, odměny advokáta a soudního poplatku |
| `Salvia` | judikatura obecných soudů, NS, NSS, ÚS a insolvenčního rejstříku, znění českých předpisů |

`tarpan-ares` a `tarpan-katastr` běží jako Cloudflare Workers a přístupové údaje
si drží samy. `Sagasu` a `Salvia` jsou konektory organizace a plugin je
odkazuje jménem, ne adresou.

## Skill `tarpan`

Metodika, která ty čtyři sady drží pohromadě: kam se kterým dotazem, jak
identifikovat subjekt a nemovitost, jak je propojit přes kód adresního místa
RÚIAN, jak vypadá prověrka protistrany krok za krokem, co která databáze
neposkytuje a jak psát výsledek, aby byl ověřitelný.

Podrobnosti k jednotlivým sadám jsou v `skills/tarpan/references/` a načítají se
až ve chvíli, kdy jsou potřeba.

## Co je dobré vědět

REST API ČÚZK **neposkytuje jména vlastníků, podíly ani nabývací tituly** —
vrací číslo LV a katastrální území. Vlastník se ověřuje v Nahlížení do KN nebo
úplným výpisem; skill na to sám upozorňuje a do výpisu doplňuje proklik.
Přehled vlastnictví pro konkrétní osobu API neumí vůbec.

API KN má limit **500 volání za den** (`kn_sluzba` s `co: "stav_uctu"` vrátí
zbytek) a vyhledávání polygonem je omezené na 5 000 m². Ostatní konektory
takový limit nemají.

`dph_status` se ptá podle DIČ; u fyzických osob je DIČ CZ + rodné číslo, takže
se nesmí skládat ručně jako CZ + IČO. Skill to hlídá.

Výpisy generované tímto pluginem mají informativní charakter, nejsou veřejnou
listinou a nenahrazují výpis vydaný podle § 55 katastrálního zákona.

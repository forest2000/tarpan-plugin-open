# Newton Media — mediální monitoring kanceláře

Referenční list ke konektoru `tarpan-newton`. Newton Media sleduje tisk, web,
TV a rozhlas podle monitoringů, které má kancelář u Newtonu objednané.
Konektor čte; jediný zápis je `newton_slozka` (viz Pravidla).

**Přihlášení:** uživatel konektor v Claude připojí tlačítkem Connect a na
přihlašovací stránce TARPAN zadá svůj login a heslo do Newtonu. Každý vidí jen
monitoringy svého účtu. Není-li konektor připojený, nebo vrátí chybu
přihlášení, řekni to (po změně hesla v Newtonu je potřeba konektor odpojit
a připojit znovu) a mediální výstupy nedomýšlej.

## Nástroje

- `newton_monitoringy` — `{monitoringy: [id, název, kód, role, branchId]}`, případně
  `nepodarilo_se` (co se nenačetlo); volej jako první.
- `newton_monitoring(monitoring_id)` — témata, složky, země (kódy), kategorie zdrojů
  a předplatné; ID témat a složek zužují hledání.
- `newton_hledat(monitoring_id, …)` — mediální výstupy za období (výchozí 7 dní),
  filtry: `dotaz`, `nazev`, `autor`, `temata`, `slozky`, `zdroje`, `porady`,
  `typy_medii`, `sentiment`, `dulezite`, `razeni`. Vrací **přehled**: u článku
  `id`, `kod`, `titulek`, `medium`, `datum`, `url`, `autor`, `tema`,
  `delka_textu` a `vynatky` (kolem hledaného výrazu, bez dotazu začátek textu);
  a `skupina`. Převzaté kopie se **neslučují** — každý článek je samostatná
  položka, takže `nalezeno_na_strance` odpovídá počtu položek v `clanky`.
  `skupina` je ID, do kterého článek zařadil Newton (jinak `null`). Je to
  **domněnka Newtonu**, ne zjištění o přetisku: do jedné skupiny dává i texty
  s vlastním obsahem (regionální zpravodajství, komentář) a skupiny během
  hodin mění. Piš tedy „Newton řadí k téže zprávě i …“, a za přetisk označ
  jen to, co jsi doložil shodným textem.
  `delka_textu` do ~200 znaků je jen perex za paywallem, víc Newton nemá.
  Stránkuj přes `stranka`/`velikost` (max. 40); `dalsi_stranka: true` = nejspíš
  je další.
- `newton_clanek(monitoring_id, clanky, cast?)` — celý text 1–5 článků podle
  `id` z přehledu; dlouhý text po částech (`casti_celkem`, další přes `cast` 2, 3…).
- `newton_naseptavac(monitoring_id, dotaz)` — ID zdrojů, autorů a pořadů pro filtry.
- `newton_alerty` a `newton_alert_clanky` — alerty a newsmaily a jejich články
  (stejný přehled jako u hledání). Články alertu si vyžádej jeho `notifikace_id`
  a `rule_history_id`.
- `newton_media(monitoring_id, kody_clanku, druh?)` — odkazy na e-clipy a videa
  (u TV a rozhlasu přepis); `druh: dostupnost` řekne, kolik e-clipů má článek
  v typu podle `typ_eclipu` (výchozí Print, 0 = žádný) — jiné typy zjistíš
  dalším voláním.
- `newton_eclip_obrazek` — e-clip jednoho článku jako obrázek k přečtení (má-li
  článek víc stran, vrátí první); i z něj cituj doslovný výňatek s médiem, datem
  a odkazem na článek.
- `newton_vydani`, `newton_metadata` — číslo vydání, detail zdrojů, pořadů, autorů.
- `newton_ucet` — účet a role; použij, když Newton vrátí 403.
- `newton_zakaznici` — jen pro administrátorský účet Newtonu.
- `newton_slozka` — **mění data v Newtonu** (přidá nebo odebere články ve složce).

## Pravidla

- `newton_slozka` volej jen na výslovný pokyn uživatele a předem mu řekni,
  které články a kterou složku změníš.
- Postup: nejdřív přehled; na otázku „co se psalo“ často stačí výňatky.
  Celé texty (`newton_clanek`) načti jen u článků podstatných pro dotaz
  (shrnutí, citace, posouzení tónu či rizik), ne u všech. Jeden text za
  skupinu stačí jen u článků se shodným titulkem i `delka_textu`; při odlišném
  titulku nebo délce si text přečti, než ho odložíš jako kopii — bývá v něm
  vlastní zjištění (vyjádření mluvčího či úřadu, jiný termín).
- Každou informaci z médií uveď s **doslovným výňatkem** (v uvozovkách, z
  `vynatky`, z textu článku, z přepisu `newton_media` nebo z e-clipu) a odkazem: médium, datum a `url`, jak je
  Newton vrátil. Co výňatkem nedoložíš, nepiš. U zprávy, kterou Newton řadí
  k více médiím (stejná `skupina`), zmiň i ta ostatní. Původ tvrď jen tehdy,
  když ho máš na čem: celou skupinu (dočtené stránky až `dalsi_stranka: false`,
  nebo `razeni: nejstarsi`) **a** v textu znak původní zprávy — článek se sám
  označuje za tiskovou zprávu, nebo nese vlastní rozhovor či vyjádření, které
  ostatní jen přebírají. Jedna stránka na to nestačí, skupina může pokračovat
  na další. Jinak cituj médium, z něhož výňatek opravdu máš, a původ netvrď. Co v Newtonu není, neznamená, že o subjektu nikdo nepsal: monitoring
  sleduje jen nastavená témata a zdroje.
- Hledá se jen v monitoringu, ne v celém mediálním archivu. Nenajde-li se
  subjekt, řekni, ve kterém monitoringu a za jaké období jsi hledal.
- O fyzických osobách hledej jen pro konkrétní věc; žádné plošné sledování osob.
- Mediální výstup není rejstříkový údaj. Fakta o firmě (jednatel, sídlo,
  insolvence) ověř v ARES a Sagasu.

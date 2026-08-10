# ARES — referenční přehled

Zdroj: Administrativní registr ekonomických subjektů (Ministerstvo financí ČR).
Konektor je průchozí, nic se neukládá.

## Nástroje

| Nástroj | K čemu |
|---|---|
| `ares_vyhledat` | název, adresa, právní forma, CZ-NACE, finanční úřad → seznam subjektů a IČO |
| `ares_detail_vse` | jedno IČO → data ze všech registrů najednou (výchozí volba) |
| `ares_detail` | jedno IČO z jednoho registru |
| `ares_vyhledat_registr` | dávkově více IČO z jednoho registru |
| `ares_standardizovat_adresu` | validace adresy proti RÚIAN → **kód adresního místa**, GPS |
| `ares_ciselnik` | překlad kódů (právní forma, CZ-NACE, finanční úřad) |
| `ares_vypis` | odkaz na kompletní výpis do Wordu v úpravě TARPAN |
| `ares_notifikace_vyhledat`, `ares_notifikace_davka` | monitoring změn subjektů |

## Registry

`zaklad` je agregované jádro — identifikace, adresa, právní forma, DIČ, seznam
registrací. `vr` (veřejný/obchodní rejstřík) je nejbohatší: statutární orgán,
jednatelé, společníci, základní kapitál, předmět podnikání a celá historie
včetně dat zápisu a výmazu. `rzp` je živnostenský rejstřík, `res` statistický
registr. Pro úplný obraz volej `ares_detail_vse`.

## Kontrola dokumentu proti rejstříku

Když uživatel předloží smlouvu, plnou moc nebo podání, porovnej proti aktuálním
datům podle IČO v tomto pořadí:

1. **Jednající osoba** — je stále zapsaným členem statutárního orgánu? Odpovídá
   způsob jednání tomu, jak je podepsáno (samostatně / společně dva)? Tohle je
   nejčastější a nejzávažnější vada.
2. **Obchodní firma** — přesné znění včetně právní formy a interpunkce.
3. **Sídlo** — celá adresa; PSČ ve tvaru „110 00".
4. **IČO a DIČ.**
5. **Spisová značka** — soud, oddíl, vložka.

Zastaralý údaj (vymazaný jednatel, bývalé sídlo, starý název) označ jako riziko
a rovnou nabídni aktuální hodnotu. Nikdy jen nekonstatuj rozdíl — napiš, co z něj
plyne (např. že smlouvu podepsala osoba, která už není oprávněna jednat).

## Doplňování údajů do dokumentu

Doplňuj sídlo, zastoupení (jednatel + funkce + způsob jednání), IČO, DIČ,
spisovou značku a ID datové schránky. Formulace pro záhlaví smlouvy:

> obchodní firma, se sídlem …, IČO …, zapsaná v obchodním rejstříku vedeném
> Městským soudem v Praze, oddíl C, vložka …, zastoupená … , jednatelem

## Signály rizika

Stav subjektu jiný než aktivní, likvidace, insolvence, zápis o zahájení řízení
o výmazu, nesoulad mezi registry (například subjekt existuje v RŽP, ale nikoli
ve VR), krátká doba od vzniku u protistrany velké transakce. Na tyto věci
upozorni sám od sebe, i když se uživatel ptal na něco jiného.

## Propojení s katastrem

`ares_detail_vse` vrací v adrese sídla kód adresního místa RÚIAN. Ten předej
nástroji `kn_stavba_adresni_misto` a získáš budovu, ve které firma sídlí —
včetně čísla LV, parcel pod stavbou a seznamu jednotek. Pozor: sídlo firmy
neznamená, že budovu vlastní; vlastníka ověř podle LV v Nahlížení do KN.

Nesedí-li adresa přesně, nech ji nejdřív standardizovat nástrojem
`ares_standardizovat_adresu`.

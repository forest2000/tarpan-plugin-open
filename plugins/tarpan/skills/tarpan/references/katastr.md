# Katastr nemovitostí — referenční přehled

Zdroj: REST API dálkového přístupu k datům KN (ČÚZK), `api-kn.cuzk.gov.cz/api/v1`.
Konektor drží API klíč sám, uživatel nic nezadává.

## Nástroje

| Nástroj | Vstup | Vrací |
|---|---|---|
| `kn_uzemi` | `uroven` + `nazev` / `kod` / `nadrizeny_kod` | kraje, okresy, obce, části obcí, katastrální území |
| `kn_ciselnik` | `ciselnik` (+ `kod`, `nazev`) | druhy pozemku, typy staveb a jednotek, způsoby využití a ochrany, pracoviště |
| `kn_parcela_vyhledani` | k. ú. + kmenové číslo (+ poddělení) | úplný detail parcely |
| `kn_parcela_detail` | ISKN ID | totéž podle ID |
| `kn_parcela_sousedni` | ISKN ID | sousední parcely |
| `kn_parcela_polygon` | pole souřadnic | parcely s definičním bodem v polygonu |
| `kn_stavba_vyhledani` | část obce + číslo domovní | detail stavby |
| `kn_stavba_detail` | ISKN ID | totéž podle ID |
| `kn_stavba_adresni_misto` | kód adresního místa RÚIAN | stavba na dané adrese |
| `kn_stavba_polygon` | pole souřadnic | stavby v polygonu |
| `kn_jednotka_vyhledani` | část obce + č. domovní + č. jednotky | jednotky |
| `kn_jednotka_detail` | ISKN ID | detail jednotky |
| `kn_pravo_stavby` | `id` / `parcela_id` / `stavba_id` | právo stavby |
| `kn_rizeni_vyhledani` | typ + číslo + rok + pracoviště | řízení vč. stavu a operací |
| `kn_rizeni_detail` | ISKN ID | detail řízení |
| `kn_rizeni_prijate_dne` | typ + pracoviště + datum | všechna řízení přijatá ten den |
| `kn_sluzba` | `co` | aktuálnost dat, stav účtu, provoz, health, číselník zpráv |
| `kn_vypis` | `typ` + `id` (+ `ico`, `sousedni`, `format`) | výpis do Wordu |

## Typy a kódy, na kterých záleží

**Typ parcely** — `PKN` parcela katastru nemovitostí (výchozí), `PZE` parcela
zjednodušené evidence. U PZE má smysl `puvod_parcely_ze`: 3 evidence
nemovitostí, 4 pozemkový katastr, 6 přídělový plán nebo jiný podklad.

**Druh číslování parcely** — 1 stavební („st. 123"), 2 pozemková. Nevyplníš-li
ho, konektor zkusí nejdřív 2, pak 1, a v poli `pouzite_parametry` napíše, co
nakonec zabralo. Když uživatel řekne „st. 1713", jde o stavební parcelu.

**Typ stavby** — 1 číslo popisné, 2 číslo evidenční. Stejná automatika (nejdřív 1,
pak 2).

**Typ řízení** — `V` vklad, `Z` záznam, `PGP` potvrzení geometrického plánu,
`PD` podací deník, `ZPV` pomocné řízení V.

**Typ vazby stavby k pozemku** — `PostavenaNaPozemku`, `JeSoucastiPozemku`
(§ 506 odst. 1 o. z.), `JeSoucastiPravaStavby` (§ 1240 a násl. o. z.). U
transakcí je to podstatné: je-li stavba součástí pozemku, nepřevádí se zvlášť.

## Časté chyby a pasti

- **Číslo jednotky menší než 10000** — API hledá číslo modulo 10000 ve všech
  částech budovy a může vrátit více jednotek se stejným číslem v různých
  vchodech. Nech si potvrdit, o kterou jde, nebo použij plné číslo (např. 15001).
- **Sousední parcely** fungují jen tam, kde je digitální katastrální mapa. Prázdný
  výsledek neznamená chybu, ale území bez DKM.
- **HTTP 404** znamená „nenalezeno", nikoli výpadek. Zkontroluj kód území a číslo;
  u starých parcel zkus `typ_parcely: "PZE"`.
- **Souřadnice polygonu** jsou v S-JTSK (EPSG:5514/5513) v metrech, max. dvě
  desetinná místa. Nejsou to WGS84 stupně.
- **Kód obce ≠ kód části obce.** Pro stavby a jednotky je potřeba část obce
  (`kn_uzemi` s `uroven: "cast_obce"` a `nadrizeny_kod` = kód obce).

## Plomby

Pole `rizeniPlomby` u parcely, stavby, jednotky i práva stavby obsahuje řízení,
ve kterých je nemovitost dotčena změnou právního vztahu. Je-li neprázdné, uveď to
jako první a vyjmenuj spisové značky ve tvaru `V-1234/2026`. Detail dohledáš přes
`kn_rizeni_detail` s ISKN ID z plomby, stav úhrady správního poplatku a provedené
operace jsou v odpovědi.

## Ochrana a omezení, která mají právní dopad

Pole `zpusobyOchrany` — zemědělský půdní fond (odnětí podle zákona o ochraně
ZPF), pozemek určený k plnění funkcí lesa, památková zóna nebo rezervace,
chráněná krajinná oblast, ochranné pásmo. Pokud se řeší stavební záměr, na tyto
zápisy upozorni sám od sebe.

Pole `bpej` (bonitované půdně ekologické jednotky) je podkladem pro výpočet
odvodů za odnětí ze ZPF.

## Výpis

`kn_vypis` umí čtyři typy: `parcela`, `stavba`, `jednotka`, `pravo_stavby`.
Volitelně `ico` (doplní vlastníka z ARES), `sousedni: true` (u parcely připojí
sousední parcely), `format: "odkaz"` (vrátí jen URL místo dokumentu).

Dokument obsahuje identifikaci, údaje o nemovitosti, BPEJ, způsoby ochrany,
stavby a práva stavby, plomby, číslo LV s prokliky do Nahlížení do KN a patičku
s časem aktuálnosti dat. Grafika je shodná s výpisem z ARES.

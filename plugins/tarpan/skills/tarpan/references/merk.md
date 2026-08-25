# Merk — ekonomika a vazby, a čím se liší od rejstříků

Referenční list ke konektoru `tarpan-merk` (Merk API, `api.merk.cz`). Merk je komerční
databáze firem pro Česko a Slovensko. V TARPANu je zdrojem **ekonomiky a vazeb**, ne
zdrojem rejstříkových údajů.

## Co Merk je a co není

| Otázka | Kam patří |
|---|---|
| Kdo je zapsaný jako jednatel a jak jedná? | **ARES** (`ares_detail_vse`) |
| Kdy byl kdo zapsán a vymazán, jaké bylo dřívější sídlo? | **ARES** — historii zápisů má jen on |
| Probíhá insolvence? | **Sagasu** (`insolvence_vyhledat`), ISIR je závazný |
| Znění stanov, notářský zápis, originál závěrky | **Sagasu** (`sbirka_listin` → `listina_text`) |
| Jak si firma stojí hospodářsky? | **Merk** (`merk_firma`, `merk_ukazatele`, `merk_vykazy`) |
| Kdo firmu ovládá a přes koho je propojená? | **Merk** (`merk_vazby`, `merk_cesta`) |

Merk vrací i sídlo, právní formu a stav — ale **bez historie**. Pro otázku „směla ta
osoba k datu podpisu jednat?" je to nepoužitelné. Odpověď `merk_firma` na to sama
upozorňuje; tu výhradu ve výstupu neškrtej.

## Placená volání

Merk má vedle limitu volání za minutu i **měsíční limity předplatného**. Následující
nástroje z nich ubírají při každé úspěšné odpovědi:

`merk_naseptavac` · `merk_vykazy` · `merk_zakazky` · `merk_provozovny` ·
`merk_licence` · `merk_zamestnanci` · `merk_vozidla` · `merk_odpady`

Ostatní nástroje jsou v rámci předplatného zdarma. Před prověrkou většího seznamu
nebo dávkou dotazů zavolej **`merk_limity`** — vypíše limit, čerpání a zůstatek
u každé položky, a taky jestli máte vůbec zapnuté vazby a události.

Limity volání za minutu se liší podle endpointu (10 u výkazů, ukazatelů, událostí
a číselníků; 600 u našeptávače a vyhledávání). Konektor si rozestup hlídá sám.

## Ekonomické údaje

**Obrat a velikost jsou pásma, ne čísla.** `merk_firma` vrací `obrat_pasmo`
(„100–500 mil. Kč") a `velikost_pasmo`, u obojího `trend`. U části subjektů jde
o odhad — do výstupu to piš jako pásmo, ne jako přesnou částku.

**Zisk, EBITDA a poslední závěrka** už jsou konkrétní čísla s rokem. Vždy uveď rok,
ke kterému se vážou; „firma měla zisk 1,2 mil." bez roku je zavádějící.

**Částky chodí v TISÍCÍCH Kč.** Konektor je přepočítává a vrací v poli `v_kc`, vedle
zůstává zdrojová hodnota (`zdroj_tis_kc`, resp. `hodnota` u ukazatelů) na kontrolu.
**Do podání piš korunovou částku z `v_kc`**, ne zdrojové číslo — jinak se spleteš
o tři řády. Týká se to zisku, EBITDA i absolutních ukazatelů (tržby, EBIT, cizí
zdroje, přidaná hodnota); poměry a indexy jednotku nemají.

**Company index** je vlastní bonitní skóre Merku. **Není** to rating podle zvláštního
předpisu ani úvěrové hodnocení a nesmí se tak podávat. Uváděj ho jen s označením, že
jde o skóre Merku, nebo ho neuváděj vůbec. Konektor k číslu dopočítává i písmenný
stupeň podle tabulky z dokumentace API (A+++ ≥ 95 · A++ ≥ 92 · A+ ≥ 85 · A ≥ 75 ·
B ≥ 60 · C ≥ 50 · D ≥ 45 · E ≥ 35 · FX < 35) — a ta výhrada platí i pro něj.

## Finanční ukazatele a výkazy

`merk_ukazatele` vrací 42 ukazatelů po letech, česky pojmenovaných: likvidita 1–3,
běžná a celková zadluženost, koeficient samofinancování, finanční páka, ROA, ROE, ROS,
marže, EBIT, EBITDA, EVA, pracovní kapitál, obrátky pohledávek, zásob a závazků,
Z-skóre, index bonity, Tafflerův index, rychlý test. **Hity nestojí** — je to první
volba, když jde o hospodářský obraz.

`merk_vykazy` vrací rozvahu a výsledovku po řádcích. Kódy polí (`p1201`, `p40012`…)
překládá konektor na české názvy podle oficiálního schématu API; nulové řádky ve
výchozím nastavení vynechává (`jen_nenulove`). Kód, který ve schématu není, skončí
v poli `nezmapovano` — nezahazuje se mlčky. **Hity stojí.**

Obojí je **dopočtené z účetní závěrky uložené ve sbírce listin**. Za správnost odpovídá
účetní jednotka. Potřebuješ-li citovat, cituj listinu ze sbírky (Sagasu), ne Merk.
A pamatuj, co ukazatele znamenají: vypovídají o účetním obrazu, ne o platební morálce
ani o schopnosti splnit konkrétní závazek.

## Graf vazeb

Tohle je věc, kterou v TARPANu neumí nikdo jiný.

- `merk_vazby` kolem firmy (`ico`) nebo osoby (`person_id`) vrátí **uzly** (firmy
  a osoby) a **hrany** (vazby) s podílem v procentech, vkladem, rolí, funkcí a daty
  od–do.
  - **`kroky` je ve výchozím stavu 1**, tedy jen přímé vazby. Na vlastnickou
    strukturu přes prostředníky nastav 2 až 3.
  - **`stav`** rozlišuje `aktualni` (trvající vazby), `historicke` (ukončené)
    a `vse` (výchozí). Nerozlišuje vlastnictví od funkce.
  - **`role_id`** filtruje podle role z číselníku `company_role`
    (`merk_ciselnik` s `ktery: "company_role"`) — například 1 je člen statutárního
    orgánu, 3 prokurista, 4 člen dozorčí rady. Tohle je ta osa „vlastník versus
    funkcionář".
  - `podil_od` odfiltruje drobné podíly.
- `merk_osoba` najde osobu podle jména a případně data narození a vrátí `person_id`.
  **Jmenovci jsou běžní** — příjmení Novák má v Merku přes čtrnáct tisíc záznamů.
  Nástroj vypíše nejvýš dvacet a řekne, kolik jich je celkem; takový výběr ke
  ztotožnění nestačí. Doplň datum narození, nebo osobu hledej přes firmu, u které
  má být ve funkci.
- `merk_cesta` najde nejkratší cestu mezi dvěma uzly. Na propojenost stran, střet
  zájmů a osoby blízké podle § 22 občanského zákoníku.

Uzel firmy se zapisuje jako `cz-12345678`, uzel osoby jako `person_id` z `merk_osoba`.

Vrátí-li se prázdný graf, nástroj napíše, co hledal — uzel, stav vazby a počet
kroků. Bývá to tím, že `kroky` zůstaly na jedničce.

**Pozor na velikost.** Graf velké firmy na dva kroky má klidně tisíce prvků (u ČEZu
přes 3 MB dat). Odpověď se proto ořezává na 300 prvků a hlásí to. Oříznutý graf je
nahodilý výběr — **nedá se z něj dovozovat, že něco chybí**. Než zvýšíš `kroky`,
zúž dotaz přes `podil_od` nebo `role_id`.

**Nenalezená cesta nic nedokazuje.** Znamená jen, že v datech Merku do zadaného počtu
kroků není. Stejně tak nalezená vazba sama o sobě neprokazuje ovládání ani jednání ve
shodě — to je právní kvalifikace, kterou musíš odůvodnit.

**Graf obsahuje osobní údaje** — jména, data narození, obce. Zpracovávej je jen
v rozsahu nutném pro věc a do výstupu klientovi dávej jen to, co je pro ni potřebné.
Plošný výpis všech osob kolem firmy do memoranda tam nepatří.

## Ostatní nástroje

- `merk_zakazky` — veřejné zakázky s předmětem, cenou s DPH, zadavatelem a odkazem do
  registru smluv. Rozhodné je znění zveřejněné v registru, na které vede odkaz.
- `merk_zamestnanci` — kontaktní osoby z veřejných zdrojů, **nikoli statutární orgán**.
- `merk_licence` — živnostenská oprávnění; historii adres a zaniklá oprávnění má
  živnostenský rejstřík v Sagasu.
- `merk_vozidla` — vozový park z registru silničních vozidel. Leasing ani zástavy
  z toho neplynou.
- `merk_udalosti`, `merk_zmeny`, `merk_nove_firmy` — sledování změn v čase. Období
  `od` a `do` je povinné a **má krátký strop**: události nejvýš 15 dnů, nové firmy
  3 dny, změny **1 den**. Delší období API odmítne; konektor to hlídá předem a řekne,
  že se dotaz musí rozdělit. Kódy událostí vysvětlí `merk_ciselnik`.
- `merk_hledat` — vyhledání firem podle oboru, okresu, PSČ, vzdálenosti, pásma obratu
  a velikosti, zisku a trendu. **Nejdřív `merk_ciselnik`** — bez kódů se filtr nedá
  postavit.
- `merk_vokativ` — jméno v 5. pádě na oslovení v dopise. V podání se strana označuje
  1. pádem.

## Prázdná odpověď

Merk vrací HTTP 204, když k subjektu data nemá. Konektor z toho dělá čitelnou zprávu
`nenalezeno`. Prázdná odpověď **neznamená, že subjekt neexistuje** ani že nic z toho
není — jen že to Merk nevede. U firmy bez závěrky ve sbírce listin nebudou ukazatele
ani výkazy, a je to normální stav.

## Konektor je jen pro čtení

Zápis do Merku (zakládání uživatelů, zpětná vazba k našeptávači) implementovaný není
a nebude — měnit stav v Merku patří do aplikace, ne do modelu.

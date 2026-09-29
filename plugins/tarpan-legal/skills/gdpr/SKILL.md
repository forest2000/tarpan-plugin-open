---
name: gdpr
description: Ochrana osobních údajů podle GDPR — posouzení zamýšleného zpracování, kontrola zpracovatelské smlouvy a vyřízení žádosti subjektu údajů. Použij VŽDY, když jde o osobní údaje: zda je zpracování přípustné a na jakém právním základu, kontrola nebo příprava zpracovatelské smlouvy, žádost o přístup, výmaz či námitka, předávání údajů mimo EU, porušení zabezpečení a ohlašování. Triggery: „GDPR", „osobní údaje", „zpracovatelská smlouva", „souhlas se zpracováním", „právo být zapomenut", „žádost o výmaz", „přístup k údajům", „únik dat", „ÚOOÚ", „DPA", „pověřenec". Netriggeruj pro doložku o mlčenlivosti bez osobních údajů (na tu je nda).
---

# Ochrana osobních údajů

Tři úlohy, každá s vlastním postupem. Urči na začátku, o kterou jde:

- **A. Smí se to?** — někdo chce něco dělat s osobními údaji a ptá se, jestli může.
- **B. Je ta smlouva v pořádku?** — kontrola nebo příprava zpracovatelské smlouvy.
- **C. Přišla žádost.** — subjekt údajů uplatnil právo a běží lhůta.

## Zdrojová poznámka — čti dřív, než začneš citovat

**GDPR není v e-Sbírce.** Konektor `esbirka` obsahuje české právo; nařízení (EU) 2016/679 je právo unijní a jeho text z něj nedostaneš. Z toho plyne pravidlo:

- **Články GDPR necituj doslovně z paměti.** Odkazuj na ně („podle čl. 6 odst. 1 písm. f) je právním základem oprávněný zájem") a řekni, že přesné znění je potřeba ověřit v úředním textu, případně si ho vyžádej od uživatele.
- **V e-Sbírce je zákon č. 110/2019 Sb.**, o zpracování osobních údajů — ten načítej normálně. Řeší, co GDPR nechává na členském státu (věk dítěte u souhlasu, výjimky, ÚOOÚ, zpracování pro novinářské a umělecké účely).
- **Judikatura je v Salvii** — hlavně index `nss` (ÚOOÚ je správní orgán, jeho rozhodnutí přezkoumávají správní soudy) a `us`. Rozhodnutí Soudního dvora EU tam nejsou; zmiňuj je jen jako odkaz, ne jako citát.

Tahle omezení nejsou důvod nepracovat — jsou důvod psát ve výstupu, co je ověřené a co ne.

---

## A. Smí se to? — posouzení zamýšleného zpracování

**1. Jsou to vůbec osobní údaje?** Údaj o identifikované nebo identifikovatelné žijící fyzické osobě. Pozor na to, co se za osobní údaj nepovažuje intuitivně: IP adresa, cookie identifikátor, pracovní e-mail ve tvaru jméno.příjmení, kombinace údajů, které samy o sobě nikoho neurčí. Údaje o zemřelém a o právnické osobě pod GDPR nespadají — mohou ale spadat jinam.

**2. Kdo je kdo?** Správce určuje účel a prostředky; zpracovatel zpracovává pro správce. Společní správci mají zvláštní režim. **Určit roli špatně je vada, která se propíše do celé smlouvy** — a bývá to nejčastější chyba u dodavatelů IT služeb, kteří se ve smlouvě označí za zpracovatele, ale ve skutečnosti rozhodují o účelu sami.

**3. Účel — konkrétně.** Ne „pro obchodní účely". Každý účel se posuzuje zvlášť a má vlastní právní základ.

**4. Právní základ** (čl. 6): plnění smlouvy · právní povinnost · oprávněný zájem · souhlas · životně důležitý zájem · veřejný zájem.

Dvě věci, které se pletou nejčastěji:
- **Souhlas není nejbezpečnější volba, ale nejkřehčí.** Musí být svobodný, konkrétní, informovaný, odvolatelný a stejně snadno odvolatelný jako udělený. Souhlas vyžadovaný jako podmínka služby, kterou lze poskytnout i bez něj, svobodný není.
- **Oprávněný zájem** vyžaduje test proporcionality a musí být zdokumentovaný. Nelze ho použít tam, kde zpracování subjekt rozumně nečeká.

**5. Zvláštní kategorie** (čl. 9) — zdraví, biometrie, náboženství, politické názory, sexuální orientace, odbory. Zákaz s úzkými výjimkami. Rozpoznat je je půlka práce; v personální agendě jsou skoro vždy.

**6. Povinnosti navázané na zpracování:**
- informování subjektu (čl. 13 a 14) — jiné, když se údaje získávají od subjektu, a jiné, když odjinud,
- záznamy o činnostech zpracování,
- posouzení vlivu (DPIA) u vysokého rizika — profilování, rozsáhlé zpracování zvláštních kategorií, systematické monitorování,
- pověřenec (DPO), je-li povinný,
- zabezpečení přiměřené riziku.

**7. Předávání mimo EU/EHP** (kap. V) — rozhodnutí o odpovídající ochraně, standardní smluvní doložky, závazná podniková pravidla. Ptej se výslovně, **kde jsou servery a kdo má do systému přístup** — poddodavatel s přístupem odjinud je předání, i když se data „nikam neposílají".

**Výstup:**

```
## Posouzení zpracování — [co se má dělat]

**Osobní údaje:** ano / ne — [proč]
**Role klienta:** správce / zpracovatel / společný správce
**Účely a právní základy**
| Účel | Základ | Poznámka |

**Zvláštní kategorie:** ano / ne
**Předání mimo EU:** ano / ne — [mechanismus]

### Co je potřeba udělat
1. …

### Rizika
[co může ÚOOÚ vytknout, s odstupňovanou závažností]

### Neověřeno
[co se nepodařilo ověřit — zejména doslovné znění článků GDPR]
```

---

## B. Zpracovatelská smlouva

Smlouva mezi správcem a zpracovatelem podle čl. 28. **Věta „strany se zavazují dodržovat GDPR" zpracovatelskou smlouvou není** a je to nejčastější nález — chybějící smlouva je porušení sama o sobě, nezávisle na tom, jestli se s údaji zachází dobře.

Zkontroluj, že smlouva obsahuje:

| Co | Na co si dát pozor |
|---|---|
| předmět, doba, povaha a účel zpracování | obecné vymezení nestačí; příloha s popisem je standard |
| druh údajů a kategorie subjektů | často chybí úplně |
| pokyny správce | zpracování jen podle doložených pokynů, včetně předání do třetí země |
| mlčenlivost osob | vázanost osob, které mají k údajům přístup |
| zabezpečení | konkrétní opatření, ne odkaz na „přiměřená opatření" |
| **poddodavatelé** | souhlas správce, seznam, oznámení změny s možností námitky, stejné povinnosti dál |
| součinnost při právech subjektů | lhůty musí umožnit správci stihnout jeho vlastní lhůtu |
| ohlášení porušení zabezpečení | **konkrétní lhůta zpracovatele**, kratší než ta, kterou má správce vůči úřadu — jinak správce svou lhůtu nestihne |
| součinnost při DPIA a předchozích konzultacích | |
| osud údajů po skončení | výmaz nebo vrácení podle volby správce, s výjimkou zákonné archivace |
| audit a kontrola | rozsah, frekvence, náklady |

**Na čí straně stojíš, rozhoduje.** Jako správce chceš krátké lhůty, právo na audit a odpovědnost zpracovatele; jako zpracovatel chceš vymezený rozsah součinnosti, náklady auditu na správci a limit odpovědnosti. Zeptej se, za koho jednáme, než začneš připomínkovat — postup je jinak stejný jako u skillu `kontrola-smlouvy`, včetně mezí podle `../kontrola-smlouvy/references/kogentni.md`.

---

## C. Žádost subjektu údajů

**Lhůta běží od doručení.** Zjisti datum jako první věc a spočítej konec konkrétním datem. Prodloužení je možné, ale musí se o něm subjekt vyrozumět v původní lhůtě — na to se zapomíná.

**1. O jaké právo jde?** přístup a kopie · oprava · výmaz · omezení zpracování · přenositelnost · **námitka** · nebýt předmětem automatizovaného rozhodování.

Rozlišuj je pečlivě: žádost formulovaná jako „chci, ať mě vymažete" je často námitka proti přímému marketingu, kde je režim jiný a jednodušší.

**2. Ověř totožnost** žadatele — přiměřeně, ne šikanózně. Nadměrné požadavky na doložení totožnosti jsou samy o sobě vada.

**3. Vztahuje se právo na tohle zpracování?**
- **výmaz** neplatí proti zpracování nutnému pro splnění právní povinnosti, pro určení a výkon právních nároků a pro archivaci podle zákona,
- **přenositelnost** jen u údajů poskytnutých subjektem, zpracovávaných automatizovaně na základě souhlasu nebo smlouvy,
- **námitka** u oprávněného zájmu vyžaduje posouzení; u přímého marketingu se vyhovuje bez posuzování.

**4. Práva jiných osob.** Kopie údajů nesmí nepříznivě dotknout práv jiných — u e-mailové korespondence, personálních spisů a záznamů obsahujících třetí osoby je potřeba anonymizovat.

**5. Odpověz a zdokumentuj.** Vyhovění i odmítnutí musí být odůvodněné a musí obsahovat poučení o možnosti podat stížnost u ÚOOÚ a o soudní ochraně.

**Výstup:**

```
## Žádost subjektu údajů — [kdo], [datum doručení]

**Uplatněné právo:** [...]
**Lhůta:** do [konkrétní datum] · prodloužení možné do [...]
**Totožnost ověřena:** ano / ne / jak

### Posouzení
[vztahuje se právo na tohle zpracování? výjimky?]

### Návrh odpovědi
[text k odeslání]

### Co doložit do spisu
[...]
```

---

## Meze

Tenhle skill posuzuje právní stránku. Nenahrazuje bezpečnostní posouzení ani technická opatření; kde je otázka technická (šifrování, retence, logy), řekni to a nepředstírej závěr.

U porušení zabezpečení s ohlašovací povinností jde o věc s běžící lhůtou — vezmi ji zároveň skillem `triaz-zadani`.

---

*Struktura vychází ze skillu `compliance-check` z pluginu `legal` od Anthropicu (repozitář `anthropics/knowledge-work-plugins`, licence Apache-2.0). Původní verze míchá GDPR s americkými předpisy o ochraně soukromí; tahle je omezená na unijní a českou úpravu.*

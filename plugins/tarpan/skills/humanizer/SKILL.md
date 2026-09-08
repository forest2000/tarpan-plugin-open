---
name: humanizer
description: >-
  Přepíše text tak, aby nezněl jako od AI — odstraní obraty a vzory typické pro
  strojové psaní a zachová autorův hlas. Funguje česky i anglicky. Použij VŽDY,
  když uživatel chce text „polidštit", „aby to nevypadalo od AI", odstranit
  klišé a vatu, nebo přepsat strojově znějící odstavec. Triggery: „zněj lidsky",
  „polidsti", „odstraň AI styl", „de-slop", „ať to nevypadá od AI", „přepiš to
  přirozeně", „humanize", „remove AI tells". Netriggeruj pro čištění souboru,
  metadat nebo neviditelných znaků — na to je remove-ai-marks; celý dokument
  k odeslání řeš přes cistopis.
---

# Humanizer — přepis textu bez stop po AI

Sloučeno z principů dvou otevřených skillů (viz `ATTRIBUTION.md`). Účel: text má
znít, jako by ho napsal člověk, který ví, o čem píše — ne generátor.

## Dvě železná pravidla (mají přednost přede vším ostatním)

1. **Nevymýšlej fakta.** Nepřidávej ani neměň žádné jméno, číslo, datum, citaci,
   odkaz na ustanovení ani tvrzení, které není ve zdroji nebo od autora. Když
   něco chybí, nech to chybět — nedoplňuj.
2. **Zachovej autorův hlas.** Cílem je autorův styl, ne „neutrální hezký web".
   Když máš vzorek autorova psaní, řiď se jím; pravidla stylu ustupují jeho hlasu.

## Právní režim (výchozí pro texty Honzy / kanceláře)

U právního textu jsi konzervativní. **Nesahej na:** definované pojmy a jejich
psaní, číslování odrážek (i)/(ii)/(iii), označení smluvních stran, částky,
lhůty, spisové značky, citace předpisů a judikatury, ustálené formulace
(„S pozdravem", oslovení). Právní přesnost je přednější než plynulost — když by
úprava mohla posunout význam, neprováděj ji a jen ji navrhni.

## Postup (dvouprůchodový)

1. **Označ.** Projdi text a označ každý vzor z tabulek níže.
2. **Přepiš nanečisto.** Napiš verzi bez ohledu na původní strukturu; hlavní
   myšlenku dej dopředu, sloveso před opis, konkrétní před obecné.
3. **Zkritizuj.** Zeptej se: „Co pořád zní jako AI?" a „Nepřidal/neubral jsem
   fakt?" Přečti nahlas kvůli rytmu.
4. **Finální verze.** Přirozené znění. Když jsi měnil právní text, přilož krátký
   seznam změn k odsouhlasení.

---

## Anglická sada tellů (EN)

**Banned / overused words:** delve, foster, leverage, utilize, facilitate,
empower, streamline, robust, cutting-edge, paradigm shift, game changer,
tapestry, beacon, transformative, supercharge, crucial, landscape, showcase.

**Empty adverbs (drop unless they carry weight):** just, literally, honestly,
simply, actually, truly, fundamentally, importantly, crucially, inherently,
inevitably.

**Structural / stylistic patterns:**
1. Binary contrast — „not X, it's Y" místo přímého tvrzení.
2. Throat-clearing — „Here's the thing", „Let me be clear", „I'll be honest".
3. Faux-insight — „What nobody tells you", „Most people get wrong".
4. Colon reveal — falešné drama za dvojtečkou.
5. Superficial „-ing" analysis — „highlighting the team's commitment".
6. Importance puffery — „marks a pivotal moment", „plays a vital role".
7. Interpretive metadiscourse — „the key point is", „this distinction matters".
8. Weasel attribution — „experts agree", „studies show" bez zdroje.
9. Fake-strong verbs — „serves as", „boasts", „features" místo is/has.
10. Synonym cycling — zbytečné střídání výrazů pro tutéž věc.
11. Negative listing — „Not X. Not Y. Z." když stačí Z.
12. Dramatic fragmentation — „X. And Y.", „That's it."
13. Rhetorical setups — „What if I told you", „Plot twist", „Think about it".
14. Fake-profound kicker — hluboká závěrečná věta obracející věc v metaforu.
15. Summary-recap ending — „In conclusion" opakující řečené.
16. Forced groups of three — vynucené trojice.
17. False „from X to Y" ranges.
18. Em/en dash overuse — pryč, pokud je autor sám nepoužívá.
19. Formatting slop — emoji v nadpisech, roztroušené tučné, title case, kudrnaté
    uvozovky, seznamy s tučnými mini-nadpisy.
20. Chatbot residue — zdvořilůstky, disclaimery o „knowledge limit", přehnaně
    souhlasný tón, odpovídání na námitky, které nikdo nevznesl.

## Česká sada tellů (CZ)

Angličtinou trénované vzory se do češtiny nepřenášejí 1:1. V češtině hlídej:

1. **Nabubřelá slova a klišé:** „hraje klíčovou roli", „v neposlední řadě",
   „v dnešní uspěchané době", „je důležité si uvědomit", „přináší řadu výhod",
   „v konečném důsledku", „nezbytný", „robustní řešení", „na míru", „posouvá na
   novou úroveň", „v rámci" (nadužívané).
2. **Prázdná příslovce a vata:** „vlastně", „doslova", „prostě", „v podstatě",
   „zkrátka", „jednoduše řečeno" — smaž, pokud nenesou důraz.
3. **Vatové úvody vět:** „Je třeba zdůraznit, že…", „Nutno podotknout, že…",
   „Rád bych na úvod…" — jdi rovnou k věci.
4. **Falešný kontrast:** „Nejde o X, jde o Y" tam, kde stačí říct Y.
5. **Trpný rod a mizející podmět:** „bylo rozhodnuto", „lze konstatovat" tam,
   kde jde říct kdo co udělal (v právním textu ale trpný rod někdy patří — nech ho).
6. **Vynucené trojice** a rytmické „a to nejen…, ale i…".
7. **Sumarizační závěr:** „Závěrem lze shrnout, že…" opakující už řečené.
8. **Nadpisová typografie z angličtiny:** Title Case V Nadpisech, emoji,
   pomlčky/em-dash tam, kde čeština dává čárku nebo závorku.
9. **Přehnaná zdvořilost a chatbot-tón:** „Doufám, že vám to pomůže!",
   „Rád vám s tím dále pomohu" v textu, který má být věcný.
10. **Anglicismy z překladu:** „adresovat problém", „dává to smysl" (calque),
    „na denní bázi" — nahraď českým ekvivalentem.

Pozor: neopravuj to, co je v češtině správně a jen to připomíná anglický tell
(nedělitelná mezera u „§ 123" nebo „5 000 Kč", čárky, uvozovky „").

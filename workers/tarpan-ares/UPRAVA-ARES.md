# TARPAN – ARES: odstranění loga (a oprava pomlček)

## Co je v balíčku

`tarpan-ares.bundle.js` — kompletní kód workeru připravený k nasazení, už bez
loga a s opravenými pomlčkami. Je to **upravená verze toho, co na Cloudflare
běží teď**, stažená z nasazeného workeru; nevznikla z tvých zdrojáků.

Proto platí: pokud si worker nasazuješ ze svého projektu (`wrangler deploy` ve
složce se `src/`), proveď stejné úpravy i tam — jinak je příští nasazení přepíše.
Postup je v části 3.

---

## 1. Nasazení rovnou (nejrychlejší)

**Přes web:** dash.cloudflare.com → Workers & Pages → `tarpan-ares` → **Edit code**
→ smaž obsah editoru, vlož celý obsah `tarpan-ares.bundle.js` → **Deploy**.

**Z terminálu:** ulož soubor jako `src/index.js` v prázdné složce s tímto
`wrangler.toml` a spusť `npx wrangler deploy`:

```toml
name = "tarpan-ares"
main = "src/index.js"
compatibility_date = "2026-08-02"
```

Worker ARES nepoužívá žádný secret, takže po nasazení není co donastavovat.

---

## 2. Ověření

Otevři výpis libovolného subjektu, například:

```
https://tarpan-ares.janforejtar.com/vypis/06229921
```

Dokument musí začínat rovnou nadpisem VÝPIS Z ARES (žádné logo) a u členů
statutárního orgánu musí být mezi jménem a funkcí čistá pomlčka, ne `â€"`.

---

## 3. Stejná úprava ve tvých zdrojácích

**Logo — tři zásahy a jeden smazaný soubor**

1. Smaž `src/logo_hex.js`.
2. V `src/index.js` odstraň řádek `import { LOGO_HEX } from "./logo_hex.js";`
   (v aktuálním buildu je logo jako `var LOGO_HEX = "89504e47…"`).
3. Změň hlavičku funkce z `function buildVypisRtf(data, logoHex) {`
   na `function buildVypisRtf(data) {` a smaž z jejího těla blok:

   ```js
   if (logoHex) {
     B.push(`\\pard\\sa40 {\\pict\\pngblip\\picwgoal1134\\pichgoal1134 ${logoHex}}\\par`);
   }
   ```

4. Volání změň z `buildVypisRtf(data, LOGO_HEX)` na `buildVypisRtf(data)`.

**Pomlčky — proč to bylo rozbité**

Dokument je RTF v kódování `ansicpg1250`. Text, který prochází přes `rtfEsc()`,
se převádí na RTF unicode escapes a je v pořádku. Jenže na několika místech se
pomlčka nebo tečka vkládá do šablony přímo, mimo `rtfEsc()` — a ta se pak ve
Wordu zobrazí jako `â€"`.

Ve funkci `buildVypisRtf` nahraď v řetězcích vkládaných do `B.push(...)`:

| původně | nově | kde |
|---|---|---|
| `—` (em dash) | `\\u8212?` | „— neaktuální", oddělovač jméno — funkce |
| `–` (en dash) | `\\u8211?` | odrážky oborů činnosti v RŽP |
| `·` (tečka) | `\\u183?` | „· vymazáno", „· st. přísl." |

Pozor: pomlčky **uvnitř** `rtfEsc("…")` nech být, ty jsou správně už teď.

---

## 4. Poznámka ke katastru

Konektor `tarpan-katastr` má tuto opravu i odstraněné logo už zapracované ve
zdrojácích, které jsi dostal dřív. Oba výpisy tak zůstávají graficky jednotné —
zlaté linky, kapitálky, patička, jen bez obrázku v záhlaví.

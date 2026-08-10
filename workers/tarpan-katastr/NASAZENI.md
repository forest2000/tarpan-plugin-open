# TARPAN – katastr: nasazení konektoru

Konektor je Cloudflare Worker (stejně jako `tarpan-ares` a `tarpan-sbirka`), který
mluví s REST API dálkového přístupu k datům KN (ČÚZK) a zároveň umí vygenerovat
výpis z katastru do Wordu v úpravě TARPAN.

Výsledná adresa bude **`https://tarpan-katastr.jan-forejtar.workers.dev`** —
to je zároveň URL konektoru.

---

## 1. Co je v balíčku

```
tarpan-katastr/
├── wrangler.toml                     ← konfigurace workeru
├── package.json
├── src/
│   ├── index.js                      ← MCP server, 18 nástrojů, všech 41 endpointů API KN
│   └── vypis.js                      ← generátor výpisu do RTF (úprava TARPAN)
├── dist/
│   └── tarpan-katastr.bundle.js      ← vše v jednom souboru (pro nasazení přes web)
└── test/
    └── offline-test.mjs              ← test bez sítě: `node test/offline-test.mjs`
```

---

## 2. Nasazení — varianta A: z příkazové řádky (doporučeno)

Otevři Terminál a postupuj přesně takto.

**Krok 1 — rozbal balíček a vstup do složky**

```bash
cd ~/Downloads
unzip tarpan-katastr.zip
cd tarpan-katastr
```

**Krok 2 — přihlášení k Cloudflare** (otevře se prohlížeč, potvrď „Allow“)

```bash
npx wrangler login
```

**Krok 3 — první nasazení**

```bash
npx wrangler deploy
```

Wrangler vypíše na konci adresu ve tvaru
`https://tarpan-katastr.jan-forejtar.workers.dev`. Tu si zkopíruj.

**Krok 4 — vložení API klíče ČÚZK jako secret**

```bash
npx wrangler secret put CUZK_KN_API_KEY
```

Wrangler se zeptá `Enter a secret value:` — vlož přesně tuto hodnotu a potvrď Enter:

```
<API klíč ČÚZK — najdeš ho v hesláři, do repozitáře nepatří>
```

Klíč se tím uloží zašifrovaně na straně Cloudflare; v žádném souboru není a do
gitu se nedostane. Změna se projeví okamžitě, není třeba znovu nasazovat.

---

## 3. Nasazení — varianta B: přes web Cloudflare (bez terminálu)

1. Otevři **dash.cloudflare.com** → v levém menu **Compute (Workers)** → **Workers & Pages**.
2. **Create** → **Start with Hello World!** → **Deploy**.
3. Nový worker přejmenuj na **`tarpan-katastr`** (Settings → General → Name → Rename).
4. Otevři **Edit code** (tlačítko `</>`), v editoru **smaž veškerý obsah** a vlož
   celý obsah souboru `dist/tarpan-katastr.bundle.js`. Pak **Deploy**.
5. Jdi do **Settings → Variables and Secrets → Add**:
   - Type: **Secret**
   - Variable name: `CUZK_KN_API_KEY`
   - Value: `<API klíč ČÚZK z hesláře>`
   - **Deploy**

---

## 4. Ověření, že worker běží

V prohlížeči otevři kořenovou adresu workeru:

```
https://tarpan-katastr.jan-forejtar.workers.dev
```

Musí se zobrazit JSON, ve kterém je:

- `"name": "tarpan-katastr"`
- `"api_key_nastaven": true`  ← pokud je `false`, secret se neuložil, opakuj krok 4 / bod 5
- seznam 18 nástrojů

Rychlá zkouška, že prochází i samotné API ČÚZK — v terminálu:

```bash
curl -s -X POST https://tarpan-katastr.jan-forejtar.workers.dev \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"kn_sluzba","arguments":{"co":"stav_uctu"}}}'
```

Odpověď obsahuje počet provedených volání, limit a datum expirace API klíče.

---

## 5. Registrace konektoru v Claude

1. V Claude otevři **Nastavení → Konektory** (Settings → Connectors).
2. **Přidat vlastní konektor** (Add custom connector).
3. Vyplň přesně:

   | Pole | Hodnota |
   |---|---|
   | Název (Name) | `TARPAN – katastr` |
   | URL vzdáleného MCP serveru | `https://tarpan-katastr.jan-forejtar.workers.dev` |
   | Autentizace | žádná (konektor je bez OAuth, klíč drží worker) |

4. Ulož a v tomto chatu konektor zapni.
5. Ověření v chatu: *„Kolik mi zbývá volání API katastru?“* → musí zavolat
   `kn_sluzba` a vrátit stav účtu.

**Nezapomeň:** URL nekončí lomítkem ani `/mcp`. Worker přijímá JSON-RPC na POST
kdekoli, takže funguje i `…/mcp`, ale kanonická adresa je kořen.

---

## 6. Vypnutí starého konektoru Katastr

Až nový konektor ověříš, starý odpoj — jeho nástroj `search_parcela` je rozbitý
(posílá parametry `katastralniUzemiKod` / `kmenoveCislo`, API však vyžaduje
`KodKatastralnihoUzemi`, `TypParcely`, `DruhCislovaniParcely`, `KmenoveCisloParcely`,
takže vrací HTTP 400). Stejně tak `search_jednotka` posílá `stavbaId`, který
v API neexistuje.

1. **Nastavení → Konektory → Katastr → Odebrat.**
2. Plugin `katastr` odinstaluj až ve chvíli, kdy budeme skládat společný plugin TARPAN.
3. Worker `katastr` na Cloudflare můžeš smazat (Workers & Pages → katastr → Settings → Delete)
   nebo nechat běžet jako zálohu; nic nestojí.

---

## 7. Co konektor umí

| Nástroj | K čemu |
|---|---|
| `kn_uzemi` | kraje, okresy, obce, části obcí, katastrální území — hledání podle názvu i bez diakritiky |
| `kn_ciselnik` | druhy pozemku, typy staveb a jednotek, způsoby využití a ochrany, pracoviště (vč. IČO, e-mailu, datové schránky) |
| `kn_parcela_vyhledani` | parcela podle k. ú. + parcelního čísla (PKN i PZE, stavební i pozemkové, poddělení, původ ZE) |
| `kn_parcela_detail` / `kn_parcela_sousedni` / `kn_parcela_polygon` | detail podle ID, sousední parcely, výběr polygonem v S-JTSK |
| `kn_stavba_vyhledani` / `kn_stavba_detail` / `kn_stavba_adresni_misto` / `kn_stavba_polygon` | stavba podle č. p./č. e., podle ID, podle kódu adresního místa z RÚIAN (propojení s ARES), polygonem |
| `kn_jednotka_vyhledani` / `kn_jednotka_detail` | byty a nebytové prostory, podíl na společných částech domu |
| `kn_pravo_stavby` | právo stavby podle vlastního ID, ID parcely nebo ID stavby |
| `kn_rizeni_vyhledani` / `kn_rizeni_detail` / `kn_rizeni_prijate_dne` | řízení V, Z, PGP, PD, ZPV — vč. seznamu řízení přijatých v daný den |
| `kn_sluzba` | aktuálnost dat, stav účtu a limit volání, provozní informace, health |
| `kn_vypis` | **výpis z katastru do Wordu** v úpravě TARPAN (odkaz ke stažení) |

Chybějící parametry se doplňují samy: u parcely se zkusí nejdřív pozemková a poté
stavební, u stavby nejdřív číslo popisné a poté evidenční. Ve výsledku je vždy
pole `pouzite_parametry`, aby bylo jasné, co se skutečně hledalo.

---

## 8. Výpis do Wordu

Nástroj `kn_vypis` **vrací hotový dokument rovnou v odpovědi** — Claude ho v chatu
převede na `.docx` a pošle jako přílohu, nikam se neklika. Dokument je zabalený
gzipem a zakódovaný do base64 (přenáší se tak jen kolem 2 kB) a Claude
s ním naloží podle pole `pokyn`:

```bash
base64 -d < blob.b64 | gunzip > vypis.rtf
soffice --headless --convert-to docx vypis.rtf
```

Volitelné parametry: `ico` doplní vlastníka dohledaného v ARES, `sousedni: true`
u parcely připojí sousední parcely, `format: "odkaz"` vrátí místo dokumentu jen
URL ke stažení (hodí se, když chceš odkaz poslat dál).

Stahovací adresy fungují dál a dají se otevřít i ručně:

```
https://tarpan-katastr.jan-forejtar.workers.dev/vypis/parcela/1193500504?sousedni=1
https://tarpan-katastr.jan-forejtar.workers.dev/vypis/stavba/4455661?ico=27604977
https://tarpan-katastr.jan-forejtar.workers.dev/vypis/jednotka/5566771
https://tarpan-katastr.jan-forejtar.workers.dev/vypis/pravo-stavby/777001
```

Grafika odpovídá výpisu z ARES — zlaté linky, kapitálky, patička; výpis z katastru je bez loga.

**Důležité omezení:** API KN neposkytuje jména ani adresy vlastníků a nabývací
tituly. Výpis proto uvádí číslo LV, katastrální území a proklik do Nahlížení do
KN; přímo v dokumentu je to napsané, aby nikdo výpis nepovažoval za úplný výpis
z KN podle § 55 katastrálního zákona.

---

## 9. Aktualizace už nasazeného workeru

Když přijde nová verze zdrojáků, stačí ve složce projektu:

```bash
npx wrangler deploy
```

Secret `CUZK_KN_API_KEY` zůstává, znovu se nezadává. Změnily-li se vstupy nástrojů,
v Claude konektor vypni a znovu zapni, aby se načetl nový seznam nástrojů.

Při nasazení přes web vlož znovu obsah `dist/tarpan-katastr.bundle.js` a dej **Deploy**.

---

## 10. Až bude hotovo

Dej vědět a složíme z konektorů **TARPAN – ARES**, **TARPAN – sbírka listin** a
**TARPAN – katastr** jeden plugin i se společným skillem.

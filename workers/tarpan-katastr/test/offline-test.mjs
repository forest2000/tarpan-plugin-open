// Offline test generátoru výpisu – běží bez sítě, na vzorových datech
// ve tvaru, který vrací REST API KN (podle openapi.json ČÚZK).
import { buildVypis } from "../src/vypis.js";
import { callTool } from "../src/index.js";
import { writeFileSync } from "node:fs";

const KU = { kod: 729051, nazev: "Smíchov" };

const PARCELA = {
  id: 3168502,
  typParcely: "PKN",
  druhCislovaniParcely: 2,
  kmenoveCisloParcely: 1234,
  poddeleniCislaParcely: 5,
  katastralniUzemi: KU,
  vymera: 1478,
  lv: { id: 990011, cislo: 4321, katastralniUzemi: KU },
  mapovyList: { kod: 12345, oznaceni: "PRAHA 5-2/3" },
  zpusobUrceniVymery: { kod: 2, nazev: "Graficky nebo v digitalizované mapě" },
  druhPozemku: { kod: 13, nazev: "Zastavěná plocha a nádvoří" },
  zpusobVyuziti: { kod: 1, nazev: "Společný dvůr" },
  stavba: { id: 4455661, typStavby: { kod: 1, nazev: "Budova s číslem popisným" }, cislaDomovni: [15], castObce: { kod: 400084, nazev: "Smíchov" } },
  pravoStavby: { id: 777001, datumUkonceni: "2055-12-31" },
  definicniBod: { x: -743123.45, y: -1043987.65, id: 1 },
  zpusobyOchrany: [{ kod: 31, nazev: "Památková zóna – budova, pozemek v památkové zóně" }],
  bpej: [{ kod: 12345, vymera: 800 }, { kod: 54321, vymera: 678 }],
  rizeniPlomby: [{ id: 88001, typRizeni: "V", poradoveCislo: 1234, rok: 2026, kodPracoviste: 101 }],
};

const STAVBA = {
  id: 4455661,
  typStavby: { kod: 1, nazev: "Budova s číslem popisným" },
  cislaDomovni: [15],
  castObce: { kod: 400084, nazev: "Smíchov" },
  docasna: false,
  typyVazby: "PostavenaNaPozemku",
  obec: { kod: 554782, nazev: "Praha" },
  lv: { id: 990011, cislo: 4321, katastralniUzemi: KU },
  definicniBod: { x: -743123.45, y: -1043987.65 },
  jednotky: [{ id: 5566771, cisloJednotky: 15001 }, { id: 5566772, cisloJednotky: 15002 }],
  zpusobVyuziti: { kod: 6, nazev: "Bytový dům" },
  zpusobyOchrany: [],
  parcely: [{ id: 3168502, typParcely: "PKN", druhCislovaniParcely: 1, kmenoveCisloParcely: 1234, poddeleniCislaParcely: 5, katastralniUzemi: KU }],
  adresniMista: [21745398],
  rizeniPlomby: [],
};

const JEDNOTKA = {
  id: 5566771,
  cisloJednotky: 15001,
  typJednotky: { kod: 2, nazev: "Byt" },
  zpusobVyuziti: { kod: 7, nazev: "Bydlení" },
  zpusobyOchrany: [],
  podilNaSpolecnychCastechDomu: { citatel: 6543, jmenovatel: 100000 },
  lv: { id: 990022, cislo: 9876, katastralniUzemi: KU },
  vymezenaVeStavbe: STAVBA,
  rizeniPlomby: [{ id: 88002, typRizeni: "Z", poradoveCislo: 55, rok: 2026, kodPracoviste: 101 }],
};

const PRAVO_STAVBY = {
  id: 777001,
  datumUkonceni: "2020-12-31",
  datumPrijeti: "2016-03-15",
  ucelyPravaStavby: [{ kod: 1, nazev: "Stavba pro bydlení" }],
  lv: { id: 990033, cislo: 5555, katastralniUzemi: KU },
  parcely: [PARCELA],
  stavby: [STAVBA],
  zpusobyOchrany: [],
  rizeniPlomby: [],
};

const ZAZNAMY = {
  "/Parcely/3168502": PARCELA,
  "/Stavby/4455661": STAVBA,
  "/Jednotky/5566771": JEDNOTKA,
  "/PravaStavby/777001": PRAVO_STAVBY,
  "/Parcely/SousedniParcely/3168502": [
    { id: 3168503, typParcely: "PKN", druhCislovaniParcely: 2, kmenoveCisloParcely: 1235, katastralniUzemi: KU },
  ],
  "/CiselnikyUzemnichJednotek/KatastralniUzemi/729051": { kod: 729051, nazev: "Smíchov", kodObce: 554782 },
  "/CiselnikyUzemnichJednotek/Obce/554782": { kod: 554782, nazev: "Praha", kodOkresu: 3100 },
  "/CiselnikyUzemnichJednotek/Okresy/3100": { kod: 3100, nazev: "Hlavní město Praha" },
};

const knGet = async (path) => {
  if (!(path in ZAZNAMY)) return { chyba: "Nenalezeno (HTTP 404).", url: path };
  return { data: ZAZNAMY[path], aktualnostDatK: "2026-08-01T23:59:00" };
};

function zkontrolujRtf(rtf, jmeno) {
  let hloubka = 0;
  for (let i = 0; i < rtf.length; i++) {
    const ch = rtf[i];
    if (ch === "\\") { i++; continue; }
    if (ch === "{") hloubka++;
    else if (ch === "}") hloubka--;
    if (hloubka < 0) throw new Error(`${jmeno}: přebývá } na pozici ${i}`);
  }
  if (hloubka !== 0) throw new Error(`${jmeno}: nevyvážené závorky, zbývá ${hloubka}`);
  if (!rtf.startsWith("{\\rtf1")) throw new Error(`${jmeno}: chybí hlavička RTF`);
  return true;
}

let chyby = 0;

for (const [typ, id, opts] of [
  ["parcela", 3168502, { sousedni: true }],
  ["stavba", 4455661, {}],
  ["jednotka", 5566771, {}],
  ["pravo-stavby", 777001, {}],
]) {
  try {
    const { rtf, filename } = await buildVypis({ typ, id, knGet, ...opts });
    zkontrolujRtf(rtf, typ);
    writeFileSync(new URL(`./out-${typ}.rtf`, import.meta.url), rtf, "utf8");
    console.log(`OK  ${typ.padEnd(13)} ${String(rtf.length).padStart(6)} B  → ${filename}`);
  } catch (e) {
    chyby++;
    console.log(`CHYBA ${typ}: ${e.message}`);
  }
}

/* --- kontrola mapování parametrů nástrojů na skutečné query parametry API --- */
const volani = [];
globalThis.fetch = async (url) => {
  volani.push(String(url));
  return new Response(JSON.stringify({ data: [], zpravy: [], aktualnostDatK: "2026-08-01T23:59:00" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const OCEKAVANO = [
  ["kn_parcela_vyhledani", { kod_katastralniho_uzemi: 729051, kmenove_cislo: 1234, poddeleni: 5, druh_cislovani: 2 },
    "/Parcely/Vyhledani?KodKatastralnihoUzemi=729051&TypParcely=PKN&DruhCislovaniParcely=2&KmenoveCisloParcely=1234&PoddeleniCislaParcely=5"],
  ["kn_stavba_vyhledani", { kod_casti_obce: 400084, cislo_domovni: 15, typ_stavby: 1 },
    "/Stavby/Vyhledani?KodCastiObce=400084&TypStavby=1&CisloDomovni=15"],
  ["kn_jednotka_vyhledani", { kod_casti_obce: 400084, cislo_domovni: 15, cislo_jednotky: 15001, typ_stavby: 1 },
    "/Jednotky/Vyhledani?KodCastiObce=400084&TypStavby=1&CisloDomovni=15&CisloJednotky=15001"],
  ["kn_rizeni_vyhledani", { typ_rizeni: "V", cislo: 1234, rok: 2026, kod_pracoviste: 101 },
    "/Rizeni/Vyhledani?TypRizeni=V&Cislo=1234&Rok=2026&KodPracoviste=101"],
  ["kn_rizeni_prijate_dne", { typ_rizeni: "V", kod_pracoviste: 101, datum_prijeti: "2026-07-31" },
    "/Rizeni/PrijateDne?TypRizeni=V&KodPracoviste=101&DatumPrijeti=2026-07-31"],
  ["kn_parcela_polygon", { souradnice: [[-743000, -1043000], [-742900, -1043000], [-742900, -1042900]] },
    "/Parcely/Polygon?SeznamSouradnic=%5B%7B%22x%22%3A-743000%2C%22y%22%3A-1043000%7D"],
  ["kn_pravo_stavby", { parcela_id: 3168502 }, "/PravaStavby/Parcela/3168502"],
  ["kn_sluzba", { co: "stav_uctu" }, "/AplikacniSluzby/StavUctu"],
];

for (const [nastroj, args, ocekavanyKus] of OCEKAVANO) {
  volani.length = 0;
  await callTool(nastroj, args, "TEST-KEY", "https://example.workers.dev");
  const url = volani[0] ?? "";
  if (url.includes(ocekavanyKus)) {
    console.log(`OK  ${nastroj.padEnd(22)} ${url.replace("https://api-kn.cuzk.gov.cz/api/v1", "")}`);
  } else {
    chyby++;
    console.log(`CHYBA ${nastroj}\n   očekáváno: ${ocekavanyKus}\n   voláno:    ${url}`);
  }
}

/* --- kn_vypis vrací odkaz --- */
const odkaz = await callTool("kn_vypis", { typ: "pravo_stavby", id: 777001, ico: "27604977" }, "K", "https://tarpan-katastr.example.workers.dev");
const cekany = "https://tarpan-katastr.example.workers.dev/vypis/pravo-stavby/777001?ico=27604977";
if (odkaz.odkaz === cekany) console.log("OK  kn_vypis               " + odkaz.odkaz);
else { chyby++; console.log("CHYBA kn_vypis: " + odkaz.odkaz + " != " + cekany); }

console.log(chyby ? `\n${chyby} CHYB` : "\nVŠE V POŘÁDKU");
process.exit(chyby ? 1 : 0);

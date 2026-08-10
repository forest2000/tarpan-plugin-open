// TARPAN – katastr
// MCP server nad REST API dálkového přístupu k datům KN (ČÚZK), api/v1.
// Pokrývá všech 41 endpointů a všechny jejich hledací parametry.
//
// MCP endpoint:  POST /            (i POST /mcp kvůli zpětné kompatibilitě)
// Výpis (RTF):   GET  /vypis/{parcela|stavba|jednotka|pravo-stavby}/{id}
// Info:          GET  /

import { buildVypis } from "./vypis.js";

const SERVER_INFO = { name: "tarpan-katastr", version: "1.0.0" };
const PROTOCOL_VERSION = "2024-11-05";
const KN_BASE = "https://api-kn.cuzk.gov.cz/api/v1";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, ApiKey",
};

/* ------------------------------------------------------------------ */
/*  HTTP klient                                                        */
/* ------------------------------------------------------------------ */

const CACHE = new Map(); // číselníky – v paměti isolate, TTL 6 h
const TTL = 6 * 60 * 60 * 1000;

async function knGet(path, params, apiKey, { cache = false } = {}) {
  if (!apiKey) {
    return { chyba: "Chybí API klíč. Nastav secret CUZK_KN_API_KEY (wrangler secret put CUZK_KN_API_KEY)." };
  }
  let url = KN_BASE + path;
  if (params) {
    const q = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    if (q) url += "?" + q;
  }

  if (cache) {
    const hit = CACHE.get(url);
    if (hit && Date.now() - hit.t < TTL) return hit.v;
  }

  let res;
  try {
    res = await fetch(url, { headers: { ApiKey: apiKey, Accept: "application/json" } });
  } catch (e) {
    return { chyba: `Nepodařilo se spojit s API ČÚZK: ${e?.message ?? String(e)}` };
  }

  const text = await res.text().catch(() => "");
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* ponecháme text */
  }

  if (!res.ok) {
    if (res.status === 404) {
      return { chyba: "Nenalezeno (HTTP 404).", detail: body?.detail ?? body?.title ?? null, url };
    }
    if (res.status === 401 || res.status === 403) {
      return { chyba: `Autentizace/autorizace selhala (HTTP ${res.status}). Zkontroluj platnost API klíče ČÚZK.`, url };
    }
    if (res.status === 429) {
      return { chyba: "Překročen limit volání API ČÚZK (HTTP 429). Zkus to později; stav účtu zjistíš nástrojem kn_sluzba.", url };
    }
    return {
      chyba: `HTTP ${res.status}`,
      detail: body?.errors ?? body?.detail ?? body?.title ?? String(text).slice(0, 500),
      url,
    };
  }

  // Obálka VysledekZpracovani → { data, zpravy, aktualnostDatK, provedenoVolani }
  let out;
  if (body && typeof body === "object" && !Array.isArray(body) && "data" in body) {
    out = { data: body.data };
    if (body.aktualnostDatK) out.aktualnostDatK = body.aktualnostDatK;
    if (Array.isArray(body.zpravy) && body.zpravy.length) out.zpravy = body.zpravy;
    if (body.provedenoVolani != null) out.provedenoVolani = body.provedenoVolani;
  } else {
    out = { data: body };
  }

  if (cache) CACHE.set(url, { t: Date.now(), v: out });
  return out;
}

/* ------------------------------------------------------------------ */
/*  Pomocné funkce                                                     */
/* ------------------------------------------------------------------ */

const deacc = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function filtrujNazev(items, nazev) {
  if (!nazev) return items;
  const n = deacc(nazev);
  const exact = items.filter((i) => deacc(i.nazev) === n);
  if (exact.length) return exact;
  return items.filter((i) => deacc(i.nazev).includes(n));
}

function filtrujNadrizeny(items, kod) {
  if (kod == null) return items;
  const k = Number(kod);
  return items.filter(
    (i) => i.kodKraje === k || i.kodOkresu === k || i.kodObce === k || i.kodNadrizenehoPracoviste === k
  );
}

function filtrujPlatne(items, vcetneNeplatnych) {
  if (vcetneNeplatnych) return items;
  return items.filter((i) => !i.platnostDo);
}

const chyba = (t, extra = {}) => ({ chyba: t, ...extra });

/** Zabalí text gzipem a vrátí jako base64 – zmenší přenášený dokument zhruba na polovinu. */
async function gzipBase64(text) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  const KROK = 0x8000;
  for (let i = 0; i < bytes.length; i += KROK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + KROK));
  }
  return btoa(bin);
}

// API očekává JSON pole objektů {"x":…,"y":…} (typ SouradniceXY), nikoli pole dvojic.
// Přijímáme obojí (i hotový JSON string) a převádíme na správný tvar.
function souradniceToParam(v) {
  if (typeof v === "string") return v;
  if (!Array.isArray(v) || v.length < 3) return null;
  const body = v.map((p) => {
    if (Array.isArray(p)) return { x: Number(p[0]), y: Number(p[1]) };
    if (p && typeof p === "object") return { x: Number(p.x), y: Number(p.y) };
    return null;
  });
  if (body.some((p) => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y))) return null;
  return JSON.stringify(body);
}

/* ------------------------------------------------------------------ */
/*  Definice nástrojů                                                  */
/* ------------------------------------------------------------------ */

const TYP_PARCELY_DESC = "PKN = parcela katastru nemovitostí, PZE = parcela zjednodušené evidence.";
const DRUH_CISLOVANI_DESC = "1 = stavební parcela (‚st. 123‘), 2 = pozemková parcela. Když nevyplníš, zkusí se automaticky 2 a poté 1.";
const TYP_STAVBY_DESC = "1 = stavba s číslem popisným (č. p.), 2 = stavba s číslem evidenčním (č. e.). Když nevyplníš, zkusí se automaticky 1 a poté 2.";
const TYP_RIZENI_DESC = "V = vklad, Z = záznam, PGP = potvrzení geometrického plánu, PD = podací deník, ZPV = pomocné řízení V.";

const TOOLS = [
  /* ---------- územní číselníky (vstupní bod většiny dotazů) ---------- */
  {
    name: "kn_uzemi",
    description:
      "Číselník územních jednotek – kraje, okresy, obce, části obcí a katastrální území. TOTO JE ZPRAVIDLA PRVNÍ KROK: uživatel zná název (‚k. ú. Smíchov‘, ‚obec Beroun‘), API však pracuje s číselnými kódy. Hledá se bez ohledu na diakritiku a velikost písmen; přesná shoda názvu má přednost před částečnou. Kombinuj s 'nadrizeny_kod' (např. všechna k. ú. v obci, všechny části obce v obci).",
    inputSchema: {
      type: "object",
      required: ["uroven"],
      properties: {
        uroven: {
          type: "string",
          enum: ["kraj", "okres", "obec", "cast_obce", "katastralni_uzemi"],
          description: "Která územní úroveň se má prohledat.",
        },
        kod: { type: "integer", description: "Přesný kód jednotky – vrátí přímo jeden záznam." },
        nazev: { type: "string", description: "Název nebo část názvu (bez ohledu na diakritiku)." },
        nadrizeny_kod: {
          type: "integer",
          description:
            "Kód nadřízené jednotky – u okresu kód kraje, u obce kód okresu, u části obce a katastrálního území kód obce.",
        },
        vcetne_neplatnych: {
          type: "boolean",
          description: "Zahrnout i zrušené jednotky (s vyplněným platnostDo). Výchozí false.",
        },
        limit: { type: "integer", description: "Maximální počet vrácených záznamů (výchozí 50)." },
      },
    },
  },
  {
    name: "kn_ciselnik",
    description:
      "Číselníky ISKN – druhy pozemku, způsoby určení výměry, typy jednotky, typy stavby, způsoby využití parcely/stavby/jednotky, způsoby ochrany a pracoviště (katastrální úřady a pracoviště, včetně IČO, telefonu, e-mailu a ID datové schránky). Použij pro překlad kódů z odpovědí do češtiny nebo pro zjištění kódu pracoviště před vyhledáním řízení.",
    inputSchema: {
      type: "object",
      required: ["ciselnik"],
      properties: {
        ciselnik: {
          type: "string",
          enum: [
            "druhy_pozemku",
            "zpusoby_urceni_vymery",
            "typy_jednotky",
            "typy_stavby",
            "zpusoby_vyuziti_parcely",
            "zpusoby_vyuziti_stavby",
            "zpusoby_vyuziti_jednotky",
            "zpusoby_ochrany",
            "pracoviste",
          ],
          description: "Který číselník vrátit.",
        },
        kod: { type: "integer", description: "Kód položky – u číselníku 'pracoviste' vrátí přímo jedno pracoviště." },
        nazev: { type: "string", description: "Filtr podle názvu (bez ohledu na diakritiku)." },
        limit: { type: "integer", description: "Maximální počet vrácených záznamů (výchozí 200)." },
      },
    },
  },

  /* ---------- parcely ---------- */
  {
    name: "kn_parcela_vyhledani",
    description:
      "Vyhledá parcelu podle přirozené identifikace: katastrální území + parcelní číslo. Vrací kompletní údaje o pozemku – výměru, druh pozemku, způsob využití, způsob určení výměry, způsoby ochrany, BPEJ, mapový list, číslo LV, stavbu na pozemku, právo stavby, definiční bod a plomby (probíhající řízení). Kód katastrálního území zjisti nástrojem kn_uzemi.",
    inputSchema: {
      type: "object",
      required: ["kod_katastralniho_uzemi", "kmenove_cislo"],
      properties: {
        kod_katastralniho_uzemi: { type: "integer", description: "Kód katastrálního území (viz kn_uzemi)." },
        kmenove_cislo: { type: "integer", description: "Kmenové (parcelní) číslo, tj. část před lomítkem. Rozsah 1–99999." },
        poddeleni: { type: "integer", description: "Poddělení čísla parcely, tj. část za lomítkem." },
        typ_parcely: { type: "string", enum: ["PKN", "PZE"], description: TYP_PARCELY_DESC + " Výchozí PKN." },
        druh_cislovani: { type: "integer", enum: [1, 2], description: DRUH_CISLOVANI_DESC },
        puvod_parcely_ze: {
          type: "integer",
          enum: [3, 4, 6],
          description: "Původ parcely zjednodušené evidence: 3 = evidence nemovitostí, 4 = pozemkový katastr, 6 = přídělový plán nebo jiný podklad. Má smysl jen u typ_parcely = PZE.",
        },
      },
    },
  },
  {
    name: "kn_parcela_detail",
    description: "Vrátí detail parcely podle jejího jednoznačného identifikátoru ISKN (pole 'id' z výsledků vyhledávání).",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifikátor parcely v ISKN." } },
    },
  },
  {
    name: "kn_parcela_sousedni",
    description:
      "Vrátí sousední parcely k zadané parcele. Funguje jen v území s digitální katastrální mapou – jinde vrátí prázdný seznam (nikoli chybu).",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifikátor parcely v ISKN." } },
    },
  },
  {
    name: "kn_parcela_polygon",
    description:
      "Vyhledá parcely, jejichž definiční bod leží uvnitř zadaného polygonu. Souřadnice v S-JTSK (EPSG:5514 nebo 5513) v metrech, max. 2 desetinná místa; na orientaci polygonu nezáleží.",
    inputSchema: {
      type: "object",
      required: ["souradnice"],
      properties: {
        souradnice: {
          type: "array",
          items: { type: "array", items: { type: "number" } },
          description: "Nejméně tři body polygonu v S-JTSK jako pole dvojic [x, y], např. [[-743000,-1043000],[-742900,-1043000],[-742900,-1042900]]. Polygon se uzavírá sám, na orientaci nezáleží. POZOR: API omezuje plochu polygonu na 5 000 m² (např. čtverec 70 × 70 m); větší výběr vrátí chybu.",
        },
      },
    },
  },

  /* ---------- stavby ---------- */
  {
    name: "kn_stavba_vyhledani",
    description:
      "Vyhledá stavbu (budovu) podle přirozené identifikace: část obce + číslo popisné nebo evidenční. Vrací typ stavby, způsob využití, způsoby ochrany, číslo LV, parcely pod stavbou, typ vazby k pozemku (postavena na pozemku / je součástí pozemku / je součástí práva stavby), seznam jednotek v budově, kódy adresních míst a plomby. Kód části obce zjisti nástrojem kn_uzemi (uroven = cast_obce).",
    inputSchema: {
      type: "object",
      required: ["kod_casti_obce", "cislo_domovni"],
      properties: {
        kod_casti_obce: { type: "integer", description: "Kód části obce (viz kn_uzemi)." },
        cislo_domovni: { type: "integer", description: "Číslo popisné nebo evidenční." },
        typ_stavby: { type: "integer", enum: [1, 2], description: TYP_STAVBY_DESC },
      },
    },
  },
  {
    name: "kn_stavba_detail",
    description: "Vrátí detail stavby podle jejího identifikátoru ISKN.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifikátor stavby v ISKN." } },
    },
  },
  {
    name: "kn_stavba_adresni_misto",
    description:
      "Vyhledá stavbu podle kódu adresního místa RÚIAN. Kód adresního místa vrací ARES v adrese sídla subjektu – tímto nástrojem tedy propojíš firmu z konektoru TARPAN – ARES s budovou v katastru.",
    inputSchema: {
      type: "object",
      required: ["kod_adresniho_mista"],
      properties: { kod_adresniho_mista: { type: "integer", description: "Kód adresního místa v RÚIAN." } },
    },
  },
  {
    name: "kn_stavba_polygon",
    description:
      "Vyhledá stavby, jejichž definiční bod leží uvnitř zadaného polygonu. Souřadnice v S-JTSK (EPSG:5514 nebo 5513) v metrech.",
    inputSchema: {
      type: "object",
      required: ["souradnice"],
      properties: {
        souradnice: {
          type: "array",
          items: { type: "array", items: { type: "number" } },
          description: "Nejméně tři body polygonu v S-JTSK jako pole dvojic [x, y], např. [[-743000,-1043000],[-742900,-1043000],[-742900,-1042900]]. Polygon se uzavírá sám, na orientaci nezáleží. POZOR: API omezuje plochu polygonu na 5 000 m² (např. čtverec 70 × 70 m); větší výběr vrátí chybu.",
        },
      },
    },
  },

  /* ---------- jednotky ---------- */
  {
    name: "kn_jednotka_vyhledani",
    description:
      "Vyhledá bytovou nebo nebytovou jednotku podle přirozené identifikace: část obce + číslo popisné/evidenční budovy + číslo jednotky. Pozor na chování API: je-li číslo jednotky větší než 9999, hledá se přesná shoda; je-li menší, hledá se číslo jednotky modulo 10000 ve všech částech budovy (tj. může vrátit více jednotek se stejným číslem v různých vchodech).",
    inputSchema: {
      type: "object",
      required: ["kod_casti_obce", "cislo_domovni", "cislo_jednotky"],
      properties: {
        kod_casti_obce: { type: "integer", description: "Kód části obce (viz kn_uzemi)." },
        cislo_domovni: { type: "integer", description: "Číslo popisné nebo evidenční budovy." },
        cislo_jednotky: { type: "integer", description: "Číslo jednotky." },
        typ_stavby: { type: "integer", enum: [1, 2], description: TYP_STAVBY_DESC },
      },
    },
  },
  {
    name: "kn_jednotka_detail",
    description:
      "Vrátí detail jednotky podle identifikátoru ISKN – typ jednotky, způsob využití, způsoby ochrany, podíl na společných částech domu, číslo LV, budovu, ve které je vymezena, a plomby.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifikátor jednotky v ISKN." } },
    },
  },

  /* ---------- právo stavby ---------- */
  {
    name: "kn_pravo_stavby",
    description:
      "Vrátí právo stavby (§ 1240 a násl. o. z.) – zadej právě jeden z parametrů: vlastní identifikátor práva stavby, identifikátor zatížené parcely, nebo identifikátor stavby, která je součástí práva stavby. Vrací datum přijetí, datum ukončení, účely práva stavby, číslo LV, dotčené parcely a stavby, způsoby ochrany a plomby.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Identifikátor práva stavby v ISKN." },
        parcela_id: { type: "number", description: "Identifikátor zatížené parcely v ISKN." },
        stavba_id: { type: "number", description: "Identifikátor stavby v ISKN." },
      },
    },
  },

  /* ---------- řízení ---------- */
  {
    name: "kn_rizeni_vyhledani",
    description:
      "Vyhledá katastrální řízení podle jeho spisové identifikace (např. V-1234/2024 na pracovišti Praha). Vrací stav řízení, stav úhrady správního poplatku, provedené operace a navázaná řízení. Kód pracoviště zjisti nástrojem kn_ciselnik (ciselnik = pracoviste). " + TYP_RIZENI_DESC,
    inputSchema: {
      type: "object",
      required: ["typ_rizeni", "cislo", "rok", "kod_pracoviste"],
      properties: {
        typ_rizeni: { type: "string", enum: ["V", "Z", "PGP", "PD", "ZPV"], description: TYP_RIZENI_DESC },
        cislo: { type: "integer", description: "Pořadové číslo řízení (část před lomítkem)." },
        rok: { type: "integer", description: "Rok řízení (část za lomítkem)." },
        kod_pracoviste: { type: "integer", description: "Kód katastrálního pracoviště." },
      },
    },
  },
  {
    name: "kn_rizeni_detail",
    description: "Vrátí detail řízení podle identifikátoru ISKN (pole 'id' z plomb u nemovitosti nebo z vyhledání řízení).",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifikátor řízení v ISKN." } },
    },
  },
  {
    name: "kn_rizeni_prijate_dne",
    description:
      "Vrátí seznam hlaviček všech řízení zadaného typu přijatých na daném pracovišti v konkrétní den. Vhodné pro monitoring nových vkladů.",
    inputSchema: {
      type: "object",
      required: ["typ_rizeni", "kod_pracoviste", "datum_prijeti"],
      properties: {
        typ_rizeni: { type: "string", enum: ["V", "Z", "PGP", "PD", "ZPV"], description: TYP_RIZENI_DESC },
        kod_pracoviste: { type: "integer", description: "Kód katastrálního pracoviště." },
        datum_prijeti: { type: "string", description: "Datum přijetí ve formátu YYYY-MM-DD." },
      },
    },
  },

  /* ---------- provozní ---------- */
  {
    name: "kn_sluzba",
    description:
      "Provozní informace o službě API KN: 'aktualnost' = ke kterému okamžiku jsou data aktuální, 'stav_uctu' = počet provedených volání, limit a datum expirace API klíče, 'provoz' = provozní informace ČÚZK, 'health' = zdraví služby, 'zpravy' = číselník zpráv, které API vrací.",
    inputSchema: {
      type: "object",
      required: ["co"],
      properties: {
        co: { type: "string", enum: ["aktualnost", "stav_uctu", "provoz", "health", "zpravy"] },
      },
    },
  },

  /* ---------- výpis ---------- */
  {
    name: "kn_vypis",
    description:
      "Vygeneruje kompletní VÝPIS Z KATASTRU NEMOVITOSTÍ v grafické úpravě TARPAN – stejné podobě jako výpis z ARES. VÝCHOZÍ CHOVÁNÍ: vrátí hotový dokument přímo v odpovědi (pole soubor_gzip_base64), ty ho rozbalíš, převedeš na .docx a pošleš uživateli do chatu nástrojem SendUserFile – uživatel nemusí nikam klikat. Přesný postup je v poli 'pokyn'. Obsahuje všechny údaje, které API KN o nemovitosti poskytuje, včetně plomb, a odkaz do Nahlížení do KN na list vlastnictví (jména vlastníků API neposkytuje). Zadáš-li navíc IČO, výpis doplní údaje o vlastníkovi z ARES.",
    inputSchema: {
      type: "object",
      required: ["typ", "id"],
      properties: {
        typ: { type: "string", enum: ["parcela", "stavba", "jednotka", "pravo_stavby"], description: "Druh nemovitosti." },
        id: { type: "number", description: "Identifikátor nemovitosti v ISKN." },
        ico: { type: "string", description: "Volitelně IČO vlastníka (právnické osoby) – výpis o něm doplní údaje z ARES." },
        sousedni: { type: "boolean", description: "U parcely připojit i seznam sousedních parcel. Výchozí false." },
        format: {
          type: "string",
          enum: ["soubor", "odkaz"],
          description:
            "'soubor' (výchozí) = vrátí dokument v odpovědi k odeslání do chatu. 'odkaz' = vrátí jen URL ke stažení, bez přenosu dat; použij, jen když uživatel výslovně chce odkaz.",
        },
      },
    },
  },
];

/* ------------------------------------------------------------------ */
/*  Provádění nástrojů                                                 */
/* ------------------------------------------------------------------ */

const UZEMI_PATH = {
  kraj: "Kraje",
  okres: "Okresy",
  obec: "Obce",
  cast_obce: "CastiObci",
  katastralni_uzemi: "KatastralniUzemi",
};

const CISELNIK_PATH = {
  druhy_pozemku: "DruhyPozemku",
  zpusoby_urceni_vymery: "ZpusobyUrceniVymery",
  typy_jednotky: "TypyJednotky",
  typy_stavby: "TypyStavby",
  zpusoby_vyuziti_parcely: "ZpusobyVyuzitiParcely",
  zpusoby_vyuziti_stavby: "ZpusobyVyuzitiStavby",
  zpusoby_vyuziti_jednotky: "ZpusobyVyuzitiJednotky",
  zpusoby_ochrany: "ZpusobyOchrany",
  pracoviste: "Pracoviste",
};

const SLUZBA_PATH = {
  aktualnost: "AktualnostDat",
  stav_uctu: "StavUctu",
  provoz: "ProvozniInformace",
  health: "Health",
  zpravy: "CiselnikZprav",
};

export async function callTool(name, args, apiKey, origin = "") {
  switch (name) {
    /* ---------- číselníky ---------- */
    case "kn_uzemi": {
      const seg = UZEMI_PATH[args.uroven];
      if (!seg) return chyba("Neznámá úroveň. Povolené: kraj, okres, obec, cast_obce, katastralni_uzemi.");
      if (args.kod != null) {
        return knGet(`/CiselnikyUzemnichJednotek/${seg}/${args.kod}`, null, apiKey, { cache: true });
      }
      const raw = await knGet(`/CiselnikyUzemnichJednotek/${seg}`, null, apiKey, { cache: true });
      if (raw.chyba) return raw;
      let items = Array.isArray(raw.data) ? raw.data : [];
      const celkem = items.length;
      items = filtrujPlatne(items, args.vcetne_neplatnych);
      items = filtrujNadrizeny(items, args.nadrizeny_kod);
      items = filtrujNazev(items, args.nazev);
      const limit = args.limit ?? 50;
      return {
        pocet_nalezeno: items.length,
        pocet_v_ciselniku: celkem,
        data: items.slice(0, limit),
        aktualnostDatK: raw.aktualnostDatK,
      };
    }

    case "kn_ciselnik": {
      const seg = CISELNIK_PATH[args.ciselnik];
      if (!seg) return chyba("Neznámý číselník.");
      if (args.ciselnik === "pracoviste" && args.kod != null) {
        return knGet(`/CiselnikyISKN/Pracoviste/${args.kod}`, null, apiKey, { cache: true });
      }
      const raw = await knGet(`/CiselnikyISKN/${seg}`, null, apiKey, { cache: true });
      if (raw.chyba) return raw;
      let items = Array.isArray(raw.data) ? raw.data : [];
      if (args.kod != null) items = items.filter((i) => Number(i.kod) === Number(args.kod));
      items = filtrujNazev(items, args.nazev);
      const limit = args.limit ?? 200;
      return { pocet_nalezeno: items.length, data: items.slice(0, limit), aktualnostDatK: raw.aktualnostDatK };
    }

    /* ---------- parcely ---------- */
    case "kn_parcela_vyhledani": {
      if (args.kod_katastralniho_uzemi == null || args.kmenove_cislo == null) {
        return chyba("Zadej kod_katastralniho_uzemi a kmenove_cislo.");
      }
      const typ = args.typ_parcely ?? "PKN";
      const varianty = args.druh_cislovani != null ? [Number(args.druh_cislovani)] : [2, 1];
      let posledni = null;
      for (const druh of varianty) {
        const res = await knGet(
          "/Parcely/Vyhledani",
          {
            KodKatastralnihoUzemi: args.kod_katastralniho_uzemi,
            TypParcely: typ,
            DruhCislovaniParcely: druh,
            KmenoveCisloParcely: args.kmenove_cislo,
            PoddeleniCislaParcely: args.poddeleni,
            PuvodParcelyZE: args.puvod_parcely_ze,
          },
          apiKey
        );
        posledni = res;
        const nasel = !res.chyba && Array.isArray(res.data) && res.data.length > 0;
        if (nasel) {
          return {
            ...res,
            pouzite_parametry: {
              typ_parcely: typ,
              druh_cislovani: druh,
              druh_cislovani_popis: druh === 1 ? "stavební parcela" : "pozemková parcela",
            },
          };
        }
      }
      if (posledni?.chyba) return posledni;
      return {
        data: [],
        upozorneni:
          "Parcela nenalezena. Zkontroluj kód katastrálního území a parcelní číslo; u parcel zjednodušené evidence zkus typ_parcely = PZE.",
        pouzite_parametry: { typ_parcely: typ, druh_cislovani: varianty },
      };
    }

    case "kn_parcela_detail":
      if (args.id == null) return chyba("Zadej id parcely.");
      return knGet(`/Parcely/${args.id}`, null, apiKey);

    case "kn_parcela_sousedni": {
      if (args.id == null) return chyba("Zadej id parcely.");
      const res = await knGet(`/Parcely/SousedniParcely/${args.id}`, null, apiKey);
      if (!res.chyba && Array.isArray(res.data) && res.data.length === 0) {
        res.upozorneni = "Nebyly nalezeny sousední parcely – území zřejmě nemá digitální katastrální mapu.";
      }
      return res;
    }

    case "kn_parcela_polygon": {
      const s = souradniceToParam(args.souradnice);
      if (!s) return chyba("Zadej souradnice jako pole dvojic [x, y] v S-JTSK.");
      return knGet("/Parcely/Polygon", { SeznamSouradnic: s }, apiKey);
    }

    /* ---------- stavby ---------- */
    case "kn_stavba_vyhledani": {
      if (args.kod_casti_obce == null || args.cislo_domovni == null) {
        return chyba("Zadej kod_casti_obce a cislo_domovni.");
      }
      const varianty = args.typ_stavby != null ? [Number(args.typ_stavby)] : [1, 2];
      let posledni = null;
      for (const t of varianty) {
        const res = await knGet(
          "/Stavby/Vyhledani",
          { KodCastiObce: args.kod_casti_obce, TypStavby: t, CisloDomovni: args.cislo_domovni },
          apiKey
        );
        posledni = res;
        if (!res.chyba && Array.isArray(res.data) && res.data.length > 0) {
          return { ...res, pouzite_parametry: { typ_stavby: t, typ_stavby_popis: t === 1 ? "číslo popisné" : "číslo evidenční" } };
        }
      }
      if (posledni?.chyba) return posledni;
      return { data: [], upozorneni: "Stavba nenalezena. Zkontroluj kód části obce a číslo popisné/evidenční." };
    }

    case "kn_stavba_detail":
      if (args.id == null) return chyba("Zadej id stavby.");
      return knGet(`/Stavby/${args.id}`, null, apiKey);

    case "kn_stavba_adresni_misto":
      if (args.kod_adresniho_mista == null) return chyba("Zadej kod_adresniho_mista.");
      return knGet(`/Stavby/AdresniMisto/${args.kod_adresniho_mista}`, null, apiKey);

    case "kn_stavba_polygon": {
      const s = souradniceToParam(args.souradnice);
      if (!s) return chyba("Zadej souradnice jako pole dvojic [x, y] v S-JTSK.");
      return knGet("/Stavby/Polygon", { SeznamSouradnic: s }, apiKey);
    }

    /* ---------- jednotky ---------- */
    case "kn_jednotka_vyhledani": {
      if (args.kod_casti_obce == null || args.cislo_domovni == null || args.cislo_jednotky == null) {
        return chyba("Zadej kod_casti_obce, cislo_domovni a cislo_jednotky.");
      }
      const varianty = args.typ_stavby != null ? [Number(args.typ_stavby)] : [1, 2];
      let posledni = null;
      for (const t of varianty) {
        const res = await knGet(
          "/Jednotky/Vyhledani",
          {
            KodCastiObce: args.kod_casti_obce,
            TypStavby: t,
            CisloDomovni: args.cislo_domovni,
            CisloJednotky: args.cislo_jednotky,
          },
          apiKey
        );
        posledni = res;
        if (!res.chyba && Array.isArray(res.data) && res.data.length > 0) {
          return { ...res, pouzite_parametry: { typ_stavby: t } };
        }
      }
      if (posledni?.chyba) return posledni;
      return {
        data: [],
        upozorneni:
          "Jednotka nenalezena. Ověř číslo jednotky – u čísel menších než 10000 API hledá číslo modulo 10000 ve všech částech budovy.",
      };
    }

    case "kn_jednotka_detail":
      if (args.id == null) return chyba("Zadej id jednotky.");
      return knGet(`/Jednotky/${args.id}`, null, apiKey);

    /* ---------- právo stavby ---------- */
    case "kn_pravo_stavby":
      if (args.id != null) return knGet(`/PravaStavby/${args.id}`, null, apiKey);
      if (args.parcela_id != null) return knGet(`/PravaStavby/Parcela/${args.parcela_id}`, null, apiKey);
      if (args.stavba_id != null) return knGet(`/PravaStavby/Stavba/${args.stavba_id}`, null, apiKey);
      return chyba("Zadej id, parcela_id nebo stavba_id.");

    /* ---------- řízení ---------- */
    case "kn_rizeni_vyhledani": {
      const { typ_rizeni, cislo, rok, kod_pracoviste } = args;
      if (!typ_rizeni || cislo == null || rok == null || kod_pracoviste == null) {
        return chyba("Zadej typ_rizeni, cislo, rok a kod_pracoviste.");
      }
      return knGet(
        "/Rizeni/Vyhledani",
        { TypRizeni: typ_rizeni, Cislo: cislo, Rok: rok, KodPracoviste: kod_pracoviste },
        apiKey
      );
    }

    case "kn_rizeni_detail":
      if (args.id == null) return chyba("Zadej id řízení.");
      return knGet(`/Rizeni/${args.id}`, null, apiKey);

    case "kn_rizeni_prijate_dne": {
      const { typ_rizeni, kod_pracoviste, datum_prijeti } = args;
      if (!typ_rizeni || kod_pracoviste == null || !datum_prijeti) {
        return chyba("Zadej typ_rizeni, kod_pracoviste a datum_prijeti (YYYY-MM-DD).");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(datum_prijeti))) {
        return chyba("datum_prijeti musí být ve formátu YYYY-MM-DD.");
      }
      return knGet(
        "/Rizeni/PrijateDne",
        { TypRizeni: typ_rizeni, KodPracoviste: kod_pracoviste, DatumPrijeti: datum_prijeti },
        apiKey
      );
    }

    /* ---------- provozní ---------- */
    case "kn_sluzba": {
      const seg = SLUZBA_PATH[args.co];
      if (!seg) return chyba("Neznámý dotaz. Povolené: aktualnost, stav_uctu, provoz, health, zpravy.");
      return knGet(`/AplikacniSluzby/${seg}`, null, apiKey);
    }

    /* ---------- výpis ---------- */
    case "kn_vypis": {
      const typ = String(args.typ ?? "").replace("_", "-");
      if (!["parcela", "stavba", "jednotka", "pravo-stavby"].includes(typ)) {
        return chyba("Neznámý typ. Povolené: parcela, stavba, jednotka, pravo_stavby.");
      }
      if (args.id == null) return chyba("Zadej id nemovitosti.");
      const ico = args.ico ? String(args.ico).replace(/\D/g, "").padStart(8, "0") : null;
      const q = [];
      if (ico) q.push("ico=" + encodeURIComponent(ico));
      if (args.sousedni) q.push("sousedni=1");
      const odkaz = `${origin}/vypis/${typ}/${args.id}${q.length ? "?" + q.join("&") : ""}`;

      if (args.format === "odkaz") {
        return { odkaz, format: "RTF (otevře se ve Wordu)", pokyn: "Předej uživateli odkaz ke stažení." };
      }

      let doc;
      try {
        doc = await buildVypis({
          typ,
          id: args.id,
          ico,
          sousedni: !!args.sousedni,
          knGet: (p, params) => knGet(p, params, apiKey),
        });
      } catch (e) {
        return chyba(`Nepodařilo se sestavit výpis: ${e?.message ?? String(e)}`, { odkaz });
      }

      return {
        nazev_souboru: doc.filename.replace(/\.rtf$/, ".docx"),
        soubor_gzip_base64: await gzipBase64(doc.rtf),
        kodovani: "gzip + base64; po rozbalení je to RTF",
        odkaz,
        pokyn:
          "NEVYPISUJ obsah pole soubor_gzip_base64. Ulož ho do souboru a proveď: " +
          "`base64 -d < blob.b64 | gunzip > vypis.rtf` a poté `soffice --headless --convert-to docx vypis.rtf`. " +
          "Výsledný .docx pošli uživateli nástrojem SendUserFile pod názvem z pole nazev_souboru. " +
          "Ohlásí-li gunzip chybu CRC nebo délky, přenos se cestou poškodil – zavolej nástroj ZNOVU, nepokoušej se soubor opravit. "
          + "Není-li LibreOffice k dispozici, přejmenuj RTF na .doc a pošli ho tak, nebo použij pole odkaz. " +
          "Dokument je kompletní výpis z katastru nemovitostí v úpravě TARPAN; jména vlastníků API KN neposkytuje.",
      };
    }

    default:
      return chyba(`Neznámý nástroj: ${name}`);
  }
}

/* ------------------------------------------------------------------ */
/*  JSON-RPC / MCP                                                     */
/* ------------------------------------------------------------------ */

function jsonResponse(obj, init = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    ...init,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS, ...(init.headers || {}) },
  });
}

const rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
const rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handleRpc(msg, apiKey, origin) {
  const { method, params, id } = msg ?? {};
  try {
    switch (method) {
      case "initialize":
        return rpcResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: SERVER_INFO,
          capabilities: { tools: {} },
        });
      case "notifications/initialized":
      case "notifications/cancelled":
        return null;
      case "ping":
        return rpcResult(id, {});
      case "tools/list":
        return rpcResult(id, { tools: TOOLS });
      case "tools/call": {
        const result = await callTool(params?.name, params?.arguments ?? {}, apiKey, origin);
        const isError = !!(result && typeof result === "object" && "chyba" in result);
        return rpcResult(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError,
        });
      }
      case "resources/list":
        return rpcResult(id, { resources: [] });
      case "prompts/list":
        return rpcResult(id, { prompts: [] });
      default:
        return rpcError(id, -32601, `Neznámá metoda: ${method}`);
    }
  } catch (e) {
    return rpcError(id, -32000, e?.message ?? "Interní chyba serveru.");
  }
}

/* ------------------------------------------------------------------ */
/*  Worker                                                             */
/* ------------------------------------------------------------------ */

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    const url = new URL(request.url);
    const origin = url.origin;
    const apiKey = env.CUZK_KN_API_KEY;

    /* --- výpis do Wordu --- */
    if (request.method === "GET" && url.pathname.startsWith("/vypis/")) {
      const [, , typ, idRaw] = url.pathname.split("/");
      const id = Number(idRaw);
      if (!typ || !Number.isFinite(id)) {
        return jsonResponse({ error: "Použij /vypis/{parcela|stavba|jednotka|pravo-stavby}/{id}" }, { status: 400 });
      }
      try {
        const { rtf, filename } = await buildVypis({
          typ,
          id,
          ico: url.searchParams.get("ico"),
          sousedni: url.searchParams.get("sousedni") === "1",
          knGet: (p, q) => knGet(p, q, apiKey, { cache: false }),
        });
        return new Response(rtf, {
          headers: {
            "Content-Type": "application/rtf; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            ...CORS,
          },
        });
      } catch (e) {
        return jsonResponse({ error: `Chyba generování výpisu: ${e?.message ?? String(e)}` }, { status: 500 });
      }
    }

    /* --- info --- */
    if (request.method === "GET") {
      if (url.pathname === "/" || url.pathname === "" || url.pathname === "/mcp") {
        return jsonResponse({
          server: SERVER_INFO,
          transport: "streamable-http",
          endpoint: "POST /",
          authentication: "none (API klíč ČÚZK drží worker jako secret)",
          api_key_nastaven: !!apiKey,
          tools: TOOLS.map((t) => t.name),
          vypis: `${origin}/vypis/{parcela|stavba|jednotka|pravo-stavby}/{id}`,
          upstream: KN_BASE,
        });
      }
      return jsonResponse({ error: "Not found", hint: "MCP endpoint je POST /" }, { status: 404 });
    }

    if (request.method !== "POST") {
      return jsonResponse(rpcError(null, -32600, "Použij POST s JSON-RPC 2.0."), { status: 405 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(rpcError(null, -32700, "Neplatný JSON."), { status: 400 });
    }

    if (Array.isArray(payload)) {
      const responses = (await Promise.all(payload.map((m) => handleRpc(m, apiKey, origin)))).filter((r) => r !== null);
      if (!responses.length) return new Response(null, { status: 202, headers: CORS });
      return jsonResponse(responses);
    }

    const response = await handleRpc(payload, apiKey, origin);
    if (response === null) return new Response(null, { status: 202, headers: CORS });
    return jsonResponse(response);
  },
};

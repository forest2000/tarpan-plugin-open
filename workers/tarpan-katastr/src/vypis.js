// Generátor výpisu z katastru nemovitostí do RTF (otevře se ve Wordu).
// Grafická úprava TARPAN – shodná s výpisem z ARES (tarpan-ares/src/index.js).

const INK = 1;
const GOLD = 2;
const RED = 3;
const GREY = 4;
const GREEN = 5;

const NAHLIZENI = "https://nahlizenidokn.cuzk.gov.cz/ZobrazObjekt.aspx";
const ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";

const MESICE = [
  "ledna", "února", "března", "dubna", "května", "června",
  "července", "srpna", "září", "října", "listopadu", "prosince",
];

const TYP_VAZBY = {
  PostavenaNaPozemku: "stavba je postavena na pozemku",
  JeSoucastiPozemku: "stavba je součástí pozemku (§ 506 odst. 1 o. z.)",
  JeSoucastiPravaStavby: "stavba je součástí práva stavby (§ 1240 a násl. o. z.)",
};

const TYP_RIZENI = {
  V: "vklad",
  Z: "záznam",
  PGP: "potvrzení geometrického plánu",
  PD: "podací deník",
  ZPV: "pomocné řízení V",
};

const ZDROJ_ZE = { 3: "evidence nemovitostí", 4: "pozemkový katastr", 6: "přídělový plán nebo jiný podklad" };

/* ---------------------------------------------------------------- */
/*  Formátování                                                      */
/* ---------------------------------------------------------------- */

function rtfEsc(s) {
  let o = "";
  for (const ch of String(s == null ? "" : s)) {
    const c = ch.codePointAt(0);
    if (ch === "\\") o += "\\\\";
    else if (ch === "{") o += "\\{";
    else if (ch === "}") o += "\\}";
    else if (c > 127) o += "\\u" + (c > 32767 ? c - 65536 : c) + "?";
    else o += ch;
  }
  return o;
}

function fdate(s) {
  if (!s) return "";
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(s);
  return `${Number(m[3])}. ${Number(m[2])}. ${m[1]}`;
}

function fdatetime(s) {
  if (!s) return "";
  const d = fdate(s);
  const t = String(s).match(/T(\d{2}):(\d{2})/);
  return t ? `${d} ${t[1]}:${t[2]}` : d;
}

function fnum(v) {
  if (v == null || v === "") return "";
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  const [i, f] = String(n).split(".");
  const s = i.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return f ? `${s},${f}` : s;
}

/** Parcelní číslo v běžném zápisu: „st. 123/4“ nebo „123/4“. */
function parcCislo(p) {
  if (!p) return "";
  const st = p.druhCislovaniParcely === 1 ? "st. " : "";
  const pod = p.poddeleniCislaParcely ? "/" + p.poddeleniCislaParcely : "";
  return `${st}${p.kmenoveCisloParcely ?? "?"}${pod}`;
}

function cislaDomovni(s) {
  const c = (s?.cislaDomovni ?? []).filter((x) => x != null);
  if (!c.length) return "bez čísla popisného";
  const typ = s?.typStavby?.kod === 2 || s?.typStavby?.nazev?.toLowerCase?.().includes("eviden") ? "č. e." : "č. p.";
  return `${typ} ${c.join(", ")}`;
}

const nazevKodu = (o) => (o ? [o.nazev, o.kod != null ? `[${o.kod}]` : null].filter(Boolean).join(" ") : null);

/* ---------------------------------------------------------------- */
/*  Načtení dat                                                      */
/* ---------------------------------------------------------------- */

async function nactiUzemi(knGet, kodKu) {
  const out = {};
  if (kodKu == null) return out;
  const ku = await knGet(`/CiselnikyUzemnichJednotek/KatastralniUzemi/${kodKu}`);
  out.ku = ku?.data ?? null;
  const kodObce = out.ku?.kodObce;
  if (kodObce != null) {
    const ob = await knGet(`/CiselnikyUzemnichJednotek/Obce/${kodObce}`);
    out.obec = ob?.data ?? null;
    const kodOkresu = out.obec?.kodOkresu;
    if (kodOkresu != null) {
      const ok = await knGet(`/CiselnikyUzemnichJednotek/Okresy/${kodOkresu}`);
      out.okres = ok?.data ?? null;
    }
  }
  return out;
}

async function nactiAres(ico) {
  if (!ico) return null;
  try {
    const res = await fetch(`${ARES_BASE}/ekonomicke-subjekty/${ico}`, {
      headers: { Accept: "application/json", "User-Agent": "tarpan-katastr/1.0" },
    });
    if (!res.ok) return { ico, chyba: `ARES vrátil HTTP ${res.status}` };
    const d = await res.json();
    const a = d?.sidlo ?? {};
    const adresa =
      a.textovaAdresa ||
      [
        [a.nazevUlice || a.nazevObce, a.cisloDomovni ? `${a.cisloDomovni}${a.cisloOrientacni ? "/" + a.cisloOrientacni : ""}` : null]
          .filter(Boolean)
          .join(" "),
        [a.psc ? String(a.psc).replace(/^(\d{3})(\d{2})$/, "$1 $2") : null, a.nazevObce].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(", ");
    return {
      ico: d?.ico ?? ico,
      nazev: d?.obchodniJmeno ?? null,
      dic: d?.dic ?? null,
      pravniForma: d?.pravniForma ?? null,
      sidlo: adresa || null,
      datovaSchranka: d?.datovaSchranka ?? null,
      stav: d?.stavSubjektu ?? null,
    };
  } catch (e) {
    return { ico, chyba: `ARES nedostupný: ${e?.message ?? String(e)}` };
  }
}

/* ---------------------------------------------------------------- */
/*  Stavba dokumentu                                                 */
/* ---------------------------------------------------------------- */

function makeDoc(nadpisPodtitul) {
  const B = [];
  B.push("{\\rtf1\\ansi\\ansicpg1250\\deff0{\\fonttbl{\\f0\\froman Times New Roman;}}");
  B.push("{\\colortbl;\\red35\\green31\\blue32;\\red181\\green152\\blue90;\\red179\\green38\\blue30;\\red114\\green107\\blue96;\\red46\\green107\\blue79;}");
  B.push("\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1021\\margb1021\\f0\\fs22\\cf1 ");

  const par = (s, opts = {}) => {
    const {
      sz = 22, cf = INK, b = false, i = false, scaps = false,
      sb = 0, sa = 40, just = false, border = false, bcf = GOLD, bw = 8,
      indent = 0, hang = 0, tabs = [],
    } = opts;
    let p = "\\pard";
    if (border) p += `\\brdrb\\brdrs\\brdrw${bw}\\brdrcf${bcf}\\brsp20`;
    if (just) p += "\\qj";
    if (indent) p += `\\li${indent}`;
    if (hang) p += `\\fi-${hang}`;
    for (const t of tabs) p += `\\tx${t}`;
    p += `\\sb${sb}\\sa${sa} `;
    p += `{\\fs${sz}\\cf${cf}${b ? "\\b" : ""}${i ? "\\i" : ""}${scaps ? "\\scaps" : ""} ${s}}`;
    B.push(p + "\\par");
  };

  const kv = (label, value, opts = {}) => {
    if (value == null || value === "") return;
    const cf = opts.red ? RED : opts.green ? GREEN : INK;
    const b = opts.b ? "\\b" : "";
    B.push(
      `\\pard\\tx2835\\sa20 {\\fs22\\cf${GREY} ${rtfEsc(label)}:}\\tab {\\fs22\\cf${cf}${b} ${opts.raw ? value : rtfEsc(value)}}\\par`
    );
  };

  const sec = (t) => par(rtfEsc(t), { sz: 24, b: true, scaps: true, sb: 200, sa: 60, border: true, bcf: GOLD, bw: 8 });
  const sub = (t) => par(rtfEsc(t), { sz: 20, cf: GREY, b: true, scaps: true, sb: 120, sa: 30 });

  const bullet = (t, opts = {}) => {
    const cf = opts.red ? RED : INK;
    B.push(`\\pard\\li340\\fi-200\\sa20 {\\fs22\\cf${cf} ${rtfEsc("– " + t)}}\\par`);
  };

  const link = (url, text) =>
    `{\\field{\\*\\fldinst{HYPERLINK "${String(url).replace(/[\\{}]/g, "")}"}}{\\fldrslt{\\ul\\cf${GOLD} ${rtfEsc(text)}}}}`;

  const raw = (s) => B.push(s);

  /* hlavička */
  par(rtfEsc("VÝPIS Z KATASTRU NEMOVITOSTÍ"), { sz: 34, b: true, scaps: true, sa: 0, border: true, bcf: INK, bw: 12 });
  par(rtfEsc(nadpisPodtitul || "pro interní potřebu TARPAN"), { sz: 20, cf: GOLD, b: true, scaps: true, sa: 30 });

  const d = new Date();
  par(rtfEsc(`Vyhotoveno ${d.getDate()}. ${MESICE[d.getMonth()]} ${d.getFullYear()}`), { sz: 20, cf: GREY, sa: 120 });

  const finish = () => {
    B.push("}");
    return B.join("\n");
  };

  return { B, par, kv, sec, sub, bullet, link, raw, finish };
}

/** Společné bloky: způsoby ochrany, plomby, patička. */
function blokOchrany(doc, zpusoby) {
  if (!zpusoby?.length) return;
  doc.sec("Způsob ochrany nemovitosti");
  for (const z of zpusoby) doc.bullet([z.nazev, z.kod != null ? `[${z.kod}]` : null].filter(Boolean).join(" "));
}

function blokPlomby(doc, plomby) {
  doc.sec("Plomby a probíhající řízení");
  if (!plomby?.length) {
    doc.par(rtfEsc("Na nemovitosti není vyznačena plomba – k datu vyhotovení neprobíhá řízení o změně právního vztahu."), {
      sz: 22,
      cf: GREEN,
    });
    return;
  }
  doc.par(
    rtfEsc(
      `POZOR: na nemovitosti je vyznačena plomba (${plomby.length} ${plomby.length === 1 ? "řízení" : "řízení"}). Právní vztahy se mohou měnit.`
    ),
    { sz: 22, cf: RED, b: true, sa: 60 }
  );
  for (const r of plomby) {
    const znacka = `${r.typRizeni ?? "?"}-${r.poradoveCislo ?? "?"}/${r.rok ?? "?"}`;
    const popis = [
      TYP_RIZENI[r.typRizeni] ? `typ: ${TYP_RIZENI[r.typRizeni]}` : null,
      r.kodPracoviste != null ? `pracoviště ${r.kodPracoviste}` : null,
      r.id != null ? `ID ${r.id}` : null,
    ]
      .filter(Boolean)
      .join(", ");
    doc.bullet(`${znacka}${popis ? ` (${popis})` : ""}`, { red: true });
  }
}

function blokLV(doc, lv, odkazNahlizeni, ares) {
  doc.sec("List vlastnictví a vlastníci");
  if (lv?.cislo != null) {
    doc.kv("Číslo LV", String(lv.cislo), { b: true });
    if (lv.katastralniUzemi) doc.kv("Vedený pro k. ú.", nazevKodu(lv.katastralniUzemi));
    if (lv.id != null) doc.kv("ID listu vlastnictví v ISKN", String(lv.id));
  } else {
    doc.kv("Číslo LV", "neuvedeno");
  }
  if (odkazNahlizeni) {
    doc.kv("Nahlížení do KN", doc.link(odkazNahlizeni, "otevřít detail nemovitosti"), { raw: true });
    doc.par(rtfEsc(odkazNahlizeni), { sz: 18, cf: GREY, indent: 2835, sa: 20 });
  }
  doc.par(
    rtfEsc(
      "REST API dálkového přístupu k datům KN neposkytuje jména a adresy vlastníků ani nabývací tituly. Aktuální vlastníky a omezení vlastnického práva ověř na výše uvedeném odkazu do Nahlížení do KN, popřípadě si vyžádej úplný výpis z katastru nemovitostí."
    ),
    { sz: 20, cf: GREY, i: true, just: true, sa: 60 }
  );
  if (ares) {
    doc.sub("Vlastník dohledaný v ARES");
    if (ares.chyba) {
      doc.kv("IČO", ares.ico);
      doc.kv("Poznámka", ares.chyba, { red: true });
    } else {
      doc.kv("Obchodní firma", ares.nazev);
      doc.kv("IČO", ares.ico);
      doc.kv("DIČ", ares.dic);
      doc.kv("Sídlo", ares.sidlo);
      doc.kv("Datová schránka", ares.datovaSchranka);
      doc.kv("Stav subjektu", ares.stav === "AKTIVNI" ? "Aktivní" : ares.stav);
      doc.par(
        rtfEsc("Údaje o vlastníkovi pocházejí z ARES a byly dohledány podle IČO zadaného uživatelem – katastr je nepotvrzuje."),
        { sz: 18, cf: GREY, i: true }
      );
    }
  }
}

function blokPaticka(doc, meta) {
  doc.par("", { sa: 0, border: true, bcf: GREY, bw: 6 });
  if (meta?.aktualnostDatK) {
    doc.par(rtfEsc(`Údaje katastru nemovitostí jsou aktuální k ${fdatetime(meta.aktualnostDatK)}.`), {
      sz: 18,
      cf: GREY,
      i: true,
      sa: 20,
    });
  }
  doc.par(
    rtfEsc(
      "Červeně: upozornění (plomba, ukončená platnost). Údaje v hranatých závorkách jsou kódy příslušných číselníků ISKN."
    ),
    { sz: 18, cf: GREY, i: true, sa: 20 }
  );
  doc.par(
    rtfEsc(
      "Zdroj: REST API dálkového přístupu k datům katastru nemovitostí (Český úřad zeměměřický a katastrální). Výpis má informativní charakter, není veřejnou listinou a nenahrazuje výpis z katastru nemovitostí vydaný podle § 55 katastrálního zákona. Pro interní potřebu TARPAN."
    ),
    { sz: 18, cf: GREY, just: true }
  );
}

/* ---------------------------------------------------------------- */
/*  Jednotlivé typy výpisu                                           */
/* ---------------------------------------------------------------- */

function uvodniVeta(doc, text) {
  doc.raw(`\\pard\\qj\\sb100\\sa60 {\\fs23\\cf${INK} ${text}}\\par`);
}

function vypisParcela(doc, p, uzemi, meta, sousedni, ares) {
  const kuTxt = nazevKodu(p.katastralniUzemi) || nazevKodu(uzemi.ku) || "";
  const obecTxt = nazevKodu(uzemi.obec);
  const typParc = p.typParcely === "PZE" ? "Parcela zjednodušené evidence" : "Parcela katastru nemovitostí";

  uvodniVeta(
    doc,
    rtfEsc("Pozemek ") +
      `{\\b ${rtfEsc("parc. č. " + parcCislo(p))}}` +
      rtfEsc(
        `, ${p.vymera != null ? `o výměře ${fnum(p.vymera)} m², ` : ""}${
          p.druhPozemku?.nazev ? `druh pozemku ${p.druhPozemku.nazev.toLowerCase()}, ` : ""
        }v katastrálním území ${kuTxt}${obecTxt ? `, obec ${obecTxt}` : ""}${
          p.lv?.cislo != null ? `, zapsaný na listu vlastnictví č. ${p.lv.cislo}` : ""
        }.`
      )
  );

  doc.sec("Identifikace pozemku");
  doc.kv("Parcelní číslo", parcCislo(p), { b: true });
  doc.kv("Typ parcely", typParc);
  doc.kv("Druh číslování", p.druhCislovaniParcely === 1 ? "stavební parcela" : p.druhCislovaniParcely === 2 ? "pozemková parcela" : null);
  doc.kv("Katastrální území", kuTxt);
  doc.kv("Obec", obecTxt);
  doc.kv("Okres", nazevKodu(uzemi.okres));
  if (p.katastralniUzemiPuvodni) doc.kv("Původní katastrální území", nazevKodu(p.katastralniUzemiPuvodni));
  if (p.zdrojParcelyZE != null) doc.kv("Původ parcely ZE", ZDROJ_ZE[p.zdrojParcelyZE] ?? String(p.zdrojParcelyZE));
  if (p.dilParcely != null) doc.kv("Díl parcely", String(p.dilParcely));
  doc.kv("Číslo LV", p.lv?.cislo != null ? String(p.lv.cislo) : null, { b: true });
  doc.kv("Mapový list", p.mapovyList ? [p.mapovyList.oznaceni, p.mapovyList.kod != null ? `[${p.mapovyList.kod}]` : null].filter(Boolean).join(" ") : null);
  doc.kv("ID parcely v ISKN", p.id != null ? String(p.id) : null);

  doc.sec("Údaje o pozemku");
  doc.kv("Výměra", p.vymera != null ? `${fnum(p.vymera)} m²` : null, { b: true });
  doc.kv("Způsob určení výměry", nazevKodu(p.zpusobUrceniVymery));
  doc.kv("Druh pozemku", nazevKodu(p.druhPozemku));
  doc.kv("Způsob využití", nazevKodu(p.zpusobVyuziti));
  if (p.definicniBod) doc.kv("Definiční bod (S-JTSK)", `X = ${fnum(p.definicniBod.x)}, Y = ${fnum(p.definicniBod.y)}`);

  if (p.bpej?.length) {
    doc.sub("Bonitované půdně ekologické jednotky (BPEJ)");
    for (const b of p.bpej) doc.bullet(`${b.kod ?? "?"} – ${b.vymera != null ? fnum(b.vymera) + " m²" : "výměra neuvedena"}`);
  }

  blokOchrany(doc, p.zpusobyOchrany);

  if (p.stavba || p.pravoStavby) {
    doc.sec("Stavby a práva stavby na pozemku");
    if (p.stavba) {
      doc.kv("Stavba na pozemku", `${cislaDomovni(p.stavba)}${p.stavba.castObce?.nazev ? ", " + p.stavba.castObce.nazev : ""}${p.stavba.typStavby?.nazev ? ` (${p.stavba.typStavby.nazev})` : ""}`);
      doc.kv("ID stavby v ISKN", p.stavba.id != null ? String(p.stavba.id) : null);
    }
    if (p.pravoStavby) {
      doc.kv("Právo stavby", `ID ${p.pravoStavby.id}${p.pravoStavby.datumUkonceni ? `, do ${fdate(p.pravoStavby.datumUkonceni)}` : ""}`);
    }
  }

  if (sousedni?.length) {
    doc.sec("Sousední parcely");
    for (const s of sousedni) {
      doc.bullet(`parc. č. ${parcCislo(s)}${s.katastralniUzemi?.nazev ? `, k. ú. ${s.katastralniUzemi.nazev}` : ""} (ID ${s.id})`);
    }
  }

  blokPlomby(doc, p.rizeniPlomby);
  blokLV(doc, p.lv, p.id != null ? `${NAHLIZENI}?typ=parcela&id=${p.id}` : null, ares);
  blokPaticka(doc, meta);

  return `Vypis_KN_parcela_${(p.katastralniUzemi?.nazev || "").replace(/[^\p{L}\p{N}]+/gu, "_")}_${parcCislo(p).replace(/[^\p{L}\p{N}]+/gu, "_")}`;
}

function vypisStavba(doc, s, uzemi, meta, ares) {
  const obecTxt = nazevKodu(s.obec) || nazevKodu(uzemi.obec);
  uvodniVeta(
    doc,
    rtfEsc("Stavba ") +
      `{\\b ${rtfEsc(cislaDomovni(s))}}` +
      rtfEsc(
        `${s.castObce?.nazev ? `, část obce ${s.castObce.nazev}` : ""}${obecTxt ? `, obec ${obecTxt}` : ""}${
          s.typStavby?.nazev ? `, ${s.typStavby.nazev.toLowerCase()}` : ""
        }${s.lv?.cislo != null ? `, zapsaná na listu vlastnictví č. ${s.lv.cislo}` : ""}.`
      )
  );

  doc.sec("Identifikace stavby");
  doc.kv("Číslo popisné / evidenční", cislaDomovni(s), { b: true });
  doc.kv("Typ stavby", nazevKodu(s.typStavby));
  doc.kv("Část obce", nazevKodu(s.castObce));
  doc.kv("Obec", obecTxt);
  doc.kv("Okres", nazevKodu(uzemi.okres));
  doc.kv("Číslo LV", s.lv?.cislo != null ? String(s.lv.cislo) : null, { b: true });
  doc.kv("Dočasná stavba", s.docasna === true ? "ano" : s.docasna === false ? "ne" : null, { red: s.docasna === true });
  doc.kv("Vazba k pozemku", s.typyVazby ? TYP_VAZBY[s.typyVazby] ?? s.typyVazby : null);
  doc.kv("ID stavby v ISKN", s.id != null ? String(s.id) : null);

  doc.sec("Údaje o stavbě");
  doc.kv("Způsob využití", nazevKodu(s.zpusobVyuziti));
  if (s.definicniBod) doc.kv("Definiční bod (S-JTSK)", `X = ${fnum(s.definicniBod.x)}, Y = ${fnum(s.definicniBod.y)}`);
  if (s.adresniMista?.length) doc.kv("Kódy adresních míst (RÚIAN)", s.adresniMista.join(", "));
  if (s.pravoStavby) {
    doc.kv("Právo stavby", `ID ${s.pravoStavby.id}${s.pravoStavby.datumUkonceni ? `, do ${fdate(s.pravoStavby.datumUkonceni)}` : ""}`);
  }

  if (s.parcely?.length) {
    doc.sub("Pozemky, na kterých stavba stojí");
    for (const p of s.parcely) {
      doc.bullet(`parc. č. ${parcCislo(p)}${p.katastralniUzemi?.nazev ? `, k. ú. ${p.katastralniUzemi.nazev}` : ""} (ID ${p.id})`);
    }
  }

  blokOchrany(doc, s.zpusobyOchrany);

  if (s.jednotky?.length) {
    doc.sec(`Jednotky vymezené ve stavbě (${s.jednotky.length})`);
    for (const j of s.jednotky) doc.bullet(`jednotka č. ${j.cisloJednotky ?? "?"} (ID ${j.id})`);
    doc.par(rtfEsc("Detail jednotky včetně podílu na společných částech domu získáš nástrojem kn_jednotka_detail."), {
      sz: 18,
      cf: GREY,
      i: true,
    });
  }

  blokPlomby(doc, s.rizeniPlomby);
  blokLV(doc, s.lv, s.id != null ? `${NAHLIZENI}?typ=budova&id=${s.id}` : null, ares);
  blokPaticka(doc, meta);

  return `Vypis_KN_stavba_${(s.castObce?.nazev || "").replace(/[^\p{L}\p{N}]+/gu, "_")}_${(s.cislaDomovni ?? []).join("_") || s.id}`;
}

function vypisJednotka(doc, j, uzemi, meta, ares) {
  const st = j.vymezenaVeStavbe;
  uvodniVeta(
    doc,
    rtfEsc("Jednotka ") +
      `{\\b ${rtfEsc("č. " + (j.cisloJednotky ?? "?"))}}` +
      rtfEsc(
        `${j.typJednotky?.nazev ? `, ${j.typJednotky.nazev.toLowerCase()}` : ""}${
          st ? `, vymezená ve stavbě ${cislaDomovni(st)}${st.castObce?.nazev ? `, ${st.castObce.nazev}` : ""}` : ""
        }${j.lv?.cislo != null ? `, zapsaná na listu vlastnictví č. ${j.lv.cislo}` : ""}.`
      )
  );

  doc.sec("Identifikace jednotky");
  doc.kv("Číslo jednotky", j.cisloJednotky != null ? String(j.cisloJednotky) : null, { b: true });
  doc.kv("Typ jednotky", nazevKodu(j.typJednotky));
  doc.kv("Způsob využití", nazevKodu(j.zpusobVyuziti));
  doc.kv("Číslo LV", j.lv?.cislo != null ? String(j.lv.cislo) : null, { b: true });
  doc.kv("ID jednotky v ISKN", j.id != null ? String(j.id) : null);

  doc.sec("Podíl na společných částech domu");
  if (j.podilNaSpolecnychCastechDomu?.citatel != null) {
    const p = j.podilNaSpolecnychCastechDomu;
    doc.kv("Podíl", `${fnum(p.citatel)} / ${fnum(p.jmenovatel)}`, { b: true });
    if (p.jmenovatel) doc.kv("Vyjádřeno procenty", `${((p.citatel / p.jmenovatel) * 100).toFixed(4).replace(".", ",")} %`);
  } else {
    doc.kv("Podíl", "neuveden");
  }

  if (st) {
    doc.sec("Budova, ve které je jednotka vymezena");
    doc.kv("Označení stavby", cislaDomovni(st));
    doc.kv("Část obce", nazevKodu(st.castObce));
    doc.kv("Typ stavby", nazevKodu(st.typStavby));
    doc.kv("Obec", nazevKodu(uzemi.obec));
    doc.kv("ID stavby v ISKN", st.id != null ? String(st.id) : null);
  }

  blokOchrany(doc, j.zpusobyOchrany);
  blokPlomby(doc, j.rizeniPlomby);
  blokLV(doc, j.lv, j.id != null ? `${NAHLIZENI}?typ=jednotka&id=${j.id}` : null, ares);
  blokPaticka(doc, meta);

  return `Vypis_KN_jednotka_${j.cisloJednotky ?? j.id}`;
}

function vypisPravoStavby(doc, ps, uzemi, meta, ares) {
  const konec = ps.datumUkonceni ? new Date(ps.datumUkonceni) : null;
  const jizSkoncilo = konec && konec.getTime() < Date.now();

  uvodniVeta(
    doc,
    rtfEsc("Právo stavby ") +
      `{\\b ${rtfEsc("ID " + (ps.id ?? "?"))}}` +
      rtfEsc(
        `${ps.datumPrijeti ? `, přijaté ${fdate(ps.datumPrijeti)}` : ""}${
          ps.datumUkonceni ? `, s koncem platnosti ${fdate(ps.datumUkonceni)}` : ""
        }${ps.lv?.cislo != null ? `, zapsané na listu vlastnictví č. ${ps.lv.cislo}` : ""}.`
      )
  );

  doc.sec("Identifikace práva stavby");
  doc.kv("ID práva stavby v ISKN", ps.id != null ? String(ps.id) : null, { b: true });
  doc.kv("Datum přijetí", fdate(ps.datumPrijeti));
  doc.kv("Datum konce platnosti", fdate(ps.datumUkonceni), { red: !!jizSkoncilo });
  if (jizSkoncilo) doc.kv("Upozornění", "Doba, na kterou bylo právo stavby zřízeno, již uplynula.", { red: true });
  doc.kv("Číslo LV", ps.lv?.cislo != null ? String(ps.lv.cislo) : null, { b: true });

  if (ps.ucelyPravaStavby?.length) {
    doc.sub("Účel práva stavby");
    for (const u of ps.ucelyPravaStavby) doc.bullet([u.nazev, u.kod != null ? `[${u.kod}]` : null].filter(Boolean).join(" "));
  }

  if (ps.parcely?.length) {
    doc.sec("Zatížené pozemky");
    for (const p of ps.parcely) {
      doc.bullet(`parc. č. ${parcCislo(p)}${p.katastralniUzemi?.nazev ? `, k. ú. ${p.katastralniUzemi.nazev}` : ""} (ID ${p.id})`);
    }
  }

  if (ps.stavby?.length) {
    doc.sec("Stavby, které jsou součástí práva stavby");
    for (const s of ps.stavby) doc.bullet(`${cislaDomovni(s)}${s.castObce?.nazev ? `, ${s.castObce.nazev}` : ""} (ID ${s.id})`);
  }

  blokOchrany(doc, ps.zpusobyOchrany);
  blokPlomby(doc, ps.rizeniPlomby);
  blokLV(doc, ps.lv, null, ares);
  blokPaticka(doc, meta);

  return `Vypis_KN_pravo_stavby_${ps.id}`;
}

/* ---------------------------------------------------------------- */
/*  Vstupní bod                                                      */
/* ---------------------------------------------------------------- */

export async function buildVypis({ typ, id, ico, sousedni, knGet }) {
  const cesty = {
    parcela: `/Parcely/${id}`,
    stavba: `/Stavby/${id}`,
    jednotka: `/Jednotky/${id}`,
    "pravo-stavby": `/PravaStavby/${id}`,
  };
  const cesta = cesty[typ];
  if (!cesta) throw new Error(`Neznámý typ výpisu: ${typ}`);

  const res = await knGet(cesta);
  if (res?.chyba) throw new Error(`${res.chyba}${res.detail ? " – " + JSON.stringify(res.detail) : ""}`);
  const data = res?.data;
  if (!data) throw new Error("API KN nevrátilo žádná data.");

  const meta = { aktualnostDatK: res.aktualnostDatK };

  const kodKu =
    data.katastralniUzemi?.kod ??
    data.lv?.katastralniUzemi?.kod ??
    data.parcely?.[0]?.katastralniUzemi?.kod ??
    null;
  const uzemi = await nactiUzemi(knGet, kodKu);

  const ares = ico ? await nactiAres(ico) : null;

  const doc = makeDoc("pro interní potřebu TARPAN");
  let base;

  if (typ === "parcela") {
    let sous = null;
    if (sousedni) {
      const s = await knGet(`/Parcely/SousedniParcely/${id}`);
      sous = Array.isArray(s?.data) ? s.data : null;
    }
    base = vypisParcela(doc, data, uzemi, meta, sous, ares);
  } else if (typ === "stavba") {
    base = vypisStavba(doc, data, uzemi, meta, ares);
  } else if (typ === "jednotka") {
    base = vypisJednotka(doc, data, uzemi, meta, ares);
  } else {
    base = vypisPravoStavby(doc, data, uzemi, meta, ares);
  }

  const filename = `${base}`.replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 80) + ".rtf";
  return { rtf: doc.finish(), filename };
}

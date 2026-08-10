// src/vypis.js
var INK = 1;
var GOLD = 2;
var RED = 3;
var GREY = 4;
var GREEN = 5;
var NAHLIZENI = "https://nahlizenidokn.cuzk.gov.cz/ZobrazObjekt.aspx";
var ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";
var MESICE = [
  "ledna",
  "\xFAnora",
  "b\u0159ezna",
  "dubna",
  "kv\u011Btna",
  "\u010Dervna",
  "\u010Dervence",
  "srpna",
  "z\xE1\u0159\xED",
  "\u0159\xEDjna",
  "listopadu",
  "prosince"
];
var TYP_VAZBY = {
  PostavenaNaPozemku: "stavba je postavena na pozemku",
  JeSoucastiPozemku: "stavba je sou\u010D\xE1st\xED pozemku (\xA7 506 odst. 1 o. z.)",
  JeSoucastiPravaStavby: "stavba je sou\u010D\xE1st\xED pr\xE1va stavby (\xA7 1240 a n\xE1sl. o. z.)"
};
var TYP_RIZENI = {
  V: "vklad",
  Z: "z\xE1znam",
  PGP: "potvrzen\xED geometrick\xE9ho pl\xE1nu",
  PD: "podac\xED den\xEDk",
  ZPV: "pomocn\xE9 \u0159\xEDzen\xED V"
};
var ZDROJ_ZE = { 3: "evidence nemovitost\xED", 4: "pozemkov\xFD katastr", 6: "p\u0159\xEDd\u011Blov\xFD pl\xE1n nebo jin\xFD podklad" };
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
  const s = i.replace(/\B(?=(\d{3})+(?!\d))/g, "\xA0");
  return f ? `${s},${f}` : s;
}
function parcCislo(p) {
  if (!p) return "";
  const st = p.druhCislovaniParcely === 1 ? "st. " : "";
  const pod = p.poddeleniCislaParcely ? "/" + p.poddeleniCislaParcely : "";
  return `${st}${p.kmenoveCisloParcely ?? "?"}${pod}`;
}
function cislaDomovni(s) {
  const c = (s?.cislaDomovni ?? []).filter((x) => x != null);
  if (!c.length) return "bez \u010D\xEDsla popisn\xE9ho";
  const typ = s?.typStavby?.kod === 2 || s?.typStavby?.nazev?.toLowerCase?.().includes("eviden") ? "\u010D. e." : "\u010D. p.";
  return `${typ} ${c.join(", ")}`;
}
var nazevKodu = (o) => o ? [o.nazev, o.kod != null ? `[${o.kod}]` : null].filter(Boolean).join(" ") : null;
async function nactiUzemi(knGet2, kodKu) {
  const out = {};
  if (kodKu == null) return out;
  const ku = await knGet2(`/CiselnikyUzemnichJednotek/KatastralniUzemi/${kodKu}`);
  out.ku = ku?.data ?? null;
  const kodObce = out.ku?.kodObce;
  if (kodObce != null) {
    const ob = await knGet2(`/CiselnikyUzemnichJednotek/Obce/${kodObce}`);
    out.obec = ob?.data ?? null;
    const kodOkresu = out.obec?.kodOkresu;
    if (kodOkresu != null) {
      const ok = await knGet2(`/CiselnikyUzemnichJednotek/Okresy/${kodOkresu}`);
      out.okres = ok?.data ?? null;
    }
  }
  return out;
}
async function nactiAres(ico) {
  if (!ico) return null;
  try {
    const res = await fetch(`${ARES_BASE}/ekonomicke-subjekty/${ico}`, {
      headers: { Accept: "application/json", "User-Agent": "tarpan-katastr/1.0" }
    });
    if (!res.ok) return { ico, chyba: `ARES vr\xE1til HTTP ${res.status}` };
    const d = await res.json();
    const a = d?.sidlo ?? {};
    const adresa = a.textovaAdresa || [
      [a.nazevUlice || a.nazevObce, a.cisloDomovni ? `${a.cisloDomovni}${a.cisloOrientacni ? "/" + a.cisloOrientacni : ""}` : null].filter(Boolean).join(" "),
      [a.psc ? String(a.psc).replace(/^(\d{3})(\d{2})$/, "$1 $2") : null, a.nazevObce].filter(Boolean).join(" ")
    ].filter(Boolean).join(", ");
    return {
      ico: d?.ico ?? ico,
      nazev: d?.obchodniJmeno ?? null,
      dic: d?.dic ?? null,
      pravniForma: d?.pravniForma ?? null,
      sidlo: adresa || null,
      datovaSchranka: d?.datovaSchranka ?? null,
      stav: d?.stavSubjektu ?? null
    };
  } catch (e) {
    return { ico, chyba: `ARES nedostupn\xFD: ${e?.message ?? String(e)}` };
  }
}
function makeDoc(nadpisPodtitul) {
  const B = [];
  B.push("{\\rtf1\\ansi\\ansicpg1250\\deff0{\\fonttbl{\\f0\\froman Times New Roman;}}");
  B.push("{\\colortbl;\\red35\\green31\\blue32;\\red181\\green152\\blue90;\\red179\\green38\\blue30;\\red114\\green107\\blue96;\\red46\\green107\\blue79;}");
  B.push("\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1021\\margb1021\\f0\\fs22\\cf1 ");
  const par = (s, opts = {}) => {
    const {
      sz = 22,
      cf = INK,
      b = false,
      i = false,
      scaps = false,
      sb = 0,
      sa = 40,
      just = false,
      border = false,
      bcf = GOLD,
      bw = 8,
      indent = 0,
      hang = 0,
      tabs = []
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
    B.push(`\\pard\\li340\\fi-200\\sa20 {\\fs22\\cf${cf} ${rtfEsc("\u2013 " + t)}}\\par`);
  };
  const link = (url, text) => `{\\field{\\*\\fldinst{HYPERLINK "${String(url).replace(/[\\{}]/g, "")}"}}{\\fldrslt{\\ul\\cf${GOLD} ${rtfEsc(text)}}}}`;
  const raw = (s) => B.push(s);
  par(rtfEsc("V\xDDPIS Z KATASTRU NEMOVITOST\xCD"), { sz: 34, b: true, scaps: true, sa: 0, border: true, bcf: INK, bw: 12 });
  par(rtfEsc(nadpisPodtitul || "pro intern\xED pot\u0159ebu TARPAN"), { sz: 20, cf: GOLD, b: true, scaps: true, sa: 30 });
  const d = /* @__PURE__ */ new Date();
  par(rtfEsc(`Vyhotoveno ${d.getDate()}. ${MESICE[d.getMonth()]} ${d.getFullYear()}`), { sz: 20, cf: GREY, sa: 120 });
  const finish = () => {
    B.push("}");
    return B.join("\n");
  };
  return { B, par, kv, sec, sub, bullet, link, raw, finish };
}
function blokOchrany(doc, zpusoby) {
  if (!zpusoby?.length) return;
  doc.sec("Zp\u016Fsob ochrany nemovitosti");
  for (const z of zpusoby) doc.bullet([z.nazev, z.kod != null ? `[${z.kod}]` : null].filter(Boolean).join(" "));
}
function blokPlomby(doc, plomby) {
  doc.sec("Plomby a prob\xEDhaj\xEDc\xED \u0159\xEDzen\xED");
  if (!plomby?.length) {
    doc.par(rtfEsc("Na nemovitosti nen\xED vyzna\u010Dena plomba \u2013 k datu vyhotoven\xED neprob\xEDh\xE1 \u0159\xEDzen\xED o zm\u011Bn\u011B pr\xE1vn\xEDho vztahu."), {
      sz: 22,
      cf: GREEN
    });
    return;
  }
  doc.par(
    rtfEsc(
      `POZOR: na nemovitosti je vyzna\u010Dena plomba (${plomby.length} ${plomby.length === 1 ? "\u0159\xEDzen\xED" : "\u0159\xEDzen\xED"}). Pr\xE1vn\xED vztahy se mohou m\u011Bnit.`
    ),
    { sz: 22, cf: RED, b: true, sa: 60 }
  );
  for (const r of plomby) {
    const znacka = `${r.typRizeni ?? "?"}-${r.poradoveCislo ?? "?"}/${r.rok ?? "?"}`;
    const popis = [
      TYP_RIZENI[r.typRizeni] ? `typ: ${TYP_RIZENI[r.typRizeni]}` : null,
      r.kodPracoviste != null ? `pracovi\u0161t\u011B ${r.kodPracoviste}` : null,
      r.id != null ? `ID ${r.id}` : null
    ].filter(Boolean).join(", ");
    doc.bullet(`${znacka}${popis ? ` (${popis})` : ""}`, { red: true });
  }
}
function blokLV(doc, lv, odkazNahlizeni, ares) {
  doc.sec("List vlastnictv\xED a vlastn\xEDci");
  if (lv?.cislo != null) {
    doc.kv("\u010C\xEDslo LV", String(lv.cislo), { b: true });
    if (lv.katastralniUzemi) doc.kv("Veden\xFD pro k. \xFA.", nazevKodu(lv.katastralniUzemi));
    if (lv.id != null) doc.kv("ID listu vlastnictv\xED v ISKN", String(lv.id));
  } else {
    doc.kv("\u010C\xEDslo LV", "neuvedeno");
  }
  if (odkazNahlizeni) {
    doc.kv("Nahl\xED\u017Een\xED do KN", doc.link(odkazNahlizeni, "otev\u0159\xEDt detail nemovitosti"), { raw: true });
    doc.par(rtfEsc(odkazNahlizeni), { sz: 18, cf: GREY, indent: 2835, sa: 20 });
  }
  doc.par(
    rtfEsc(
      "REST API d\xE1lkov\xE9ho p\u0159\xEDstupu k dat\u016Fm KN neposkytuje jm\xE9na a adresy vlastn\xEDk\u016F ani nab\xFDvac\xED tituly. Aktu\xE1ln\xED vlastn\xEDky a omezen\xED vlastnick\xE9ho pr\xE1va ov\u011B\u0159 na v\xFD\u0161e uveden\xE9m odkazu do Nahl\xED\u017Een\xED do KN, pop\u0159\xEDpad\u011B si vy\u017E\xE1dej \xFApln\xFD v\xFDpis z katastru nemovitost\xED."
    ),
    { sz: 20, cf: GREY, i: true, just: true, sa: 60 }
  );
  if (ares) {
    doc.sub("Vlastn\xEDk dohledan\xFD v ARES");
    if (ares.chyba) {
      doc.kv("I\u010CO", ares.ico);
      doc.kv("Pozn\xE1mka", ares.chyba, { red: true });
    } else {
      doc.kv("Obchodn\xED firma", ares.nazev);
      doc.kv("I\u010CO", ares.ico);
      doc.kv("DI\u010C", ares.dic);
      doc.kv("S\xEDdlo", ares.sidlo);
      doc.kv("Datov\xE1 schr\xE1nka", ares.datovaSchranka);
      doc.kv("Stav subjektu", ares.stav === "AKTIVNI" ? "Aktivn\xED" : ares.stav);
      doc.par(
        rtfEsc("\xDAdaje o vlastn\xEDkovi poch\xE1zej\xED z ARES a byly dohled\xE1ny podle I\u010CO zadan\xE9ho u\u017Eivatelem \u2013 katastr je nepotvrzuje."),
        { sz: 18, cf: GREY, i: true }
      );
    }
  }
}
function blokPaticka(doc, meta) {
  doc.par("", { sa: 0, border: true, bcf: GREY, bw: 6 });
  if (meta?.aktualnostDatK) {
    doc.par(rtfEsc(`\xDAdaje katastru nemovitost\xED jsou aktu\xE1ln\xED k ${fdatetime(meta.aktualnostDatK)}.`), {
      sz: 18,
      cf: GREY,
      i: true,
      sa: 20
    });
  }
  doc.par(
    rtfEsc(
      "\u010Cerven\u011B: upozorn\u011Bn\xED (plomba, ukon\u010Den\xE1 platnost). \xDAdaje v hranat\xFDch z\xE1vork\xE1ch jsou k\xF3dy p\u0159\xEDslu\u0161n\xFDch \u010D\xEDseln\xEDk\u016F ISKN."
    ),
    { sz: 18, cf: GREY, i: true, sa: 20 }
  );
  doc.par(
    rtfEsc(
      "Zdroj: REST API d\xE1lkov\xE9ho p\u0159\xEDstupu k dat\u016Fm katastru nemovitost\xED (\u010Cesk\xFD \xFA\u0159ad zem\u011Bm\u011B\u0159ick\xFD a katastr\xE1ln\xED). V\xFDpis m\xE1 informativn\xED charakter, nen\xED ve\u0159ejnou listinou a nenahrazuje v\xFDpis z katastru nemovitost\xED vydan\xFD podle \xA7 55 katastr\xE1ln\xEDho z\xE1kona. Pro intern\xED pot\u0159ebu TARPAN."
    ),
    { sz: 18, cf: GREY, just: true }
  );
}
function uvodniVeta(doc, text) {
  doc.raw(`\\pard\\qj\\sb100\\sa60 {\\fs23\\cf${INK} ${text}}\\par`);
}
function vypisParcela(doc, p, uzemi, meta, sousedni, ares) {
  const kuTxt = nazevKodu(p.katastralniUzemi) || nazevKodu(uzemi.ku) || "";
  const obecTxt = nazevKodu(uzemi.obec);
  const typParc = p.typParcely === "PZE" ? "Parcela zjednodu\u0161en\xE9 evidence" : "Parcela katastru nemovitost\xED";
  uvodniVeta(
    doc,
    rtfEsc("Pozemek ") + `{\\b ${rtfEsc("parc. \u010D. " + parcCislo(p))}}` + rtfEsc(
      `, ${p.vymera != null ? `o v\xFDm\u011B\u0159e ${fnum(p.vymera)} m\xB2, ` : ""}${p.druhPozemku?.nazev ? `druh pozemku ${p.druhPozemku.nazev.toLowerCase()}, ` : ""}v katastr\xE1ln\xEDm \xFAzem\xED ${kuTxt}${obecTxt ? `, obec ${obecTxt}` : ""}${p.lv?.cislo != null ? `, zapsan\xFD na listu vlastnictv\xED \u010D. ${p.lv.cislo}` : ""}.`
    )
  );
  doc.sec("Identifikace pozemku");
  doc.kv("Parceln\xED \u010D\xEDslo", parcCislo(p), { b: true });
  doc.kv("Typ parcely", typParc);
  doc.kv("Druh \u010D\xEDslov\xE1n\xED", p.druhCislovaniParcely === 1 ? "stavebn\xED parcela" : p.druhCislovaniParcely === 2 ? "pozemkov\xE1 parcela" : null);
  doc.kv("Katastr\xE1ln\xED \xFAzem\xED", kuTxt);
  doc.kv("Obec", obecTxt);
  doc.kv("Okres", nazevKodu(uzemi.okres));
  if (p.katastralniUzemiPuvodni) doc.kv("P\u016Fvodn\xED katastr\xE1ln\xED \xFAzem\xED", nazevKodu(p.katastralniUzemiPuvodni));
  if (p.zdrojParcelyZE != null) doc.kv("P\u016Fvod parcely ZE", ZDROJ_ZE[p.zdrojParcelyZE] ?? String(p.zdrojParcelyZE));
  if (p.dilParcely != null) doc.kv("D\xEDl parcely", String(p.dilParcely));
  doc.kv("\u010C\xEDslo LV", p.lv?.cislo != null ? String(p.lv.cislo) : null, { b: true });
  doc.kv("Mapov\xFD list", p.mapovyList ? [p.mapovyList.oznaceni, p.mapovyList.kod != null ? `[${p.mapovyList.kod}]` : null].filter(Boolean).join(" ") : null);
  doc.kv("ID parcely v ISKN", p.id != null ? String(p.id) : null);
  doc.sec("\xDAdaje o pozemku");
  doc.kv("V\xFDm\u011Bra", p.vymera != null ? `${fnum(p.vymera)} m\xB2` : null, { b: true });
  doc.kv("Zp\u016Fsob ur\u010Den\xED v\xFDm\u011Bry", nazevKodu(p.zpusobUrceniVymery));
  doc.kv("Druh pozemku", nazevKodu(p.druhPozemku));
  doc.kv("Zp\u016Fsob vyu\u017Eit\xED", nazevKodu(p.zpusobVyuziti));
  if (p.definicniBod) doc.kv("Defini\u010Dn\xED bod (S-JTSK)", `X = ${fnum(p.definicniBod.x)}, Y = ${fnum(p.definicniBod.y)}`);
  if (p.bpej?.length) {
    doc.sub("Bonitovan\xE9 p\u016Fdn\u011B ekologick\xE9 jednotky (BPEJ)");
    for (const b of p.bpej) doc.bullet(`${b.kod ?? "?"} \u2013 ${b.vymera != null ? fnum(b.vymera) + " m\xB2" : "v\xFDm\u011Bra neuvedena"}`);
  }
  blokOchrany(doc, p.zpusobyOchrany);
  if (p.stavba || p.pravoStavby) {
    doc.sec("Stavby a pr\xE1va stavby na pozemku");
    if (p.stavba) {
      doc.kv("Stavba na pozemku", `${cislaDomovni(p.stavba)}${p.stavba.castObce?.nazev ? ", " + p.stavba.castObce.nazev : ""}${p.stavba.typStavby?.nazev ? ` (${p.stavba.typStavby.nazev})` : ""}`);
      doc.kv("ID stavby v ISKN", p.stavba.id != null ? String(p.stavba.id) : null);
    }
    if (p.pravoStavby) {
      doc.kv("Pr\xE1vo stavby", `ID ${p.pravoStavby.id}${p.pravoStavby.datumUkonceni ? `, do ${fdate(p.pravoStavby.datumUkonceni)}` : ""}`);
    }
  }
  if (sousedni?.length) {
    doc.sec("Sousedn\xED parcely");
    for (const s of sousedni) {
      doc.bullet(`parc. \u010D. ${parcCislo(s)}${s.katastralniUzemi?.nazev ? `, k. \xFA. ${s.katastralniUzemi.nazev}` : ""} (ID ${s.id})`);
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
    rtfEsc("Stavba ") + `{\\b ${rtfEsc(cislaDomovni(s))}}` + rtfEsc(
      `${s.castObce?.nazev ? `, \u010D\xE1st obce ${s.castObce.nazev}` : ""}${obecTxt ? `, obec ${obecTxt}` : ""}${s.typStavby?.nazev ? `, ${s.typStavby.nazev.toLowerCase()}` : ""}${s.lv?.cislo != null ? `, zapsan\xE1 na listu vlastnictv\xED \u010D. ${s.lv.cislo}` : ""}.`
    )
  );
  doc.sec("Identifikace stavby");
  doc.kv("\u010C\xEDslo popisn\xE9 / eviden\u010Dn\xED", cislaDomovni(s), { b: true });
  doc.kv("Typ stavby", nazevKodu(s.typStavby));
  doc.kv("\u010C\xE1st obce", nazevKodu(s.castObce));
  doc.kv("Obec", obecTxt);
  doc.kv("Okres", nazevKodu(uzemi.okres));
  doc.kv("\u010C\xEDslo LV", s.lv?.cislo != null ? String(s.lv.cislo) : null, { b: true });
  doc.kv("Do\u010Dasn\xE1 stavba", s.docasna === true ? "ano" : s.docasna === false ? "ne" : null, { red: s.docasna === true });
  doc.kv("Vazba k pozemku", s.typyVazby ? TYP_VAZBY[s.typyVazby] ?? s.typyVazby : null);
  doc.kv("ID stavby v ISKN", s.id != null ? String(s.id) : null);
  doc.sec("\xDAdaje o stavb\u011B");
  doc.kv("Zp\u016Fsob vyu\u017Eit\xED", nazevKodu(s.zpusobVyuziti));
  if (s.definicniBod) doc.kv("Defini\u010Dn\xED bod (S-JTSK)", `X = ${fnum(s.definicniBod.x)}, Y = ${fnum(s.definicniBod.y)}`);
  if (s.adresniMista?.length) doc.kv("K\xF3dy adresn\xEDch m\xEDst (R\xDAIAN)", s.adresniMista.join(", "));
  if (s.pravoStavby) {
    doc.kv("Pr\xE1vo stavby", `ID ${s.pravoStavby.id}${s.pravoStavby.datumUkonceni ? `, do ${fdate(s.pravoStavby.datumUkonceni)}` : ""}`);
  }
  if (s.parcely?.length) {
    doc.sub("Pozemky, na kter\xFDch stavba stoj\xED");
    for (const p of s.parcely) {
      doc.bullet(`parc. \u010D. ${parcCislo(p)}${p.katastralniUzemi?.nazev ? `, k. \xFA. ${p.katastralniUzemi.nazev}` : ""} (ID ${p.id})`);
    }
  }
  blokOchrany(doc, s.zpusobyOchrany);
  if (s.jednotky?.length) {
    doc.sec(`Jednotky vymezen\xE9 ve stavb\u011B (${s.jednotky.length})`);
    for (const j of s.jednotky) doc.bullet(`jednotka \u010D. ${j.cisloJednotky ?? "?"} (ID ${j.id})`);
    doc.par(rtfEsc("Detail jednotky v\u010Detn\u011B pod\xEDlu na spole\u010Dn\xFDch \u010D\xE1stech domu z\xEDsk\xE1\u0161 n\xE1strojem kn_jednotka_detail."), {
      sz: 18,
      cf: GREY,
      i: true
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
    rtfEsc("Jednotka ") + `{\\b ${rtfEsc("\u010D. " + (j.cisloJednotky ?? "?"))}}` + rtfEsc(
      `${j.typJednotky?.nazev ? `, ${j.typJednotky.nazev.toLowerCase()}` : ""}${st ? `, vymezen\xE1 ve stavb\u011B ${cislaDomovni(st)}${st.castObce?.nazev ? `, ${st.castObce.nazev}` : ""}` : ""}${j.lv?.cislo != null ? `, zapsan\xE1 na listu vlastnictv\xED \u010D. ${j.lv.cislo}` : ""}.`
    )
  );
  doc.sec("Identifikace jednotky");
  doc.kv("\u010C\xEDslo jednotky", j.cisloJednotky != null ? String(j.cisloJednotky) : null, { b: true });
  doc.kv("Typ jednotky", nazevKodu(j.typJednotky));
  doc.kv("Zp\u016Fsob vyu\u017Eit\xED", nazevKodu(j.zpusobVyuziti));
  doc.kv("\u010C\xEDslo LV", j.lv?.cislo != null ? String(j.lv.cislo) : null, { b: true });
  doc.kv("ID jednotky v ISKN", j.id != null ? String(j.id) : null);
  doc.sec("Pod\xEDl na spole\u010Dn\xFDch \u010D\xE1stech domu");
  if (j.podilNaSpolecnychCastechDomu?.citatel != null) {
    const p = j.podilNaSpolecnychCastechDomu;
    doc.kv("Pod\xEDl", `${fnum(p.citatel)} / ${fnum(p.jmenovatel)}`, { b: true });
    if (p.jmenovatel) doc.kv("Vyj\xE1d\u0159eno procenty", `${(p.citatel / p.jmenovatel * 100).toFixed(4).replace(".", ",")} %`);
  } else {
    doc.kv("Pod\xEDl", "neuveden");
  }
  if (st) {
    doc.sec("Budova, ve kter\xE9 je jednotka vymezena");
    doc.kv("Ozna\u010Den\xED stavby", cislaDomovni(st));
    doc.kv("\u010C\xE1st obce", nazevKodu(st.castObce));
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
    rtfEsc("Pr\xE1vo stavby ") + `{\\b ${rtfEsc("ID " + (ps.id ?? "?"))}}` + rtfEsc(
      `${ps.datumPrijeti ? `, p\u0159ijat\xE9 ${fdate(ps.datumPrijeti)}` : ""}${ps.datumUkonceni ? `, s koncem platnosti ${fdate(ps.datumUkonceni)}` : ""}${ps.lv?.cislo != null ? `, zapsan\xE9 na listu vlastnictv\xED \u010D. ${ps.lv.cislo}` : ""}.`
    )
  );
  doc.sec("Identifikace pr\xE1va stavby");
  doc.kv("ID pr\xE1va stavby v ISKN", ps.id != null ? String(ps.id) : null, { b: true });
  doc.kv("Datum p\u0159ijet\xED", fdate(ps.datumPrijeti));
  doc.kv("Datum konce platnosti", fdate(ps.datumUkonceni), { red: !!jizSkoncilo });
  if (jizSkoncilo) doc.kv("Upozorn\u011Bn\xED", "Doba, na kterou bylo pr\xE1vo stavby z\u0159\xEDzeno, ji\u017E uplynula.", { red: true });
  doc.kv("\u010C\xEDslo LV", ps.lv?.cislo != null ? String(ps.lv.cislo) : null, { b: true });
  if (ps.ucelyPravaStavby?.length) {
    doc.sub("\xDA\u010Del pr\xE1va stavby");
    for (const u of ps.ucelyPravaStavby) doc.bullet([u.nazev, u.kod != null ? `[${u.kod}]` : null].filter(Boolean).join(" "));
  }
  if (ps.parcely?.length) {
    doc.sec("Zat\xED\u017Een\xE9 pozemky");
    for (const p of ps.parcely) {
      doc.bullet(`parc. \u010D. ${parcCislo(p)}${p.katastralniUzemi?.nazev ? `, k. \xFA. ${p.katastralniUzemi.nazev}` : ""} (ID ${p.id})`);
    }
  }
  if (ps.stavby?.length) {
    doc.sec("Stavby, kter\xE9 jsou sou\u010D\xE1st\xED pr\xE1va stavby");
    for (const s of ps.stavby) doc.bullet(`${cislaDomovni(s)}${s.castObce?.nazev ? `, ${s.castObce.nazev}` : ""} (ID ${s.id})`);
  }
  blokOchrany(doc, ps.zpusobyOchrany);
  blokPlomby(doc, ps.rizeniPlomby);
  blokLV(doc, ps.lv, null, ares);
  blokPaticka(doc, meta);
  return `Vypis_KN_pravo_stavby_${ps.id}`;
}
async function buildVypis({ typ, id, ico, sousedni, knGet: knGet2 }) {
  const cesty = {
    parcela: `/Parcely/${id}`,
    stavba: `/Stavby/${id}`,
    jednotka: `/Jednotky/${id}`,
    "pravo-stavby": `/PravaStavby/${id}`
  };
  const cesta = cesty[typ];
  if (!cesta) throw new Error(`Nezn\xE1m\xFD typ v\xFDpisu: ${typ}`);
  const res = await knGet2(cesta);
  if (res?.chyba) throw new Error(`${res.chyba}${res.detail ? " \u2013 " + JSON.stringify(res.detail) : ""}`);
  const data = res?.data;
  if (!data) throw new Error("API KN nevr\xE1tilo \u017E\xE1dn\xE1 data.");
  const meta = { aktualnostDatK: res.aktualnostDatK };
  const kodKu = data.katastralniUzemi?.kod ?? data.lv?.katastralniUzemi?.kod ?? data.parcely?.[0]?.katastralniUzemi?.kod ?? null;
  const uzemi = await nactiUzemi(knGet2, kodKu);
  const ares = ico ? await nactiAres(ico) : null;
  const doc = makeDoc("pro intern\xED pot\u0159ebu TARPAN");
  let base;
  if (typ === "parcela") {
    let sous = null;
    if (sousedni) {
      const s = await knGet2(`/Parcely/SousedniParcely/${id}`);
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

// src/index.js
var SERVER_INFO = { name: "tarpan-katastr", version: "1.0.0" };
var PROTOCOL_VERSION = "2024-11-05";
var KN_BASE = "https://api-kn.cuzk.gov.cz/api/v1";
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, ApiKey"
};
var CACHE = /* @__PURE__ */ new Map();
var TTL = 6 * 60 * 60 * 1e3;
async function knGet(path, params, apiKey, { cache = false } = {}) {
  if (!apiKey) {
    return { chyba: "Chyb\xED API kl\xED\u010D. Nastav secret CUZK_KN_API_KEY (wrangler secret put CUZK_KN_API_KEY)." };
  }
  let url = KN_BASE + path;
  if (params) {
    const q = Object.entries(params).filter(([, v]) => v !== void 0 && v !== null && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
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
    return { chyba: `Nepoda\u0159ilo se spojit s API \u010C\xDAZK: ${e?.message ?? String(e)}` };
  }
  const text = await res.text().catch(() => "");
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
  }
  if (!res.ok) {
    if (res.status === 404) {
      return { chyba: "Nenalezeno (HTTP 404).", detail: body?.detail ?? body?.title ?? null, url };
    }
    if (res.status === 401 || res.status === 403) {
      return { chyba: `Autentizace/autorizace selhala (HTTP ${res.status}). Zkontroluj platnost API kl\xED\u010De \u010C\xDAZK.`, url };
    }
    if (res.status === 429) {
      return { chyba: "P\u0159ekro\u010Den limit vol\xE1n\xED API \u010C\xDAZK (HTTP 429). Zkus to pozd\u011Bji; stav \xFA\u010Dtu zjist\xED\u0161 n\xE1strojem kn_sluzba.", url };
    }
    return {
      chyba: `HTTP ${res.status}`,
      detail: body?.errors ?? body?.detail ?? body?.title ?? String(text).slice(0, 500),
      url
    };
  }
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
var deacc = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
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
var chyba = (t, extra = {}) => ({ chyba: t, ...extra });
async function gzipBase64(text) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  const KROK = 32768;
  for (let i = 0; i < bytes.length; i += KROK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + KROK));
  }
  return btoa(bin);
}
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
var TYP_PARCELY_DESC = "PKN = parcela katastru nemovitost\xED, PZE = parcela zjednodu\u0161en\xE9 evidence.";
var DRUH_CISLOVANI_DESC = "1 = stavebn\xED parcela (\u201Ast. 123\u2018), 2 = pozemkov\xE1 parcela. Kdy\u017E nevypln\xED\u0161, zkus\xED se automaticky 2 a pot\xE9 1.";
var TYP_STAVBY_DESC = "1 = stavba s \u010D\xEDslem popisn\xFDm (\u010D. p.), 2 = stavba s \u010D\xEDslem eviden\u010Dn\xEDm (\u010D. e.). Kdy\u017E nevypln\xED\u0161, zkus\xED se automaticky 1 a pot\xE9 2.";
var TYP_RIZENI_DESC = "V = vklad, Z = z\xE1znam, PGP = potvrzen\xED geometrick\xE9ho pl\xE1nu, PD = podac\xED den\xEDk, ZPV = pomocn\xE9 \u0159\xEDzen\xED V.";
var TOOLS = [
  /* ---------- územní číselníky (vstupní bod většiny dotazů) ---------- */
  {
    name: "kn_uzemi",
    description: "\u010C\xEDseln\xEDk \xFAzemn\xEDch jednotek \u2013 kraje, okresy, obce, \u010D\xE1sti obc\xED a katastr\xE1ln\xED \xFAzem\xED. TOTO JE ZPRAVIDLA PRVN\xCD KROK: u\u017Eivatel zn\xE1 n\xE1zev (\u201Ak. \xFA. Sm\xEDchov\u2018, \u201Aobec Beroun\u2018), API v\u0161ak pracuje s \u010D\xEDseln\xFDmi k\xF3dy. Hled\xE1 se bez ohledu na diakritiku a velikost p\xEDsmen; p\u0159esn\xE1 shoda n\xE1zvu m\xE1 p\u0159ednost p\u0159ed \u010D\xE1ste\u010Dnou. Kombinuj s 'nadrizeny_kod' (nap\u0159. v\u0161echna k. \xFA. v obci, v\u0161echny \u010D\xE1sti obce v obci).",
    inputSchema: {
      type: "object",
      required: ["uroven"],
      properties: {
        uroven: {
          type: "string",
          enum: ["kraj", "okres", "obec", "cast_obce", "katastralni_uzemi"],
          description: "Kter\xE1 \xFAzemn\xED \xFArove\u0148 se m\xE1 prohledat."
        },
        kod: { type: "integer", description: "P\u0159esn\xFD k\xF3d jednotky \u2013 vr\xE1t\xED p\u0159\xEDmo jeden z\xE1znam." },
        nazev: { type: "string", description: "N\xE1zev nebo \u010D\xE1st n\xE1zvu (bez ohledu na diakritiku)." },
        nadrizeny_kod: {
          type: "integer",
          description: "K\xF3d nad\u0159\xEDzen\xE9 jednotky \u2013 u okresu k\xF3d kraje, u obce k\xF3d okresu, u \u010D\xE1sti obce a katastr\xE1ln\xEDho \xFAzem\xED k\xF3d obce."
        },
        vcetne_neplatnych: {
          type: "boolean",
          description: "Zahrnout i zru\u0161en\xE9 jednotky (s vypln\u011Bn\xFDm platnostDo). V\xFDchoz\xED false."
        },
        limit: { type: "integer", description: "Maxim\xE1ln\xED po\u010Det vr\xE1cen\xFDch z\xE1znam\u016F (v\xFDchoz\xED 50)." }
      }
    }
  },
  {
    name: "kn_ciselnik",
    description: "\u010C\xEDseln\xEDky ISKN \u2013 druhy pozemku, zp\u016Fsoby ur\u010Den\xED v\xFDm\u011Bry, typy jednotky, typy stavby, zp\u016Fsoby vyu\u017Eit\xED parcely/stavby/jednotky, zp\u016Fsoby ochrany a pracovi\u0161t\u011B (katastr\xE1ln\xED \xFA\u0159ady a pracovi\u0161t\u011B, v\u010Detn\u011B I\u010CO, telefonu, e-mailu a ID datov\xE9 schr\xE1nky). Pou\u017Eij pro p\u0159eklad k\xF3d\u016F z odpov\u011Bd\xED do \u010De\u0161tiny nebo pro zji\u0161t\u011Bn\xED k\xF3du pracovi\u0161t\u011B p\u0159ed vyhled\xE1n\xEDm \u0159\xEDzen\xED.",
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
            "pracoviste"
          ],
          description: "Kter\xFD \u010D\xEDseln\xEDk vr\xE1tit."
        },
        kod: { type: "integer", description: "K\xF3d polo\u017Eky \u2013 u \u010D\xEDseln\xEDku 'pracoviste' vr\xE1t\xED p\u0159\xEDmo jedno pracovi\u0161t\u011B." },
        nazev: { type: "string", description: "Filtr podle n\xE1zvu (bez ohledu na diakritiku)." },
        limit: { type: "integer", description: "Maxim\xE1ln\xED po\u010Det vr\xE1cen\xFDch z\xE1znam\u016F (v\xFDchoz\xED 200)." }
      }
    }
  },
  /* ---------- parcely ---------- */
  {
    name: "kn_parcela_vyhledani",
    description: "Vyhled\xE1 parcelu podle p\u0159irozen\xE9 identifikace: katastr\xE1ln\xED \xFAzem\xED + parceln\xED \u010D\xEDslo. Vrac\xED kompletn\xED \xFAdaje o pozemku \u2013 v\xFDm\u011Bru, druh pozemku, zp\u016Fsob vyu\u017Eit\xED, zp\u016Fsob ur\u010Den\xED v\xFDm\u011Bry, zp\u016Fsoby ochrany, BPEJ, mapov\xFD list, \u010D\xEDslo LV, stavbu na pozemku, pr\xE1vo stavby, defini\u010Dn\xED bod a plomby (prob\xEDhaj\xEDc\xED \u0159\xEDzen\xED). K\xF3d katastr\xE1ln\xEDho \xFAzem\xED zjisti n\xE1strojem kn_uzemi.",
    inputSchema: {
      type: "object",
      required: ["kod_katastralniho_uzemi", "kmenove_cislo"],
      properties: {
        kod_katastralniho_uzemi: { type: "integer", description: "K\xF3d katastr\xE1ln\xEDho \xFAzem\xED (viz kn_uzemi)." },
        kmenove_cislo: { type: "integer", description: "Kmenov\xE9 (parceln\xED) \u010D\xEDslo, tj. \u010D\xE1st p\u0159ed lom\xEDtkem. Rozsah 1\u201399999." },
        poddeleni: { type: "integer", description: "Podd\u011Blen\xED \u010D\xEDsla parcely, tj. \u010D\xE1st za lom\xEDtkem." },
        typ_parcely: { type: "string", enum: ["PKN", "PZE"], description: TYP_PARCELY_DESC + " V\xFDchoz\xED PKN." },
        druh_cislovani: { type: "integer", enum: [1, 2], description: DRUH_CISLOVANI_DESC },
        puvod_parcely_ze: {
          type: "integer",
          enum: [3, 4, 6],
          description: "P\u016Fvod parcely zjednodu\u0161en\xE9 evidence: 3 = evidence nemovitost\xED, 4 = pozemkov\xFD katastr, 6 = p\u0159\xEDd\u011Blov\xFD pl\xE1n nebo jin\xFD podklad. M\xE1 smysl jen u typ_parcely = PZE."
        }
      }
    }
  },
  {
    name: "kn_parcela_detail",
    description: "Vr\xE1t\xED detail parcely podle jej\xEDho jednozna\u010Dn\xE9ho identifik\xE1toru ISKN (pole 'id' z v\xFDsledk\u016F vyhled\xE1v\xE1n\xED).",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifik\xE1tor parcely v ISKN." } }
    }
  },
  {
    name: "kn_parcela_sousedni",
    description: "Vr\xE1t\xED sousedn\xED parcely k zadan\xE9 parcele. Funguje jen v \xFAzem\xED s digit\xE1ln\xED katastr\xE1ln\xED mapou \u2013 jinde vr\xE1t\xED pr\xE1zdn\xFD seznam (nikoli chybu).",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifik\xE1tor parcely v ISKN." } }
    }
  },
  {
    name: "kn_parcela_polygon",
    description: "Vyhled\xE1 parcely, jejich\u017E defini\u010Dn\xED bod le\u017E\xED uvnit\u0159 zadan\xE9ho polygonu. Sou\u0159adnice v S-JTSK (EPSG:5514 nebo 5513) v metrech, max. 2 desetinn\xE1 m\xEDsta; na orientaci polygonu nez\xE1le\u017E\xED.",
    inputSchema: {
      type: "object",
      required: ["souradnice"],
      properties: {
        souradnice: {
          type: "array",
          items: { type: "array", items: { type: "number" } },
          description: "Nejm\xE9n\u011B t\u0159i body polygonu v S-JTSK jako pole dvojic [x, y], nap\u0159. [[-743000,-1043000],[-742900,-1043000],[-742900,-1042900]]. Polygon se uzav\xEDr\xE1 s\xE1m, na orientaci nez\xE1le\u017E\xED. POZOR: API omezuje plochu polygonu na 5 000 m\xB2 (nap\u0159. \u010Dtverec 70 \xD7 70 m); v\u011Bt\u0161\xED v\xFDb\u011Br vr\xE1t\xED chybu."
        }
      }
    }
  },
  /* ---------- stavby ---------- */
  {
    name: "kn_stavba_vyhledani",
    description: "Vyhled\xE1 stavbu (budovu) podle p\u0159irozen\xE9 identifikace: \u010D\xE1st obce + \u010D\xEDslo popisn\xE9 nebo eviden\u010Dn\xED. Vrac\xED typ stavby, zp\u016Fsob vyu\u017Eit\xED, zp\u016Fsoby ochrany, \u010D\xEDslo LV, parcely pod stavbou, typ vazby k pozemku (postavena na pozemku / je sou\u010D\xE1st\xED pozemku / je sou\u010D\xE1st\xED pr\xE1va stavby), seznam jednotek v budov\u011B, k\xF3dy adresn\xEDch m\xEDst a plomby. K\xF3d \u010D\xE1sti obce zjisti n\xE1strojem kn_uzemi (uroven = cast_obce).",
    inputSchema: {
      type: "object",
      required: ["kod_casti_obce", "cislo_domovni"],
      properties: {
        kod_casti_obce: { type: "integer", description: "K\xF3d \u010D\xE1sti obce (viz kn_uzemi)." },
        cislo_domovni: { type: "integer", description: "\u010C\xEDslo popisn\xE9 nebo eviden\u010Dn\xED." },
        typ_stavby: { type: "integer", enum: [1, 2], description: TYP_STAVBY_DESC }
      }
    }
  },
  {
    name: "kn_stavba_detail",
    description: "Vr\xE1t\xED detail stavby podle jej\xEDho identifik\xE1toru ISKN.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifik\xE1tor stavby v ISKN." } }
    }
  },
  {
    name: "kn_stavba_adresni_misto",
    description: "Vyhled\xE1 stavbu podle k\xF3du adresn\xEDho m\xEDsta R\xDAIAN. K\xF3d adresn\xEDho m\xEDsta vrac\xED ARES v adrese s\xEDdla subjektu \u2013 t\xEDmto n\xE1strojem tedy propoj\xED\u0161 firmu z konektoru TARPAN \u2013 ARES s budovou v katastru.",
    inputSchema: {
      type: "object",
      required: ["kod_adresniho_mista"],
      properties: { kod_adresniho_mista: { type: "integer", description: "K\xF3d adresn\xEDho m\xEDsta v R\xDAIAN." } }
    }
  },
  {
    name: "kn_stavba_polygon",
    description: "Vyhled\xE1 stavby, jejich\u017E defini\u010Dn\xED bod le\u017E\xED uvnit\u0159 zadan\xE9ho polygonu. Sou\u0159adnice v S-JTSK (EPSG:5514 nebo 5513) v metrech.",
    inputSchema: {
      type: "object",
      required: ["souradnice"],
      properties: {
        souradnice: {
          type: "array",
          items: { type: "array", items: { type: "number" } },
          description: "Nejm\xE9n\u011B t\u0159i body polygonu v S-JTSK jako pole dvojic [x, y], nap\u0159. [[-743000,-1043000],[-742900,-1043000],[-742900,-1042900]]. Polygon se uzav\xEDr\xE1 s\xE1m, na orientaci nez\xE1le\u017E\xED. POZOR: API omezuje plochu polygonu na 5 000 m\xB2 (nap\u0159. \u010Dtverec 70 \xD7 70 m); v\u011Bt\u0161\xED v\xFDb\u011Br vr\xE1t\xED chybu."
        }
      }
    }
  },
  /* ---------- jednotky ---------- */
  {
    name: "kn_jednotka_vyhledani",
    description: "Vyhled\xE1 bytovou nebo nebytovou jednotku podle p\u0159irozen\xE9 identifikace: \u010D\xE1st obce + \u010D\xEDslo popisn\xE9/eviden\u010Dn\xED budovy + \u010D\xEDslo jednotky. Pozor na chov\xE1n\xED API: je-li \u010D\xEDslo jednotky v\u011Bt\u0161\xED ne\u017E 9999, hled\xE1 se p\u0159esn\xE1 shoda; je-li men\u0161\xED, hled\xE1 se \u010D\xEDslo jednotky modulo 10000 ve v\u0161ech \u010D\xE1stech budovy (tj. m\u016F\u017Ee vr\xE1tit v\xEDce jednotek se stejn\xFDm \u010D\xEDslem v r\u016Fzn\xFDch vchodech).",
    inputSchema: {
      type: "object",
      required: ["kod_casti_obce", "cislo_domovni", "cislo_jednotky"],
      properties: {
        kod_casti_obce: { type: "integer", description: "K\xF3d \u010D\xE1sti obce (viz kn_uzemi)." },
        cislo_domovni: { type: "integer", description: "\u010C\xEDslo popisn\xE9 nebo eviden\u010Dn\xED budovy." },
        cislo_jednotky: { type: "integer", description: "\u010C\xEDslo jednotky." },
        typ_stavby: { type: "integer", enum: [1, 2], description: TYP_STAVBY_DESC }
      }
    }
  },
  {
    name: "kn_jednotka_detail",
    description: "Vr\xE1t\xED detail jednotky podle identifik\xE1toru ISKN \u2013 typ jednotky, zp\u016Fsob vyu\u017Eit\xED, zp\u016Fsoby ochrany, pod\xEDl na spole\u010Dn\xFDch \u010D\xE1stech domu, \u010D\xEDslo LV, budovu, ve kter\xE9 je vymezena, a plomby.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifik\xE1tor jednotky v ISKN." } }
    }
  },
  /* ---------- právo stavby ---------- */
  {
    name: "kn_pravo_stavby",
    description: "Vr\xE1t\xED pr\xE1vo stavby (\xA7 1240 a n\xE1sl. o. z.) \u2013 zadej pr\xE1v\u011B jeden z parametr\u016F: vlastn\xED identifik\xE1tor pr\xE1va stavby, identifik\xE1tor zat\xED\u017Een\xE9 parcely, nebo identifik\xE1tor stavby, kter\xE1 je sou\u010D\xE1st\xED pr\xE1va stavby. Vrac\xED datum p\u0159ijet\xED, datum ukon\u010Den\xED, \xFA\u010Dely pr\xE1va stavby, \u010D\xEDslo LV, dot\u010Den\xE9 parcely a stavby, zp\u016Fsoby ochrany a plomby.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "Identifik\xE1tor pr\xE1va stavby v ISKN." },
        parcela_id: { type: "number", description: "Identifik\xE1tor zat\xED\u017Een\xE9 parcely v ISKN." },
        stavba_id: { type: "number", description: "Identifik\xE1tor stavby v ISKN." }
      }
    }
  },
  /* ---------- řízení ---------- */
  {
    name: "kn_rizeni_vyhledani",
    description: "Vyhled\xE1 katastr\xE1ln\xED \u0159\xEDzen\xED podle jeho spisov\xE9 identifikace (nap\u0159. V-1234/2024 na pracovi\u0161ti Praha). Vrac\xED stav \u0159\xEDzen\xED, stav \xFAhrady spr\xE1vn\xEDho poplatku, proveden\xE9 operace a nav\xE1zan\xE1 \u0159\xEDzen\xED. K\xF3d pracovi\u0161t\u011B zjisti n\xE1strojem kn_ciselnik (ciselnik = pracoviste). " + TYP_RIZENI_DESC,
    inputSchema: {
      type: "object",
      required: ["typ_rizeni", "cislo", "rok", "kod_pracoviste"],
      properties: {
        typ_rizeni: { type: "string", enum: ["V", "Z", "PGP", "PD", "ZPV"], description: TYP_RIZENI_DESC },
        cislo: { type: "integer", description: "Po\u0159adov\xE9 \u010D\xEDslo \u0159\xEDzen\xED (\u010D\xE1st p\u0159ed lom\xEDtkem)." },
        rok: { type: "integer", description: "Rok \u0159\xEDzen\xED (\u010D\xE1st za lom\xEDtkem)." },
        kod_pracoviste: { type: "integer", description: "K\xF3d katastr\xE1ln\xEDho pracovi\u0161t\u011B." }
      }
    }
  },
  {
    name: "kn_rizeni_detail",
    description: "Vr\xE1t\xED detail \u0159\xEDzen\xED podle identifik\xE1toru ISKN (pole 'id' z plomb u nemovitosti nebo z vyhled\xE1n\xED \u0159\xEDzen\xED).",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "number", description: "Identifik\xE1tor \u0159\xEDzen\xED v ISKN." } }
    }
  },
  {
    name: "kn_rizeni_prijate_dne",
    description: "Vr\xE1t\xED seznam hlavi\u010Dek v\u0161ech \u0159\xEDzen\xED zadan\xE9ho typu p\u0159ijat\xFDch na dan\xE9m pracovi\u0161ti v konkr\xE9tn\xED den. Vhodn\xE9 pro monitoring nov\xFDch vklad\u016F.",
    inputSchema: {
      type: "object",
      required: ["typ_rizeni", "kod_pracoviste", "datum_prijeti"],
      properties: {
        typ_rizeni: { type: "string", enum: ["V", "Z", "PGP", "PD", "ZPV"], description: TYP_RIZENI_DESC },
        kod_pracoviste: { type: "integer", description: "K\xF3d katastr\xE1ln\xEDho pracovi\u0161t\u011B." },
        datum_prijeti: { type: "string", description: "Datum p\u0159ijet\xED ve form\xE1tu YYYY-MM-DD." }
      }
    }
  },
  /* ---------- provozní ---------- */
  {
    name: "kn_sluzba",
    description: "Provozn\xED informace o slu\u017Eb\u011B API KN: 'aktualnost' = ke kter\xE9mu okam\u017Eiku jsou data aktu\xE1ln\xED, 'stav_uctu' = po\u010Det proveden\xFDch vol\xE1n\xED, limit a datum expirace API kl\xED\u010De, 'provoz' = provozn\xED informace \u010C\xDAZK, 'health' = zdrav\xED slu\u017Eby, 'zpravy' = \u010D\xEDseln\xEDk zpr\xE1v, kter\xE9 API vrac\xED.",
    inputSchema: {
      type: "object",
      required: ["co"],
      properties: {
        co: { type: "string", enum: ["aktualnost", "stav_uctu", "provoz", "health", "zpravy"] }
      }
    }
  },
  /* ---------- výpis ---------- */
  {
    name: "kn_vypis",
    description: "Vygeneruje kompletn\xED V\xDDPIS Z KATASTRU NEMOVITOST\xCD v grafick\xE9 \xFAprav\u011B TARPAN \u2013 stejn\xE9 podob\u011B jako v\xFDpis z ARES. V\xDDCHOZ\xCD CHOV\xC1N\xCD: vr\xE1t\xED hotov\xFD dokument p\u0159\xEDmo v odpov\u011Bdi (pole soubor_gzip_base64), ty ho rozbal\xED\u0161, p\u0159evede\u0161 na .docx a po\u0161le\u0161 u\u017Eivateli do chatu n\xE1strojem SendUserFile \u2013 u\u017Eivatel nemus\xED nikam klikat. P\u0159esn\xFD postup je v poli 'pokyn'. Obsahuje v\u0161echny \xFAdaje, kter\xE9 API KN o nemovitosti poskytuje, v\u010Detn\u011B plomb, a odkaz do Nahl\xED\u017Een\xED do KN na list vlastnictv\xED (jm\xE9na vlastn\xEDk\u016F API neposkytuje). Zad\xE1\u0161-li nav\xEDc I\u010CO, v\xFDpis dopln\xED \xFAdaje o vlastn\xEDkovi z ARES.",
    inputSchema: {
      type: "object",
      required: ["typ", "id"],
      properties: {
        typ: { type: "string", enum: ["parcela", "stavba", "jednotka", "pravo_stavby"], description: "Druh nemovitosti." },
        id: { type: "number", description: "Identifik\xE1tor nemovitosti v ISKN." },
        ico: { type: "string", description: "Voliteln\u011B I\u010CO vlastn\xEDka (pr\xE1vnick\xE9 osoby) \u2013 v\xFDpis o n\u011Bm dopln\xED \xFAdaje z ARES." },
        sousedni: { type: "boolean", description: "U parcely p\u0159ipojit i seznam sousedn\xEDch parcel. V\xFDchoz\xED false." },
        format: {
          type: "string",
          enum: ["soubor", "odkaz"],
          description: "'soubor' (v\xFDchoz\xED) = vr\xE1t\xED dokument v odpov\u011Bdi k odesl\xE1n\xED do chatu. 'odkaz' = vr\xE1t\xED jen URL ke sta\u017Een\xED, bez p\u0159enosu dat; pou\u017Eij, jen kdy\u017E u\u017Eivatel v\xFDslovn\u011B chce odkaz."
        }
      }
    }
  }
];
var UZEMI_PATH = {
  kraj: "Kraje",
  okres: "Okresy",
  obec: "Obce",
  cast_obce: "CastiObci",
  katastralni_uzemi: "KatastralniUzemi"
};
var CISELNIK_PATH = {
  druhy_pozemku: "DruhyPozemku",
  zpusoby_urceni_vymery: "ZpusobyUrceniVymery",
  typy_jednotky: "TypyJednotky",
  typy_stavby: "TypyStavby",
  zpusoby_vyuziti_parcely: "ZpusobyVyuzitiParcely",
  zpusoby_vyuziti_stavby: "ZpusobyVyuzitiStavby",
  zpusoby_vyuziti_jednotky: "ZpusobyVyuzitiJednotky",
  zpusoby_ochrany: "ZpusobyOchrany",
  pracoviste: "Pracoviste"
};
var SLUZBA_PATH = {
  aktualnost: "AktualnostDat",
  stav_uctu: "StavUctu",
  provoz: "ProvozniInformace",
  health: "Health",
  zpravy: "CiselnikZprav"
};
async function callTool(name, args, apiKey, origin = "") {
  switch (name) {
    /* ---------- číselníky ---------- */
    case "kn_uzemi": {
      const seg = UZEMI_PATH[args.uroven];
      if (!seg) return chyba("Nezn\xE1m\xE1 \xFArove\u0148. Povolen\xE9: kraj, okres, obec, cast_obce, katastralni_uzemi.");
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
        aktualnostDatK: raw.aktualnostDatK
      };
    }
    case "kn_ciselnik": {
      const seg = CISELNIK_PATH[args.ciselnik];
      if (!seg) return chyba("Nezn\xE1m\xFD \u010D\xEDseln\xEDk.");
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
            PuvodParcelyZE: args.puvod_parcely_ze
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
              druh_cislovani_popis: druh === 1 ? "stavebn\xED parcela" : "pozemkov\xE1 parcela"
            }
          };
        }
      }
      if (posledni?.chyba) return posledni;
      return {
        data: [],
        upozorneni: "Parcela nenalezena. Zkontroluj k\xF3d katastr\xE1ln\xEDho \xFAzem\xED a parceln\xED \u010D\xEDslo; u parcel zjednodu\u0161en\xE9 evidence zkus typ_parcely = PZE.",
        pouzite_parametry: { typ_parcely: typ, druh_cislovani: varianty }
      };
    }
    case "kn_parcela_detail":
      if (args.id == null) return chyba("Zadej id parcely.");
      return knGet(`/Parcely/${args.id}`, null, apiKey);
    case "kn_parcela_sousedni": {
      if (args.id == null) return chyba("Zadej id parcely.");
      const res = await knGet(`/Parcely/SousedniParcely/${args.id}`, null, apiKey);
      if (!res.chyba && Array.isArray(res.data) && res.data.length === 0) {
        res.upozorneni = "Nebyly nalezeny sousedn\xED parcely \u2013 \xFAzem\xED z\u0159ejm\u011B nem\xE1 digit\xE1ln\xED katastr\xE1ln\xED mapu.";
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
          return { ...res, pouzite_parametry: { typ_stavby: t, typ_stavby_popis: t === 1 ? "\u010D\xEDslo popisn\xE9" : "\u010D\xEDslo eviden\u010Dn\xED" } };
        }
      }
      if (posledni?.chyba) return posledni;
      return { data: [], upozorneni: "Stavba nenalezena. Zkontroluj k\xF3d \u010D\xE1sti obce a \u010D\xEDslo popisn\xE9/eviden\u010Dn\xED." };
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
            CisloJednotky: args.cislo_jednotky
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
        upozorneni: "Jednotka nenalezena. Ov\u011B\u0159 \u010D\xEDslo jednotky \u2013 u \u010D\xEDsel men\u0161\xEDch ne\u017E 10000 API hled\xE1 \u010D\xEDslo modulo 10000 ve v\u0161ech \u010D\xE1stech budovy."
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
      if (args.id == null) return chyba("Zadej id \u0159\xEDzen\xED.");
      return knGet(`/Rizeni/${args.id}`, null, apiKey);
    case "kn_rizeni_prijate_dne": {
      const { typ_rizeni, kod_pracoviste, datum_prijeti } = args;
      if (!typ_rizeni || kod_pracoviste == null || !datum_prijeti) {
        return chyba("Zadej typ_rizeni, kod_pracoviste a datum_prijeti (YYYY-MM-DD).");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(datum_prijeti))) {
        return chyba("datum_prijeti mus\xED b\xFDt ve form\xE1tu YYYY-MM-DD.");
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
      if (!seg) return chyba("Nezn\xE1m\xFD dotaz. Povolen\xE9: aktualnost, stav_uctu, provoz, health, zpravy.");
      return knGet(`/AplikacniSluzby/${seg}`, null, apiKey);
    }
    /* ---------- výpis ---------- */
    case "kn_vypis": {
      const typ = String(args.typ ?? "").replace("_", "-");
      if (!["parcela", "stavba", "jednotka", "pravo-stavby"].includes(typ)) {
        return chyba("Nezn\xE1m\xFD typ. Povolen\xE9: parcela, stavba, jednotka, pravo_stavby.");
      }
      if (args.id == null) return chyba("Zadej id nemovitosti.");
      const ico = args.ico ? String(args.ico).replace(/\D/g, "").padStart(8, "0") : null;
      const q = [];
      if (ico) q.push("ico=" + encodeURIComponent(ico));
      if (args.sousedni) q.push("sousedni=1");
      const odkaz = `${origin}/vypis/${typ}/${args.id}${q.length ? "?" + q.join("&") : ""}`;
      if (args.format === "odkaz") {
        return { odkaz, format: "RTF (otev\u0159e se ve Wordu)", pokyn: "P\u0159edej u\u017Eivateli odkaz ke sta\u017Een\xED." };
      }
      let doc;
      try {
        doc = await buildVypis({
          typ,
          id: args.id,
          ico,
          sousedni: !!args.sousedni,
          knGet: (p, params) => knGet(p, params, apiKey)
        });
      } catch (e) {
        return chyba(`Nepoda\u0159ilo se sestavit v\xFDpis: ${e?.message ?? String(e)}`, { odkaz });
      }
      return {
        nazev_souboru: doc.filename.replace(/\.rtf$/, ".docx"),
        soubor_gzip_base64: await gzipBase64(doc.rtf),
        kodovani: "gzip + base64; po rozbalen\xED je to RTF",
        odkaz,
        pokyn: "NEVYPISUJ obsah pole soubor_gzip_base64. Ulo\u017E ho do souboru a prove\u010F: `base64 -d < blob.b64 | gunzip > vypis.rtf` a pot\xE9 `soffice --headless --convert-to docx vypis.rtf`. V\xFDsledn\xFD .docx po\u0161li u\u017Eivateli n\xE1strojem SendUserFile pod n\xE1zvem z pole nazev_souboru. Ohl\xE1s\xED-li gunzip chybu CRC nebo d\xE9lky, p\u0159enos se cestou po\u0161kodil \u2013 zavolej n\xE1stroj ZNOVU, nepokou\u0161ej se soubor opravit. Nen\xED-li LibreOffice k dispozici, p\u0159ejmenuj RTF na .doc a po\u0161li ho tak, nebo pou\u017Eij pole odkaz. Dokument je kompletn\xED v\xFDpis z katastru nemovitost\xED v \xFAprav\u011B TARPAN; jm\xE9na vlastn\xEDk\u016F API KN neposkytuje."
      };
    }
    default:
      return chyba(`Nezn\xE1m\xFD n\xE1stroj: ${name}`);
  }
}
function jsonResponse(obj, init = {}) {
  return new Response(JSON.stringify(obj, null, 2), {
    ...init,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS, ...init.headers || {} }
  });
}
var rpcResult = (id, result) => ({ jsonrpc: "2.0", id, result });
var rpcError = (id, code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
async function handleRpc(msg, apiKey, origin) {
  const { method, params, id } = msg ?? {};
  try {
    switch (method) {
      case "initialize":
        return rpcResult(id, {
          protocolVersion: PROTOCOL_VERSION,
          serverInfo: SERVER_INFO,
          capabilities: { tools: {} }
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
          isError
        });
      }
      case "resources/list":
        return rpcResult(id, { resources: [] });
      case "prompts/list":
        return rpcResult(id, { prompts: [] });
      default:
        return rpcError(id, -32601, `Nezn\xE1m\xE1 metoda: ${method}`);
    }
  } catch (e) {
    return rpcError(id, -32e3, e?.message ?? "Intern\xED chyba serveru.");
  }
}
var index_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const origin = url.origin;
    const apiKey = env.CUZK_KN_API_KEY;
    if (request.method === "GET" && url.pathname.startsWith("/vypis/")) {
      const [, , typ, idRaw] = url.pathname.split("/");
      const id = Number(idRaw);
      if (!typ || !Number.isFinite(id)) {
        return jsonResponse({ error: "Pou\u017Eij /vypis/{parcela|stavba|jednotka|pravo-stavby}/{id}" }, { status: 400 });
      }
      try {
        const { rtf, filename } = await buildVypis({
          typ,
          id,
          ico: url.searchParams.get("ico"),
          sousedni: url.searchParams.get("sousedni") === "1",
          knGet: (p, q) => knGet(p, q, apiKey, { cache: false })
        });
        return new Response(rtf, {
          headers: {
            "Content-Type": "application/rtf; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            ...CORS
          }
        });
      } catch (e) {
        return jsonResponse({ error: `Chyba generov\xE1n\xED v\xFDpisu: ${e?.message ?? String(e)}` }, { status: 500 });
      }
    }
    if (request.method === "GET") {
      if (url.pathname === "/" || url.pathname === "" || url.pathname === "/mcp") {
        return jsonResponse({
          server: SERVER_INFO,
          transport: "streamable-http",
          endpoint: "POST /",
          authentication: "none (API kl\xED\u010D \u010C\xDAZK dr\u017E\xED worker jako secret)",
          api_key_nastaven: !!apiKey,
          tools: TOOLS.map((t) => t.name),
          vypis: `${origin}/vypis/{parcela|stavba|jednotka|pravo-stavby}/{id}`,
          upstream: KN_BASE
        });
      }
      return jsonResponse({ error: "Not found", hint: "MCP endpoint je POST /" }, { status: 404 });
    }
    if (request.method !== "POST") {
      return jsonResponse(rpcError(null, -32600, "Pou\u017Eij POST s JSON-RPC 2.0."), { status: 405 });
    }
    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(rpcError(null, -32700, "Neplatn\xFD JSON."), { status: 400 });
    }
    if (Array.isArray(payload)) {
      const responses = (await Promise.all(payload.map((m) => handleRpc(m, apiKey, origin)))).filter((r) => r !== null);
      if (!responses.length) return new Response(null, { status: 202, headers: CORS });
      return jsonResponse(responses);
    }
    const response = await handleRpc(payload, apiKey, origin);
    if (response === null) return new Response(null, { status: 202, headers: CORS });
    return jsonResponse(response);
  }
};
export {
  callTool,
  index_default as default
};

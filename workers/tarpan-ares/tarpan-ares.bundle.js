var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/vypis.js
var INK = 1;
var GOLD = 2;
var RED = 3;
var GREY = 4;
var GREEN = 5;
var PF = {
  "112": "Spole\u010Dnost s ru\u010Den\xEDm omezen\xFDm",
  "121": "Akciov\xE1 spole\u010Dnost",
  "111": "Ve\u0159ejn\xE1 obchodn\xED spole\u010Dnost",
  "118": "Komanditn\xED spole\u010Dnost",
  "101": "Fyzick\xE1 osoba podnikaj\xEDc\xED",
  "141": "Obecn\u011B prosp\u011B\u0161n\xE1 spole\u010Dnost",
  "205": "Dru\u017Estvo",
  "301": "St\xE1tn\xED podnik",
  "325": "Organiza\u010Dn\xED slo\u017Eka st\xE1tu",
  "706": "Spolek"
};
var NACE = {
  "69100": "Pr\xE1vn\xED \u010Dinnost",
  "68310": "Zprost\u0159edkovatelsk\xE9 \u010Dinnosti realitn\xEDch agentur",
  "68200": "Pron\xE1jem a spr\xE1va vlastn\xEDch nebo pronajat\xFDch nemovitost\xED",
  "6820": "Pron\xE1jem nemovitost\xED",
  "68100": "N\xE1kup a n\xE1sledn\xFD prodej vlastn\xEDch nemovitost\xED",
  "70220": "Poradenstv\xED v podnik\xE1n\xED a \u0159\xEDzen\xED"
};
var FU = { "001": "Finan\u010Dn\xED \xFA\u0159ad pro hlavn\xED m\u011Bsto Prahu" };
var COURT_INS = {
  MSPH: "M\u011Bstsk\xFDm soudem v Praze",
  KSPH: "Krajsk\xFDm soudem v Praze",
  KSBR: "Krajsk\xFDm soudem v Brn\u011B",
  KSOS: "Krajsk\xFDm soudem v Ostrav\u011B",
  KSCB: "Krajsk\xFDm soudem v \u010Cesk\xFDch Bud\u011Bjovic\xEDch",
  KSPL: "Krajsk\xFDm soudem v Plzni",
  KSUL: "Krajsk\xFDm soudem v \xDAst\xED nad Labem",
  KSHK: "Krajsk\xFDm soudem v Hradci Kr\xE1lov\xE9"
};
var REG_LABEL = {
  stavZdrojeRos: "Registr osob (ROS)",
  stavZdrojeRes: "Registr ekonomick\xFDch subjekt\u016F (RES)",
  stavZdrojeDph: "Pl\xE1tce DPH",
  stavZdrojeVr: "Ve\u0159ejn\xFD (obchodn\xED) rejst\u0159\xEDk",
  stavZdrojeRzp: "\u017Divnostensk\xFD rejst\u0159\xEDk (R\u017DP)",
  stavZdrojeCeu: "Centr\xE1ln\xED evidence \xFApadc\u016F",
  stavZdrojeNrpzs: "Poskytovatel zdrav. slu\u017Eeb (NRPZS)",
  stavZdrojeRpsh: "Politick\xE9 strany a hnut\xED",
  stavZdrojeRcns: "C\xEDrkve a n\xE1bo\u017E. spole\u010Dnosti",
  stavZdrojeSzr: "Spole\u010Dn\xFD zem\u011Bd\u011Blsk\xFD registr",
  stavZdrojeRs: "Registr \u0161kol",
  stavZdrojeSd: "Spot\u0159ebn\xED da\u0148",
  stavZdrojeIr: "Insolven\u010Dn\xED rejst\u0159\xEDk",
  stavZdrojeSkDph: "Skupinov\xE1 registrace DPH",
  stavZdrojeRed: "Registr ek. dat"
};
var REG_G1 = ["stavZdrojeRos", "stavZdrojeRes", "stavZdrojeDph", "stavZdrojeVr", "stavZdrojeRzp", "stavZdrojeCeu"];
function fdate(s) {
  if (!s) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
  return m ? `${+m[3]}. ${+m[2]}. ${m[1]}` : String(s);
}
__name(fdate, "fdate");
function odDo(od, doo) {
  const a = [];
  if (od) a.push("od " + fdate(od));
  if (doo) a.push("do " + fdate(doo));
  return a.join(" ");
}
__name(odDo, "odDo");
function fixPsc(t) {
  if (!t) return t;
  return String(t).replace(/(^|[^\d/])(\d{3})(\d{2})(?!\d)/g, (_, p, a, b) => `${p}${a} ${b}`);
}
__name(fixPsc, "fixPsc");
function fkc(v) {
  if (v == null || v === "") return "";
  const s = String(v).split(/[;,]/)[0].replace(/\D/g, "");
  if (!s) return String(v);
  return Number(s).toLocaleString("cs-CZ").replace(/\u00a0/g, " ") + ",- K\u010D";
}
__name(fkc, "fkc");
function norm(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}
__name(norm, "norm");
function proper(w) {
  if (!w) return "";
  return String(w).split(" ").map((x) => x.split("-").map((p) => p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : p).join("-")).join(" ");
}
__name(proper, "proper");
function pname(t, j, p) {
  return [t || "", proper(j), proper(p)].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
__name(pname, "pname");
function pf(c) {
  return c ? PF[c] || "k\xF3d " + c : "";
}
__name(pf, "pf");
function nace(c) {
  return NACE[c] ? `${c} \u2014 ${NACE[c]}` : c || "";
}
__name(nace, "nace");
function fu(c) {
  return FU[c] || (c ? "k\xF3d " + c : "");
}
__name(fu, "fu");
function courtIns(c) {
  return COURT_INS[c] || String(c || "").replace("M\u011Bstsk\xFD soud", "M\u011Bstsk\xFDm soudem").replace("Krajsk\xFD soud", "Krajsk\xFDm soudem");
}
__name(courtIns, "courtIns");
function groupIdentity(items) {
  const order = [], groups = {};
  for (const e of items) {
    const key = e.ico ? "po|" + String(e.ico).trim() : "fo|" + norm(e.jm) + "|" + (e.dnar || "");
    if (!groups[key]) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(e);
  }
  const out = [];
  for (const key of order) {
    const g = groups[key];
    const cur = g.filter((e) => !e.do);
    const isCur = cur.length > 0;
    const primary = cur[0] || g.slice().sort((a, b) => String(a.od || "").localeCompare(String(b.od || "")))[g.length - 1];
    const base = Object.assign({}, primary);
    const ods = g.map((e) => e.od).filter(Boolean).sort();
    base.od = ods[0] || primary.od;
    base.do = isCur ? null : g.map((e) => e.do).filter(Boolean).sort().pop() || primary.do;
    const seen = /* @__PURE__ */ new Set([norm(primary.adr || "")]);
    const ah = [];
    for (const e of g.slice().sort((a, b) => String(a.od || "").localeCompare(String(b.od || "")))) {
      const a = e.adr || "";
      if (a && !seen.has(norm(a))) {
        ah.push({ t: a, od: e.od, do: e.do });
        seen.add(norm(a));
      }
    }
    ah.sort((a, b) => String(b.do || b.od || "").localeCompare(String(a.do || a.od || "")));
    base.adr_hist = ah;
    base.current = isCur;
    out.push(base);
  }
  return out;
}
__name(groupIdentity, "groupIdentity");
function reg(data, name) {
  const r = (data.registry || {})[name];
  if (!r) return null;
  if (r._stav) return null;
  if (r.zaznamy) return r.zaznamy[0] || null;
  return r;
}
__name(reg, "reg");
function build(data) {
  const z = (data.registry || {}).zaklad || {}, vr = reg(data, "vr") || {}, res = reg(data, "res") || {}, rzp = reg(data, "rzp") || {}, ros = reg(data, "ros") || {};
  const first = /* @__PURE__ */ __name((a) => Array.isArray(a) && a.length ? a[0] : null, "first");
  const m = {
    ico: z.ico || data.ico || "",
    dic: z.dic || "",
    nazev: z.obchodniJmeno || res.obchodniJmeno || "",
    pravniForma: z.pravniForma || (first(vr.pravniForma) || {}).hodnota || "",
    datumVzniku: z.datumVzniku || vr.datumZapisu || "",
    financniUrad: z.financniUrad || vr.financniUrad || "",
    nace: z.czNace || res.czNace || z.czNace2008 || [],
    datumAktualizace: z.datumAktualizace || "",
    sidlo: (z.sidlo || {}).textovaAdresa || "",
    stav: z.seznamRegistraci ? "AKTIVNI" : vr.stavSubjektu || "",
    registrace: z.seznamRegistraci || {},
    datovaSchranka: ((ros.datoveSchranky || [])[0] || {}).identifikatorDs || ""
  };
  m.nazvy = (vr.obchodniJmeno || []).map((n) => ({ h: n.hodnota, od: n.datumZapisu, do: n.datumVymazu }));
  m.nazvy_hist = m.nazvy.filter((n) => n.do).sort((a, b) => String(b.do || b.od || "").localeCompare(String(a.do || a.od || "")));
  const sz = first(vr.spisovaZnacka);
  m.or = sz ? { soud: sz.soud, oddil: sz.oddil, vlozka: sz.vlozka, od: sz.datumZapisu } : {};
  if (!m.or.vlozka) {
    for (const du of z.dalsiUdaje || []) {
      if (du.spisovaZnacka) {
        m.or = { raw: du.spisovaZnacka };
        break;
      }
    }
  }
  const zk = first(vr.zakladniKapital);
  m.kapital = zk ? (zk.vklad || {}).hodnota : null;
  m.kapitalOd = zk ? zk.datumZapisu : null;
  m.sidla_akt = [];
  m.sidla_hist = [];
  for (const a of vr.adresy || []) {
    const t = (a.adresa || {}).textovaAdresa || "";
    const rec = { t, od: a.datumZapisu, do: a.datumVymazu };
    (a.datumVymazu ? m.sidla_hist : m.sidla_akt).push(rec);
  }
  if (!m.sidla_akt.length && m.sidlo) m.sidla_akt = [{ t: m.sidlo, od: null, do: null }];
  if (m.sidla_akt.length && !m.sidlo) m.sidlo = m.sidla_akt[0].t;
  m.sidla_hist.sort((a, b) => String(b.do || b.od || "").localeCompare(String(a.do || a.od || "")));
  m.predmet = ((vr.cinnosti || {}).predmetPodnikani || []).map((p) => ({ h: p.hodnota, od: p.datumZapisu, do: p.datumVymazu }));
  m.organy = [];
  for (const o of vr.statutarniOrgany || []) {
    const org = { nazev: o.nazevOrganu || "Statut\xE1rn\xED org\xE1n", clenove: [], zpusob: [] };
    for (const zj of o.zpusobJednani || []) org.zpusob.push({ h: zj.hodnota, od: zj.datumZapisu, do: zj.datumVymazu });
    for (const c of o.clenoveOrganu || []) {
      const f = c.fyzickaOsoba || {};
      const fun = (c.clenstvi || {}).funkce || {};
      org.clenove.push({
        jm: pname(f.titulPredJmenem, f.jmeno, f.prijmeni),
        funkce: fun.nazev || c.nazevAngazma || "\u010Dlen",
        dnar: f.datumNarozeni,
        adr: (f.adresa || {}).textovaAdresa || "",
        obc: f.statniObcanstvi,
        od: fun.vznikFunkce || c.datumZapisu,
        do: fun.zanikFunkce || c.datumVymazu
      });
    }
    m.organy.push(org);
  }
  m.spolecnici = [];
  for (const g of vr.spolecnici || []) {
    for (const s of g.spolecnik || []) {
      const o = s.osoba || {}, po = o.pravnickaOsoba, fo = o.fyzickaOsoba || {};
      const ent = { do: s.datumVymazu || o.datumVymazu, od: s.datumZapisu || o.datumZapisu, podily: [] };
      if (po) {
        ent.jm = po.obchodniJmeno || "";
        ent.ico = po.ico || "";
        ent.adr = (po.adresa || {}).textovaAdresa || "";
        ent.dnar = null;
      } else {
        ent.jm = pname(fo.titulPredJmenem, fo.jmeno, fo.prijmeni);
        ent.ico = "";
        ent.adr = (fo.adresa || {}).textovaAdresa || "";
        ent.dnar = fo.datumNarozeni;
      }
      for (const p of s.podil || []) {
        const vp = p.velikostPodilu || {};
        let op = vp.hodnota || "";
        if (vp.typObnos === "PROCENTA" && op && !String(op).endsWith("%")) op = op + "%";
        let sp = (p.splaceni || {}).hodnota || "";
        if (sp && !String(sp).endsWith("%")) sp = sp + "%";
        let dr = p.druhPodilu || p.druh;
        if (dr && typeof dr === "object") dr = dr.hodnota;
        ent.podily.push({ vklad: (p.vklad || {}).hodnota, podil: op, splac: sp, druh: dr || "Z\xE1kladn\xED pod\xEDl", od: p.datumZapisu, do: p.datumVymazu });
      }
      m.spolecnici.push(ent);
    }
  }
  m.ostatni = (vr.ostatniSkutecnosti || []).map((o) => ({ h: o.hodnota, od: o.datumZapisu, do: o.datumVymazu }));
  m.rzp = rzp;
  m.res_stat = res.statistickeUdaje || {};
  m.res_nace = res.czNacePrevazujici;
  return m;
}
__name(build, "build");
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
__name(rtfEsc, "rtfEsc");
function buildVypisRtf(data, doplnky) {
  const m = build(data);
  const B = [];
  const H = /* @__PURE__ */ __name((s) => B.push(s), "H");
  H("{\\rtf1\\ansi\\ansicpg1250\\deff0{\\fonttbl{\\f0\\froman Times New Roman;}}");
  H("{\\colortbl;\\red35\\green31\\blue32;\\red181\\green152\\blue90;\\red179\\green38\\blue30;\\red114\\green107\\blue96;\\red46\\green107\\blue79;}");
  H("\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1021\\margb1021\\f0\\fs22\\cf1 ");
  const par = /* @__PURE__ */ __name((s, { sz = 22, cf = INK, b = false, i = false, scaps = false, sb = 0, sa = 40, just = false, border = false, bcf = GOLD, bw = 8, indent = 0, hang = 0, tabs = [] } = {}) => {
    let p = "\\pard";
    if (border) p += `\\brdrb\\brdrs\\brdrw${bw}\\brdrcf${bcf}\\brsp20`;
    if (just) p += "\\qj";
    if (indent) p += `\\li${indent}`;
    if (hang) p += `\\fi-${hang}`;
    for (const t of tabs) p += `\\tx${t}`;
    p += `\\sb${sb}\\sa${sa} `;
    p += `{\\fs${sz}\\cf${cf}${b ? "\\b" : ""}${i ? "\\i" : ""}${scaps ? "\\scaps" : ""} ${s}}`;
    p += "\\par";
    B.push(p);
  }, "par");
  const runs = /* @__PURE__ */ __name((...parts) => {
    let p = "\\pard\\sa20 ";
    for (const r of parts) {
      p += `{\\fs${r.sz || 22}\\cf${r.cf || INK}${r.b ? "\\b" : ""}${r.i ? "\\i" : ""} ${rtfEsc(r.t)}}`;
    }
    B.push(p + "\\par");
  }, "runs");
  const kv = /* @__PURE__ */ __name((label, value, red = false) => {
    if (value == null || value === "") return;
    let p = `\\pard\\tx2835\\sa20 {\\fs22\\cf${GREY} ${rtfEsc(label)}:}\\tab {\\fs22\\cf${red ? RED : INK} ${rtfEsc(value)}}\\par`;
    B.push(p);
  }, "kv");
  const sec = /* @__PURE__ */ __name((t) => par(rtfEsc(t), { sz: 24, b: true, scaps: true, sb: 200, sa: 60, border: true, bcf: GOLD, bw: 8 }), "sec");
  const sub = /* @__PURE__ */ __name((t) => par(rtfEsc(t), { sz: 20, cf: GREY, b: true, scaps: true, sb: 120, sa: 30 }), "sub");
  par(rtfEsc("V\xDDPIS Z ARES"), { sz: 34, b: true, scaps: true, sa: 0, border: true, bcf: INK, bw: 12 });
  par(rtfEsc("pro intern\xED pot\u0159ebu TARPAN"), { sz: 20, cf: GOLD, b: true, scaps: true, sa: 30 });
  const mm = ["ledna", "\xFAnora", "b\u0159ezna", "dubna", "kv\u011Btna", "\u010Dervna", "\u010Dervence", "srpna", "z\xE1\u0159\xED", "\u0159\xEDjna", "listopadu", "prosince"];
  const d = /* @__PURE__ */ new Date();
  par(rtfEsc(`Vyhotoveno ${d.getDate()}. ${mm[d.getMonth()]} ${d.getFullYear()}`), { sz: 20, cf: GREY, sa: 120 });
  {
    let txt = rtfEsc("Spole\u010Dnost ") + `{\\b ${rtfEsc(m.nazev || "\u2014")}}`;
    if (m.ico) txt += ", " + rtfEsc("I\u010CO: " + m.ico);
    if (m.sidlo) txt += ", " + rtfEsc("se s\xEDdlem " + fixPsc(m.sidlo));
    if (m.or.vlozka) txt += ", " + rtfEsc(`zapsan\xE1 v obchodn\xEDm rejst\u0159\xEDku veden\xE9m ${courtIns(m.or.soud)}, odd\xEDl ${m.or.oddil}, vlo\u017Eka ${m.or.vlozka}`);
    else if (m.or.raw) txt += ", " + rtfEsc(`zapsan\xE1 v obchodn\xEDm rejst\u0159\xEDku, sp. zn. ${String(m.or.raw).split("/")[0]}`);
    txt += ".";
    B.push(`\\pard\\qj\\sb100\\sa60 {\\fs23\\cf${INK} ${txt}}\\par`);
  }
  sec("Z\xE1kladn\xED \xFAdaje");
  kv("Obchodn\xED firma", m.nazev);
  for (const n of m.nazvy_hist) kv("D\u0159\xEDv\u011Bj\u0161\xED firma", `${n.h}  (${odDo(n.od, n.do)} \u2014 neaktu\xE1ln\xED)`, true);
  kv("I\u010CO", m.ico);
  kv("DI\u010C", m.dic);
  kv("Pr\xE1vn\xED forma", pf(m.pravniForma));
  kv("Datum vzniku a z\xE1pisu", fdate(m.datumVzniku));
  if (m.or.vlozka) kv("Zaps\xE1no", `v obchodn\xEDm rejst\u0159\xEDku veden\xE9m ${courtIns(m.or.soud)}, odd\xEDl ${m.or.oddil}, vlo\u017Eka ${m.or.vlozka}`);
  else if (m.or.raw) kv("Spisov\xE1 zna\u010Dka", String(m.or.raw).split("/")[0]);
  if (m.kapital) kv("Z\xE1kladn\xED kapit\xE1l", fkc(m.kapital) + (m.kapitalOd ? `  (od ${fdate(m.kapitalOd)})` : ""));
  if (m.nace && m.nace.length) kv("CZ-NACE", m.nace.map(nace).join("; "));
  kv("Finan\u010Dn\xED \xFA\u0159ad", fu(m.financniUrad));
  kv("Datov\xE1 schr\xE1nka", m.datovaSchranka);
  kv("Stav subjektu", m.stav === "AKTIVNI" ? "Aktivn\xED" : m.stav);
  kv("Datum aktualizace", fdate(m.datumAktualizace));
  if (m.predmet.length) {
    sec("P\u0159edm\u011Bt podnik\xE1n\xED");
    m.predmet.forEach((p, i) => {
      const old = !!p.do;
      const dd = odDo(p.od, p.do);
      B.push(`\\pard\\li340\\fi-340\\sa20 {\\fs22\\cf${old ? RED : INK} ${i + 1}. ${rtfEsc(p.h)}}${dd ? `{\\fs20\\i\\cf${old ? RED : GREY}  (${rtfEsc(dd)}${old ? " \\u8212? neaktu\xE1ln\xED" : ""})}` : ""}\\par`);
    });
  }
  sec("S\xEDdlo");
  for (const s of m.sidla_akt) kv("S\xEDdlo", fixPsc(s.t) + (s.od ? `  (od ${fdate(s.od)})` : ""));
  for (const s of m.sidla_hist) kv("D\u0159\xEDv\u011Bj\u0161\xED s\xEDdlo", `${fixPsc(s.t)}  (${odDo(s.od, s.do)} \u2014 neaktu\xE1ln\xED)`, true);
  for (const org of m.organy) {
    sec(org.nazev || "Statut\xE1rn\xED org\xE1n");
    const merged = groupIdentity(org.clenove);
    const akt = merged.filter((c) => c.current), his = merged.filter((c) => !c.current);
    const clen = /* @__PURE__ */ __name((c) => {
      const old = !c.current;
      B.push(`\\pard\\sb60 {\\fs22\\cf${old ? RED : INK}\\b ${rtfEsc(c.jm || "\u2014")}}${c.funkce ? `{\\fs22\\cf${old ? RED : GREY}  \\u8212?  ${rtfEsc(c.funkce)}}` : ""}\\par`);
      const det = [];
      if (c.dnar) det.push("dat. nar. " + fdate(c.dnar));
      if (c.adr) det.push("bytem " + fixPsc(c.adr));
      if (det.length) B.push(`\\pard\\sa0 {\\fs22\\cf${old ? RED : INK} ${rtfEsc(det.join(", "))}}\\par`);
      for (const ah of c.adr_hist || []) B.push(`\\pard\\sa0 {\\fs20\\i\\cf${RED} d\u0159\xEDve bytem ${rtfEsc(fixPsc(ah.t))}  (${rtfEsc(odDo(ah.od, ah.do))} \\u8212? neaktu\xE1ln\xED)}\\par`);
      B.push(`\\pard\\sa40 {\\fs20\\i\\cf${old ? RED : GREY} Ve funkci ${rtfEsc(odDo(c.od, c.do) || "\u2014")}${old ? " \\u183? vymaz\xE1no" : ""}${c.obc ? " \\u183? st. p\\u345?\\u237?sl. " + rtfEsc(c.obc) : ""}}\\par`);
    }, "clen");
    akt.forEach(clen);
    if (his.length) {
      sub("D\u0159\xEDv\u011Bj\u0161\xED \u010Dlenov\xE9 (neaktu\xE1ln\xED)");
      his.forEach(clen);
    }
    if (org.zpusob.length) {
      sub("Zp\u016Fsob jedn\xE1n\xED");
      for (const z of org.zpusob) {
        const old = !!z.do;
        const dd = odDo(z.od, z.do);
        B.push(`\\pard\\sa40 {\\fs22\\cf${old ? RED : INK} ${rtfEsc(z.h)}}${dd ? `{\\fs20\\i\\cf${old ? RED : GREY}  (${rtfEsc(dd)}${old ? " \\u8212? neaktu\xE1ln\xED" : ""})}` : ""}\\par`);
      }
    }
  }
  if (m.spolecnici.length) {
    sec("Spole\u010Dn\xEDci");
    const merged = groupIdentity(m.spolecnici);
    const akt = merged.filter((s) => s.current), his = merged.filter((s) => !s.current);
    const spol = /* @__PURE__ */ __name((s) => {
      const old = !s.current;
      B.push(`\\pard\\sb60 {\\fs22\\cf${old ? RED : INK}\\b ${rtfEsc(s.jm || "\u2014")}}${s.ico ? `{\\fs22\\cf${old ? RED : GREY}  (I\u010CO: ${rtfEsc(s.ico)})}` : ""}\\par`);
      const det = [];
      if (s.dnar) det.push("dat. nar. " + fdate(s.dnar));
      if (s.adr) det.push((s.ico ? "se s\xEDdlem " : "bytem ") + fixPsc(s.adr));
      if (det.length) B.push(`\\pard\\sa20 {\\fs22\\cf${old ? RED : INK} ${rtfEsc(det.join(", "))}}\\par`);
      for (const ah of s.adr_hist || []) B.push(`\\pard\\sa0 {\\fs20\\i\\cf${RED} ${s.ico ? "d\u0159\xEDve se s\xEDdlem " : "d\u0159\xEDve bytem "}${rtfEsc(fixPsc(ah.t))}  (${rtfEsc(odDo(ah.od, ah.do))} \\u8212? neaktu\xE1ln\xED)}\\par`);
      const pods = s.podily.filter((x) => !x.do);
      const list = pods.length ? pods : s.podily;
      list.forEach((pd, ip) => {
        const oldp = !!pd.do || old;
        if (list.length > 1) B.push(`\\pard\\li340\\sb${ip ? 100 : 40}\\sa0 {\\fs20\\b\\scaps\\cf${oldp ? RED : GOLD} ${rtfEsc("Pod\xEDl č. " + (ip + 1))}}\\par`);
        const rows = [["Vklad", fkc(pd.vklad)], ["Splaceno", pd.splac], ["Obchodn\xED pod\xEDl", pd.podil], ["Druh pod\xEDlu", pd.druh || "Z\xE1kladn\xED pod\xEDl"]];
        for (const [lbl, val] of rows) {
          if (val == null || val === "") continue;
          B.push(`\\pard\\li340\\tx2608\\sa0 {\\fs22\\cf${GREY} ${rtfEsc(lbl)}:}\\tab {\\fs22\\cf${oldp ? RED : INK} ${rtfEsc(String(val))}}\\par`);
        }
      });
      B.push(`\\pard\\sa40 {\\fs20\\i\\cf${old ? RED : GREY} Zaps\xE1n ${rtfEsc(odDo(s.od, s.do) || "\u2014")}${old ? " \\u183? vymaz\xE1no" : ""}}\\par`);
    }, "spol");
    akt.forEach(spol);
    if (his.length) {
      sub("D\u0159\xEDv\u011Bj\u0161\xED spole\u010Dn\xEDci (neaktu\xE1ln\xED)");
      his.forEach(spol);
    }
  }
  const rzp = m.rzp;
  if (rzp && (rzp.zivnosti || rzp.zivnostiStav)) {
    sec("\u017Divnostensk\xE9 opr\xE1vn\u011Bn\xED (R\u017DP)");
    const zs = rzp.zivnostiStav || {};
    if (zs.pocetCelkem != null) kv("Stav \u017Eivnost\xED", `aktivn\xEDch ${zs.pocetAktivnich || 0}, zanikl\xFDch ${zs.pocetZaniklych || 0}, celkem ${zs.pocetCelkem || 0}`);
    for (const z of rzp.zivnosti || []) {
      const old = !!z.datumZaniku;
      B.push(`\\pard\\sb60 {\\fs22\\cf${old ? RED : INK}\\b ${rtfEsc(z.predmetPodnikani || "")}}\\par`);
      const meta = [];
      const dm = { L: "voln\xE1", V: "v\xE1zan\xE1", R: "\u0159emesln\xE1", K: "koncesovan\xE1" };
      if (z.druhZivnosti) meta.push(dm[z.druhZivnosti] || z.druhZivnosti);
      if (z.datumVzniku) meta.push("vznik " + fdate(z.datumVzniku));
      if (z.datumZaniku) meta.push("z\xE1nik " + fdate(z.datumZaniku));
      if (meta.length) B.push(`\\pard\\sa20 {\\fs20\\i\\cf${old ? RED : GREY} (${rtfEsc(meta.join(", "))})}\\par`);
      for (const ob of z.oboryCinnosti || []) B.push(`\\pard\\li340\\fi-200\\sa0 {\\fs20\\cf${INK} \\u8211? ${rtfEsc(ob.oborNazev || "")}}\\par`);
      for (const oz of z.odpovedniZastupci || []) B.push(`\\pard\\li340\\sa20 {\\fs20\\cf${GREY} Odpov\u011Bdn\xFD z\xE1stupce: ${rtfEsc(pname(oz.titulPredJmenem, oz.jmeno, oz.prijmeni))}}\\par`);
    }
  }
  if (Object.keys(m.res_stat).length || m.res_nace) {
    sec("Statistick\xE9 \xFAdaje (RES)");
    if (m.res_nace) kv("P\u0159eva\u017Euj\xEDc\xED \u010Dinnost (CZ-NACE)", nace(m.res_nace));
    const km = { "110": "do 9 zam\u011Bstnanc\u016F", "120": "10\u201319 zam\u011Bstnanc\u016F", "130": "20\u201324", "210": "25\u201349", "310": "50\u201399", "320": "100\u2013199" };
    if (m.res_stat.kategoriePoctuPracovniku) kv("Kategorie po\u010Dtu zam\u011Bstnanc\u016F", km[m.res_stat.kategoriePoctuPracovniku] || m.res_stat.kategoriePoctuPracovniku);
    if (m.res_stat.institucionalniSektor2010) kv("Institucion\xE1ln\xED sektor", m.res_stat.institucionalniSektor2010);
  }
  if (m.ostatni.length) {
    sec("Ostatn\xED skute\u010Dnosti");
    for (const o of m.ostatni) {
      const old = !!o.do;
      const dd = odDo(o.od, o.do);
      B.push(`\\pard\\sa40 {\\fs22\\cf${old ? RED : INK} ${rtfEsc(o.h)}}${dd ? `{\\fs20\\i\\cf${old ? RED : GREY}  (${rtfEsc(dd)}${old ? " \\u8212? neaktu\xE1ln\xED" : ""})}` : ""}\\par`);
    }
  }
  const keys = Object.keys(m.registrace || {}).filter((k) => REG_LABEL[k]);
  if (keys.length) {
    sec("Evidence v registrech");
    const rows = /* @__PURE__ */ __name((arr, title) => {
      if (!arr.length) return;
      sub(title);
      for (const k of arr) {
        const v = m.registrace[k];
        let txt, cf, b = false;
        if (v === "AKTIVNI") {
          txt = "Aktivn\xED";
          cf = GREEN;
          b = true;
        } else if (v === "HISTORICKY") {
          txt = "Historicky (neaktu\xE1ln\xED)";
          cf = RED;
          b = true;
        } else if (v === "NEEXISTUJICI") {
          txt = "Neevidov\xE1no";
          cf = GREY;
        } else {
          txt = String(v);
          cf = INK;
        }
        B.push(`\\pard\\tx4253\\sa0 {\\fs22\\cf${GREY} ${rtfEsc(REG_LABEL[k])}}\\tab {\\fs22\\cf${cf}${b ? "\\b" : ""} ${rtfEsc(txt)}}\\par`);
      }
    }, "rows");
    rows(REG_G1.filter((k) => keys.includes(k)), "Z\xE1kladn\xED evidence");
    rows(keys.filter((k) => !REG_G1.includes(k)), "Ostatn\xED registry");
  }
  /* --- doplňky z konektoru Sagasu (insolvence, DPH, datová schránka, listiny) --- */
  if (doplnky && typeof doplnky === "object") {
    const D = doplnky;
    const odrazka = (t, red) => B.push(`\\pard\\li340\\fi-200\\sa20 {\\fs22\\cf${red ? RED : INK} ${rtfEsc("– " + t)}}\\par`);

    if (D.insolvence) {
      sec("Insolvenčn\xED ř\xEDzen\xED");
      const rz = Array.isArray(D.insolvence.rizeni) ? D.insolvence.rizeni : [];
      if (!rz.length) {
        par(rtfEsc("K datu vyhotoven\xED nen\xED v insolvenčn\xEDm rejstř\xEDku vedeno ř\xEDzen\xED."), { sz: 22, cf: GREEN });
      } else {
        par(rtfEsc(`POZOR: v insolvenčn\xEDm rejstř\xEDku ${rz.length === 1 ? "je vedeno ř\xEDzen\xED" : "jsou vedena ř\xEDzen\xED (" + rz.length + ")"}.`), { sz: 22, cf: RED, b: true, sa: 60 });
        for (const r of rz) {
          const meta = [r.soud, r.stav, r.skoncene === true ? "skončen\xE9" : r.skoncene === false ? "prob\xEDhaj\xEDc\xED" : null].filter(Boolean).join(", ");
          odrazka(`${r.spisovaZnacka || "?"}${meta ? ` (${meta})` : ""}`, r.skoncene !== true);
        }
      }
    }

    if (D.dph) {
      sec("DPH a bankovn\xED \xFAčty");
      if (D.dph.dic) kv("DIČ", D.dph.dic);
      if (D.dph.platceDPH !== void 0 && D.dph.platceDPH !== null) kv("Pl\xE1tce DPH", D.dph.platceDPH ? "ano" : "ne");
      const nes = D.dph.nespolehlivyPlatce;
      if (nes === "ANO") {
        kv("Nespolehliv\xFD pl\xE1tce", "ANO" + (D.dph.datumZverejneniNespolehlivosti ? `  (zveřejněno ${fdate(D.dph.datumZverejneniNespolehlivosti)})` : ""), true);
      } else if (nes === "NE") {
        kv("Nespolehliv\xFD pl\xE1tce", "ne");
      } else if (nes) {
        kv("Nespolehliv\xFD pl\xE1tce", "neevidov\xE1n jako pl\xE1tce DPH");
      }
      if (D.dph.cisloFinancnihoUradu) kv("Finančn\xED \xFAřad", String(D.dph.cisloFinancnihoUradu));
      const ucty = Array.isArray(D.dph.zverejneneUcty) ? D.dph.zverejneneUcty : [];
      if (ucty.length) {
        sub("Zveřejněn\xE9 bankovn\xED \xFAčty");
        for (const u of ucty) {
          const cislo = typeof u === "string" ? u : [u.predcisli, u.cislo].filter(Boolean).join("-") + (u.kodBanky ? "/" + u.kodBanky : "") || u.ucet || JSON.stringify(u);
          const od = typeof u === "object" && u.datumZverejneni ? `  (od ${fdate(u.datumZverejneni)})` : "";
          odrazka(String(cislo) + od);
        }
      } else if (D.dph.platceDPH) {
        par(rtfEsc("Subjekt nem\xE1 zveřejněn ž\xE1dn\xFD bankovn\xED \xFAčet. Plat\xED-li se na \xFAčet, kter\xFD nen\xED zveřejněn, vznik\xE1 riziko ručen\xED za nezaplacenou DPH podle z\xE1kona o DPH."), { sz: 20, cf: RED, i: true, just: true });
      }
    }

    if (D.datovaSchranka) {
      sec("Datov\xE1 schr\xE1nka");
      kv("ID schr\xE1nky", D.datovaSchranka.idDS || D.datovaSchranka.id || null);
      kv("Typ schr\xE1nky", D.datovaSchranka.typ);
      kv("Stav", D.datovaSchranka.stav || D.datovaSchranka.stav_schranky);
    }

    const zaverky = Array.isArray(D.ucetniZaverky) ? D.ucetniZaverky : [];
    if (zaverky.length) {
      const roky = zaverky.map((z) => Number(z.rok)).filter(Number.isFinite);
      let radky = zaverky.slice();
      if (roky.length) {
        // chybějící rok mezi nejstarší a nejnovější závěrkou musí být v tabulce vidět
        const mapa = new Map(zaverky.filter((z) => Number.isFinite(Number(z.rok))).map((z) => [Number(z.rok), z]));
        radky = [];
        for (let r = Math.max(...roky); r >= Math.min(...roky); r--) radky.push(mapa.get(r) || { rok: r, chybi: true });
      }
      sec("\xDAčetn\xED z\xE1věrky");
      const CX = [1000, 3160, 5320, 7480, 9638];
      const trow = /* @__PURE__ */ __name((cells, head = false) => {
        let p = "\\trowd\\trgaph70\\trleft0";
        if (head) p += "\\trbrdrb\\brdrs\\brdrw8\\brdrcf2";
        for (const x of CX) p += `\\cellx${x}`;
        B.push(p);
        cells.forEach((c, i) => {
          const zar = i > 0 && !c.ql ? "\\qr" : "";
          B.push(`\\pard\\intbl${zar}\\sb30\\sa30 {\\fs${c.sz ?? 22}\\cf${c.cf ?? INK}${c.b ? "\\b" : ""}${c.i ? "\\i" : ""} ${rtfEsc(String(c.t ?? ""))}}\\cell`);
        });
        B.push("\\row");
      }, "trow");
      trow(
        [{ t: "Rok" }, { t: "V\xFDsledek hospodařen\xED" }, { t: "Tržby" }, { t: "Aktiva celkem" }, { t: "Vlastn\xED kapit\xE1l" }].map((c) => ({ ...c, cf: GREY, b: true, sz: 20 })),
        true
      );
      for (const z of radky) {
        const prazdny = z.chybi || !(z.vysledek || z.trzby || z.aktiva || z.vlastniKapital);
        if (prazdny) {
          trow([{ t: z.rok, b: true }, { t: "Nen\xED ve Sb\xEDrce listin", cf: RED, i: true, ql: true }, { t: "" }, { t: "" }, { t: "" }]);
          continue;
        }
        trow([
          { t: z.rok, b: true },
          { t: z.vysledek ?? "—" },
          { t: z.trzby ?? "—" },
          { t: z.aktiva ?? "—" },
          { t: z.vlastniKapital ?? "—" }
        ]);
      }
      B.push("\\pard\\sa20 {\\fs2 }\\par");
      for (const z of radky) {
        if (!z.poznamka) continue;
        B.push(`\\pard\\sa20 {\\fs20\\i\\cf${GREY} ${rtfEsc(String(z.rok ?? "") + ": " + String(z.poznamka))}}\\par`);
      }
    }

    const listiny = Array.isArray(D.listiny) ? D.listiny : [];
    if (listiny.length) {
      const celkem = Number(D.listinyCelkem);
      const neuplne = Number.isFinite(celkem) && celkem > listiny.length;
      sec(`Sb\xEDrka listin (${listiny.length}${neuplne ? " z " + celkem : ""})`);
      if (neuplne) {
        par(rtfEsc(`UPOZORN\u011aN\xCD: seznam nen\xED \xFApln\xFD \u2014 sb\xEDrka obsahuje ${celkem} listin, v tomto v\xFDpisu ${listiny.length}. Dopl\u0148 zb\xFDvaj\xEDc\xED strany a v\xFDpis vygeneruj znovu.`), { sz: 20, cf: RED, b: true, sa: 40 });
      }
      for (const l of listiny) {
        const hlava = [l.znacka, l.popis].filter(Boolean).join(" — ");
        B.push(`\\pard\\sb60\\sa0 {\\fs22\\cf${INK} ${rtfEsc(hlava || "listina")}}\\par`);
        const meta = [
          l.datumVzniku ? "vznik " + fdate(l.datumVzniku) : null,
          l.datumZverejneni ? "zveřejněno " + fdate(l.datumZverejneni) : null,
          l.pocetListu ? l.pocetListu + " listů" : null,
          l.digitalizovan === false ? "bez digit\xE1ln\xED podoby" : null
        ].filter(Boolean).join(", ");
        if (meta) B.push(`\\pard\\li340\\sa${Array.isArray(l.udalosti) && l.udalosti.length ? 0 : 20} {\\fs20\\i\\cf${l.digitalizovan === false ? RED : GREY} ${rtfEsc(meta)}}\\par`);
        const ud = Array.isArray(l.udalosti) ? l.udalosti.filter(Boolean) : [];
        if (ud.length) {
          ud.forEach((u2, i2) => {
            B.push(`\\pard\\li680\\fi-240\\sa0 {\\fs22\\cf${l.nejisty ? RED : INK} ${i2 + 1}. ${rtfEsc(String(u2))}}\\par`);
          });
          if (l.nejisty) B.push(`\\pard\\li680\\sa20 {\\fs18\\i\\cf${RED} ${rtfEsc("obsah listiny se nepodařilo přečíst spolehlivě — ověř v originále")}}\\par`);
          else B.push(`\\pard\\sa20 {\\fs2 }\\par`);
        } else if (l.digitalizovan !== false) {
          B.push(`\\pard\\li340\\sa20 {\\fs18\\i\\cf${GREY} ${rtfEsc("obsah listiny nebyl čten")}}\\par`);
        }
      }
    }

    if (D.poznamka) {
      sec("Pozn\xE1mka");
      par(rtfEsc(String(D.poznamka)), { sz: 22, just: true });
    }
  }

  par("", { sa: 0, border: true, bcf: 4, bw: 6 });
  par(rtfEsc("\u010Cerven\u011B: neaktu\xE1ln\xED, vymazan\xFD nebo historick\xFD \xFAdaj.  \u201Eod / do\u201C = datum z\xE1pisu / v\xFDmazu \xFAdaje v rejst\u0159\xEDku."), { sz: 18, cf: GREY, i: true, sa: 20 });
  if (doplnky && typeof doplnky === "object" && Object.keys(doplnky).length) {
    const zdroje = [];
    if (doplnky.insolvence) zdroje.push("insolven\u010Dn\xED rejst\u0159\xEDk (ISIR)");
    if (doplnky.dph) zdroje.push("registr pl\xE1tc\u016F DPH (MF\u010CR)");
    if (doplnky.datovaSchranka) zdroje.push("ISDS");
    if (Array.isArray(doplnky.listiny) && doplnky.listiny.length) zdroje.push("sb\xEDrka listin (ve\u0159ejn\xE9 rejst\u0159\xEDky)");
    if (zdroje.length) par(rtfEsc("Dal\u0161\xED zdroje: " + zdroje.join(", ") + ". \xDAdaje mimo obchodn\xED rejst\u0159\xEDk nejsou ARESem potvrzov\xE1ny."), { sz: 18, cf: GREY, i: true, sa: 20 });
  }
  par(rtfEsc("Zdroj: ARES (Ministerstvo financ\xED \u010CR). \xDAdaje maj\xED informativn\xED charakter. Dokument obsahuje osobn\xED \xFAdaje z ve\u0159ejn\xFDch rejst\u0159\xEDk\u016F \u2014 pro intern\xED pot\u0159ebu TARPAN."), { sz: 18, cf: GREY });
  H("}");
  // pojistka: cokoli, co se do RTF dostalo mimo rtfEsc (české literály v šablonách), escapuj tady
  return B.join("\n").replace(/[^\x00-\x7F]/g, (c) => "\\u" + c.charCodeAt(0) + "?");
}
__name(buildVypisRtf, "buildVypisRtf");

// src/logo_hex.js

// src/index.ts
var ARES_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest";
var REGISTRY = {
  zaklad: { path: "ekonomicke-subjekty", label: "J\xE1dro ARES (agregovan\xE1 data ze v\u0161ech zdroj\u016F)" },
  vr: { path: "ekonomicke-subjekty-vr", label: "Ve\u0159ejn\xFD (obchodn\xED) rejst\u0159\xEDk \u2013 statut\xE1rn\xED org\xE1ny, spole\u010Dn\xEDci, historie, jm\u011Bn\xED" },
  res: { path: "ekonomicke-subjekty-res", label: "Registr ekonomick\xFDch subjekt\u016F (\u010CS\xDA) \u2013 statistick\xE9 \xFAdaje, CZ-NACE" },
  rzp: { path: "ekonomicke-subjekty-rzp", label: "Registr \u017Eivnostensk\xE9ho podnik\xE1n\xED \u2013 \u017Eivnostensk\xE1 opr\xE1vn\u011Bn\xED" },
  ros: { path: "ekonomicke-subjekty-ros", label: "Registr osob (ROS)" },
  nrpzs: { path: "ekonomicke-subjekty-nrpzs", label: "N\xE1rodn\xED registr poskytovatel\u016F zdravotn\xEDch slu\u017Eeb" },
  rpsh: { path: "ekonomicke-subjekty-rpsh", label: "Registr politick\xFDch stran a hnut\xED" },
  rcns: { path: "ekonomicke-subjekty-rcns", label: "Registr c\xEDrkv\xED a n\xE1bo\u017Eensk\xFDch spole\u010Dnost\xED" },
  szr: { path: "ekonomicke-subjekty-szr", label: "Spole\u010Dn\xFD zem\u011Bd\u011Blsk\xFD registr" },
  rs: { path: "ekonomicke-subjekty-rs", label: "Registr \u0161kol a \u0161kolsk\xFDch za\u0159\xEDzen\xED" },
  ceu: { path: "ekonomicke-subjekty-ceu", label: "Centr\xE1ln\xED evidence \xFApadc\u016F" }
};
var REGISTRY_CODES = Object.keys(REGISTRY);
var REGISTRY_ENUM_DESC = REGISTRY_CODES.map((k) => `${k} = ${REGISTRY[k].label}`).join("; ");
var UA = "ares-mcp-worker/1.0 (+https://ares.gov.cz)";
function normalizeIco(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length === 0 || digits.length > 8) return null;
  return digits.padStart(8, "0");
}
__name(normalizeIco, "normalizeIco");
async function aresGet(path) {
  const res = await fetch(`${ARES_BASE}/${path}`, {
    method: "GET",
    headers: { Accept: "application/json", "User-Agent": UA }
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}
__name(aresGet, "aresGet");
async function aresPost(path, payload) {
  const res = await fetch(`${ARES_BASE}/${path}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": UA },
    body: JSON.stringify(payload ?? {})
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}
__name(aresPost, "aresPost");
var PAGING_PROPS = {
  start: { type: "integer", minimum: 0, description: "Offset pro str\xE1nkov\xE1n\xED (pozice prvn\xEDho vr\xE1cen\xE9ho prvku). V\xFDchoz\xED 0." },
  pocet: { type: "integer", minimum: 0, maximum: 200, description: "Po\u010Det vr\xE1cen\xFDch prvk\u016F (max 200). V\xFDchoz\xED 10." },
  razeni: { type: "array", items: { type: "string" }, description: "\u0158azen\xED, nap\u0159. ['obchodniJmeno'] nebo ['-obchodniJmeno'] (- = sestupn\u011B)." }
};
async function detailVse(ico) {
  const results = {};
  await Promise.all(
    REGISTRY_CODES.map(async (code) => {
      const { status, body } = await aresGet(`${REGISTRY[code].path}/${ico}`);
      results[code] = status === 404 ? { _stav: "nenalezeno" } : status >= 400 ? { _stav: `chyba ${status}`, detail: body } : body;
    })
  );
  return { ico, registry: results };
}
__name(detailVse, "detailVse");
var TOOLS = [
  {
    name: "ares_detail",
    description: "Vr\xE1t\xED detail ekonomick\xE9ho subjektu podle I\u010CO z vybran\xE9ho zdrojov\xE9ho registru ARES. Registr 'zaklad' je agregovan\xE9 j\xE1dro (z\xE1kladn\xED identifikace, adresa, pr\xE1vn\xED forma, seznam registrac\xED, DI\u010C). Registr 'vr' (ve\u0159ejn\xFD/obchodn\xED rejst\u0159\xEDk) je nejbohat\u0161\xED \u2013 statut\xE1rn\xED org\xE1ny, jednatel\xE9, spole\u010Dn\xEDci, z\xE1kladn\xED kapit\xE1l, p\u0159edm\u011Bt podnik\xE1n\xED a historie. Pro \xFApln\xFD obraz subjektu je vhodn\xE9 zavolat 'zaklad' a pot\xE9 'vr'. Registry: " + REGISTRY_ENUM_DESC,
    inputSchema: {
      type: "object",
      properties: {
        ico: { type: "string", description: "I\u010CO subjektu (1\u20138 \u010D\xEDslic; krat\u0161\xED se dopln\xED vodic\xEDmi nulami na 8 m\xEDst)." },
        registr: { type: "string", enum: REGISTRY_CODES, default: "zaklad", description: "Zdrojov\xFD registr, ze kter\xE9ho \u010D\xEDst detail." }
      },
      required: ["ico"]
    }
  },
  {
    name: "ares_detail_vse",
    description: "Pohodln\xFD n\xE1stroj: pro zadan\xE9 I\u010CO st\xE1hne detail ze V\u0160ECH zdrojov\xFDch registr\u016F ARES najednou (zaklad, vr, res, rzp, ros, nrpzs, rpsh, rcns, szr, rs, ceu) a vr\xE1t\xED je pohromad\u011B. Pou\u017Eij, kdy\u017E chce\u0161 o subjektu maximum dostupn\xFDch informac\xED jedn\xEDm vol\xE1n\xEDm. Registry, kde subjekt nen\xED evidov\xE1n, se vr\xE1t\xED jako 'nenalezeno'.",
    inputSchema: {
      type: "object",
      properties: {
        ico: { type: "string", description: "I\u010CO subjektu (1\u20138 \u010D\xEDslic; dopln\xED se vodic\xEDmi nulami na 8 m\xEDst)." }
      },
      required: ["ico"]
    }
  },
  {
    name: "ares_vyhledat",
    description: "Komplexn\xED vyhled\xE1n\xED ekonomick\xFDch subjekt\u016F v j\xE1dru ARES podle kombinace krit\xE9ri\xED: obchodn\xED jm\xE9no (fulltext), adresa s\xEDdla, pr\xE1vn\xED forma, CZ-NACE, finan\u010Dn\xED \xFA\u0159ad, I\u010CO. Vrac\xED seznam subjekt\u016F se z\xE1kladn\xEDmi \xFAdaji + po\u010Det nalezen\xFDch. Vhodn\xE9 pro dohled\xE1n\xED I\u010CO podle n\xE1zvu firmy nebo pro filtrov\xE1n\xED subjekt\u016F.",
    inputSchema: {
      type: "object",
      properties: {
        obchodniJmeno: { type: "string", description: "Obchodn\xED jm\xE9no / n\xE1zev (fulltext, m\u016F\u017Ee b\xFDt \u010D\xE1st n\xE1zvu)." },
        ico: { type: "array", items: { type: "string" }, description: "Seznam I\u010CO (ka\u017Ed\xE9 8 \u010D\xEDslic)." },
        sidlo: {
          type: "object",
          description: "Filtr adresy s\xEDdla (R\xDAIAN). Lze zadat jen n\u011Bkter\xE9 \u010D\xE1sti.",
          properties: {
            kodObce: { type: "integer", description: "K\xF3d obce (R\xDAIAN)." },
            nazevObce: { type: "string", description: "N\xE1zev obce." },
            nazevUlice: { type: "string", description: "N\xE1zev ulice / ve\u0159ejn\xE9ho prostranstv\xED." },
            cisloDomovni: { type: "integer", description: "\u010C\xEDslo popisn\xE9." },
            cisloOrientacni: { type: "integer", description: "\u010C\xEDslo orienta\u010Dn\xED." },
            psc: { type: "integer", description: "PS\u010C (bez mezery, nap\u0159. 11000)." },
            textovaAdresa: { type: "string", description: "Nestrukturovan\xE1 textov\xE1 adresa." }
          }
        },
        pravniForma: { type: "array", items: { type: "string" }, description: "K\xF3dy pr\xE1vn\xED formy (3m\xEDstn\xE9, \u010D\xEDseln\xEDk PravniForma), nap\u0159. ['121'] pro a.s." },
        czNace: { type: "array", items: { type: "string" }, description: "K\xF3dy CZ-NACE (\u010D\xEDseln\xEDk CzNace)." },
        financniUrad: { type: "array", items: { type: "string" }, description: "K\xF3dy finan\u010Dn\xEDho \xFA\u0159adu (3m\xEDstn\xE9)." },
        pravniFormaRos: { type: "array", items: { type: "string" }, description: "K\xF3dy pr\xE1vn\xED formy dle ROS (3m\xEDstn\xE9)." },
        ...PAGING_PROPS
      }
    }
  },
  {
    name: "ares_vyhledat_registr",
    description: "Vyhled\xE1n\xED subjekt\u016F podle seznamu I\u010CO v konkr\xE9tn\xEDm zdrojov\xE9m registru ARES (mimo j\xE1dro). Pou\u017Eij, kdy\u017E chce\u0161 d\xE1vkov\u011B z\xEDskat data z jednoho registru (nap\u0159. v\xFDpisy z ve\u0159ejn\xE9ho rejst\u0159\xEDku pro v\xEDce I\u010CO). Registry: " + REGISTRY_CODES.filter((r) => r !== "zaklad").join(", ") + ".",
    inputSchema: {
      type: "object",
      properties: {
        registr: { type: "string", enum: REGISTRY_CODES.filter((r) => r !== "zaklad"), description: "C\xEDlov\xFD zdrojov\xFD registr." },
        ico: { type: "array", items: { type: "string" }, description: "Seznam I\u010CO (ka\u017Ed\xE9 8 \u010D\xEDslic)." },
        ...PAGING_PROPS
      },
      required: ["registr", "ico"]
    }
  },
  {
    name: "ares_standardizovat_adresu",
    description: "Standardizace / validace adresy proti registru R\xDAIAN. Zadej bu\u010F strukturovan\xE9 \u010D\xE1sti (obec, ulice, \u010D\xEDsla, PS\u010C), nebo nestrukturovan\xFD text v poli 'textovaAdresa'. Vrac\xED standardizovan\xE9 adresn\xED m\xEDsto(a) v\u010Detn\u011B k\xF3d\u016F R\xDAIAN a GPS.",
    inputSchema: {
      type: "object",
      properties: {
        textovaAdresa: { type: "string", description: "Nestrukturovan\xE1 adresa, nap\u0159. 'Politick\xFDch v\u011Bz\u0148\u016F 7, Praha 1'." },
        nazevObce: { type: "string" },
        nazevCastiObce: { type: "string" },
        nazevUlice: { type: "string" },
        cisloDomovni: { type: "integer", description: "\u010C\xEDslo popisn\xE9." },
        cisloOrientacni: { type: "integer" },
        cisloOrientacniPismeno: { type: "string", maxLength: 1 },
        kodAdresnihoMista: { type: "integer" },
        typStandardizaceAdresy: { type: "string", enum: ["UPLNA_STANDARDIZACE", "VYHOVUJICI_ADRESY"], description: "Typ standardizace." },
        ...PAGING_PROPS
      }
    }
  },
  {
    name: "ares_ciselnik",
    description: "Vyhled\xE1n\xED \u010D\xEDseln\xEDk\u016F / n\xE1zevn\xEDk\u016F ARES (k\xF3dov\xE9 seznamy \u2013 pr\xE1vn\xED formy, CZ-NACE, finan\u010Dn\xED \xFA\u0159ady, typy zdroj\u016F apod.). U\u017Eite\u010Dn\xE9 pro p\u0159eklad k\xF3d\u016F z odpov\u011Bd\xED na lidsk\xFD n\xE1zev a naopak. Zadej 'zdrojCiselniku' a/nebo 'kodCiselniku'.",
    inputSchema: {
      type: "object",
      properties: {
        zdrojCiselniku: { type: "string", description: "Zdroj/oblast \u010D\xEDseln\xEDku (k\xF3d TypZdrojeAres), nap\u0159. 'res', 'com'." },
        kodCiselniku: { type: "string", description: "Konkr\xE9tn\xED k\xF3d \u010D\xEDseln\xEDku, nap\u0159. 'PravniForma', 'CzNace', 'FinancniUrad'." },
        ...PAGING_PROPS
      }
    }
  },
  {
    name: "ares_notifikace_vyhledat",
    description: "Vyhled\xE1n\xED notifika\u010Dn\xEDch d\xE1vek o zm\u011Bn\xE1ch ekonomick\xFDch subjekt\u016F podle zdroje a \u010Dasov\xE9ho okna. Pokro\u010Dil\xFD n\xE1stroj pro sledov\xE1n\xED zm\u011Bn (monitoring). Zdroje: vr, res, ros, rzp, nrpzs, rcns, rpsh, rs, szr.",
    inputSchema: {
      type: "object",
      properties: {
        datovyZdroj: { type: "string", description: "K\xF3d zdroje notifikac\xED (vr, res, ros, rzp, nrpzs, rcns, rpsh, rs, szr)." },
        ...PAGING_PROPS
      }
    }
  },
  {
    name: "ares_notifikace_davka",
    description: "Vr\xE1t\xED konkr\xE9tn\xED notifika\u010Dn\xED d\xE1vku ARES podle datov\xE9ho zdroje a \u010D\xEDsla d\xE1vky.",
    inputSchema: {
      type: "object",
      properties: {
        datovyZdroj: { type: "string", description: "K\xF3d datov\xE9ho zdroje (vr, res, ros, rzp, nrpzs, rcns, rpsh, rs, szr)." },
        cisloDavky: { type: "string", description: "\u010C\xEDslo d\xE1vky." }
      },
      required: ["datovyZdroj", "cisloDavky"]
    }
  },
  {
    name: "ares_vypis",
    description: "Vygeneruje KOMPLETN\xCD v\xFDpis subjektu z ARES jako dokument otev\xEDrateln\xFD ve Wordu (.rtf) a vr\xE1t\xED odkaz ke sta\u017Een\xED. Obsahuje 100 % \xFAdaj\u016F ze v\u0161ech registr\u016F v\u010Detn\u011B historie (od/do), ve firemn\xED \xFAprav\u011B TARPAN (logo, \u201Epro intern\xED pot\u0159ebu TARPAN\u201C, Times New Roman 11, neaktu\xE1ln\xED \xFAdaje \u010Derven\u011B). Pou\u017Eij, kdy\u017E u\u017Eivatel chce v\xFDpis. BEZ parametru doplnky vr\xE1t\xED URL \u2014 p\u0159edej ji u\u017Eivateli. S parametrem doplnky (\xFAdaje z konektoru Sagasu: insolvence, DPH a \xFA\u010Dty, datov\xE1 schr\xE1nka, sb\xEDrka listin) vr\xE1t\xED OBOHACEN\xDD v\xFDpis p\u0159\xEDmo jako dokument v poli soubor_gzip_base64 \u2014 rozbal, p\u0159eve\u010F na .docx a po\u0161li u\u017Eivateli.",
    inputSchema: {
      type: "object",
      properties: {
        ico: { type: "string", description: "I\u010CO subjektu (1\u20138 \u010D\xEDslic; dopln\xED se vodic\xEDmi nulami na 8 m\xEDst)." },
        doplnky: {
          type: "object",
          description: "Voliteln\xE9 \xFAdaje z konektoru Sagasu, kter\xE9 ARES nem\xE1. Vypln\xED-li se cokoli z nich, n\xE1stroj nevr\xE1t\xED odkaz, ale rovnou hotov\xFD dokument (gzip + base64) k odesl\xE1n\xED u\u017Eivateli. Data ber z n\xE1stroj\u016F Sagasu a p\u0159eda\u010D je beze zm\u011Bny.",
          properties: {
            insolvence: {
              type: "object",
              description: "V\xFDsledek insolvence_vyhledat. Pr\xE1zdn\xE9 pole rizeni = \u017E\xE1dn\xE9 \u0159\xEDzen\xED (vyti\u0161tn\u011B se zelen\u011B jako \u010Dist\xFD stav).",
              properties: { rizeni: { type: "array", items: { type: "object", properties: { spisovaZnacka: { type: "string" }, soud: { type: "string" }, stav: { type: "string" }, skoncene: { type: "boolean" } } } } }
            },
            dph: { type: "object", description: "V\xFDsledek dph_status pro dan\xE9 I\u010CO: dic, platceDPH, nespolehlivyPlatce (ANO/NE/NENALEZEN), cisloFinancnihoUradu, datumZverejneniNespolehlivosti, zverejneneUcty." },
            datovaSchranka: { type: "object", description: "V\xFDsledek datova_schranka_vyhledat: idDS, typ, stav." },
            listiny: { type: "array", description: "Seznam ze sbirka_listin \u2014 V\u0160ECHNY listiny ze v\u0161ech str\xE1nek, ne jen prvn\xED strana. Polo\u017Eky: znacka, popis, datumVzniku, datumZverejneni, pocetListu, digitalizovan.", items: { type: "object", properties: { znacka: { type: "string" }, popis: { type: "string" }, datumVzniku: { type: "string" }, datumZverejneni: { type: "string" }, pocetListu: { type: "integer" }, digitalizovan: { type: "boolean" }, udalosti: { type: "array", items: { type: "string" }, description: "Co listina způsobila — číslovaný výčet zjištěný z jejího textu (listina_text). Např. „změna způsobu jednání z ‚jednají dva členové společně‘ na ‚samostatně jedná člen správní rady‘“, „odvolán X z funkce k datu“, „jmenován Y“. Nevyplňuj, pokud jsi listinu nečetl." }, nejisty: { type: "boolean", description: "true = obsah se nepodařilo přečíst spolehlivě; vytiskne se červeně s výhradou." } } } },
            ucetniZaverky: { type: "array", description: "Účetní závěrky vyčtené z listin: rok, vysledek, trzby, aktiva, vlastniKapital, poznamka.", items: { type: "object" } },
            listinyCelkem: { type: "integer", description: "Hodnota pocet_celkem z sbirka_listin. Je-li v\u011Bt\u0161\xED ne\u017E po\u010Det p\u0159edan\xFDch listin, v\xFDpis to \u010Derven\u011B ozn\xE1m\xED jako ne\xFApln\xFD seznam." },
            poznamka: { type: "string", description: "Voliteln\xFD vlastn\xED text na konec v\xFDpisu." }
          }
        }
      },
      required: ["ico"]
    }
  }
];
async function gzipBase64(text) {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  const KROK = 32768;
  for (let i = 0; i < bytes.length; i += KROK) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + KROK));
  return btoa(bin);
}
__name(gzipBase64, "gzipBase64");
function ok(data) {
  const text = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: "text", text }] };
}
__name(ok, "ok");
function err(msg) {
  return { content: [{ type: "text", text: msg }], isError: true };
}
__name(err, "err");
function buildFilter(args, ...allow) {
  const out = {};
  for (const key of allow) {
    if (args[key] !== void 0 && args[key] !== null && args[key] !== "") out[key] = args[key];
  }
  if (out.pocet === void 0) out.pocet = 10;
  return out;
}
__name(buildFilter, "buildFilter");
async function runTool(name, args, origin = "") {
  switch (name) {
    case "ares_detail": {
      const ico = normalizeIco(String(args.ico ?? ""));
      if (!ico) return err("Neplatn\xE9 I\u010CO. Zadej 1\u20138 \u010D\xEDslic.");
      const reg2 = REGISTRY[String(args.registr ?? "zaklad")];
      if (!reg2) return err(`Nezn\xE1m\xFD registr '${args.registr}'. Povolen\xE9: ${REGISTRY_CODES.join(", ")}.`);
      const { status, body } = await aresGet(`${reg2.path}/${ico}`);
      if (status === 404) return ok(`Subjekt s I\u010CO ${ico} nebyl v registru '${args.registr ?? "zaklad"}' nalezen.`);
      if (status >= 400) return err(`ARES vr\xE1til chybu ${status}: ${JSON.stringify(body)}`);
      return ok(body);
    }
    case "ares_detail_vse": {
      const ico = normalizeIco(String(args.ico ?? ""));
      if (!ico) return err("Neplatn\xE9 I\u010CO. Zadej 1\u20138 \u010D\xEDslic.");
      return ok(await detailVse(ico));
    }
    case "ares_vyhledat": {
      const filter = buildFilter(
        args,
        "obchodniJmeno",
        "ico",
        "sidlo",
        "pravniForma",
        "czNace",
        "financniUrad",
        "pravniFormaRos",
        "start",
        "pocet",
        "razeni"
      );
      const { status, body } = await aresPost("ekonomicke-subjekty/vyhledat", filter);
      if (status >= 400) return err(`ARES vr\xE1til chybu ${status}: ${JSON.stringify(body)}`);
      return ok(body);
    }
    case "ares_vyhledat_registr": {
      const reg2 = REGISTRY[String(args.registr ?? "")];
      if (!reg2 || args.registr === "zaklad") return err(`Nezn\xE1m\xFD registr '${args.registr}'. Povolen\xE9: ${REGISTRY_CODES.filter((r) => r !== "zaklad").join(", ")}.`);
      const filter = buildFilter(args, "ico", "start", "pocet", "razeni");
      const { status, body } = await aresPost(`${reg2.path}/vyhledat`, filter);
      if (status >= 400) return err(`ARES vr\xE1til chybu ${status}: ${JSON.stringify(body)}`);
      return ok(body);
    }
    case "ares_standardizovat_adresu": {
      const filter = buildFilter(
        args,
        "textovaAdresa",
        "nazevObce",
        "nazevCastiObce",
        "nazevUlice",
        "cisloDomovni",
        "cisloOrientacni",
        "cisloOrientacniPismeno",
        "kodAdresnihoMista",
        "typStandardizaceAdresy",
        "start",
        "pocet",
        "razeni"
      );
      const { status, body } = await aresPost("standardizovane-adresy/vyhledat", filter);
      if (status >= 400) return err(`ARES vr\xE1til chybu ${status}: ${JSON.stringify(body)}`);
      return ok(body);
    }
    case "ares_ciselnik": {
      const filter = buildFilter(args, "zdrojCiselniku", "kodCiselniku", "start", "pocet", "razeni");
      const { status, body } = await aresPost("ciselniky-nazevniky/vyhledat", filter);
      if (status >= 400) return err(`ARES vr\xE1til chybu ${status}: ${JSON.stringify(body)}`);
      return ok(body);
    }
    case "ares_notifikace_vyhledat": {
      const filter = buildFilter(args, "datovyZdroj", "start", "pocet", "razeni");
      const { status, body } = await aresPost("ekonomicke-subjekty-notifikace/vyhledat", filter);
      if (status >= 400) return err(`ARES vr\xE1til chybu ${status}: ${JSON.stringify(body)}`);
      return ok(body);
    }
    case "ares_notifikace_davka": {
      const zdroj = String(args.datovyZdroj ?? "");
      const cislo = String(args.cisloDavky ?? "");
      if (!zdroj || !cislo) return err("Vypl\u0148 'datovyZdroj' i 'cisloDavky'.");
      const { status, body } = await aresGet(`ekonomicke-subjekty-notifikace/datovy-zdroj/${encodeURIComponent(zdroj)}/cislo-davky/${encodeURIComponent(cislo)}`);
      if (status >= 400) return err(`ARES vr\xE1til chybu ${status}: ${JSON.stringify(body)}`);
      return ok(body);
    }
    case "ares_vypis": {
      const ico = normalizeIco(String(args.ico ?? ""));
      if (!ico) return err("Neplatn\xE9 I\u010CO. Zadej 1\u20138 \u010D\xEDslic.");
      const url = `${origin}/vypis/${ico}`;
      const dopl = args.doplnky;
      if (dopl && typeof dopl === "object" && Object.keys(dopl).length) {
        try {
          const data2 = await detailVse(ico);
          const rtf2 = buildVypisRtf(data2, dopl);
          const nazev2 = String(data2.registry?.zaklad?.obchodniJmeno || "subjekt").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "subjekt";
          return ok({
            nazev_souboru: `Vypis_ARES_${nazev2}_${ico}.docx`,
            soubor_gzip_base64: await gzipBase64(rtf2),
            kodovani: "gzip + base64; po rozbalen\xED je to RTF",
            odkaz: url,
            pokyn: "NEVYPISUJ obsah pole soubor_gzip_base64. Ulo\u017E ho a prove\u010F: `tr -d '\\n' < blob.b64 | base64 -d | gunzip > vypis.rtf` a pot\xE9 `soffice --headless --convert-to docx vypis.rtf`. V\xFDsledn\xFD .docx po\u0161li u\u017Eivateli n\xE1strojem SendUserFile pod n\xE1zvem z pole nazev_souboru. Ohl\xE1s\xED-li gunzip chybu CRC nebo d\xE9lky, p\u0159enos se po\u0161kodil \u2013 zavolej n\xE1stroj ZNOVU."
          });
        } catch (e) {
          return err(`Chyba generov\xE1n\xED v\xFDpisu: ${e?.message ?? String(e)}`);
        }
      }
      return ok(
        `Kompletn\xED v\xFDpis z ARES je p\u0159ipraven ke sta\u017Een\xED (otev\u0159e se ve Wordu):
${url}

Dokument obsahuje 100 % \xFAdaj\u016F ze v\u0161ech registr\u016F v\u010Detn\u011B historie, v \xFAprav\u011B pro intern\xED pot\u0159ebu TARPAN.`
      );
    }
    default:
      return err(`Nezn\xE1m\xFD n\xE1stroj: ${name}`);
  }
}
__name(runTool, "runTool");
var PROTOCOL_VERSION = "2024-11-05";
var SERVER_INFO = { name: "ares-mcp", version: "1.0.0" };
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Max-Age": "86400"
};
function jsonResponse(obj, init = {}) {
  return new Response(JSON.stringify(obj), {
    ...init,
    headers: { "Content-Type": "application/json", ...CORS, ...init.headers ?? {} }
  });
}
__name(jsonResponse, "jsonResponse");
function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}
__name(rpcResult, "rpcResult");
function rpcError(id, code, message) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
__name(rpcError, "rpcError");
async function handleRpc(msg, origin = "") {
  const { id, method, params } = msg ?? {};
  if (id === void 0 || id === null) return null;
  switch (method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions: "TARPAN \u2013 ARES: \u010Dty\u0159i funkce nad daty z rejst\u0159\xEDk\u016F. Data ber jen z t\u011Bchto n\xE1stroj\u016F, nikdy z pam\u011Bti; subjekt v\u017Edy nejd\u0159\xEDv resolvuj na I\u010CO (`ares_vyhledat` z n\xE1zvu, ov\u011B\u0159 a potvr\u010F), pak `ares_detail_vse`. (1) V\xDDPIS: na \u017E\xE1dost o v\xFDpis zavolej `ares_vypis` a p\u0159edej u\u017Eivateli vr\xE1cen\xFD odkaz \u2014 vygeneruje kompletn\xED v\xFDpis do Wordu (100 % \xFAdaj\u016F, historie, \xFAprava TARPAN). (2) KONTROLA: porovnej dokument proti aktu\xE1ln\xEDm \xFAdaj\u016Fm z ARES dle I\u010CO \u2014 firma, s\xEDdlo, I\u010CO/DI\u010C, spisov\xE1 zna\u010Dka a hlavn\u011B jednaj\xEDc\xED osoba (je st\xE1le zapsan\xFDm \u010Dlenem statut\xE1rn\xEDho org\xE1nu a sm\xED jednat dle zp\u016Fsobu jedn\xE1n\xED?); zastaral\xE9 \xFAdaje (vymazan\xE9 s\xEDdlo, b\xFDval\xFD jednatel, star\xFD n\xE1zev) ozna\u010D jako riziko a uve\u010F aktu\xE1ln\xED hodnotu. (3) DOPLN\u011AN\xCD: dopl\u0148 ov\u011B\u0159en\xE9 aktu\xE1ln\xED \xFAdaje do dokumentu (s\xEDdlo, zastoupen\xED = jednatel + funkce + zp\u016Fsob jedn\xE1n\xED, datov\xE1 schr\xE1nka, I\u010CO, DI\u010C, sp. zn.); PS\u010C ve tvaru \u201E110 00\u201C. (4) CHAT: prost\xE9 dotazy zodpov\u011Bz z konektoru. Neaktu\xE1ln\xED \xFAdaje uv\xE1d\u011Bj jako neaktu\xE1ln\xED."
      });
    case "ping":
      return rpcResult(id, {});
    case "tools/list":
      return rpcResult(id, { tools: TOOLS });
    case "tools/call": {
      const toolName = params?.name;
      const args = params?.arguments ?? {};
      try {
        const result = await runTool(toolName, args, origin);
        return rpcResult(id, result);
      } catch (e) {
        return rpcResult(id, err(`Intern\xED chyba n\xE1stroje: ${e?.message ?? String(e)}`));
      }
    }
    default:
      return rpcError(id, -32601, `Metoda '${method}' nen\xED podporov\xE1na.`);
  }
}
__name(handleRpc, "handleRpc");
var index_default = {
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(request.url);
    const origin = url.origin;
    if (request.method === "GET" && url.pathname.startsWith("/vypis/")) {
      const ico = normalizeIco(decodeURIComponent(url.pathname.slice("/vypis/".length)));
      if (!ico) return jsonResponse({ error: "Neplatn\xE9 I\u010CO." }, { status: 400 });
      try {
        const data = await detailVse(ico);
        const rtf = buildVypisRtf(data);
        const nazev = String(data.registry?.zaklad?.obchodniJmeno || "subjekt").replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "subjekt";
        return new Response(rtf, {
          headers: {
            "Content-Type": "application/rtf; charset=utf-8",
            "Content-Disposition": `attachment; filename="Vypis_ARES_${nazev}_${ico}.rtf"`,
            ...CORS
          }
        });
      } catch (e) {
        return jsonResponse({ error: `Chyba generov\xE1n\xED v\xFDpisu: ${e?.message ?? String(e)}` }, { status: 500 });
      }
    }
    if (request.method === "GET") {
      if (url.pathname === "/" || url.pathname === "") {
        return jsonResponse({
          server: SERVER_INFO,
          transport: "streamable-http",
          endpoint: "POST /",
          authentication: "none",
          tools: TOOLS.map((t) => t.name),
          upstream: ARES_BASE
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
      const responses = (await Promise.all(payload.map((m) => handleRpc(m, origin)))).filter((r) => r !== null);
      if (responses.length === 0) return new Response(null, { status: 202, headers: CORS });
      return jsonResponse(responses);
    }
    const response = await handleRpc(payload, origin);
    if (response === null) return new Response(null, { status: 202, headers: CORS });
    return jsonResponse(response);
  }
};
export {
  index_default as default
};
//# sourceMappingURL=index.js.map


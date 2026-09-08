#!/usr/bin/env python3
"""
clean_marks.py — odlehčený čistič stop po AI.

Dvě věci, obojí deterministické a ověřitelné:
  1) TEXTOVÁ VRSTVA (čistá stdlib): neviditelné a steganografické znaky
     — zero-width, obousměrné řízení (bidi), tag-znaky, variation selectors,
     word joiner. Volitelně i exotické mezery.
  2) SOUBOROVÁ VRSTVA (přes systémové nástroje, pokud jsou): metadata
     s AI proveniencí — C2PA / EXIF / XMP / vlastnosti dokumentu.
     Používá exiftool, qpdf, ghostscript. Když nejsou, řekne to a textovou
     vrstvu udělá stejně.

Použití:
  python clean_marks.py inspect <cesta>
  python clean_marks.py clean   <cesta> [--out OUT] [--spaces] [--no-metadata]

Návratový JSON report na stdout. Originál se nikdy nepřepisuje na místě.
Pouze standardní knihovna Pythonu 3.10+.
"""
from __future__ import annotations
import argparse
import json
import os
import shutil
import subprocess
import sys
import unicodedata

# --- definice neviditelných / steganografických znaků ---------------------

ZERO_WIDTH = {
    0x200B,  # zero width space
    0x200C,  # zero width non-joiner
    0x200D,  # zero width joiner
    0x2060,  # word joiner
    0xFEFF,  # zero width no-break space / BOM
}
BIDI = set(range(0x202A, 0x202F)) | set(range(0x2066, 0x206A))  # LRE..PDI
TAG_CHARS = set(range(0xE0000, 0xE0080))  # Unicode tag block (steg. nosič)
VARIATION_SELECTORS = set(range(0xFE00, 0xFE10)) | set(range(0xE0100, 0xE01F0))
INVISIBLE = ZERO_WIDTH | BIDI | TAG_CHARS | VARIATION_SELECTORS

# exotické mezery -> normalní mezera (jen na vyžádání; NBSP bývá v právu záměrná)
EXOTIC_SPACES = {
    0x00A0, 0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006,
    0x2007, 0x2008, 0x2009, 0x200A, 0x202F, 0x205F, 0x3000,
}

TEXT_EXT = {".txt", ".md", ".markdown", ".html", ".htm", ".csv", ".json", ".xml"}
DOC_EXT = {".pdf", ".docx", ".xlsx", ".pptx", ".epub", ".odt"}
IMG_EXT = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".gif", ".heic", ".avif"}


def _name(cp: int) -> str:
    try:
        return unicodedata.name(chr(cp))
    except ValueError:
        return f"U+{cp:04X}"


# --- textová vrstva --------------------------------------------------------

def scan_text(text: str) -> dict:
    counts: dict[str, int] = {}
    for ch in text:
        cp = ord(ch)
        if cp in INVISIBLE or cp in EXOTIC_SPACES:
            key = f"U+{cp:04X} {_name(cp)}"
            counts[key] = counts.get(key, 0) + 1
    return counts


def clean_text(text: str, normalize_spaces: bool = False) -> tuple[str, int]:
    removed = 0
    out = []
    for ch in text:
        cp = ord(ch)
        if cp in INVISIBLE:
            removed += 1
            continue
        if normalize_spaces and cp in EXOTIC_SPACES:
            out.append(" ")
            removed += 1
            continue
        out.append(ch)
    return "".join(out), removed


# --- souborová vrstva (systémové nástroje) --------------------------------

def _have(tool: str) -> bool:
    return shutil.which(tool) is not None


def strip_metadata(path: str, out: str) -> dict:
    """Zkopíruje soubor a strhne metadata dostupnými nástroji. Vrací report."""
    ext = os.path.splitext(path)[1].lower()
    shutil.copyfile(path, out)
    steps = []

    if _have("exiftool") and (ext in IMG_EXT or ext in DOC_EXT):
        r = subprocess.run(
            ["exiftool", "-all=", "-overwrite_original", out],
            capture_output=True, text=True,
        )
        steps.append({"tool": "exiftool", "ok": r.returncode == 0,
                      "note": "EXIF/XMP/IPTC odstraněny" if r.returncode == 0
                              else r.stderr.strip()[:200]})

    if ext == ".pdf":
        if _have("exiftool"):
            subprocess.run(["exiftool", "-all=", "-overwrite_original", out],
                           capture_output=True, text=True)
        if _have("qpdf"):
            tmp = out + ".qpdf.pdf"
            r = subprocess.run(["qpdf", "--linearize", out, tmp],
                               capture_output=True, text=True)
            if r.returncode in (0, 3) and os.path.exists(tmp):
                os.replace(tmp, out)
                steps.append({"tool": "qpdf", "ok": True,
                              "note": "PDF přeuložen (dropnut nepoužitý balast)"})
            else:
                steps.append({"tool": "qpdf", "ok": False,
                              "note": r.stderr.strip()[:200]})

    if not steps:
        steps.append({"tool": None, "ok": False,
                      "note": "Žádný nástroj na metadata není k dispozici "
                              "(exiftool/qpdf/ghostscript). Instaluj je pro tuto vrstvu."})
    return {"output": out, "steps": steps}


# --- příkazy ---------------------------------------------------------------

def is_text_file(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in TEXT_EXT


def cmd_inspect(path: str) -> dict:
    ext = os.path.splitext(path)[1].lower()
    rep: dict = {"path": path, "type": "text" if is_text_file(path) else "file"}
    if is_text_file(path):
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
        found = scan_text(text)
        rep["invisible_chars"] = found
        rep["invisible_total"] = sum(found.values())
    else:
        rep["note"] = (f"Binární formát ({ext}). Inspekci metadat udělá clean; "
                       f"exiftool přítomen: {_have('exiftool')}, qpdf: {_have('qpdf')}.")
    return rep


def cmd_clean(path: str, out: str | None, spaces: bool, metadata: bool) -> dict:
    base, ext = os.path.splitext(path)
    if out is None:
        out = f"{base}.clean{ext}"
    rep: dict = {"input": path, "output": out}

    if is_text_file(path):
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()
        before = scan_text(text)
        cleaned, removed = clean_text(text, normalize_spaces=spaces)
        with open(out, "w", encoding="utf-8", newline="") as f:
            f.write(cleaned)
        rep["layer"] = "text"
        rep["verified_removed"] = {"invisible_chars": before,
                                   "count": sum(before.values()) if not spaces else removed}
        rep["removed_count"] = removed
    else:
        if metadata:
            rep["layer"] = "file"
            rep.update(strip_metadata(path, out))
        else:
            rep["layer"] = "file"
            rep["note"] = "Metadata přeskočena (--no-metadata)."
    return rep


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Čistič stop po AI (Unicode + metadata).")
    sub = p.add_subparsers(dest="cmd", required=True)

    pi = sub.add_parser("inspect", help="jen zjisti, co v souboru je")
    pi.add_argument("path")

    pc = sub.add_parser("clean", help="vyčisti do nového souboru")
    pc.add_argument("path")
    pc.add_argument("--out", default=None)
    pc.add_argument("--spaces", action="store_true",
                    help="normalizovat i exotické mezery (POZOR: NBSP bývá v právu záměrná)")
    pc.add_argument("--no-metadata", dest="metadata", action="store_false",
                    help="nesahej na metadata souboru")

    a = p.parse_args(argv)
    if not os.path.exists(a.path):
        print(json.dumps({"error": f"soubor neexistuje: {a.path}"}, ensure_ascii=False))
        return 2

    if a.cmd == "inspect":
        rep = cmd_inspect(a.path)
    else:
        rep = cmd_clean(a.path, a.out, a.spaces, a.metadata)

    print(json.dumps(rep, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

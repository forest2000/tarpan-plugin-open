# Leady — které firmy navštívily web kanceláře

Referenční list ke konektoru `leady` — oficiální MCP server Saleskitu
(`https://mcp.saleskit.com/leady/`). Leady podle IP adresy odhaduje, **která firma**
web kanceláře navštívila, které stránky si prohlížela a jak dlouho.

**Přihlášení:** OAuth, jako u Merku. Uživatel konektor v Claude připojí tlačítkem
Connect a přihlásí se svým účtem Saleskit. Není-li připojený, napiš to a nic
nedomýšlej. Jaké nástroje konektor má, zjistíš z jejich seznamu po připojení —
názvy si nevymýšlej.

## Jen firmy, nikdy osoby

- Leady identifikuje **jen firmy (podle IČO)**, ne konkrétní lidi. Nikdy netvrď ani
  nenaznačuj, **kdo** z dané firmy web navštívil.
- Firmu z Leady smíš doplnit z Merku nebo ARES **jen na úrovni firmy** (obor,
  velikost, obrat). Nespojuj návštěvu s konkrétními osobami ze statutárního orgánu,
  ze zaměstnanců, z kontaktů ani přes web či LinkedIn a nestav z toho seznam jmen k oslovení.
- Je-li „firma" podnikající fyzická osoba (OSVČ, název je jméno člověka), uveď ji
  jen jako „podnikající fyzická osoba" bez jména a nedoplňuj ji z Merku ani ARES —
  tím by ses dostal ke konkrétnímu člověku.
- Identita firmy je odhad provozovatele s vysokou pravděpodobností, ne jistota.
  Ve výstupu to tak označ.

## Prázdná odpověď

Prázdný výsledek **neznamená, že web nikdo nenavštívil.** Může chybět měřicí kód
Leady na webu kanceláře, data se ještě nenačetla, nebo firma nebyla rozpoznána.
Napiš to uživateli místo závěru „žádné návštěvy".

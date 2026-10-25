# Leady — které firmy navštívily web kanceláře

Referenční list ke konektoru `leady` — oficiální MCP server Saleskitu
(`https://mcp.saleskit.com/leady/`). Leady podle IP adresy odhaduje, **která firma**
web kanceláře navštívila, které stránky si prohlížela a jak dlouho.

**Přihlášení:** OAuth, jako u Merku. Uživatel konektor v Claude připojí tlačítkem
Connect a přihlásí se svým účtem Saleskit. Není-li připojený, napiš to a nic
nedomýšlej.

## Nástroje

- `resources_list_resources` — sledované weby (`domain`); volej jako první.
- `sessions_list_sessions(domain, session_type="company")` — návštěvy firem,
  bez data za posledních 30 dní (`period_start`/`period_end`). **Vždy
  `session_type="company"`.**
- `sessions_list_session_actions` — které stránky si návštěva prohlížela.
- `companies_get_details` — detail firmy z návštěvy (`company_id` + `secure_token`
  z výsledku návštěv; podle IČO ho nejde zavolat).
- `saved_filters_list_saved_filters`, `saved_filters_get_saved_filter`,
  `labels_list_labels`, `enums_get_magnitudes`, `enums_get_turnovers`,
  `blacklists_list_blacklist` —
  uložené filtry, štítky a číselníky, jen pro čtení. Uložený filtr použij jen
  s `session_type="company"`; filtr nad osobami nepoužívej.
- `labels_bulk_assign_to_companies` / `labels_bulk_unassign_from_companies` **mění
  data v Saleskitu — nepoužívej**; štítky ať uživatel mění v aplikaci Saleskit.
- `persons_get_details` a návštěvy s `session_type="person"` **nepoužívej** (viz níže).
- Údaje typu `csv_secret` z `resources_list_resources` jsou přístupové tajemství —
  nikdy je nevypisuj.

## Jen firmy, nikdy osoby

- Leady umí kromě firem rozpoznat i **osoby** (s profily na sociálních sítích).
  To kancelář nepoužívá: návštěvy osob nečti a nevypisuj, i kdyby uživatel chtěl.
- Firmy nikdy netvrď ani nenaznačuj, **kdo** z nich web navštívil.
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

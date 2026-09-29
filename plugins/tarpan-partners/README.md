# TARPAN Partners

Balíček pro kancelář. Zatím obsahuje základ TARPAN — veřejné rejstříky,
katastr nemovitostí, ekonomiku firem z Merku a výpisy do Wordu; kancelářské
skilly přibudou.

```
/plugin install tarpan-partners@tarpan
```

Základ (`tarpan`) se doinstaluje sám jako závislost, takže po instalaci máte
konektory `tarpan-ares`, `tarpan-katastr`, `Sagasu` a `tarpan-merk` a skilly:

| Skill | K čemu |
|---|---|
| `tarpan` | rejstříky, katastr, Merk, výpočty, výpisy do Wordu, prověrka protistrany |
| `rukopis` | přepis textu od Clauda do stylu uživatele, bez stop po AI |
| `remove-ai-marks` | odstranění neviditelných znaků a metadat ze souboru před odesláním |

## Proč existuje samostatný balíček

Kancelář a advokáti potřebují jiné nástroje. Advokátní balíček **TARPAN Legal**
přidává judikaturu a znění předpisů (`Salvia`, `esbirka`) a metodiku právní
rešerše — pro kancelář je to zbytečná zátěž a Claude by nabízel postupy, které
sem nepatří.

Tenhle balíček je proti základu zatím prázdný: instaluje se kvůli tomu, aby
kancelářské skilly, které sem přibudou, dotekly automatickou aktualizací a nikdo
nemusel nic instalovat znovu.

## Co sem patří

Kancelářské skilly a konektory — šablony a výstupy pro provoz kanceláře,
hromadné výpisy, evidence. Právní metodika a prameny práva patří do
`tarpan-legal`, obecná práce s rejstříky do základu `tarpan`.

# TARPAN Partners

Balíček pro kancelář. Obsahuje celý základ TARPAN — veřejné rejstříky, katastr
nemovitostí, výpisy do Wordu a metodiku prověrky protistrany.

```
/plugin install tarpan-partners@tarpan
```

Základ (`tarpan`) se doinstaluje sám jako závislost, takže po instalaci máte
konektory `tarpan-ares`, `tarpan-katastr` a `Sagasu` a skill `tarpan`.

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

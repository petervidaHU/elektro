---
title: Ohm törvénye
summary: A feszültség, az áram és az ellenállás kapcsolata, a törvény három alakja, és kidolgozott példák a számításukra.
---

:::goals
- Fel tudod írni Ohm törvényét mindhárom alakjában.
- Ki tudod számítani az áramot, a feszültséget vagy az ellenállást a másik kettőből.
- Helyesen kezeled a mértékegységeket és az előtagokat (mA, kΩ, kV).
- Megérted, mit jelent a törvény egy fogyasztó viselkedésére.
:::

## A törvény

Egy fogyasztón átfolyó áram egyenesen arányos a rá kapcsolt feszültséggel, és fordítottan arányos az ellenállásával. Ez **Ohm törvénye**:

`U = R · I`

- U: a fogyasztó kapcsain lévő feszültség, V,
- R: a fogyasztó ellenállása, Ω,
- I: a fogyasztón átfolyó áram, A.

Ugyanez átrendezve:

`I = U / R`

`R = U / I`

Szavakkal: kétszer akkora feszültség kétszer akkora áramot hajt át ugyanazon az ellenálláson. Kétszer akkora ellenálláson ugyanaz a feszültség fele akkora áramot hajt át.

**Segítség a megjegyzéshez:** rajzolj egy háromszöget. Felül az U, alul egymás mellett az R és az I. Takard le azt, amit keresel: ami megmarad, az a képlet. U-t letakarva R · I marad, I-t letakarva U / R, R-t letakarva U / I.

## Mértékegységek és előtagok

Ohm törvénye csak akkor ad helyes eredményt, ha a mennyiségeket **alapegységben** (V, A, Ω) helyettesíted be, vagy következetesen használod az előtagokat. A leggyakoribb átváltások:

- 1 mA = 0,001 A, tehát 250 mA = 0,25 A,
- 1 kΩ = 1000 Ω, tehát 4,7 kΩ = 4700 Ω,
- 1 kV = 1000 V, 1 mV = 0,001 V.

Ha a feszültséget V-ban és az ellenállást kΩ-ban helyettesíted be, az áramot mA-ben kapod: 12 V / 4 kΩ = 3 mA.

## Kidolgozott példák

:::example
**Áram számítása.** Egy fűtőbetét ellenállása 46 Ω, 230 V-ra kapcsoljuk. Mekkora áram folyik rajta?

1. Adatok: U = 230 V, R = 46 Ω.
2. I = U / R = 230 V / 46 Ω = 5 A.
:::

:::example
**Ellenállás számítása.** Egy 12 V-os lámpán 0,5 A áram folyik. Mekkora az ellenállása üzem közben?

1. Adatok: U = 12 V, I = 0,5 A.
2. R = U / I = 12 V / 0,5 A = 24 Ω.
:::

:::example
**Feszültség számítása.** Egy 6 Ω-os ellenálláson 2 A áram folyik. Mekkora feszültség esik rajta?

1. Adatok: R = 6 Ω, I = 2 A.
2. U = R · I = 6 Ω · 2 A = 12 V.
:::

:::example
**Előtaggal.** Egy 2,2 kΩ-os ellenálláson 11 V feszültség van. Mekkora az áram?

1. Átváltás: R = 2,2 kΩ = 2200 Ω.
2. I = U / R = 11 V / 2200 Ω = 0,005 A = 5 mA.
:::

## Mit jelent ez a gyakorlatban?

- **Nagyobb feszültség nagyobb áramot hajt át** ugyanazon a fogyasztón. Ezért veszélyesebb a 400 V, mint a 230 V: ugyanazon a testellenálláson nagyobb áramot hajt át.
- **Kisebb ellenálláson nagyobb áram folyik.** A rövidzárnál az ellenállás közel nulla, ezért az áram nagyon nagy lesz.
- **A vezetéken is esik feszültség.** A vezetéknek is van ellenállása, ezért a rajta átfolyó áram hatására `U = R · I` feszültség esik rajta. Ez a **feszültségesés**, amelyet a méretezés modulban számolsz.

:::mistake
Rossz mértékegység: 230 V / 4,7 kΩ ≠ 48,9 A. Ha a kΩ-ot nem váltod át, ezerszer nagyobb áramot kapsz. Helyesen: 230 V / 4700 Ω ≈ 0,049 A = 49 mA.
:::

:::exam
Az ágazati alapvizsgán Ohm törvényével számolsz áramot, feszültséget és ellenállást, gyakran mA-ben és kΩ-ban megadott adatokkal. Mindig írd ki a mértékegységet az eredmény mellé.
:::

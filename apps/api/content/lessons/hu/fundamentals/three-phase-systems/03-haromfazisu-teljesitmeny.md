---
title: Háromfázisú teljesítmény
summary: A szimmetrikus háromfázisú fogyasztó hatásos, meddő és látszólagos teljesítménye, és a vonali áram kiszámítása a teljesítményből.
verify:
  - "P = √3·U_v·I_v·cos φ, Q = √3·U_v·I_v·sin φ, S = √3·U_v·I_v – Wikipedia: Three-phase electric power"
  - "Példák (11 kW, cos φ 0,85 → 18,68 A; 7,5 kW motor η 0,88 cos φ 0,82 → 15,0 A) – számított értékek; a motoradatok szemléltető értékek"
---

:::goals
- Ki tudod számítani egy szimmetrikus háromfázisú fogyasztó teljesítményét a vonali feszültségből és áramból.
- Ki tudod számítani a vonali áramot a teljesítményből.
- Figyelembe tudod venni a motor hatásfokát az áram kiszámításakor.
- Tudod, miért ugyanaz a képlet csillag- és deltakapcsolásra.
:::

## A teljesítmény képlete

Szimmetrikus terhelésnél a három fázis teljesítménye egyforma, az összteljesítmény egy fázis teljesítményének háromszorosa:

`P = 3 · U_f · I_f · cos φ`

A gyakorlatban a **vonali** mennyiségeket ismered: a hálózat vonali feszültségét (400 V) és a vezetékben folyó vonali áramot, ezt méri a lakatfogó. Ezekkel kifejezve:

`P = √3 · U_v · I_v · cos φ`

A képlet **mindkét kapcsolásra ugyanaz**:

- csillagban `U_f = U_v / √3` és `I_f = I_v`, tehát `3 · (U_v / √3) · I_v = √3 · U_v · I_v`,
- deltában `U_f = U_v` és `I_f = I_v / √3`, tehát `3 · U_v · (I_v / √3) = √3 · U_v · I_v`.

A meddő és a látszólagos teljesítmény ugyanígy:

- `Q = √3 · U_v · I_v · sin φ` (var),
- `S = √3 · U_v · I_v` (VA),
- `S² = P² + Q²` és `cos φ = P / S`, ugyanúgy, mint egyfázisú körben.

## A vonali áram kiszámítása

A vezeték és a védelem méretezéséhez a vonali áramot kell tudnod. A teljesítményképletből:

`I_v = P / (√3 · U_v · cos φ)`

:::example
Egy háromfázisú fogyasztó felvett hatásos teljesítménye 11 kW, cos φ = 0,85, a hálózat 400 V-os. Mekkora a vonali áram?

1. √3 · U_v · cos φ = 1,732 · 400 V · 0,85 ≈ 588,9 V.
2. I_v = 11 000 W / 588,9 V ≈ 18,68 A.
:::

:::example
Ellenőrizd az előző lecke deltába kötött fűtőkészülékét (U_v = 400 V, I_v = 15,06 A, cos φ = 1).

1. P = √3 · 400 V · 15,06 A · 1 ≈ 10 434 W.
2. Ez a kerekítésen belül megegyezik a fázisonként számított 10 435 W-tal.
:::

## Motorok áramfelvétele

A motor adattábláján a **tengelyen leadott** mechanikai teljesítmény szerepel. A hálózatból felvett villamos teljesítmény ennél nagyobb:

`P_fel = P_le / η`

Az áramfelvétel tehát:

`I_v = P_le / (√3 · U_v · cos φ · η)`

:::example
Egy motor adattábláján: P = 7,5 kW, 400 V, cos φ = 0,82, η = 88 %. Mekkora a hálózatból felvett vonali áram?

1. P_fel = 7500 W / 0,88 ≈ 8523 W.
2. I_v = 8523 W / (1,732 · 400 V · 0,82) = 8523 / 568,1 ≈ 15,0 A.
:::

Az adattáblán a névleges áram is szerepel; a számított értéknek ezzel meg kell egyeznie. Ha egy működő motor mért árama jóval nagyobb a névlegesnél, a motor túlterhelt, vagy hibás (például egy fázisa kiesett).

## Egyfázisú és háromfázisú csatlakozás összevetése

Ugyanakkora teljesítményhez háromfázisú csatlakozásnál fázisonként jóval kisebb áram kell.

:::example
Egy 11 kW-os, cos φ = 1 fogyasztó árama:

1. egyfázisan 230 V-ról: I = 11 000 W / 230 V ≈ 47,8 A,
2. háromfázisan 400 V-ról: I_v = 11 000 W / (1,732 · 400 V) ≈ 15,9 A vezetőnként.
:::

Ezért köti a villanyszerelő a nagy teljesítményű fogyasztókat (tűzhely, átfolyós vízmelegítő, hőszivattyú, elektromos autó töltő) háromfázisra: kisebb keresztmetszet, kisebb feszültségesés és egyenletesebb fázisterhelés érhető el.

:::mistake
Gyakori hiba, hogy a vonali feszültség (400 V) mellé a √3 helyett 3-as szorzót írnak: `P = 3 · 400 V · I · cos φ`. A 3-as szorzó csak a **fázis**mennyiségekkel (`3 · U_f · I_f · cos φ`) helyes.
:::

:::exam
A vizsga III. részében gyakori feladat: háromfázisú motor vonali áramának kiszámítása az adattábla teljesítményéből, cos φ-ből és hatásfokából.
:::

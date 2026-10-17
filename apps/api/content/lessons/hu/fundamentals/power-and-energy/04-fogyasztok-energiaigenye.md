---
title: Fogyasztók teljesítmény- és energiaigénye
summary: Hogyan számoljuk ki több fogyasztó együttes teljesítményét, napi és havi energiaigényét, és a terhelő áramot egyfázisú áramkörben.
---

:::goals
- Ki tudod számítani több fogyasztó összteljesítményét.
- Ki tudod számítani egy lakás vagy egy áramkör napi és havi energiaigényét.
- Ki tudod számítani egyfázisú áramkör terhelő áramát a teljesítményből.
- Megérted az egyidejűség szerepét a méretezésben.
:::

## Összteljesítmény

Párhuzamosan kapcsolt fogyasztóknál (a lakásban minden fogyasztó ilyen) az **összteljesítmény a teljesítmények összege**:

`P_össz = P₁ + P₂ + P₃ + …`

Ez abból következik, hogy az áramok összeadódnak, a feszültség pedig közös.

## Terhelő áram egyfázisú áramkörben

A **terhelő áram** (jele **I_b**) az az áram, amely az áramkörben üzem közben folyik. Ebből indul ki a vezeték és a védelem méretezése. Ohmos fogyasztóknál (cos φ = 1):

`I_b = P / U`

- I_b: terhelő áram, A,
- P: az egyidejűleg működő fogyasztók összteljesítménye, W,
- U: a névleges feszültség, egyfázisú hálózatban 230 V.

Motoros és más, nem tisztán ohmos fogyasztóknál a teljesítménytényezővel is számolni kell (`I = P / (U · cos φ)`), ezt a váltakozó áramú teljesítménynél tanulod. A háromfázisú terhelő áramot a háromfázisú teljesítménynél tanulod.

:::example
Egy konyhai áramkörön egyszerre működik: sütő 3000 W, mosogatógép 2200 W, világítás 300 W, hűtőszekrény 150 W. Mekkora az összteljesítmény és a terhelő áram? (ohmos terhelésnek tekintjük)

1. P_össz = 3000 + 2200 + 300 + 150 = 5650 W.
2. I_b = P / U = 5650 W / 230 V ≈ 24,57 A.
3. Ez több, mint amit egy 16 A-es kismegszakítóval védett áramkör tartósan elvisel: a sütőt és a mosogatógépet külön áramkörre kell kötni.
:::

## Energiaigény

Az **energiaigény** az egyes fogyasztók energiájának összege. Minden fogyasztóra külön kiszámolod a `W = P · t` értéket a saját üzemidejével, majd összeadod őket:

`W_össz = P₁ · t₁ + P₂ · t₂ + …`

:::example
Egy lakás napi fogyasztói: hűtőszekrény 150 W, a nap során összesen 8 órát működik; világítás 300 W, 5 órát; mosógép 2000 W, 1 órát; televízió 100 W, 4 órát. Mennyi a napi és a 30 napos havi energiaigény?

1. Hűtő: 0,15 kW · 8 h = 1,2 kWh.
2. Világítás: 0,3 kW · 5 h = 1,5 kWh.
3. Mosógép: 2 kW · 1 h = 2,0 kWh.
4. Televízió: 0,1 kW · 4 h = 0,4 kWh.
5. Napi összesen: 1,2 + 1,5 + 2,0 + 0,4 = 5,1 kWh.
6. Havi: 5,1 kWh · 30 = 153 kWh.
:::

## Az egyidejűség

Egy lakásban ritkán működik minden fogyasztó egyszerre. Ha a beépített (összes) teljesítménnyel méreteznénk, feleslegesen vastag vezetéket és nagy védelmet választanánk. Ezért a tervezésben az **egyidejűségi tényezőt** használjuk:

`P_egyidejű = g · P_beépített`

- g: egyidejűségi tényező (0 és 1 közötti szám). Értékét a tervezési előírások, illetve a feladat adják meg.

:::example
Egy lakás beépített teljesítménye 18 kW, az egyidejűségi tényező a feladat szerint 0,5. Mekkora az egyidejű teljesítmény?

1. P_egyidejű = 0,5 · 18 kW = 9 kW.
:::

**Figyelj:** egy-egy önálló áramkörnél (például egy sütő áramkörénél) mindig a teljes teljesítménnyel számolsz, mert az a fogyasztó bármikor teljes teljesítménnyel működhet.

:::mistake
Az energiaigénynél nem a teljesítményeket adod össze és szorzod egyetlen idővel, hanem minden fogyasztót a **saját** üzemidejével szorzol. A hűtő és a mosógép nem ugyanannyi ideig működik.
:::

:::exam
A központi interaktív vizsga III. részében szerepel a „fogyasztók teljesítmény- és energiaigényének, jellemzőinek meghatározása”. A terhelő áram az alapja a vezeték kiválasztásának, amelyet a méretezés modulban tanulsz.
:::

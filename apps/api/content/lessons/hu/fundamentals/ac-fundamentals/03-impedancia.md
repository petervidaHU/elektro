---
title: Impedancia
summary: Az ellenállás és a reaktancia együttes hatása: az impedancia kiszámítása soros RL-, RC- és RLC-körben, a feszültségháromszög és a teljesítménytényező.
verify:
  - "Z = √(R² + X²), cos φ = R/Z, soros körben U² = U_R² + U_X² – Wikipedia: Electrical impedance"
  - "Soros RLC: X = X_L − X_C, rezonanciánál Z = R – Wikipedia: RLC circuit"
  - "Példa (R = 40 Ω, X_L = 30 Ω → Z = 50 Ω, I = 4,6 A, cos φ = 0,8, φ = 36,87°) – számított értékek"
---

:::goals
- Ki tudod számítani egy soros RL-, RC- vagy RLC-kör impedanciáját.
- Meg tudod határozni az áramot, a részfeszültségeket és a fázisszöget.
- Megérted, miért nem adódnak össze számtanilag a részfeszültségek váltakozó áramon.
- Tudod, mit jelent a teljesítménytényező (cos φ).
:::

## Mi az impedancia?

A valóságos fogyasztók egyszerre tartalmaznak ohmos ellenállást és reaktanciát. Egy motor tekercsének van huzalellenállása (R) és induktív reaktanciája (X_L) is. A kettő együttes, áramot korlátozó hatása az **impedancia** (látszólagos ellenállás), jele **Z**, mértékegysége az **ohm (Ω)**.

Ohm törvénye váltakozó áramon az impedanciával érvényes:

`I = U / Z`

Az R és az X **nem adható össze egyszerűen**, mert az ohmos ellenálláson eső feszültség fázisban van az árammal, a reaktancián eső feszültség viszont 90°-kal eltér tőle. A két mennyiség derékszögű háromszöget alkot.

## Soros RL-kör

Soros körben minden elemen ugyanaz az áram folyik. Az impedancia a Pitagorasz-tétel szerint:

`Z = √(R² + X_L²)`

A részfeszültségek:

- az ellenálláson: `U_R = I · R` (fázisban az árammal),
- a tekercsen: `U_L = I · X_L` (90°-kal siet az áramhoz képest).

A tápfeszültség a két részfeszültség **vektoros** összege:

`U = √(U_R² + U_L²)`

[Ábra: feszültségháromszög. Vízszintes befogó U_R, függőleges befogó U_L, átfogó U; az U_R és U közötti szög φ. Mellette az impedanciaháromszög: R, X_L, Z.]

:::example
Egy soros RL-kör adatai: R = 40 Ω, X_L = 30 Ω, U = 230 V, 50 Hz.

1. Z = √(40² + 30²) = √(1600 + 900) = √2500 = 50 Ω.
2. I = U / Z = 230 V / 50 Ω = 4,6 A.
3. U_R = I · R = 4,6 A · 40 Ω = 184 V.
4. U_L = I · X_L = 4,6 A · 30 Ω = 138 V.
5. Ellenőrzés: √(184² + 138²) = √(33 856 + 19 044) = √52 900 = 230 V.
6. cos φ = R / Z = 40 / 50 = 0,8, ebből φ ≈ 36,87°. Az áram 36,87°-ot késik a feszültséghez képest.
:::

Figyeld meg: U_R + U_L = 184 V + 138 V = 322 V, ami **több**, mint a 230 V-os tápfeszültség. Ez nem hiba: a két részfeszültség nem egyszerre éri el a csúcsát, ezért csak vektorosan adhatók össze.

## Soros RC-kör

Ugyanígy számolsz, csak X_L helyett X_C áll:

`Z = √(R² + X_C²)`

A különbség a fázisszög irányában van: RC-körben az áram **siet** a feszültséghez képest.

:::example
Egy soros RC-kör adatai: R = 300 Ω, C = 10 µF, U = 230 V, 50 Hz.

1. X_C = 1 / (2 · π · 50 · 0,00001) ≈ 318,3 Ω.
2. Z = √(300² + 318,3²) = √(90 000 + 101 321) = √191 321 ≈ 437,4 Ω.
3. I = 230 V / 437,4 Ω ≈ 0,526 A.
4. cos φ = 300 / 437,4 ≈ 0,686, ebből φ ≈ 46,7°. Az áram 46,7°-ot siet.
:::

## Soros RLC-kör

Ha a körben ellenállás, tekercs és kondenzátor is van, a tekercs és a kondenzátor feszültsége egymással **ellentétes fázisú**, ezért a két reaktancia kivonódik egymásból. Az eredő reaktancia `X = X_L − X_C`, az impedancia:

`Z = √(R² + (X_L − X_C)²)`

Ha X_L > X_C, a kör induktív jellegű (az áram késik), ha X_C > X_L, kapacitív jellegű (az áram siet).

:::example
Egy soros RLC-kör adatai: R = 40 Ω, X_L = 60 Ω, X_C = 30 Ω, U = 230 V.

1. X = X_L − X_C = 60 Ω − 30 Ω = 30 Ω (induktív).
2. Z = √(40² + 30²) = 50 Ω.
3. I = 230 V / 50 Ω = 4,6 A.
4. U_L = 4,6 A · 60 Ω = 276 V, U_C = 4,6 A · 30 Ω = 138 V.
:::

Az U_L itt nagyobb, mint a tápfeszültség. Ha X_L = X_C, a két reaktancia kioltja egymást, Z = R, és az áram a legnagyobb. Ez a **soros rezonancia**; ilyenkor a tekercsen és a kondenzátoron a tápfeszültség többszöröse is megjelenhet.

## Fázisszög és teljesítménytényező

A **φ (fí)** fázisszög megmutatja, mennyivel tér el egymástól az áram és a feszültség. Ennek koszinusza a **teljesítménytényező**:

`cos φ = R / Z = U_R / U`

- cos φ = 1: tisztán ohmos fogyasztó (fűtés, izzólámpa).
- cos φ < 1, induktív: motorok, transzformátorok, fojtótekercses fénycsőelőtét. Az áram késik.
- cos φ < 1, kapacitív: kondenzátoros körök. Az áram siet.

Minél kisebb a cos φ, annál nagyobb áram kell ugyanakkora hasznos teljesítményhez. Ennek a teljesítményszámításban van jelentősége, ezt a következő leckében tanulod.

:::mistake
A leggyakoribb hiba váltakozó áramon a részfeszültségek vagy az R és X **számtani** összeadása. Soros körben az impedanciát és a tápfeszültséget mindig a négyzetes összeggel számítsd: `Z = √(R² + X²)`.
:::

:::exam
A vizsga III. részében tipikus feladat: soros RL-kör impedanciája, árama, részfeszültségei és cos φ értéke adott R, L és U mellett.
:::

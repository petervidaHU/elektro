---
title: Villamos teljesítmény
summary: A villamos teljesítmény fogalma, három képlete, a watt és a kilowatt, és számítások háztartási fogyasztókra.
verify:
  - "A háztartási készülékek felsorolt teljesítménytartományai (LED-izzó 5–15 W, hűtő 100–200 W, mosógép fűtéskor kb. 2000 W, vízforraló 2000–2200 W, sütő 2500–3500 W) szemléltető, jellemző értékek, nem forrásból vettek"
---

:::goals
- Meg tudod határozni a villamos teljesítmény fogalmát és mértékegységét.
- Fel tudod írni a teljesítmény három képletét, és tudod, melyiket mikor érdemes használni.
- Ki tudod számítani egy fogyasztó áramát és ellenállását a névleges adataiból.
- Megérted, mi történik, ha egy fogyasztót a névlegestől eltérő feszültségre kapcsolsz.
:::

## Mi a teljesítmény?

A **teljesítmény** megmutatja, mennyi energiát alakít át egy fogyasztó egységnyi idő alatt. Jele **P**, mértékegysége a **watt (W)**. Egy fogyasztó teljesítménye 1 W, ha másodpercenként 1 J energiát alakít át:

`1 W = 1 J / 1 s`

Gyakori előtagok: 1 kW (kilowatt) = 1000 W, 1 MW (megawatt) = 1 000 000 W.

## A három képlet

Egyenáramon és ohmos (tisztán ellenállás jellegű) fogyasztónál a teljesítmény:

`P = U · I`

Ohm törvényét (`U = R · I`, `I = U / R`) behelyettesítve még két alakot kapunk:

`P = I² · R`

`P = U² / R`

- P: teljesítmény, W,
- U: a fogyasztó feszültsége, V,
- I: a fogyasztó árama, A,
- R: a fogyasztó ellenállása, Ω.

Melyiket mikor használd?

- `P = U · I`: ha a feszültséget és az áramot ismered.
- `P = I² · R`: ha az áramot és az ellenállást ismered. Ezzel számolod a **vezeték veszteségét** is: a vezetéken átfolyó áram négyzetével arányos hő keletkezik.
- `P = U² / R`: ha a feszültséget és az ellenállást ismered, például egy fűtőbetét ellenállásából.

A váltakozó áramú, nem tisztán ohmos fogyasztók (például motorok) teljesítményéhez a `cos φ` teljesítménytényező is kell. Ezt a váltakozó áramú teljesítménynél tanulod.

## Kidolgozott példák

:::example
Egy vízforraló adattábláján 230 V, 2000 W áll. Mekkora az árama és az ellenállása?

1. Áram: I = P / U = 2000 W / 230 V ≈ 8,70 A.
2. Ellenállás: R = U² / P = (230 V)² / 2000 W = 52 900 / 2000 = 26,45 Ω.
3. Ellenőrzés: P = I² · R = 8,70² · 26,45 ≈ 2002 W (a kerekítés miatt nem pontosan 2000). ✓
:::

:::example
Egy 100 Ω-os ellenálláson 2 A áram folyik. Mekkora a teljesítménye?

1. P = I² · R = (2 A)² · 100 Ω = 4 · 100 = 400 W.
:::

:::example
A 26,45 Ω-os vízforralót 207 V-ra kapcsoljuk (a névleges feszültség 90 %-a). Mekkora a teljesítménye?

1. P = U² / R = (207 V)² / 26,45 Ω = 42 849 / 26,45 ≈ 1620 W.
2. A feszültség 10 %-os csökkenése a teljesítményt kb. 19 %-kal csökkentette, mert a teljesítmény a feszültség **négyzetével** arányos.
:::

## Mit jelent ez a gyakorlatban?

- **A névleges teljesítmény** csak a **névleges feszültségen** érvényes. Kisebb feszültségen az ohmos fogyasztó teljesítménye a feszültség négyzetével csökken. Ezért fontos, hogy a vezetéken ne essen túl nagy feszültség.
- **A vezeték vesztesége az áram négyzetével nő.** Kétszer akkora áramnál négyszer akkora hő keletkezik a vezetékben. Ezért kell nagyobb keresztmetszet nagyobb áramhoz.
- **A kismegszakító áramot figyel, nem teljesítményt.** Egy 16 A-es kismegszakítóval védett 230 V-os áramkörre legfeljebb `230 V · 16 A = 3680 W` ohmos terhelés köthető tartósan.

Néhány jellemző háztartási teljesítmény: LED-izzó 5–15 W, hűtőszekrény 100–200 W, mosógép fűtéskor kb. 2000 W, vízforraló 2000–2200 W, villanysütő 2500–3500 W. A pontos értéket mindig a készülék adattáblája adja meg.

:::mistake
`P = U² / R`-nél a feszültség négyzetét kell venni: 230² = 52 900, nem 460. Számológépen először a négyzetre emelést végezd el, csak utána az osztást.
:::

:::exam
A vizsga III. részében a fogyasztók teljesítményének és áramának kiszámítása gyakori feladat, többnyire az adattábla adataiból.
:::

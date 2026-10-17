---
title: Villamos munka és energia
summary: A villamos munka kiszámítása, a kilowattóra, a fogyasztásmérő szerepe, és az energiaköltség számítása.
verify:
  - "1 kWh = 3,6 MJ (1000 W · 3600 s) – SI-átváltás"
---

:::goals
- Ki tudod számítani a villamos munkát a teljesítményből és az időből.
- Át tudsz váltani joule, wattóra és kilowattóra között.
- Ismered a fogyasztásmérő feladatát és leolvasását.
- Ki tudod számítani egy fogyasztó napi, havi energiafogyasztását és költségét.
:::

## A villamos munka

A **villamos munka** (energia) az az energia, amelyet a fogyasztó egy adott idő alatt átalakít. Jele **W**:

`W = P · t`

- W: villamos munka, energia,
- P: a fogyasztó teljesítménye,
- t: az idő.

A mértékegység attól függ, milyen egységben számolsz:

- P wattban, t másodpercben: W **joule**-ban (J), `1 J = 1 W · 1 s`,
- P wattban, t órában: W **wattórában** (Wh),
- P kilowattban, t órában: W **kilowattórában** (kWh).

A gyakorlatban a **kilowattórát** használjuk. Átváltás: `1 kWh = 1000 W · 3600 s = 3 600 000 J = 3,6 MJ`.

Egy kilowattóra például: egy 1000 W-os fogyasztó egy órán át, egy 2000 W-os fél órán át, vagy egy 10 W-os LED-izzó 100 órán át.

## A fogyasztásmérő

A **fogyasztásmérő** (villanyóra) a felhasznált villamos energiát méri kWh-ban. Az áramszolgáltató ez alapján számláz.

- A régi **indukciós** mérőkben egy alumíniumtárcsa forog. A fordulatszáma a teljesítménnyel arányos, a számlálója a fordulatokat összegzi.
- A mai **elektronikus** és **okos** mérők digitálisan mérik a feszültséget és az áramot, és kijelzőn mutatják az energiát. Az okos mérő távolról is leolvasható.

A felhasznált energia két leolvasás különbsége:

`W = mérőállás_új − mérőállás_régi`

Háromfázisú mérő mindhárom fázis energiáját összegzi. A mérőhely kialakítását a szerelés modulban tanulod.

## Energia és költség számítása

A költség az energia és az egységár (tarifa) szorzata:

`Költség = W · tarifa`

- W: energia, kWh,
- tarifa: Ft/kWh. **Az értékét mindig a feladat adja meg**, mert a tarifa szolgáltatónként és időszakonként változik.

:::example
Egy 2000 W-os vízforralót naponta 15 percig használnak. Mennyi energiát fogyaszt egy 30 napos hónapban, és mennyibe kerül, ha a tarifa 40 Ft/kWh?

1. Átváltás: P = 2000 W = 2 kW, t = 15 perc = 0,25 h naponta.
2. Napi energia: W_nap = 2 kW · 0,25 h = 0,5 kWh.
3. Havi energia: W_hó = 0,5 kWh · 30 = 15 kWh.
4. Költség: 15 kWh · 40 Ft/kWh = 600 Ft.
:::

:::example
A mérő állása a hónap elején 12 345,6 kWh, a végén 12 598,1 kWh. Mennyi a havi fogyasztás?

1. W = 12 598,1 kWh − 12 345,6 kWh = 252,5 kWh.
:::

:::example
Egy 9 W-os LED-izzó és egy 60 W-os hagyományos izzó napi 5 órát világít. Mennyi energiát takarít meg a LED egy év (365 nap) alatt?

1. A teljesítménykülönbség: 60 W − 9 W = 51 W = 0,051 kW.
2. Napi megtakarítás: 0,051 kW · 5 h = 0,255 kWh.
3. Éves megtakarítás: 0,255 kWh · 365 = 93,075 kWh ≈ 93,1 kWh.
:::

## Teljesítmény vagy energia?

A két fogalmat gyakran összekeverik:

- A **teljesítmény** (W, kW) azt mutatja, **milyen gyorsan** használja az energiát a fogyasztó. Ez határozza meg az áramot, és ezen keresztül a vezeték és a kismegszakító méretezését.
- Az **energia** (kWh) azt mutatja, **mennyit** használt el összesen. Ezért fizetünk.

Egy nagy teljesítményű, de rövid ideig működő vízforraló kevesebb energiát fogyaszthat, mint egy kis teljesítményű, de folyamatosan működő hűtő.

:::mistake
A percet órába kell váltani, mielőtt kWh-t számolsz: 15 perc = 0,25 h, nem 0,15 h. Az átváltás: perc / 60.
:::

:::exam
A vizsga III. részében a fogyasztók energiaigényének és az energiaköltségnek a kiszámítása tipikus feladat. A tarifát a feladat megadja.
:::

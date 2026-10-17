---
title: Világítástechnikai alapfogalmak
summary: A fényáram, a megvilágítás (E = Φ / A), a színhőmérséklet, a színvisszaadás és a fényhasznosítás.
verify:
  - "A fényáram (lumen), a megvilágítás (lux) és az E = Φ / A összefüggés – fizikai alapismeret"
  - "A színhőmérséklet (kelvin) és a színvisszaadási index (CRI) fogalma – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: ajánlott megvilágítási értékek helyiségtípusonként – MSZ EN 12464-1; az oktatónak kell kiegészítenie"
---

:::goals
- Ismered a fényáram, a megvilágítás és a fényhasznosítás fogalmát.
- Ki tudod számítani a megvilágítást a fényáramból és a területből.
- Tudod, mit jelent a színhőmérséklet és a színvisszaadás.
:::

## Fényáram

A **fényáram** (jele: Φ) azt mutatja meg, mennyi fényt bocsát ki a fényforrás **összesen**. Mértékegysége a **lumen** (lm). Minél nagyobb a lumen, annál több fényt ad a lámpa. A lámpa csomagolásán ez az érték szerepel, és a teljesítmény (watt) önmagában nem mutatja meg, mennyire fényes a lámpa.

## Megvilágítás

A **megvilágítás** (jele: E) azt adja meg, mennyi fény jut a megvilágított **felület** egységnyi területére. Mértékegysége a **lux** (lx). Számítása:

`E = Φ / A`

- E: a megvilágítás, lx,
- Φ: a felületre jutó fényáram, lm,
- A: a megvilágított terület, m².

:::example
Egy 20 m²-es helyiségbe a lámpatestek összesen 3000 lm fényáramot juttatnak a felületre.

`E = 3000 / 20 = 150 lx`

::calculator{id="illuminance" flux=3000 area=20}
:::

A megvilágítás attól függ, mekkora a fényáram, és mekkora felületen oszlik el. Ugyanaz a lámpa kisebb helyiségben nagyobb megvilágítást ad. A munkavégzéshez szükséges megvilágítás a feladattól függ: finom munkához több, folyosón kevesebb kell.

## Fényhasznosítás

A **fényhasznosítás** azt mutatja meg, **mennyi fényt ad** a lámpa a felvett villamos teljesítményéhez képest: lumen per watt (lm/W). Minél nagyobb, annál energiatakarékosabb a fényforrás. A hagyományos izzó rossz fényhasznosítású, mert a teljesítmény nagy része hővé alakul; a LED-es fényforrások sokkal jobbak.

## Színhőmérséklet

A **színhőmérséklet** (kelvin, K) a fény színét jellemzi:

- **Alacsony** színhőmérséklet: **meleg**, sárgás-vöröses fény (lakóterek).
- **Közepes**: semleges fehér.
- **Magas**: **hideg**, kékes-fehér fény (irodák, műhelyek).

Ez a fény hangulatát és hatását adja meg, nem a fényerőt.

## Színvisszaadás

A **színvisszaadási index** (CRI vagy Ra) azt mutatja, mennyire **hűen** adja vissza a fényforrás a megvilágított tárgyak színét a természetes fényhez képest. Minél közelebb van a maximumhoz, annál hűbbek a színek. Olyan helyen, ahol a színek megkülönböztetése fontos (például kábelerek színe, festés), jó színvisszaadású fényforrás kell.

:::mistake
„A nagyobb teljesítményű lámpa fényesebb." Nem feltétlenül: a LED-lámpa kisebb teljesítménnyel is nagyobb fényáramot adhat, mint egy izzó. A fényességet a lumen mutatja, nem a watt.
:::

:::exam
A vizsgán a világítástechnikai fogalmak (fényáram, megvilágítás, fényhasznosítás) és az `E = Φ / A` összefüggés szerepel. A kívánt megvilágítást a feladat adja meg.
:::

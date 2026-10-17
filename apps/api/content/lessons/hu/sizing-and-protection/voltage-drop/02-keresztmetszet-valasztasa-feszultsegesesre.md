---
title: Keresztmetszet választása feszültségesésre
summary: Hogyan számítod ki a megengedett feszültségesésből a szükséges legkisebb keresztmetszetet, hogyan kerekítesz a szabványos sorra, és hogyan ellenőrzöd a választott vezetéket.
verify:
  - "Szabványos névleges keresztmetszetek: 1,5; 2,5; 4; 6; 10; 16; 25; 35; 50; 70; 95; 120; 150; 185; 240; 300 mm² – MSZ EN 60228 (packages/shared/src/reference/conductors.ts)"
  - "Réz fajlagos ellenállása üzemi hőmérsékleten 0,0225 Ω·mm²/m – MSZ HD 60364-5-52, G melléklet (packages/shared/src/reference/conductors.ts)"
  - "HIÁNYZIK: a megengedett feszültségesés szabványos értékei (MSZ HD 60364-5-52, G melléklet); a lecke példái a feladatban megadott értékkel számolnak"
  - "Példák (3,91 mm² → 4 mm², 6,75 V = 2,93 %; 4,64 mm² → 6 mm², 6,19 V = 1,55 %) – számított értékek"
---

:::goals
- Ki tudod számítani a megengedett feszültségesést voltban a százalékos értékből.
- Ki tudod számítani a feszültségesés szempontjából szükséges legkisebb keresztmetszetet.
- A számított értéket a szabványos keresztmetszet-sorra kerekíted.
- Ellenőrzöd, hogy a választott vezetéken a feszültségesés a megengedett alatt marad.
:::

## A feladat menete

Az előző leckében adott vezetékre számítottad ki a feszültségesést. A tervezésnél fordított a kérdés: adott a terhelés, a vezeték hossza és a **megengedett** feszültségesés, és azt keresed, **legalább mekkora keresztmetszet** kell. A menet négy lépés:

1. A megengedett feszültségesés kiszámítása voltban.
2. A szükséges legkisebb keresztmetszet kiszámítása.
3. Kerekítés **felfelé** a következő szabványos keresztmetszetre.
4. Ellenőrzés: a választott keresztmetszettel kiszámított feszültségesés nem nagyobb a megengedettnél.

A megengedett feszültségesés százalékos értékét a feladat mindig megadja. Ezzel dolgozz.

## 1. és 2. lépés: megengedett esés és legkisebb keresztmetszet

A százalékos értéket a névleges feszültség segítségével váltod át voltra. Egyfázisú körben a névleges feszültség 230 V, háromfázisúban 400 V:

::formula{id="permitted-voltage-drop"}

A feszültségesés képletét a keresztmetszetre rendezve kapod a szükséges legkisebb keresztmetszetet:

::formula{id="minimum-cross-section"}

- b: egyfázisú körben 2, háromfázisúban √3,
- ρ: fajlagos ellenállás, Ω·mm²/m (ebben a tananyagban réznél 0,0225, alumíniumnál 0,036, az üzemi hőmérsékletre vonatkozó érték),
- L: a vezeték egyirányú hossza, m,
- I: a terhelő áram, A,
- cos φ: a teljesítménytényező,
- ΔUₘₐₓ: a megengedett feszültségesés, V.

## 3. és 4. lépés: kerekítés és ellenőrzés

A számított keresztmetszet szinte sosem esik egybe egy gyártott mérettel. A vezetékek névleges keresztmetszetének szabványos sora:

1,5 – 2,5 – 4 – 6 – 10 – 16 – 25 – 35 – 50 – 70 – 95 – 120 – 150 – 185 – 240 – 300 mm²

Mindig a számított értéknél **nem kisebb**, legközelebbi szabványos méretet választod. 3,1 mm²-ből 4 mm² lesz, nem 2,5 mm².

Az ellenőrzésnél a választott keresztmetszettel újra kiszámítod a feszültségesést:

::formula{id="voltage-drop-direct"}

majd százalékban is:

::formula{id="voltage-drop-percent"}

Ha az eredmény nem nagyobb a megengedettnél, a választás feszültségesésre megfelelő.

## Kidolgozott példák

:::example
Egyfázisú, 230 V-os áramkör, rézvezeték, egyirányú hossz L = 30 m, terhelő áram I = 20 A, cos φ = 1. A feladat szerint a megengedett feszültségesés 3 %, ρ = 0,0225 Ω·mm²/m.

1. ΔUₘₐₓ = 3 · 230 V / 100 = 6,9 V.
2. Sₘᵢₙ = 2 · 0,0225 · 30 · 20 · 1 / 6,9 = 27 / 6,9 ≈ 3,91 mm².
3. A következő szabványos méret: **4 mm²**.
4. Ellenőrzés: ΔU = 2 · 0,0225 · 30 / 4 · 20 · 1 = 6,75 V.
5. ΔU% = 6,75 / 230 · 100 ≈ 2,93 %, ez nem nagyobb 3 %-nál. A 4 mm² feszültségesésre megfelel.
:::

:::example
Háromfázisú, 400 V-os áramkör, rézvezeték, L = 60 m. A fogyasztó 11 kW, cos φ = 0,85. A feladat szerint a megengedett feszültségesés 2 %, ρ = 0,0225 Ω·mm²/m.

1. A terhelő áram: I = 11 000 W / (√3 · 400 V · 0,85) ≈ 18,68 A.
2. ΔUₘₐₓ = 2 · 400 V / 100 = 8 V.
3. Sₘᵢₙ = √3 · 0,0225 · 60 · 18,68 · 0,85 / 8 ≈ 4,64 mm².
4. A következő szabványos méret: **6 mm²**.
5. Ellenőrzés: ΔU = √3 · 0,0225 · 60 / 6 · 18,68 · 0,85 ≈ 6,19 V.
6. ΔU% = 6,19 / 400 · 100 ≈ 1,55 %, ez nem nagyobb 2 %-nál. A 6 mm² megfelel.
:::

A második példában a 4 mm²-es vezetéken az esés 9,28 V, azaz 2,32 % lenne. Ez több a megengedettnél, ezért nem elég.

:::mistake
Gyakori hiba a **lefelé** kerekítés, mert a számított 4,64 mm² „közelebb van” a 4 mm²-hez. A keresztmetszetet mindig felfelé kerekíted: a kisebb vezetéken a feszültségesés a megengedett fölé kerül.
:::

:::safety
A feszültségesésre kiválasztott keresztmetszet még nem a végleges döntés. Ugyanarra a vezetékre ellenőrizni kell a **terhelhetőséget** és a **túláramvédelemmel való összehangolást** is, és a három közül a legnagyobb keresztmetszetet kell választani. Egy hosszú vezetéknél jellemzően a feszültségesés, egy rövidnél a terhelhetőség a döntő.
:::

:::exam
A vizsga III. részében ez a feladat a vezetékválasztás része: a feszültségesésre számított keresztmetszetet a terhelhetőségre kapott értékkel együtt értékeled, és a nagyobbat választod.
:::

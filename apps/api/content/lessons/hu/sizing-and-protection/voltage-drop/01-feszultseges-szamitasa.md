---
title: A feszültségesés számítása
summary: Mitől függ a vezeték feszültségesése, és hogyan számítjuk ki egy- és háromfázisú áramkörben.
verify:
  - "A 20 °C-os réz fajlagos ellenállás (kb. 0,0175 Ω·mm²/m) és a kb. 22 %-os eltérés a tankönyv szerint"
---

:::goals
- Megérted, miért esik feszültség a vezetéken.
- Ki tudod számítani a feszültségesést egy- és háromfázisú áramkörben.
- Százalékban is ki tudod fejezni, és össze tudod vetni a megengedett értékkel.
:::

## Miért esik feszültség a vezetéken?

Minden vezetőnek van ellenállása. Ha áram folyik rajta, Ohm törvénye szerint feszültség esik rajta: ennyivel kisebb feszültség jut el a fogyasztóhoz, mint amekkora a vezeték elején van. Ez a **feszültségesés** (ΔU).

Ha a feszültségesés túl nagy, a fogyasztó nem kapja meg a névleges feszültségét: a motor nehezebben indul, a lámpa halványabban világít, és a vezetéken feleslegesen vész el energia.

## Egy vezető ellenállása

Egy vezető ellenállása az anyagától, a hosszától és a keresztmetszetétől függ:

::formula{id="conductor-resistance"}

- ρ: a vezető anyagának fajlagos ellenállása, Ω·mm²/m (a rézé kisebb, mint az alumíniumé),
- L: a vezeték **egyirányú** hossza, m,
- S: a vezető névleges keresztmetszete, mm².

A hosszabb vezetéknek nagyobb, a vastagabbnak kisebb az ellenállása.

## A feszültségesés képlete

::formula{id="voltage-drop"}

- b: egyfázisú áramkörben 2, mert az áram az egyik vezetőn oda, a másikon vissza folyik; szimmetrikusan terhelt háromfázisú áramkörben √3,
- R: egy vezető ellenállása, Ω,
- I: a terhelő áram, A,
- cos φ: a terhelés teljesítménytényezője (tisztán ohmos terhelésnél 1).

Ez az egyszerűsített számítás csak a vezeték ohmos ellenállását veszi figyelembe. Az épületvillamosságban használt kis keresztmetszeteknél a vezeték reaktanciája elhanyagolható.

A feszültségesést százalékban is megadjuk, a névleges feszültséghez viszonyítva:

::formula{id="voltage-drop-percent"}

Egyfázisú áramkörnél a fázisfeszültséghez (230 V), háromfázisú áramkörnél a vonali feszültséghez (400 V) viszonyítunk.

:::mistake
Az oda-vissza utat a b tényező már tartalmazza. Ha a vezetékhosszt is megduplázod, kétszer számolod ugyanazt.
:::

## Kidolgozott példa

:::example
Egy egyfázisú, 230 V-os áramkör 25 m hosszú, 2,5 mm²-es rézvezetéken 16 A-es ohmos terhelést táplál (cos φ = 1). A réz fajlagos ellenállása a számításban 0,0225 Ω·mm²/m.

1. R = 0,0225 · 25 / 2,5 = 0,225 Ω
2. ΔU = 2 · 0,225 · 16 · 1 = 7,2 V
3. ΔU% = 7,2 / 230 · 100 ≈ 3,13 %
:::

A fajlagos ellenállás attól függ, milyen hőmérsékletre vonatkozik. Ez a tananyag a vezető üzemi hőmérsékletére vonatkozó értéket használja (MSZ HD 60364-5-52, G melléklet). Ha a tankönyvetek a 20 °C-os értékkel (réznél kb. 0,0175 Ω·mm²/m) számol, az eredmény kb. 22 %-kal kisebb lesz. Mindig azzal az értékkel dolgozz, amelyet a feladat megad.

## Megengedett feszültségesés

A kiszámított értéket a megengedett feszültségeséssel kell összevetni. A megengedett érték a tervezési előírásokból és a vonatkozó szabványból következik; a feladatok mindig megadják, mekkora értékkel kell számolnod. Ha a feszültségesés túl nagy, nagyobb keresztmetszetű vezetéket kell választani.

:::safety
A vezeték keresztmetszetét nemcsak a feszültségesés, hanem a vezeték terhelhetősége és a túláramvédelem is meghatározza. A feszültségesés szempontjából megfelelő vezeték is túlmelegedhet, ha a terhelhetőségénél nagyobb áram folyik rajta.
:::

:::exam
A központi interaktív vizsga III. (számítási) részében egy szabványos keresztmetszetű csatlakozó vezetéket kell kiválasztani a feszültségesés és a terhelhetőség alapján. A feszültségesés számításának lépései ugyanezek.
:::

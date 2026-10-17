---
title: A vezető ellenállása
summary: Mitől függ egy vezeték ellenállása, mi a fajlagos ellenállás, mennyiben különbözik a réz és az alumínium, és melyik értékkel számolunk.
verify:
  - "Fajlagos ellenállás 20 °C-on: lágyított réz 0,0172 Ω·mm²/m (IACS: 58 MS/m), alumínium 0,0282 Ω·mm²/m – Wikipedia: Electrical resistivity and conductivity; International Annealed Copper Standard"
  - "Üzemi hőmérsékletre vonatkozó fajlagos ellenállás a feszültségesés számításához: réz 0,0225, alumínium 0,036 Ω·mm²/m – MSZ HD 60364-5-52 G melléklet (az alkalmazás referenciaadata: packages/shared/src/reference/conductors.ts)"
  - "Feladatokban használt kerekített réz-érték 0,0175 Ω·mm²/m (20 °C) – a sizing-and-protection/voltage-drop lecke forrásával egyezik"
---

:::goals
- Fel tudod írni a vezető ellenállásának képletét, és meg tudod magyarázni minden tagját.
- Ismered a réz és az alumínium fajlagos ellenállását 20 °C-on és üzemi hőmérsékleten.
- Ki tudod számítani egy vezeték és egy áramkör hurkának ellenállását.
- Tudod, melyik fajlagos ellenállással kell számolnod egy feladatban.
:::

## Mitől függ a vezeték ellenállása?

Egy vezeték ellenállása három dologtól függ:

- **az anyagától:** a réz jobban vezet, mint az alumínium,
- **a hosszától:** kétszer olyan hosszú vezetéknek kétszer akkora az ellenállása,
- **a keresztmetszetétől:** kétszer akkora keresztmetszetű vezetéknek fele akkora az ellenállása.

Ezt foglalja össze a képlet:

::formula{id="conductor-resistance"}

- R: a vezető ellenállása, Ω,
- ρ: a vezető anyagának **fajlagos ellenállása**, Ω·mm²/m,
- L: a vezető hossza, m,
- S: a vezető keresztmetszete, mm².

A **fajlagos ellenállás** az anyag 1 m hosszú, 1 mm² keresztmetszetű darabjának ellenállása. Anyagjellemző: minden anyagra más, és a hőmérséklettel változik.

A fajlagos ellenállás reciproka a **fajlagos vezetőképesség** (γ): `γ = 1 / ρ`, mértékegysége m/(Ω·mm²). A réz fajlagos vezetőképessége 20 °C-on 58 m/(Ω·mm²).

## A réz és az alumínium

Fajlagos ellenállás **20 °C-on:**

- réz: **0,0172 Ω·mm²/m**,
- alumínium: **0,0282 Ω·mm²/m**.

Fajlagos ellenállás **üzemi hőmérsékleten**, a feszültségesés számításához (MSZ HD 60364-5-52, G melléklet):

- réz: **0,0225 Ω·mm²/m**,
- alumínium: **0,036 Ω·mm²/m**.

Az alumínium fajlagos ellenállása kb. 1,6-szerese a rézének. Azonos ellenálláshoz ezért kb. 1,6-szor nagyobb keresztmetszetű alumíniumvezető kell. Például egy 16 mm²-es rézvezetékkel azonos ellenálláshoz `16 · 0,036 / 0,0225 = 25,6 mm²` alumínium kellene, vagyis a következő nagyobb szabványos keresztmetszet.

**Melyik értékkel számolj?** Ez az alkalmazás a vezetékméretezésnél (feszültségesés) az **üzemi hőmérsékletű** értékkel számol, mert a terhelt vezeték felmelegszik, és melegen nagyobb az ellenállása. Számítási feladatokban gyakran a 20 °C-os értékkel (réznél kerekítve 0,0175 Ω·mm²/m-rel) számolnak. **Mindig azzal az értékkel dolgozz, amelyet a feladat megad**, és a megoldásban írd is ki, melyiket használtad.

## Egy vezeték és egy hurok ellenállása

A képletben az **L** egyetlen vezető hossza. Egy egyfázisú áramkörben az áram a fázisvezetőn megy ki és a nullavezetőn jön vissza, ezért az áramkör **hurokjának** ellenállása két vezető ellenállása: `R_hurok = 2 · R`.

:::example
Egy 20 m hosszú, 2,5 mm²-es rézvezetékkel szerelt egyfázisú áramkör. Mekkora egy vezető és a hurok ellenállása üzemi hőmérsékleten? (ρ = 0,0225 Ω·mm²/m)

1. Egy vezető: R = ρ · L / S = 0,0225 · 20 / 2,5 = 0,18 Ω.
2. A hurok (fázis + nulla): R_hurok = 2 · 0,18 Ω = 0,36 Ω.
3. 16 A terhelésnél a vezetékeken eső feszültség: U = R_hurok · I = 0,36 Ω · 16 A = 5,76 V.
:::

:::example
Ugyanez a vezeték 20 °C-on (ρ = 0,0172 Ω·mm²/m):

1. R = 0,0172 · 20 / 2,5 = 0,1376 Ω ≈ 0,138 Ω.
2. Az üzemi értéknél (0,18 Ω) kb. 24 %-kal kisebb. Ezért fontos, hogy a feladat megadott értékével számolj.
:::

:::mistake
Az L egyetlen vezető hossza, az S pedig egyetlen ér keresztmetszete. Egy háromeres, 3×2,5 mm²-es kábelnél S = 2,5 mm², nem 7,5 mm². Az oda-vissza utat a hurokellenállásnál, illetve a feszültségesés képletében a b tényező veszi figyelembe.
:::

:::exam
A vizsga III. (számítási) részében a vezeték ellenállását a feszültségesés számításának első lépéseként számolod ki. A fajlagos ellenállást a feladat mindig megadja.
:::

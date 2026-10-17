---
title: Az ellenállás hőmérsékletfüggése
summary: Miért nő a fémek ellenállása melegen, hogyan számolunk a hőmérsékleti együtthatóval, és miért üzemi hőmérsékletű értékkel méretezünk.
verify:
  - "Hőmérsékleti együttható 20 °C-on: lágyított réz 3,93·10⁻³ 1/K (IACS: 0,393 %/°C), alumínium 3,90·10⁻³ 1/K – Wikipedia: Electrical resistivity and conductivity; Copper conductor"
  - "A lineáris közelítés R_θ = R₂₀ · (1 + α · (θ − 20 °C)) – Wikipedia: Temperature coefficient of resistance (a képlet szövegesen nem jelent meg a forrásban, ellenőrizendő)"
  - "PVC szigetelésű vezető legnagyobb megengedett üzemi hőmérséklete 70 °C – MSZ HD 60364-5-52 52.1 táblázat (nem olvasott forrás, ellenőrizendő)"
---

:::goals
- Meg tudod magyarázni, miért nő a fémek ellenállása a hőmérséklettel.
- Ki tudod számítani egy vezető ellenállását adott hőmérsékleten.
- Ismered a réz és az alumínium hőmérsékleti együtthatóját.
- Megérted, miért üzemi hőmérsékletű fajlagos ellenállással méretezzük a vezetékeket.
:::

## Miért nő a fémek ellenállása melegen?

A fémben a szabad elektronok a kristályrácsban mozognak. A rács atomjai a hőmérséklettől függően rezegnek: minél melegebb a fém, annál erősebben. Az erősebben rezgő atomok jobban akadályozzák az elektronok mozgását, ezért **a fémek ellenállása a hőmérséklettel nő**.

Az ilyen anyagok **pozitív hőmérsékleti együtthatójúak** (PTC). Ilyen minden fém, így a réz és az alumínium is.

Vannak **negatív hőmérsékleti együtthatójú** (NTC) anyagok is: a félvezetők és a szén ellenállása melegen csökken. Ezt használják ki a hőmérséklet mérésére szolgáló **termisztorok**.

Vannak olyan ötvözetek is (például a konstantán), amelyek ellenállása alig függ a hőmérséklettől. Ezekből pontos mérőellenállásokat készítenek.

## A számítás

A fémek ellenállása a szokásos hőmérséklet-tartományban jó közelítéssel egyenletesen nő:

`R_θ = R₂₀ · (1 + α · (θ − 20 °C))`

- R_θ: az ellenállás θ hőmérsékleten, Ω,
- R₂₀: az ellenállás 20 °C-on, Ω,
- α: a **hőmérsékleti együttható** 20 °C-on, 1/K (vagy 1/°C),
- θ: a vezető hőmérséklete, °C.

A hőmérsékleti együttható megmutatja, hogy 1 °C hőmérséklet-emelkedés hatására az ellenállás hányad részével nő. 20 °C-on:

- réz: **α = 0,00393 1/K** (0,393 % fokonként),
- alumínium: **α = 0,0039 1/K**.

Tehát a réz ellenállása minden 10 °C melegedésnél kb. 4 %-kal nő.

:::example
Egy réztekercs ellenállása 20 °C-on 10 Ω. Mekkora az ellenállása 70 °C-on? (α = 0,00393 1/K)

1. A hőmérséklet-különbség: θ − 20 °C = 70 °C − 20 °C = 50 °C.
2. α · 50 = 0,00393 · 50 = 0,1965.
3. R₇₀ = 10 Ω · (1 + 0,1965) = 10 Ω · 1,1965 ≈ 11,97 Ω.
4. Az ellenállás kb. 20 %-kal nőtt.
:::

:::example
Fordítva: egy motor tekercsének ellenállása hidegen, 20 °C-on 2,0 Ω, üzem után 2,4 Ω. Milyen meleg a tekercs? (α = 0,00393 1/K)

1. R_θ / R₂₀ = 2,4 / 2,0 = 1,2, tehát α · (θ − 20) = 0,2.
2. θ − 20 = 0,2 / 0,00393 ≈ 50,9 °C.
3. θ ≈ 20 + 50,9 ≈ 71 °C.
:::

Ez az elve a motorok tekercshőmérséklet-mérésének: a hideg és a meleg ellenállásból számolják ki a tekercs átlagos hőmérsékletét.

## Miért méretezünk üzemi hőmérséklettel?

A terhelt vezeték felmelegszik. A PVC szigetelésű vezeték ere üzem közben akár 70 °C-os is lehet, ezért az ellenállása kb. 20 %-kal nagyobb, mint 20 °C-on. A nagyobb ellenálláson nagyobb a feszültségesés.

Ha a feszültségesést a 20 °C-os értékkel számolnád, a valóságosnál kisebb esést kapnál, és túl vékony vezetéket választhatnál. Ezért a méretezés **üzemi hőmérsékletű** fajlagos ellenállással számol: az MSZ HD 60364-5-52 G melléklete szerint réznél 0,0225, alumíniumnál 0,036 Ω·mm²/m.

:::mistake
A hőmérséklet-különbséget mindig 20 °C-hoz képest számolod, mert az α a 20 °C-os értékre vonatkozik. 70 °C-on nem α · 70-nel, hanem α · (70 − 20) = α · 50-nel szorzol.
:::

:::exam
A számítási feladatokban a hőmérsékleti együtthatót és a fajlagos ellenállást a feladat mindig megadja. Figyelj arra, hogy melyik hőmérsékletre vonatkozik az ellenállás, amelyből kiindulsz.
:::

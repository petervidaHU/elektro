---
title: Párhuzamos kapcsolás
summary: Hogyan oszlik meg az áram, ha a fogyasztókat egymás mellé kötjük, hogyan számoljuk az eredő ellenállást, és miért párhuzamosak a lakás fogyasztói.
---

:::goals
- Felismered a párhuzamos kapcsolást egy kapcsolási rajzon.
- Ki tudod számítani két vagy több párhuzamos ellenállás eredőjét.
- Ki tudod számítani az ágáramokat és a főáramot.
- Meg tudod magyarázni, miért párhuzamosan kötjük a hálózati fogyasztókat.
:::

## Mi a párhuzamos kapcsolás?

**Párhuzamos** a kapcsolás, ha a fogyasztók ugyanarra a két pontra csatlakoznak, így **mindegyiken ugyanaz a feszültség van**. Az áram több ágra oszlik: minden fogyasztónak saját ága van.

A párhuzamos kapcsolás három szabálya:

1. **A feszültség mindegyik ágon ugyanaz:** `U = U₁ = U₂ = …`
2. **Az áramok összeadódnak:** a főág árama az ágáramok összege: `I = I₁ + I₂ + …`
3. **A vezetések összeadódnak:** `1 / R_e = 1 / R₁ + 1 / R₂ + …`

**Két ellenállás** eredőjére egyszerűbb képlet is van („replusz”):

`R_e = R₁ · R₂ / (R₁ + R₂)`

**n darab egyforma** R ellenállás eredője: `R_e = R / n`.

Fontos következmény: **a párhuzamos eredő mindig kisebb a legkisebb ágellenállásnál**. Minden újabb ág újabb utat nyit az áramnak, ezért az eredő ellenállás csökken, a főáram nő.

## Az áram megoszlása

Ohm törvénye szerint minden ágban `Iₖ = U / Rₖ` folyik. Mivel a feszültség közös, **a kisebb ellenállású ágban folyik a nagyobb áram**. Az ágáramok aránya fordítottja az ellenállások arányának:

`I₁ / I₂ = R₂ / R₁`

## Kidolgozott példa

:::example
Két fogyasztó párhuzamosan 230 V-on: R₁ = 46 Ω, R₂ = 23 Ω. Számítsd ki az ágáramokat, a főáramot és az eredő ellenállást!

1. I₁ = U / R₁ = 230 V / 46 Ω = 5 A.
2. I₂ = U / R₂ = 230 V / 23 Ω = 10 A.
3. Főáram: I = I₁ + I₂ = 5 A + 10 A = 15 A.
4. Eredő ellenállás: R_e = R₁ · R₂ / (R₁ + R₂) = 46 · 23 / 69 ≈ 15,33 Ω.
5. Ellenőrzés: U / R_e = 230 V / 15,33 Ω ≈ 15 A. ✓
:::

:::example
Négy egyforma, 100 Ω-os ellenállás párhuzamosan:

1. R_e = R / n = 100 Ω / 4 = 25 Ω.
2. 24 V-on a főáram: I = 24 V / 25 Ω = 0,96 A, ágonként 0,24 A.
:::

## Miért párhuzamosak a lakás fogyasztói?

A lakás minden fogyasztója a fázis- és a nullavezető közé, vagyis párhuzamosan kapcsolódik. Ennek három oka van:

1. **Mindegyik megkapja a teljes, 230 V-os névleges feszültséget**, így a névleges teljesítményén működik.
2. **Egymástól függetlenül kapcsolhatók:** ha egy lámpát lekapcsolsz vagy kiég, a többi működik tovább.
3. **Egy újabb fogyasztó nem változtatja meg a többi feszültségét** (eltekintve a vezetéken eső feszültségtől).

A párhuzamos kapcsolás következménye: **minden bekapcsolt fogyasztó növeli az áramkör áramát**. Ha egy konnektoros áramkörre túl sok fogyasztót kapcsolsz, az áramok összege meghaladja a kismegszakító névleges áramát, és az kiold. Ez nem hiba, hanem a vezeték védelme a túlterhelés ellen.

A feszültségmérőt is párhuzamosan kötjük a mért fogyasztóval.

:::mistake
„Több fogyasztó, nagyobb ellenállás.” Párhuzamos kapcsolásnál fordítva van: minden új ág csökkenti az eredő ellenállást és növeli az áramot. Ezért terheli jobban a vezetéket és a kismegszakítót minden újabb bekapcsolt fogyasztó.
:::

:::exam
Az ágazati alapvizsgán gyakori feladat két párhuzamos ellenállás eredőjének, valamint az ágáramoknak és a főáramnak a kiszámítása. Ellenőrzésként az eredőből számolt áram egyezzen meg az ágáramok összegével.
:::

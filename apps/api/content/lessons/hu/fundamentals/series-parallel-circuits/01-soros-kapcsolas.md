---
title: Soros kapcsolás
summary: Hogyan viselkedik az áram, a feszültség és az ellenállás, ha a fogyasztókat egymás után kötjük, és hogyan számoljuk ki őket.
---

:::goals
- Felismered a soros kapcsolást egy kapcsolási rajzon.
- Ki tudod számítani a soros kapcsolás eredő ellenállását.
- Ki tudod számítani az áramot és az egyes ellenállásokon eső feszültséget.
- Tudod, hol fordul elő soros kapcsolás a villanyszerelésben.
:::

## Mi a soros kapcsolás?

**Soros** a kapcsolás, ha a fogyasztók egymás után, elágazás nélkül vannak kötve, így **ugyanaz az áram folyik át mindegyiken**. Az áramnak egyetlen útja van: ha bárhol megszakad a kör, egyik fogyasztón sem folyik áram.

A soros kapcsolás három szabálya:

1. **Az áram mindenhol ugyanaz:** `I = I₁ = I₂ = …`
2. **A feszültségek összeadódnak:** a forrás feszültsége megoszlik az ellenállások között: `U = U₁ + U₂ + …`
3. **Az ellenállások összeadódnak:** az eredő ellenállás az egyes ellenállások összege: `R_e = R₁ + R₂ + …`

Az **eredő ellenállás** az az egyetlen ellenállás, amely a forrás szempontjából ugyanúgy viselkedik, mint az egész kapcsolás: ugyanakkora feszültségen ugyanakkora áramot vesz fel.

## A feszültség megoszlása

Ohm törvénye szerint minden ellenálláson `Uₖ = Rₖ · I` feszültség esik. Mivel az áram közös, **a nagyobb ellenálláson nagyobb feszültség esik**. A feszültségek aránya megegyezik az ellenállások arányával:

`U₁ / U₂ = R₁ / R₂`

Ezen alapul a **feszültségosztó**, amelyet a vegyes kapcsolásnál tanulsz.

## Kidolgozott példa

:::example
Két ellenállás sorosan kapcsolva 230 V-ra: R₁ = 20 Ω, R₂ = 26 Ω. Számítsd ki az eredő ellenállást, az áramot és a részfeszültségeket!

1. Eredő ellenállás: R_e = R₁ + R₂ = 20 Ω + 26 Ω = 46 Ω.
2. Áram: I = U / R_e = 230 V / 46 Ω = 5 A.
3. Feszültség R₁-en: U₁ = R₁ · I = 20 Ω · 5 A = 100 V.
4. Feszültség R₂-n: U₂ = R₂ · I = 26 Ω · 5 A = 130 V.
5. Ellenőrzés: U₁ + U₂ = 100 V + 130 V = 230 V. ✓
:::

:::example
Három egyforma, 4 Ω-os ellenállás sorosan 24 V-ra kapcsolva:

1. R_e = 3 · 4 Ω = 12 Ω.
2. I = 24 V / 12 Ω = 2 A.
3. Mindegyiken U = 4 Ω · 2 A = 8 V, összesen 3 · 8 V = 24 V. ✓
:::

## A soros kapcsolás a gyakorlatban

- **Kapcsoló és fogyasztó:** a kapcsoló a fogyasztóval sorosan van. Zárva a kapcsolón szinte nem esik feszültség, nyitva viszont a teljes forrásfeszültség a kapcsoló érintkezőin jelenik meg.
- **Védelmi eszközök:** a biztosító és a kismegszakító a védett áramkörrel sorosan van, hogy a teljes áram átfolyjon rajta.
- **Árammérő:** a mért áramkörrel sorosan kötjük.
- **A vezeték és a fogyasztó:** a vezeték ellenállása a fogyasztóval sorosan van. Ezért esik feszültség a vezetéken, és ezért kap a fogyasztó kevesebbet a forrás feszültségénél.
- **Karácsonyfa-füzér (régi típus):** sorosan kötött izzók; ha egy kiég, az egész füzér kialszik.

:::mistake
„Soros kapcsolásban minden fogyasztó megkapja a teljes feszültséget.” Nem: a feszültség megoszlik a fogyasztók között. Két egyforma, 230 V-os lámpát sorosan 230 V-ra kötve mindkettő csak a feszültség felét kapja, és halványan világít. A hálózati fogyasztókat ezért párhuzamosan kötjük.
:::

:::exam
Az ágazati alapvizsgán a soros kapcsolás eredő ellenállását, áramát és részfeszültségeit számolod. A végén mindig ellenőrizd, hogy a részfeszültségek összege kiadja-e a forrás feszültségét.
:::

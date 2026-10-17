---
title: Kirchhoff törvényei
summary: A csomóponti és a huroktörvény, a csomópont, az ág és a hurok fogalma, és alkalmazásuk egyszerű áramkörökre.
---

:::goals
- Meg tudod határozni a csomópont, az ág és a hurok fogalmát.
- Fel tudod írni Kirchhoff csomóponti törvényét, és ki tudod számítani vele egy ismeretlen áramot.
- Fel tudod írni Kirchhoff huroktörvényét, és ki tudod számítani vele egy ismeretlen feszültséget.
- Felismered, hogy a soros és a párhuzamos kapcsolás szabályai e két törvényből következnek.
:::

## Csomópont, ág, hurok

Az összetettebb áramkörök leírásához három fogalmat használunk:

- **Csomópont:** az a pont, ahol legalább három vezeték találkozik. Itt ágazik szét vagy egyesül az áram.
- **Ág:** két csomópont közötti szakasz. Egy ágban mindenhol ugyanaz az áram folyik.
- **Hurok:** az áramkörben egy zárt út, amely egy pontból indulva visszatér ugyanoda, és közben egyetlen pontot sem érint kétszer.

## Kirchhoff I. törvénye: a csomóponti törvény

**Egy csomópontba befolyó áramok összege egyenlő a csomópontból kifolyó áramok összegével.**

`ΣI_be = ΣI_ki`

Másképp: ha a befolyó áramokat pozitívnak, a kifolyókat negatívnak vesszük, az áramok előjeles összege nulla (`ΣI = 0`).

Ennek oka, hogy a töltés a csomópontban nem keletkezik és nem tűnik el: amennyi befolyik, annyinak ki is kell folynia.

:::example
Egy csomópontba 15 A folyik be. Az egyik kifolyó ágban 5 A, a másikban 7 A folyik. Mekkora a harmadik kifolyó ág árama?

1. ΣI_be = ΣI_ki, tehát 15 A = 5 A + 7 A + I₃.
2. I₃ = 15 A − 5 A − 7 A = 3 A.
:::

A párhuzamos kapcsolás szabálya (`I = I₁ + I₂ + …`) a csomóponti törvény alkalmazása.

**Gyakorlati példa:** egy elosztóban a főkapcsolón átfolyó áram egyenlő az összes leágazó áramkör áramának összegével. A fázisvezetőn befolyó és a nullavezetőn visszafolyó áram egy ép egyfázisú áramkörben egyenlő. Ha nem egyenlő, az áram egy része más úton, például a védővezetőn vagy egy emberen át folyik el. Ezt érzékeli az **áram-védőkapcsoló (ÁVK)**.

## Kirchhoff II. törvénye: a huroktörvény

**Egy zárt hurokban a feszültségek előjeles összege nulla.**

`ΣU = 0`

Másképp: egy hurokban a forrásfeszültségek összege egyenlő az ellenállásokon eső feszültségek összegével.

A hurok bejárásakor kiválasztasz egy körüljárási irányt. A vele egyező irányú feszültségeket pozitívnak, az ellentétes irányúakat negatívnak veszed.

:::example
Egy 12 V-os forrásra sorosan két ellenállás kapcsolódik: R₁ = 4 Ω és R₂ = 8 Ω. Ellenőrizd a huroktörvényt!

1. Az áram: I = 12 V / (4 Ω + 8 Ω) = 1 A.
2. U₁ = 4 Ω · 1 A = 4 V, U₂ = 8 Ω · 1 A = 8 V.
3. A hurok bejárása: +12 V − 4 V − 8 V = 0 V. ✓
:::

:::example
Egy hurokban a forrás 24 V. Az egyik ellenálláson 9 V, a másikon 6 V esik. Mekkora a harmadik ellenálláson eső feszültség?

1. 24 V = 9 V + 6 V + U₃.
2. U₃ = 24 V − 9 V − 6 V = 9 V.
:::

A soros kapcsolás szabálya (`U = U₁ + U₂ + …`) a huroktörvény alkalmazása. A párhuzamos ágakon azért ugyanaz a feszültség, mert a két ágból álló hurokban a két ágfeszültség előjeles összege nulla.

## Alkalmazás

Kirchhoff két törvényével bármilyen áramkör kiszámítható:

1. Megjelölöd a csomópontokat és az ágakat, és minden ágban felveszel egy áramirányt.
2. Felírod a csomóponti egyenleteket.
3. Felírod a huroktörvényt a független hurkokra.
4. Megoldod az egyenletrendszert. Ha egy áramra negatív érték jön ki, a valódi iránya a felvettel ellentétes.

:::mistake
A huroktörvénynél a leggyakoribb hiba az előjel. Válassz egy körüljárási irányt, és következetesen tartsd végig: ami vele egyező irányú, az pozitív, ami ellentétes, az negatív.
:::

:::exam
Az ágazati alapvizsgán Kirchhoff törvényeit csomóponti áramok és hurokfeszültségek kiszámítására kell alkalmaznod, egy- és kéthurkos körökön.
:::

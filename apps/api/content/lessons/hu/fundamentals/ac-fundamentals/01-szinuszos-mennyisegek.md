---
title: Szinuszos váltakozó mennyiségek
summary: A szinuszos váltakozó feszültség jellemzői: periódusidő, frekvencia, csúcsérték, effektív érték, és hogy mit jelent pontosan a 230 V.
verify:
  - "Magyarország: 230 V, 50 Hz – Wikipedia: Mains electricity by country"
  - "√2 ≈ 1,414; 230 V csúcsértéke 325,3 V – számított érték"
---

:::goals
- Meg tudod határozni a periódusidőt, a frekvenciát és a körfrekvenciát, és át tudod számolni őket egymásba.
- Ismered a csúcsérték, a csúcstól csúcsig érték és az effektív érték jelentését.
- Ki tudod számítani a csúcsértéket az effektív értékből és fordítva.
- Megérted, mit jelent az, hogy a hálózat feszültsége 230 V.
:::

## Mi a váltakozó feszültség?

A **váltakozó feszültség** nagysága és iránya az idő függvényében periodikusan változik. A közcélú hálózat feszültsége **szinuszos**: a változását a szinuszfüggvény írja le. A szinuszos feszültséget a generátorok forgó mágneses tere állítja elő.

Az egyenfeszültség (elem, akkumulátor) ezzel szemben állandó nagyságú és irányú.

A pillanatnyi érték:

`u = Uₘ · sin(ω · t)`

- u: a feszültség pillanatnyi értéke, V,
- Uₘ: a csúcsérték (amplitúdó), V,
- ω: a körfrekvencia, 1/s,
- t: az idő, s.

[Ábra: szinuszgörbe az idő függvényében. Jelölve a csúcsérték (Uₘ), a negatív csúcs, a csúcstól csúcsig érték (2 · Uₘ), a periódusidő (T), és egy vízszintes vonal az effektív érték (U) magasságában.]

## Periódusidő és frekvencia

- **Periódusidő (T):** egy teljes hullám (egy pozitív és egy negatív félhullám) ideje. Mértékegysége a másodperc (s), gyakran ms.
- **Frekvencia (f):** a másodpercenkénti periódusok száma. Mértékegysége a **hertz (Hz)**: `1 Hz = 1 / s`.

A kettő egymás reciproka:

`f = 1 / T`, illetve `T = 1 / f`

- **Körfrekvencia (ω):** `ω = 2 · π · f`, mértékegysége 1/s (rad/s).

A magyar közcélú hálózat frekvenciája **50 Hz**. Ebből:

- T = 1 / 50 Hz = 0,02 s = **20 ms**,
- ω = 2 · π · 50 ≈ **314,16 1/s**.

Egy periódus alatt a feszültség kétszer halad át a nullán és kétszer éri el a csúcsértékét (egyszer pozitív, egyszer negatív irányban). Az izzólámpa másodpercenként 100-szor kap nulla feszültséget, de az izzószál hőtehetetlensége miatt a fénye alig változik, ezt a szem nem érzékeli.

## Csúcsérték és effektív érték

- **Csúcsérték (Uₘ):** a legnagyobb pillanatnyi érték.
- **Csúcstól csúcsig érték (U_pp):** a pozitív és a negatív csúcs különbsége: `U_pp = 2 · Uₘ`.
- **Effektív érték (U):** az az egyenfeszültség, amely ugyanazon az ellenálláson **ugyanannyi hőt** fejleszt, mint a váltakozó feszültség. Szinuszos jelnél:

`U = Uₘ / √2`, illetve `Uₘ = √2 · U`

(√2 ≈ 1,414.) Ugyanez érvényes az áramra: `I = Iₘ / √2`.

**Ha egy váltakozó feszültségről vagy áramról számértéket mondunk, az mindig az effektív érték**, hacsak külön nem jelezzük. A műszerek is az effektív értéket mutatják, a teljesítmény- és Ohm-törvényes számítások is ezzel dolgoznak.

## Mit jelent a 230 V?

A hálózat névleges fázisfeszültsége **230 V**. Ez az effektív érték. A csúcsérték:

:::example
1. Uₘ = √2 · U = 1,414 · 230 V ≈ 325,3 V.
2. A csúcstól csúcsig érték: U_pp = 2 · 325,3 V ≈ 650,5 V.
:::

A 230 V-os hálózat szigetelésének tehát pillanatonként kb. 325 V-ot kell elviselnie, és a vezetők közötti feszültség másodpercenként százszor halad át ezen a csúcson.

:::example
Egy jelet oszcilloszkópon vizsgálunk: egy periódus 4 ms, a csúcsérték 17 V. Mekkora a frekvencia és az effektív érték?

1. f = 1 / T = 1 / 0,004 s = 250 Hz.
2. U = Uₘ / √2 = 17 V / 1,414 ≈ 12,0 V.
:::

:::mistake
A `U = Uₘ / √2` összefüggés csak **szinuszos** jelre igaz. A nem szinuszos jelek (például egy dimmer vagy egy frekvenciaváltó kimenete) effektív értékét csak „valódi effektív értéket mérő” (True RMS) műszer méri pontosan.
:::

:::exam
A vizsga III. részében a váltakozó áramú számítások alapja: a frekvencia–periódusidő átváltás és a csúcsérték–effektív érték átszámítás.
:::

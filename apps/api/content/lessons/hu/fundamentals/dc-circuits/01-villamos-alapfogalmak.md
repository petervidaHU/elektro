---
title: Villamos alapfogalmak
summary: A töltés, az áram, a feszültség, az ellenállás és a vezetés pontos jelentése, jele és mértékegysége.
verify:
  - "Az elemi töltés értéke 1,602·10⁻¹⁹ C (pontosan 1,602176634·10⁻¹⁹ C) – SI, Wikipedia: Elementary charge"
  - "1 C = 1 A·s (1 A·h = 3600 A·s = 3,6 kC) – IEC 60050 / Wikipedia: Ampere-hour"
---

:::goals
- Meg tudod határozni a töltés, az áram, a feszültség, az ellenállás és a vezetés fogalmát.
- Ismered mindegyik jelét és mértékegységét.
- Ki tudod számítani az átáramlott töltést az áramerősségből és az időből.
- Tudod, mi a különbség a technikai áramirány és az elektronok mozgásának iránya között.
:::

## A villamos töltés

Minden anyag atomokból áll. Az atom magjában pozitív töltésű **protonok**, a mag körül negatív töltésű **elektronok** vannak. Egy elektron töltése az **elemi töltés**: e = 1,602·10⁻¹⁹ C.

A **villamos töltés** jele **Q**, mértékegysége a **coulomb (C)**. Egy coulomb nagyon sok elektron töltése:

`1 C = 1 / (1,602·10⁻¹⁹) ≈ 6,24·10¹⁸ elektron`

Az azonos előjelű töltések taszítják, az ellentétesek vonzzák egymást. Ha egy testen több az elektron, mint a proton, a test negatív töltésű, ha kevesebb, pozitív töltésű.

## Az áram

A **villamos áram** a töltések rendezett mozgása. Fémes vezetőben a **szabad elektronok** mozognak. Az áramerősség megmutatja, mennyi töltés halad át a vezető keresztmetszetén egységnyi idő alatt:

`I = Q / t`

- I: áramerősség, mértékegysége az **amper (A)**,
- Q: az átáramlott töltés, C,
- t: az idő, s.

Ebből: `1 A = 1 C / 1 s`, vagyis `1 C = 1 A·s`.

**Az áram iránya.** A **technikai (megállapodás szerinti) áramirány** a pozitív pólustól a fogyasztón át a negatív pólus felé mutat. Az elektronok ezzel ellentétesen, a negatív pólustól a pozitív felé mozognak. A rajzokon és a számításokban mindig a technikai áramirányt használjuk.

Gyakori előtagok: 1 mA (milliamper) = 0,001 A, 1 kA (kiloamper) = 1000 A.

:::example
Egy vezetőn 2 A áram folyik 30 másodpercig. Mennyi töltés haladt át rajta?

1. Adatok: I = 2 A, t = 30 s.
2. Q = I · t = 2 A · 30 s = 60 C.
3. Ez kb. 60 · 6,24·10¹⁸ ≈ 3,74·10²⁰ elektron.
:::

## A feszültség

A **feszültség** az a „hajtóerő”, amely a töltéseket mozgásba hozza. Pontosan: két pont között a feszültség megmutatja, mennyi munkát végez a villamos tér, amíg egységnyi töltést az egyik pontból a másikba mozgat:

`U = W / Q`

- U: feszültség, mértékegysége a **volt (V)**,
- W: a végzett munka, joule (J),
- Q: a mozgatott töltés, C.

Feszültség mindig **két pont között** van. Ezért mondjuk: „a fázis és a nulla között 230 V a feszültség”. Gyakori előtagok: 1 mV = 0,001 V, 1 kV = 1000 V.

Hasonlat: a vízvezetékben a víznyomás hajtja a vizet. A villamos körben a feszültség hajtja az áramot. Nyomáskülönbség nélkül nincs vízáramlás, feszültség nélkül nincs áram.

## Az ellenállás és a vezetés

Az anyag akadályozza a töltések mozgását: ez az **ellenállás**. Jele **R**, mértékegysége az **ohm (Ω)**. Egy fogyasztó ellenállása 1 Ω, ha rajta 1 V feszültség hatására 1 A áram folyik. Gyakori előtagok: 1 kΩ = 1000 Ω, 1 MΩ = 1 000 000 Ω.

Az ellenállás reciproka a **vezetés** (konduktancia). Jele **G**, mértékegysége a **siemens (S)**:

`G = 1 / R`

Minél kisebb egy test ellenállása, annál nagyobb a vezetése, annál könnyebben folyik át rajta az áram. Egy 10 Ω-os ellenállás vezetése 0,1 S.

:::mistake
„A feszültség átfolyik a vezetéken.” Nem: a vezetéken **áram folyik**, a feszültség pedig **két pont között van**. A feszültséget két pont között mérjük, az áramot egy ponton, a vezetőn átfolyva.
:::

:::exam
Az ágazati alapvizsgán gyakori feladat a mennyiségek jelének és mértékegységének párosítása (Q – C, I – A, U – V, R – Ω, G – S), valamint egyszerű számítás a `Q = I · t` összefüggéssel.
:::

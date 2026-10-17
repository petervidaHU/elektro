---
title: A terhelhetőséget befolyásoló tényezők
summary: Hogyan módosítja a vezeték terhelhetőségét a szerelési mód, a környezeti hőmérséklet, a csoportosítás és a szigetelés anyaga, és hogyan számolsz a helyesbítő tényezőkkel.
verify:
  - "Szigetelőanyagok tartós üzemi hőmérséklete: PVC 70 °C, EPR 90 °C – de.wikipedia: Mantelleitung"
  - "A terhelhetőségi táblázatok és a helyesbítő tényezők a referencia-szerelési módokra és 30 °C-os levegő-hőmérsékletre vonatkoznak – Wikipedia: Ampacity (30 °C-os környezeti levegő-hőmérséklet mint szokásos alap)"
  - "HIÁNYZIK: a referencia-szerelési módok betűjelei és leírása, valamint a hőmérsékleti és csoportosítási helyesbítő tényezők táblázatai – MSZ HD 60364-5-52, B melléklet; a lecke szándékosan nem közöl táblázati értéket (THEORY_TOC)"
  - "Példa (24 A · 0,87 · 0,8 ≈ 16,7 A) – a feladatban megadott, szemléltető tényezőkkel számított érték"
---

:::goals
- Ismered a vezeték terhelhetőségét befolyásoló négy fő tényezőt.
- Megérted, miért csökkenti a terhelhetőséget a meleg környezet és a csoportosítás.
- Tudod, mi a helyesbítő tényező, és hogyan számolsz vele.
- Ki tudod számítani a helyesbített terhelhetőséget a feladatban megadott értékekből.
:::

## A szerelési mód

A terhelhetőségi táblázatok a vezetékeket **referencia-szerelési módok** szerint csoportosítják. A szerelési mód azt írja le, hogyan és mibe kerül a vezeték, és ettől függ, mennyire tudja leadni a hőt:

- vezeték **hőszigetelt falban**, védőcsőben: a hő nehezen távozik, a terhelhetőség a legkisebb,
- vezeték **falon belül vagy vakolat alatt**, védőcsőben: közepes hőleadás,
- vezeték **közvetlenül a falon**, rögzítve: jobb hőleadás,
- vezeték vagy kábel **szabad levegőn**, kábeltálcán, egymástól távolabb: a legjobb hőleadás, a legnagyobb terhelhetőség,
- kábel **a földben**: a talaj hővezetésétől függ.

Ugyanannak a keresztmetszetnek tehát szerelési módonként más a terhelhetősége. A feladatban mindig meg kell határoznod, melyik szerelési mód vonatkozik a vezetékre, és abból az oszlopból kell olvasnod.

## A környezeti hőmérséklet

A táblázati értékek egy megadott **alap környezeti hőmérsékletre** vonatkoznak (levegőben szerelt vezetékeknél jellemzően 30 °C-ra). Ha a környezet melegebb (kazánház, padlás nyáron, meleg technológiai tér), a vezeték kevesebb hőt tud leadni, ezért a terhelhetősége **csökken**. Hidegebb környezetben nőhet.

Ezt a **hőmérsékleti helyesbítő tényező** (f_θ) veszi figyelembe. Értéke melegebb környezetben 1-nél kisebb.

## Csoportosítás

Ha több, egyszerre terhelt áramkör vezetéke fut **egymás mellett** (közös védőcsőben, kötegben, kábeltálcán), a vezetékek egymást is melegítik. Mindegyik kevesebb hőt tud leadni, mint egyedül, ezért mindegyik terhelhetősége **csökken**.

Ezt a **csoportosítási helyesbítő tényező** (f_cs) veszi figyelembe. Minél több áramkör van egy csoportban, annál kisebb az értéke.

## A szigetelés anyaga és a helyesbítés menete

A szigetelés anyaga megszabja a vezető legnagyobb megengedett hőmérsékletét: a PVC 70 °C-ot, a hőálló PVC és az EPR 90 °C-ot visel el tartósan. A nagyobb hőállóságú szigetelésű vezetéknek ugyanakkora keresztmetszet mellett **nagyobb** a terhelhetősége, ezért a táblázatok külön oszlopban adják meg az értékeiket.

A helyesbített terhelhetőség a táblázati érték és a helyesbítő tényezők szorzata:

`I_z = I_táblázat · f_θ · f_cs`

- I_táblázat: a táblázatból az adott szerelési módra és keresztmetszetre kiolvasott érték, A,
- f_θ: a hőmérsékleti helyesbítő tényező,
- f_cs: a csoportosítási helyesbítő tényező.

:::example
Egy 2,5 mm²-es, PVC szigetelésű rézvezeték a feladatban megadott kivonat szerint az adott szerelési módban 24 A-t visel el. A környezeti hőmérséklet miatt a feladat f_θ = 0,87, a csoportosítás miatt f_cs = 0,8 tényezőt ad meg.

1. I_z = 24 A · 0,87 · 0,8 ≈ 16,7 A.
2. A vezetékre legfeljebb 16 A-es védelem tehető, mert I_n ≤ I_z.
3. Ha a terhelő áram 18 A, a 2,5 mm² nem elég. A következő keresztmetszettel kell újraszámolni a feladatban megadott táblázati értékkel.
:::

A helyesbítés után a terhelhetőség jelentősen kisebb lehet a táblázati értéknél. Ezért kell a helyesbítő tényezőket mindig alkalmazni, ha a feladat megadja őket.

:::safety
Ha a gyakorlatban nem ismered pontosan a szerelési körülményeket (például hőszigetelés van-e a falban, hány vezeték fut egy csőben), a kedvezőtlenebb esettel számolj. A túl kicsire vett terhelhetőség legfeljebb egy nagyobb vezetéket jelent, a túl nagyra vett terhelhetőség tűzveszélyt.
:::

:::mistake
Gyakori hiba, hogy a helyesbítő tényezőkkel **osztanak** a szorzás helyett, vagy csak az egyiket alkalmazzák. Meleg környezetben és csoportosításnál mindkét tényező 1-nél kisebb, és mindkettő csökkenti a terhelhetőséget: a táblázati értéket mindkettővel meg kell szorozni.
:::

:::exam
A vizsga III. részében a táblázati kivonat mellett a feladat megadhatja a helyesbítő tényezőket is. A helyesbített terhelhetőséggel kell a védelmet és a keresztmetszetet ellenőrizni.
:::

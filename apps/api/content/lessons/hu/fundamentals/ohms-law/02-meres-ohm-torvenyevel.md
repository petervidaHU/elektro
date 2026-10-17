---
title: Mérések és Ohm törvénye
summary: Hogyan igazoljuk Ohm törvényét méréssel, mit mutat az U–I jelleggörbe, és miben különbözik a lineáris és a nem lineáris fogyasztó.
verify:
  - "A mérési példák (20 Ω-os ellenállás, 12 V-os izzó) szemléltető adatok, nem mért értékek; az izzó hideg ellenállása kisebb az üzeminél, ezért bekapcsolási áramlökés keletkezik – általános fizika"
---

:::goals
- Össze tudod állítani a kapcsolást Ohm törvényének méréses igazolásához.
- Fel tudod rajzolni és értelmezni tudod az U–I jelleggörbét.
- Meg tudod különböztetni a lineáris és a nem lineáris fogyasztót.
- Megérted, miért nagy az izzólámpa bekapcsolási árama.
:::

## A mérőkapcsolás

Ohm törvényét úgy igazoljuk, hogy egy fogyasztóra különböző feszültségeket kapcsolunk, és mindegyiknél megmérjük az áramot. A kapcsolás:

1. **Szabályozható tápegység:** a feszültséget lépésenként állítjuk.
2. **Árammérő (ampermérő):** a fogyasztóval **sorosan** kötjük, mert az áramnak át kell folynia rajta. Belső ellenállása nagyon kicsi.
3. **Feszültségmérő (voltmérő):** a fogyasztóval **párhuzamosan**, a fogyasztó két kapcsára kötjük. Belső ellenállása nagyon nagy, így alig vesz fel áramot.
4. **A vizsgált fogyasztó:** ellenállás vagy lámpa.

A mérés menete: a feszültséget nulláról indítva lépésenként növeled, minden lépésnél leolvasod a feszültséget és az áramot, és kiszámolod a hányadosukat (`R = U / I`).

## Lineáris fogyasztó: az ellenállás

Egy fém ellenállás mérésének eredménye (szemléltető adatok):

- 2 V → 0,1 A, tehát R = 20 Ω,
- 4 V → 0,2 A, tehát R = 20 Ω,
- 6 V → 0,3 A, tehát R = 20 Ω,
- 8 V → 0,4 A, tehát R = 20 Ω.

A feszültség kétszerezésekor az áram is kétszereződik, a hányados állandó. Ha a pontokat koordináta-rendszerben ábrázolod (vízszintesen a feszültség, függőlegesen az áram), **az origón átmenő egyenest** kapsz. Ez az **U–I jelleggörbe**.

Az ilyen fogyasztó **lineáris**: az ellenállása nem függ a feszültségtől és az áramtól. Az egyenes meredeksége az ellenállástól függ: minél kisebb az ellenállás, annál meredekebb az egyenes, mert ugyanakkora feszültség nagyobb áramot hajt át.

[Ábra: U–I koordináta-rendszer, vízszintes tengelyen U (V), függőlegesen I (A). Egy origón átmenő egyenes a 20 Ω-os ellenállásra, és egy laposodó, felfelé ívelő görbe az izzólámpára.]

## Nem lineáris fogyasztó: az izzólámpa

Egy 12 V-os izzólámpa mérésének eredménye (szemléltető adatok):

- 2 V → 0,10 A, tehát R = 20 Ω,
- 12 V → 0,25 A, tehát R = 48 Ω.

A feszültség hatszorosára nőtt, az áram viszont csak két és félszeresére. A lámpa ellenállása a feszültséggel **nő**, mert az izzószál felmelegszik, és a fémek ellenállása a hőmérséklettel nő. A jelleggörbe ezért nem egyenes, hanem **egyre laposodó görbe**. Az ilyen fogyasztó **nem lineáris**.

Ohm törvénye ilyenkor is érvényes **minden egyes pontban**: a pillanatnyi feszültség és áram hányadosa a pillanatnyi ellenállás. Csak az ellenállás nem állandó.

**Bekapcsolási áramlökés.** Bekapcsoláskor az izzószál még hideg, az ellenállása kicsi, ezért a bekapcsolás pillanatában az üzeminél jóval nagyobb áram folyik. Az izzószál ezért legtöbbször bekapcsoláskor ég ki. Hasonló áramlökés jellemző a motorokra és sok elektronikus tápegységre is, ezért a kismegszakítókat úgy kell megválasztani, hogy erre ne oldjanak ki.

Más nem lineáris elemek: a **dióda** (egyik irányban alig vezet, a másikban egy küszöbfeszültség felett hirtelen sokat), a **LED**, a **termisztor** (hőmérsékletfüggő ellenállás).

:::mistake
Az árammérőt soha nem kötöd párhuzamosan a fogyasztóval vagy a forrással. Az árammérő ellenállása nagyon kicsi: párhuzamosan kötve rövidzárat okoz, kiolvasztja a műszer biztosítóját vagy tönkreteszi a műszert.
:::

:::safety
Ohm törvényének mérését biztonsági törpefeszültségű, laboratóriumi tápegységgel végzed, nem a hálózati 230 V-on. Mérés előtt ellenőrzöd a műszer üzemmódját és méréshatárát, és csak utána kapcsolod be a tápot.
:::

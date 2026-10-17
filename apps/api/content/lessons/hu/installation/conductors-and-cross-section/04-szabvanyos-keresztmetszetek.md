---
title: Szabványos keresztmetszetek
summary: A szabványos keresztmetszet-sor, és az, hogy a választást a feszültségesés, a terhelhetőség és a védelem együtt határozza meg.
verify:
  - "A szabványos keresztmetszet-sor: 1,5; 2,5; 4; 6; 10; 16; 25; 35; 50; 70; 95; 120; 150; 185; 240; 300 mm² – MSZ EN 60228 (az alkalmazás referenciaadata: packages/shared/src/reference/conductors.ts)"
---

:::goals
- Ismered a szabványos keresztmetszet-sort.
- Tudod, hogy a keresztmetszetet nem lehet tetszőlegesen választani.
- Tudod, mi határozza meg a választást.
:::

## A szabványos sor

A vezetékek keresztmetszetét **nem tetszőlegesen** gyártják: a szabvány (MSZ EN 60228) rögzíti az elérhető **névleges keresztmetszeteket** mm²-ben:

`1,5 – 2,5 – 4 – 6 – 10 – 16 – 25 – 35 – 50 – 70 – 95 – 120 – 150 – 185 – 240 – 300`

Ezekből választhatsz. Ha a számítás eredménye két érték közé esik (például 4,17 mm²), **mindig a következő nagyobb** szabványos értéket választod (itt 6 mm²), mert a kisebb nem felelne meg.

A lakás- és kisépület-villamosításban a leggyakoribb értékek a sor elejéről (1,5; 2,5; 4; 6; 10; 16 mm²) kerülnek ki; a nagyobb értékeket fővezetékeknél és nagyobb fogyasztóknál használjuk.

## Mitől függ a választás?

A szükséges keresztmetszetet három feltétel határozza meg, és **mindháromnak** teljesülnie kell:

1. **Feszültségesés:** a vezeték hosszától, az áramtól és az anyagától függ. Hosszú vezetéknél gyakran ez dönt (lásd *A feszültségesés számítása*, *Keresztmetszet választása feszültségesésre*).
2. **Terhelhetőség:** a vezeték nem melegedhet túl a szerelési módtól és a környezettől függően (lásd *A terhelhetőség fogalma*, *A terhelhetőséget befolyásoló tényezők*).
3. **Védelem:** a túláramvédelemnek össze kell hangolódnia a vezetékkel, és zárlat esetén a megengedett időn belül ki kell oldania (lásd *Túláramvédelem és vezeték összehangolása*).

A három közül **a legnagyobb** keresztmetszetet adó feltétel dönt.

## Menete röviden

1. Kiszámolod a terhelő áramot.
2. A terhelhetőség alapján megkeresed a minimális keresztmetszetet (a helyesbítő tényezőkkel).
3. A feszültségesés alapján kiszámolod a minimális keresztmetszetet.
4. A kettő közül a nagyobbat felkerekíted a szabványos sorra.
5. Ellenőrzöd, hogy a választott védőkészülékkel a vezeték védett.

::calculator{id="voltage-drop" system=single-phase material=copper current=16 length=40 crossSection=6}

:::mistake
„A 4,17 mm²-hez a 4 mm² elég, mert közel van.” Nem: a szabványos sorban csak a következő nagyobb érték megfelelő. A kisebb keresztmetszet nagyobb feszültségesést és melegedést okoz, mint amit a feltétel megenged.
:::

:::safety
Soha ne válassz a számítottnál kisebb keresztmetszetet „takarékosságból" vagy mert „úgyis kibírja". A kis keresztmetszet túlmelegedik, és tüzet okozhat. Fordítva a nagyobb keresztmetszet biztonságos, legfeljebb drágább.
:::

:::exam
A központi interaktív vizsga III. részében a feladat végén mindig szabványos keresztmetszetet kell megadni. A számított érték felkerekítése a következő szabványos értékre kötelező lépés.
:::

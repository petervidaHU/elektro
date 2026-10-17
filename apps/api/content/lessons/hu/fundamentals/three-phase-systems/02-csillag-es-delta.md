---
title: Csillag- és deltakapcsolás
summary: A háromfázisú fogyasztók kétféle bekötése, a fázis- és vonali mennyiségek mindkét kapcsolásban, és hogyan döntöd el a motor adattáblájáról, melyiket kell használni.
verify:
  - "Csillag: U_v = √3·U_f, I_v = I_f; delta: U_v = U_f, I_v = √3·I_f – Wikipedia: Three-phase electric power / Y-Δ transform"
  - "Csillag-delta indításnál az indítóáram és a nyomaték a delta kapcsolásbeli érték egyharmada – Wikipedia: Motor controller (star-delta starter)"
  - "Példák (46 Ω: 3450 W csillagban, 10 435 W deltában) – számított értékek"
---

:::goals
- Fel tudod rajzolni és fel tudod ismerni a csillag- és a deltakapcsolást.
- Ismered a fázis- és vonali feszültség, illetve áram kapcsolatát mindkét kapcsolásban.
- Ki tudod számítani egy szimmetrikus fogyasztó áramait és teljesítményét mindkét kapcsolásban.
- El tudod dönteni a motor adattáblája alapján, hogy csillagba vagy deltába kell kötni.
:::

## Csillagkapcsolás (Y)

Csillagkapcsolásban a három fogyasztóelem (tekercs, fűtőszál) egyik vége egy közös pontba, a **csillagpontba** fut. A másik végük egy-egy fázisvezetőre csatlakozik. A csillagpontra a nullavezető köthető.

- Minden fogyasztóelemen a **fázisfeszültség** van: `U_f = U_v / √3`. 400 V-os hálózaton 230 V.
- A vonali áram megegyezik a fázisárammal: `I_v = I_f`.

[Ábra: csillagkapcsolás. Három ellenállás egy közös csillagpontban összekötve, szabad végük L1, L2, L3 vezetőre csatlakozik, a csillagpontból N vezető indul. Jelölve U_v, U_f, I_v.]

## Deltakapcsolás (Δ)

Deltakapcsolásban a három fogyasztóelem **zárt háromszöget** alkot: mindegyik két fázisvezető közé kapcsolódik. Nullavezetőt nem lehet rá kötni.

- Minden fogyasztóelemen a **vonali feszültség** van: `U_f = U_v`. 400 V-os hálózaton 400 V.
- A vonali áram a fázisáram √3-szorosa: `I_v = √3 · I_f`, mert minden csomópontban két fázisáram vektoros különbsége folyik a vonali vezetőbe.

[Ábra: deltakapcsolás. Három ellenállás háromszögben, a csúcsok L1, L2, L3 vezetőre csatlakoznak. Jelölve U_v = U_f, I_f és I_v.]

## Ugyanaz a fogyasztó kétféle kapcsolásban

:::example
Egy háromfázisú fűtőkészülék három egyforma, 46 Ω-os fűtőszálból áll. A hálózat 230/400 V-os.

**Csillagkapcsolásban:**
1. U_f = 230 V.
2. I_f = I_v = U_f / R = 230 V / 46 Ω = 5 A.
3. P = 3 · U_f · I_f = 3 · 230 V · 5 A = 3450 W.

**Deltakapcsolásban:**
1. U_f = 400 V.
2. I_f = U_f / R = 400 V / 46 Ω ≈ 8,70 A.
3. I_v = √3 · I_f = 1,732 · 8,70 A ≈ 15,06 A.
4. P = 3 · U_f · I_f = 3 · 400 V · 8,70 A ≈ 10 435 W.
:::

Ugyanaz a fogyasztó deltában **háromszor akkora** teljesítményt vesz fel, mint csillagban, és a vonali árama is háromszoros (15,06 A / 5 A ≈ 3). Ennek oka: deltában minden elemen √3-szor nagyobb a feszültség, így √3-szor nagyobb az áram, a teljesítmény pedig (√3)² = 3-szoros.

Ha egy csillagba tervezett fogyasztót deltába kötsz, túlterheled: a fűtőszál vagy a motortekercs kiég. Ha egy deltába tervezettet csillagba kötsz, csak harmadakkora teljesítményt ad.

## Melyik kapcsolást kell használni?

A motor adattábláján két feszültség és két kapcsolási jel szerepel. Az adattábla azt mondja meg, **mekkora feszültséget bír el egy tekercs**: a kisebbik feszültséget deltában, a nagyobbikat csillagban.

- **230/400 V, Δ/Y** felirat: egy tekercs 230 V-ot bír el. A 230/400 V-os hálózaton (400 V vonali feszültség) **csillagba** kell kötni.
- **400/690 V, Δ/Y** felirat: egy tekercs 400 V-ot bír el. A 230/400 V-os hálózaton **deltába** kell kötni. Ezek a motorok csillag-delta indításra alkalmasak.

**Csillag-delta indítás:** a motort csillagba kötve indítják, majd felpörgés után deltába kapcsolják át. Csillagban az indítóáram (és az indítónyomaték is) a deltabeli érték **egyharmada**, így kisebb a hálózat terhelése indításkor. Csak olyan motornál alkalmazható, amely üzemszerűen deltában jár a hálózaton.

A motor kapcsolódobozában a kapcsolást átkötő lemezekkel (sínekkel) alakítod ki: csillagnál a három tekercs végét egy sorban, vízszintes lemezzel kötöd össze, deltánál három függőleges lemez köti össze mindegyik tekercs elejét a következő tekercs végével.

:::mistake
Gyakori hiba, hogy egy 230/400 V Δ/Y feliratú motort 400 V-os hálózaton deltába kötnek, mert „a delta az erősebb”. Ilyenkor minden tekercs 400 V-ot kap 230 V helyett, és a motor túlmelegszik, leég.
:::

:::exam
A vizsga III. részében számítási feladat lehet: fázis- és vonali áram, teljesítmény csillag- és deltakapcsolásban, valamint a kapcsolás kiválasztása az adattábla alapján.
:::

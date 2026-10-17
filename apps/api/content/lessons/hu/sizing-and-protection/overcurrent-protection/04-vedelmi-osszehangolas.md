---
title: Túláramvédelem és vezeték összehangolása
summary: Az I_b ≤ I_n ≤ I_z feltétel jelentése, a szelektivitás elve, és az, hogy miért nem szabad nagyobb kismegszakítót tenni egy vezetékre.
verify:
  - "Az összehangolás feltétele: I_b ≤ I_n ≤ I_z – MSZ HD 60364-4-43"
  - "HIÁNYZIK: a második feltétel (a védőkészülék biztos működési árama, I₂ ≤ 1,45 · I_z) és a tényező értéke készüléktípusonként – MSZ HD 60364-4-43"
  - "A szelektivitás elve: hiba esetén csak a hibához legközelebbi védőkészülék old ki – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
---

:::goals
- Meg tudod magyarázni az I_b ≤ I_n ≤ I_z feltétel három tagját.
- Tudod, miért veszélyes a vezetékhez képest nagyobb védőkészüléket tenni.
- Érted a szelektivitás elvét.
:::

## Három áram, egy feltétel

A túláramvédelem akkor védi jól a vezetéket, ha három áram megfelelő sorrendben áll egymáshoz képest:

`I_b ≤ I_n ≤ I_z`

- **I_b:** az áramkör **terhelő árama** (a fogyasztók által felvett áram), A.
- **I_n:** a védőkészülék (kismegszakító vagy biztosító) **névleges árama**, A.
- **I_z:** a vezeték **terhelhetősége** a valós körülmények között (a helyesbítő tényezőkkel), A.

A feltétel két részre bontható:

- **I_b ≤ I_n:** a védőkészülék ne oldjon ki az üzemszerű terhelésen. Ha az I_n kisebb a terhelő áramnál, a kismegszakító folyton lekapcsol.
- **I_n ≤ I_z:** a védőkészülék **a vezeték terhelhetőségénél előbb** oldjon ki. Ha az I_n nagyobb az I_z-nél, a védelem engedi, hogy a vezetéken tartósan a terhelhetőségénél nagyobb áram folyjon.

## Miért nem szabad nagyobb védőkészüléket tenni?

Tegyük fel, hogy egy vezeték terhelhetősége kisebb a védőkészülék névleges áramánál. A vezetéken folyhat olyan tartós áram, amely a vezetéket már túlterheli (melegíti), de a védőkészülék még nem old ki. A vezeték szigetelése fokozatosan károsodik, és tűz keletkezhet.

Ezért a védőkészüléket **a vezetékhez** kell méretezni, és fordítva sem szabad a vezetéket olyan áramra terhelni, amely a védőkészülék névlegesét meghaladja. A kismegszakító cseréje egy nagyobbra („mert folyton leold") a védelem megszüntetése.

## A választás menete

1. Kiszámolod a terhelő áramot (I_b).
2. Kiválasztod a vezeték keresztmetszetét úgy, hogy terhelhetősége (I_z) legalább I_b legyen.
3. Választasz egy védőkészüléket, amelynek névleges árama I_b-nél nem kisebb, és I_z-nél nem nagyobb.
4. Ellenőrzöd, hogy a készülék a zárlatot is lekapcsolja a vezeték végén, és hogy a megszakítóképessége elég.

## Szelektivitás

Egy elosztóban a védőkészülékek **egymás után, sorban** állnak: a főelosztó nagyobb védőkészüléke mögött kisebbek védik az egyes körökhöz. Ha egy kör végén hiba keletkezik, **csak a legközelebbi, a hibás körhöz tartozó** védőkészüléknek szabad kioldania, a többi épület sötétben maradna. Ezt nevezzük **szelektivitásnak**: a hibát csak az a védőkészülék kapcsolja le, amelyik hozzá a legközelebb áll.

A szelektivitáshoz a védőkészülékek kioldási jelleggörbéinek megfelelően kell egymáshoz illeszkedniük; a részleteket a gyártói adatok és a tervezés határozzák meg.

:::safety
Soha ne cserélj le egy védőkészüléket nagyobb névleges áramúra, és ne hidald át. A vezeték terhelhetősége a határ: a védőkészülék ezt védi.
:::

:::mistake
„Az I_n lehet kisebb is, mint az I_b, ha a kismegszakító ritkán old ki.” Nem: ha az I_n kisebb a terhelő áramnál, az üzemszerű terhelés is kioldhat, vagyis a rendszer nem tud megbízhatóan működni.
:::

:::exam
A III. részben gyakori feladat: adott terhelő áramhoz és vezetékhez kell kismegszakítót választani úgy, hogy I_b ≤ I_n ≤ I_z teljesüljön. A standard névleges áramok sorát a feladat adja.
:::

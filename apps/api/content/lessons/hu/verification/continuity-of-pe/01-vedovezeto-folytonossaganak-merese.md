---
title: A védővezető folytonosságának mérése
summary: Miért és hogyan mérjük a védővezetők és az EPH-vezetők folytonosságát, és hogyan értékeljük az eredményt.
verify:
  - "A védővezető-folytonosság mérése kis ellenállású méréssel, a műszer mérőáramával; a vezetők feszültségmentesek – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a mérőáram szabványos értéke és a megengedett legnagyobb ellenállás vagy az értékelés módja – MSZ HD 60364-6"
  - "A mért ellenállás összevethető a vezeték számított ellenállásával (R = ρ · L / S) – fizikai alapismeret"
---

:::goals
- Meg tudod magyarázni, miért kell a védővezetők folytonosságát mérni.
- Le tudod írni a mérés menetét.
- Értelmezni tudod az eredményt.
:::

## Miért mérünk folytonosságot?

A védővezető (PE) normál üzemben nem terhelt, ezért **a hibája nem látszik**: a készülék működik, a védővezető meg lehet szakadva. Ha egy testzárlat később bekövetkezik, a hibaáram nincs hova, és a burkolat feszültség alatt marad. A **folytonosságmérés** igazolja, hogy a védővezető **minden pontjához** ép összeköttetés vezet a fő földelősíntől, és hogy az EPH-kötések is épek.

## Mit mérünk?

- A **védővezetők** (PE) folytonosságát: a fő földelősín és az áramkörök védővezetői, a dugaszolóaljzatok és a készülékek védőérintkezői közötti ellenállást.
- Az **EPH-vezetők** folytonosságát: a fő földelősín és a csővezetékek, fém szerkezetek közti ellenállást.

## A mérés menete

1. A mérendő vezetőket **feszültségmentesítsd** (öt lépés), és ellenőrizd a feszültségmentességet.
2. Ellenőrizd a **műszert** és a mérővezetékeket: a mérővezetékek ellenállását a műszer nullázza (vagy a műszer kijelzi, és levonod).
3. Kösd a műszer egyik mérővezetékét a **fő földelősínhez** (vagy a referenciapontra), a másikat a **mérendő ponthoz** (például a dugaszolóaljzat védőérintkezőjéhez).
4. Olvasd le az **ellenállást**, és jegyezd fel.
5. Ismételd meg minden **mérendő ponton**, a legtávolabbi ponton is.

A műszer kis ellenállás mérésére alkalmas, és a mérés alatt kis árammal méri az ellenállást.

## Az eredmény értelmezése

A védővezető ellenállásának **kicsinek** kell lennie, összhangban a vezeték hosszával és keresztmetszetével: a mért érték nagyjából a számított (`R = ρ · L / S`) érték körül legyen. Ha a mért érték **jóval nagyobb**, mint a számított, az hibás kötésre vagy szakadásra utal. A megengedett határt az előírás adja meg; az értékelést a jegyzőkönyvben rögzíteni kell.

::calculator{id="pe-continuity-check" length=20 crossSection=2.5 resistivity=0.0225}

:::safety
A folytonosságmérést **mindig feszültségmentesített** vezetőn végezd. Ha a vezetőn feszültség van, a műszer tönkremehet, és te is megsérülhetsz. A mérés előtt győződj meg a feszültség hiányáról, és a mérés alatt senki ne érintse a mérendő vezetőt.
:::

:::mistake
„A műszer sípol, tehát a védővezető jó.” A sípolás csak azt mutatja, hogy van összeköttetés. A védelem szempontjából az **ellenállás értéke** számít: egy laza, nagy ellenállású kötés is sípolhat, de hibaáramnál nem vezet megfelelően.
:::

:::exam
A vizsgán a folytonosságmérés célját, menetét és a mérés előfeltételét (feszültségmentesség) kérdezik. A mért és a számított ellenállás összevetése számítási feladat lehet.
:::

---
title: Az ÁVK működése
summary: Hogyan érzékeli az áram-védőkapcsoló a földzárlatot az összegáram-transzformátor segítségével, mit jelent a névleges kioldó különbözeti áram, és milyen érintés ellen nem véd.
verify:
  - "Működés: összegáram-transzformátor; a fázis- és nullavezető(k) áramainak összege hibátlan esetben nulla – de.wikipedia: Fehlerstrom-Schutzschalter; Wikipedia: Residual-current device"
  - "Nem véd, ha a személy két különböző potenciálú aktív részt érint (két fázis vagy fázis és nulla) – de.wikipedia: Fehlerstrom-Schutzschalter; Wikipedia: Residual-current device"
  - "Névleges kioldó különbözeti áramok: 10, 30, 100, 300, 500 mA, 1 A – de.wikipedia: Fehlerstrom-Schutzschalter; nagy érzékenység 30 mA-ig (személyvédelem), közepes 100–1000 mA (tűzvédelem) – Wikipedia: Residual-current device"
  - "Az ÁVK TN-C rendszerben nem működik – Wikipedia: Earthing system"
  - "Áram élettani hatásainak küszöbértékei – safety/electrical-safety-basics/01 (IEC/TS 60479-1, EMF-Portal)"
  - "Példák (0,2 A különbség; 0,045 A testen át) – számított, szemléltető értékek"
---

:::goals
- Megérted az összegáram-transzformátor működési elvét.
- Tudod, mit jelent a névleges kioldó különbözeti áram (IΔn).
- Megérted, milyen hibát érzékel az ÁVK, és milyen érintés ellen nem véd.
- Tudod, miért nem helyettesíti az ÁVK a kismegszakítót.
:::

## Mit figyel az áram-védőkapcsoló?

Az **áram-védőkapcsoló (ÁVK)**, nemzetközi rövidítéssel RCD, az áramkörbe befolyó és onnan visszafolyó áramot hasonlítja össze.

Egy ép egyfázisú áramkörben a fázisvezetőn befolyó áram **teljes egészében** visszatér a nullavezetőn. A két áram pillanatértékeinek összege minden pillanatban nulla. Háromfázisú körben ugyanez igaz a három fázis és a nullavezető áramainak összegére.

Ha viszont valahol szigetelési hiba van, és az áram egy része **a földön vagy a védővezetőn** keresztül folyik vissza (például egy hibás készülék házán és egy emberen át), akkor a nullavezetőn kevesebb tér vissza, mint amennyi a fázison befolyt. Ez a különbség a **különbözeti áram** (hibaáram, szivárgóáram). Ha eléri a beállított értéket, az ÁVK lekapcsol.

## Az összegáram-transzformátor

Az ÁVK szíve egy gyűrű alakú vasmag, az **összegáram-transzformátor**. Ezen halad át a védett kör **összes** üzemi vezetője: a fázisvezető(k) és a nullavezető is. A védővezető (PE) **nem** megy át rajta.

- Hibátlan esetben a vezetők áramainak mágneses hatása kioltja egymást, a vasmagban nincs eredő mágneses tér.
- Különbözeti áram esetén a vasmagban eredő mágneses tér keletkezik. Ez a vasmagon lévő érzékelő tekercsben feszültséget indukál, amely működteti a kioldó szerkezetet, és az ÁVK **minden pólust**, a nullát is, lekapcsolja.

[Ábra: összegáram-transzformátor. Gyűrű alakú vasmag, rajta átvezetve az L és N vezető; a vasmagon egy érzékelő tekercs, amely a kioldó relére csatlakozik. A PE vezető a vasmag mellett halad el.]

Az ÁVK nem a kör áramának nagyságát figyeli, hanem a **különbséget**. Egy 16 A-t felvevő, hibátlan fogyasztónál nem old ki, egy 0,03 A-es földzárlatnál viszont igen.

:::example
Egy mosógép áramkörében a fázisvezetőn 8,20 A folyik be, a nullavezetőn 8,00 A tér vissza.

1. A különbözeti áram: 8,20 A − 8,00 A = 0,20 A = 200 mA.
2. A 200 mA a mosógép szigetelési hibáján át a védővezetőn folyik a föld felé.
3. Egy 30 mA-es ÁVK ennél jóval kisebb különbségnél kiold.
:::

## A névleges kioldó különbözeti áram

Az ÁVK legfontosabb jellemzője a **névleges kioldó különbözeti áram**, jele **IΔn**. Ekkora különbözeti áramnál az ÁVK-nak legkésőbb ki kell oldania. Szokásos értékei: **10 mA, 30 mA, 100 mA, 300 mA, 500 mA, 1 A**.

- **Legfeljebb 30 mA:** nagy érzékenységű ÁVK, a személyek védelmére (kiegészítő védelem).
- **100–1000 mA:** közepes érzékenységű ÁVK, elsősorban a szigetelési hibák okozta tűz megelőzésére.

## Mire nem véd az ÁVK?

Az ÁVK csak azt érzékeli, ha áram **elfolyik** a körből. Ha valaki egyszerre érint egy fázisvezetőt és a nullavezetőt (vagy két fázist), a testén átfolyó áram ugyanabban a körben tér vissza, nincs különbözeti áram, és az ÁVK **nem old ki**. Az ember ilyenkor egyszerűen egy fogyasztó a körben.

:::example
Valaki egy szétszedett lámpatestben egyik kezével a fázis-, a másikkal a nullakapocshoz ér, miközben szigetelő padlón áll. A testén 0,045 A folyik át.

1. A fázisvezetőn befolyó többletáram 0,045 A.
2. A nullavezetőn ugyanez a 0,045 A tér vissza.
3. Különbözeti áram: 0 A. Az ÁVK nem old ki.
:::

Ezért az ÁVK **nem helyettesíti** a feszültségmentesítést, és nem helyettesíti a túláramvédelmet sem: túlterhelést és fázis–nulla zárlatot nem érzékel. A kombinált készülék (RCBO, magyarul gyakran *Fi-relés kismegszakító*) mindkét funkciót egy házban egyesíti.

Az ÁVK **TN-C rendszerben nem működik**: ott a hibaáram a PEN-vezetőn, tehát az összegáram-transzformátoron keresztül tér vissza.

:::safety
- Az ÁVK a hibát a megérintés **után** kapcsolja le, és csak a földön át elfolyó áramot érzékeli. Feszültség alatt álló részen dolgozni ÁVK-val védett körben is tilos: munka előtt mindig feszültségmentesíts.
- A nagy érzékenységű (legfeljebb 30 mA-es) ÁVK a hibavédelem **kiegészítése**, nem helyettesítője: a védővezetőt és a túláramvédelmet ÁVK mellett is szabályosan ki kell alakítani.
:::

:::mistake
Gyakori tévhit, hogy a 30 mA-es ÁVK „mindentől megvéd”. A fázis és nulla egyidejű érintésekor nem old ki, és a kioldás előtt rövid ideig az áram ugyanúgy átfolyik a testen.
:::

:::exam
A vizsgán kérdés lehet az összegáram-transzformátor működési elve, a névleges kioldó különbözeti áram jelentése, és hogy az ÁVK milyen érintés ellen nem véd.
:::

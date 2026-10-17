---
title: Lakatfogó és egyéb mérőeszközök
summary: Hogyan mér áramot a lakatfogó a kör megbontása nélkül, miért csak egy vezetőt fogj körül vele, és mi a különbség a feszültségkémlelő és a multiméter között.
verify:
  - "AC lakatfogó áramváltó elven működik (a mért vezető a primer tekercs); a lakatfogó a körülfogott vezetők áramainak vektoros összegét méri, kétvezetékes kábelen nullát mutat; DC méréshez Hall-elemes lakatfogó kell – Wikipedia: Current clamp"
  - "Feszültségmentesség megállapítása próbalámpával vagy 20 mA-nél nagyobb fogyasztású, kétsarkú, EN 61243 szerinti feszültségvizsgálóval; szellemfeszültség – MSZ 1585:2016 (feszultsegmentesites.hu), lásd safety/isolation-procedure/02"
  - "Példa (10 A, 6 A, 0 A) – szemléltető értékek"
  - "Az egysarkú fázisceruza és az érintés nélküli feszültségjelző feszültségmentesség igazolására nem használható – feszultsegmentesites.hu, lásd safety/isolation-procedure/02"
---

:::goals
- Megérted a lakatfogó működési elvét.
- Helyesen mérsz áramot lakatfogóval, és tudod, miért csak egy vezetőt szabad körülfogni.
- Ismered az AC és az AC/DC lakatfogó különbségét.
- Tudod, mikor kell feszültségkémlelőt és mikor multimétert használni.
:::

## A lakatfogó működési elve

A **lakatfogó** (fogóáram-mérő) olyan árammérő, amelynek szétnyitható vasmagja („pofái”) körbefogja a mért vezetőt. A kört **nem kell megbontani**, és a műszer nem érintkezik fémesen a feszültség alatt álló vezetővel. Ezért a hálózati áramok mérésére a lakatfogó a villanyszerelő alapműszere.

A váltakozó áramú lakatfogó **áramváltó** elven működik: a körülfogott vezető a transzformátor primer tekercse (egy menet), a vasmagra tekercselt mérőtekercs a szekunder tekercs. A vezetőben folyó váltakozó áram változó mágneses teret kelt a vasmagban, ez a mérőtekercsben arányos áramot indukál, amelyet a műszer kijelez.

Ez az elv **csak váltakozó áramon** működik, mert egyenáram nem kelt változó mágneses teret. Egyenáram mérésére (napelemes rendszer, akkumulátor, elektromos autó töltő egyenáramú oldala) **Hall-elemes** lakatfogó kell: ez közvetlenül a mágneses tér erősségét méri, ezért egyen- és váltakozó áramot is mér. Az ilyen műszeren az **AC/DC** jelölés vagy a ⎓ jel jelzi a DC-mérési képességet.

## Csak egy vezetőt fogj körül!

A lakatfogó a pofái között átmenő **összes vezető áramának együttes (vektoros) összegét** méri.

- Egy fázisvezető körülfogásakor a fázisáramot méred.
- Ha egy egyfázisú készülék teljes kábelét (fázis + nulla) fogod körül, a műszer **nullát** mutat: ugyanaz az áram folyik oda a fázisvezetőn, mint vissza a nullavezetőn, és a kettő kioltja egymást.

Ezért a fogyasztó áramának méréséhez a kábel ereit szét kell választani, vagy olyan **leválasztó adaptert** kell használni, amelyben a fázisvezető külön hurokban fut.

:::example
Egy elosztóban a lakatfogóval egy háromfázisú betáplálás vezetőit méred.

1. L1-et körülfogva: 10 A.
2. L2-t körülfogva: 6 A.
3. L3-at körülfogva: 0 A.
4. Mind a három fázist és a nullát együtt körülfogva a kijelzés közel 0 A. Ha nem, a különbség a körből a védővezetőn vagy a földön át elfolyó **szivárgóáram**.
:::

A szivárgóáram méréséhez kis méréshatárú (mA felbontású) **szivárgóáram-mérő lakatfogó** kell; ezzel egy áram-védőkapcsoló indokolatlan kioldásának okát lehet megkeresni.

## A lakatfogó helyes használata

1. Állítsd be a mérés fajtáját (A~ vagy A⎓) és, ha kell, a méréshatárt.
2. DC méréshez a mérés előtt a műszert vezető nélkül **nullázd** (ZERO vagy REL gomb), mert a Hall-elem a környezet mágneses terét is érzékeli.
3. Fogd körül az egyetlen vezetőt, és zárd a pofákat teljesen. Ha a pofák között rés marad, a mérés pontatlan.
4. A vezető lehetőleg a pofák közepén haladjon.
5. Olvasd le az értéket. Kis áramnál a műszer felbontása korlátoz: egy vezetőt többször átvezetve a pofákon a kijelzett érték a menetszámmal arányosan nő, és ezt kell elosztanod.

A legtöbb lakatfogó multiméterként is működik: van feszültség-, ellenállás- és folytonosságmérő állása, mérőzsinórokkal. Ezekre az állásokra ugyanazok a szabályok vonatkoznak, mint a multiméterre.

## Feszültségkémlelő vagy multiméter?

A **kétpólusú feszültségkémlelő** egyetlen kérdésre ad megbízható választ: **van-e feszültség** a mért pontok között. Ezt használod a feszültségmentesség megállapítására, mert:

- nincs forgókapcsolója és méréshatára, ezért nem lehet rossz állásban használni,
- belső fogyasztása elég nagy ahhoz, hogy ne mutasson **szellemfeszültséget** (a lekapcsolt vezetőn kapacitív úton megjelenő, ártalmatlan kis feszültséget),
- a működőképességét használat előtt és után egy ismert feszültségforráson kipróbálod.

A **multiméter** a feszültség pontos **értékét** méri. Ezt használod, amikor tudni akarod, mennyi a feszültség (például 230 V helyett csak 207 V van), és áram- vagy ellenállásméréshez. A multiméter nagy bemeneti ellenállása miatt viszont kijelezheti a szellemfeszültséget, és rossz állásban vagy lemerült elemmel tévesen mutathat 0 V-ot.

Az **egysarkú fázisceruza** (érintős csavarhúzó) és az érintés nélküli feszültségjelző nem alkalmas a feszültségmentesség megállapítására: a jelzésük attól függ, hogyan állsz, milyen a cipőd és a padló.

:::mistake
Gyakori hiba, hogy egy egyfázisú készülék áramát a teljes kábel körülfogásával próbálják mérni, és a nullát mutató műszerből arra következtetnek, hogy a készülék nem vesz fel áramot.
:::

:::exam
Az alapvizsgán kérdés lehet: a lakatfogó működési elve, miért csak egy vezetőt szabad körülfogni, és miért kétpólusú feszültségkémlelővel kell a feszültségmentességet megállapítani.
:::

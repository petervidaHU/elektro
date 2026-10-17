---
title: Vezérlési rajzok
summary: A nyomógomb és a mágneskapcsoló rajzjele, az öntartás és a keresztreteszelés rajza, és az áramútrajz olvasása.
verify:
  - "Az öntartás és a reteszelés elve – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: az öntartásos vezérlés és a reteszelés ábrái, rajzjelei – az oktatónak kell kiegészítenie"
---

:::goals
- Tudod, mi a nyomógomb és a mágneskapcsoló szerepe egy vezérlésben.
- Meg tudod magyarázni az öntartás elvét.
- Érted, miért kell reteszelés ellentétes irányú vagy egymást kizáró kapcsolásoknál.
:::

## A vezérlés két áramköre

A motorvezérlések két külön áramkörből állnak:

- A **főáramkör** (teljesítményáramkör) viszi a motor nagy áramát: a hálózatból a **mágneskapcsoló főérintkezőin** át a motorhoz.
- A **vezérlő áramkör** kis áramú: a nyomógombokat és a mágneskapcsoló **tekercsét** tartalmazza. Ez dönti el, mikor húz meg a mágneskapcsoló.

A két áramkört a rajzon külön rajzolják le: felül vagy bal oldalon a főáramkör, mellette vagy alatta az áramútrajz.

## A nyomógomb és a mágneskapcsoló rajzjele

- A **nyomógomb** működtetésre kapcsolja az áramkört. Kétféle van: a **záró** (indítógomb) nyomásra zár, a **bontó** (leállítógomb) nyomásra szakít.
- A **mágneskapcsoló** egy tekercsből és érintkezőkből áll: a tekercs árama behúzza az érintkezőket. Ugyanaz a betűjel jelöli a tekercset és a hozzá tartozó érintkezőket, még ha a rajz különböző pontjain vannak is.

Áramútrajzon az érintkezők **nyugalmi helyzetben** (tekercs árammentes) vannak ábrázolva.

## Az öntartás

Ha az indítógombot elengeded, a mágneskapcsoló elengedne. Az **öntartás** ezt akadályozza meg: a mágneskapcsoló egy **segédérintkezője** az indítógombbal **párhuzamosan** van kötve.

A működés lépései:

1. Megnyomod az **indítógombot**: a tekercs áramot kap, a mágneskapcsoló behúz.
2. A behúzott mágneskapcsoló **segédérintkezője** zár, és áthidalja az indítógombot.
3. Elengeded az indítógombot: a tekercs a segédérintkezőn át **továbbra is kap áramot**, a motor megy.
4. A **leállítógomb** (bontó) megszakítja a tekercs áramkörét: a mágneskapcsoló elenged, a segédérintkező nyit, a motor leáll.

A leállítógomb a tekercs áramkörében **sorosan** van kötve, mind az indítógombbal, mind az öntartó érintkezővel szemben.

:::safety
A **vészleállítást** úgy kell kialakítani, hogy a bontó érintkező a vezérlő áramkört megszakítsa, és a motor akkor is leálljon, ha a vezeték vagy az érintkező meghibásodik. Egy hibás indítógomb vagy a vezeték szakadása soha ne indítson el gépet: a bontó érintkezők megszakadása leállást eredményezzen.
:::

## A reteszelés

Ha egy motor **két irányban** forgathatók (például előre és hátra), a két mágneskapcsoló egyszerre **nem húzhat be**: a két irány főáramköre fázisokat cserél, és a kettő együtt **zárlatot** okozna. A **reteszelés** ezt akadályozza meg: az egyik mágneskapcsoló bontó segédérintkezője a másik tekercs áramkörébe van sorosan kötve. Amíg az egyik behúzott, a másik nem kaphat áramot. Ez a **villamos reteszelés**; a kettőt gyakran mechanikus reteszelés is kiegészíti.

## Több helyről indítás és leállítás

- Több **indítógombot** egymással **párhuzamosan** kötünk.
- Több **leállítógombot** egymással **sorosan** kötünk.

Így bármelyik indítógombbal el lehet indítani, és bármelyik leállítógombbal le lehet állítani.

:::mistake
„A leállítógombot is az indítógombbal párhuzamosan kötöm.” Nem: akkor nem állítaná le a motort. A leállító (bontó) gomb a tekercs áramkörében **sorosan** van, hogy megszakítson.
:::

:::exam
A II. rész kérdezi az öntartás működését és a reteszelés szükségességét. Rajzon kell felismerni az indító- és leállítógombot, a segédérintkezőt és a reteszelést.
:::

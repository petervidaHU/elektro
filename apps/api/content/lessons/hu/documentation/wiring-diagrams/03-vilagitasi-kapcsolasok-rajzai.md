---
title: Világítási kapcsolások rajzai
summary: Hogyan kapcsolódik az egyvonalas rajz a működési rajzhoz világítási áramköröknél, és hogyan olvasd a lépcsőházi világítás rajzát.
verify:
  - "A világítási kapcsolások rajzainak olvasása – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a lépcsőházi automata és az impulzusrelé bekötési rajza (ábra) – az oktatónak kell kiegészítenie"
---

:::goals
- Össze tudod kötni az egyvonalas és a működési rajzot egy világítási kapcsolásnál.
- Követni tudod egy egyszerű kapcsolás áramútját a rajzon.
- Tudod, mire figyelj a lépcsőházi világítás rajzánál.
:::

## Ugyanaz a kapcsolás két rajzon

Egy világítási kapcsolást többféleképpen rajzolhatunk, és mindegyik más kérdésre felel:

- Az **egyvonalas rajz** azt mutatja, mi mit táplál: a lakáselosztóból melyik védőkészülék kapcsolja a világítási kört.
- A **működési (elvi) rajz** azt mutatja, hogyan kapcsolódik a kapcsoló, a lámpa és a vezeték, és hogyan kapcsol a lámpa.

A kettőt együtt kell olvasni: az egyvonalas rajz a „kit táplál?” kérdésre ad választ, a működési rajz a „hogyan kapcsol?" kérdésre.

## Az egyszerű kapcsolás rajzának olvasása

Egy egysarkú kapcsolás működési rajzán a következőt látod:

1. A **fázisvezető** a védőkészüléktől a kapcsolóhoz megy.
2. A kapcsolóról a **kapcsolt fázis** (kapcsolt vezeték) a lámpához megy.
3. A lámpa másik kapcsa a **nullavezetőre** van kötve.
4. A **védővezető** a lámpatest fém részeihez megy, ha az I. osztályú.

Az áramút: fázis → kapcsoló → lámpa → nulla. Ha a kapcsoló nyitott, megszakad az áramút, a lámpa nem kap feszültséget. A rajzon a vezetők mellé írt jelölések (például a vezetékek száma) segítenek a bekötésben.

:::safety
A kapcsolónak mindig a **fázisvezetőt** kell megszakítania, nem a nullát. Ha a kapcsoló a nullát szakítaná meg, a lámpatestben kikapcsolt állapotban is fázisfeszültség lenne, és lámpacserekor áramütést szenvedhetsz. A rajzon ellenőrizd, hogy a kapcsoló a fázisra kerül.
:::

## A váltó- és keresztkapcsolás rajza

A váltókapcsolású világítás rajzán két váltókapcsoló van, a kettő között **két összekötő vezeték**. A rajzról le tudod olvasni, hogy melyik állásban van áram a lámpában. Több helyről kapcsolt világításnál a két váltókapcsoló közé keresztkapcsolót iktatnak, amelyet a rajz külön jellel mutat.

## A lépcsőházi világítás rajza

A lépcsőházi világítás működési rajza a következőt mutatja: a **nyomógombok** (több emeleten) párhuzamosan vannak kötve, és egy **lépcsőházi automatát** vagy **impulzusrelét** működtetnek, amely a lámpákat kapcsolja. A nyomógombokhoz külön vezeték megy. A rajzon a nyomógombok vezérlő áramköre és a lámpák terhelő áramköre különválik.

## Mire figyelj?

- A rajzon **jelmagyarázat** és a **vezetők száma** is szerepel; ezt mindig olvasd el.
- A kapcsolók és lámpák **sorszámozása** azonosítja a bekötésnél, melyik kapcsoló melyik lámpát kapcsolja.
- A rajz és a valóság közötti eltérést szerelés közben **jelezni kell**, és a rajzot át kell vezetni.

:::mistake
„A kapcsolás működik, tehát a rajz is jó.” A működő kapcsolás is lehet rossz: ha a kapcsoló a nullát szakítja, a lámpa kikapcsol, de a lámpatest feszültség alatt marad. A rajzzal és méréssel kell ellenőrizni.
:::

:::exam
A vizsgán világítási kapcsolás működési rajzát kell értelmezni, vagy hibát keresni benne. A „fázist kapcsoljuk" szabály rajzon is tipikus kérdés.
:::

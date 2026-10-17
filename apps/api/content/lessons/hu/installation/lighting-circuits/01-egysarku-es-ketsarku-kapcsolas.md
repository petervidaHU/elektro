---
title: Egysarkú és kétsarkú kapcsolás
summary: Az egysarkú és a kétsarkú kapcsolás felépítése és működése, és az, hogy miért a fázist kapcsoljuk.
verify:
  - "Az egysarkú kapcsoló a fázisvezetőt szakítja meg, a kétsarkú kapcsoló a fázist és a nullát is – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
---

:::goals
- Le tudod írni az egysarkú kapcsolás felépítését és működését.
- Tudod, mi a kétsarkú kapcsolás, és mikor használjuk.
- Érted, miért a fázisvezetőt kell kapcsolni.
:::

## Az egysarkú kapcsolás

A legegyszerűbb világítási kapcsolás: egy kapcsoló egy lámpát vezérel. A kapcsoló **egyetlen vezetőt** (egy pólust) szakít meg, ezért **egysarkú** kapcsoló.

A bekötés:

1. A **fázisvezető** a védőkészüléktől (kismegszakító) a kapcsolóhoz megy.
2. A kapcsolóról a **kapcsolt fázis** a lámpához vezet.
3. A lámpa másik kapcsa a **nullavezetőhöz** csatlakozik.
4. Ha a lámpatest I. osztályú (fém), a **védővezető** a lámpatesthez kerül.

Az áramút: fázis → kapcsoló → lámpa → nulla. Bekapcsolt állapotban az áramkör zárt, a lámpa világít; kikapcsoltan az áramút megszakad.

## Miért a fázist kapcsoljuk?

A kapcsolónak mindig a **fázisvezetőt** kell megszakítania. Ha a nullát kapcsolnád, a lámpa kikapcsolva is a **fázisfeszültségen** maradna: a lámpafoglalat és a lámpatest feszültség alatt lenne, és izzócserénél vagy tisztításnál **áramütést** szenvednél, mert a lámpa kikapcsolva is csak a nulla szakadása miatt nem világít.

:::safety
A kapcsoló a **fázisvezetőre** kerül, mindig. A bekötés után ellenőrizd feszültségkémlelővel, hogy a kikapcsolt kapcsoló mögötti vezeték, és így a lámpafoglalat is feszültségmentes. Lámpacsere előtt a kapcsolás ellenére a **kismegszakítót is kapcsold le** és a feszültségmentességet ellenőrizd.
:::

## A kétsarkú kapcsolás

A **kétsarkú kapcsoló** egyszerre **két vezetőt** szakít meg: a fázist és a nullát. Kikapcsolt állapotban a lámpa mindkét kapcsán megszakad a kapcsolat a hálózattal. Olyan helyen használjuk, ahol fokozott a biztonság igénye, például nedves helyiségekben, vagy ahol a készülék mindkét pólusról leválasztása előírás.

Két alkalmazási jellemzője van:

- A kétsarkú kapcsoló a **fázis** felől is és a **nulla** felől is leválaszt, így a lámpatest kikapcsolt állapotban nem csak a kapcsoló miatt feszültségmentes.
- Nagyobb a mérete és az ára, mint az egysarkúé.

## Összehasonlítás

- **Egysarkú:** egy vezetőt (a fázist) szakít meg; leggyakoribb, lakásokban.
- **Kétsarkú:** két vezetőt szakít meg (fázis és nulla); fokozott biztonságot ad.

:::mistake
„Mindegy, melyik vezetéket kapcsolom, a lámpa úgyis kialszik.” Csak látszólag: a lámpa kialszik, de ha a nullát kapcsolod, a lámpatest feszültség alatt marad. A rossz bekötés nem látszik üzem közben, csak áramütéskor derül ki.
:::

:::exam
A vizsgán a kapcsolás rajzát kell értelmezni, vagy hibát keresni benne. A „fázist kell kapcsolni" szabály és a kétsarkú kapcsoló célja tipikus kérdés.
:::

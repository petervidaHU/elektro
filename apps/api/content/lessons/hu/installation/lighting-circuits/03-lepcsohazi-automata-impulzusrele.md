---
title: Lépcsőházi automata és impulzusrelé
summary: A lépcsőházi időkapcsoló (automata) és az impulzusrelé működése, bekötésének elve és alkalmazása.
verify:
  - "A lépcsőházi automata időzített lekapcsolással, az impulzusrelé nyomógombos billenő kapcsolással működik – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a lépcsőházi automata és az impulzusrelé pontos bekötési rajza és kapcsolóinak jelölése (ábra) – az oktatónak kell kiegészítenie"
---

:::goals
- Meg tudod magyarázni a lépcsőházi automata működését.
- Meg tudod magyarázni az impulzusrelé működését.
- Tudod, mikor melyiket használjuk.
:::

## A probléma

Lépcsőházban vagy hosszú folyosón sok helyről kell világítást kapcsolni. A váltó- és keresztkapcsolóval ez sok kapcsolót és hosszú vezetéket igényelne. A megoldás: **nyomógombok** és egy központi készülék.

## Lépcsőházi automata (időkapcsoló)

A **lépcsőházi automata** egy időzítő kapcsoló. Működése:

1. Bármelyik emeleten megnyomod a **nyomógombot**.
2. Az automata **bekapcsolja** a lámpát.
3. Egy beállított **idő** után az automata **magától lekapcsol**.

A nyomógombok **párhuzamosan** vannak kötve az automata vezérlő bemenetére, ezért bármelyik elindítja. Az automata egy hálózati kapcsolót működtet, amely a lámpákat táplálja. Előnye, hogy a világítás nem maradhat felesleges égve, és energiát takarít meg. A bekapcsolási időt az automatán lehet beállítani.

## Impulzusrelé

Az **impulzusrelé** (billenőrelé) egy olyan relé, amely **minden nyomógomb-impulzusra átbillen**: egy nyomásra bekapcsol, a következőre kikapcsol, aztán megint be. Állapotát a nyomás után is megtartja (bistabil).

A nyomógombok itt is **párhuzamosan** vannak kötve a relé vezérlő bemenetére, és bármelyikkel lehet ki- és bekapcsolni. Egyszerű, mint a váltókapcsolás, de tetszőleges számú nyomógomb köthető rá, és a nyomógombokhoz csak vezérlő vezeték kell, nem teljes teljesítményű vezeték.

## Különbség

- **Automata:** idő után **magától kikapcsol**; közös terekben ajánlott.
- **Impulzusrelé:** csak a **nyomógomb** billenti át; állapotot tart, nincs időzítés.

## Alkalmazás

- **Lépcsőházak, folyosók, pincék:** automata, hogy ne maradjon égve a világítás.
- **Lakásokban, nagy terekben:** impulzusrelé, ha több helyről kell kapcsolni egyetlen áramkört, kényelmesen.
- Mindkettő **kapcsolóaljzatként vagy az elosztóban**, kismegszakító után, a **világítási kör védelmével** együtt szerelhető.

:::safety
A nyomógombok vezérlő áramköre ugyanazon a hálózaton van, mint a világítás, ezért a nyomógombok vezetékei is **feszültség alatt lehetnek**. Szerelés előtt az egész áramkört feszültségmentesítsd. A nyomógomb-áramkör is a világítási körhöz tartozik, és ugyanazt a védőkészüléket használja.
:::

:::mistake
„A nyomógomb csak a vezérlő jelet viszi, ezért biztonságos érinteni.” A nyomógomb vezetékén hálózati feszültség van; ugyanúgy feszültségmentesíteni kell, mint a világítás vezetékét.
:::

:::exam
A vizsgán a lépcsőházi automata és az impulzusrelé működésének különbségét, és a nyomógombok bekötési módját (párhuzamosan) kérdezik.
:::

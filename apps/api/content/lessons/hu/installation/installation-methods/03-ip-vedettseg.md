---
title: IP-védettség
summary: Az IP-kód felépítése, és az, hogy hol milyen védettség kell: fürdőszoba, kültér.
verify:
  - "Az IP-kód két számjegye: az első a szilárd testek (érintés, por) elleni, a második a víz elleni védettséget jelöli – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: az IP-kód első és második számjegyének jelentése fokozatonként (0–6, illetve 0–9) – MSZ EN 60529"
  - "HIÁNYZIK: a minimálisan előírt IP-védettség fürdőszobában, kültéren és más környezetben – MSZ HD 60364-7-701 és az 5-51 vonatkozó része"
---

:::goals
- Meg tudod fejteni az IP-kód felépítését.
- Tudod, mire utal az első és mire a második számjegy.
- Tudod, miért kell a környezethez illő védettség.
:::

## Mi az IP-kód?

Az **IP-kód** (angolul: *Ingress Protection*, behatolás elleni védelem) azt adja meg, hogy a villamos készülék vagy szerelvény **burkolata** mennyire védi a belsejét a **szilárd testek** (por, szerszám, ujj) és a **víz** behatolásától, és mennyire védi az embert a veszélyes részek megérintésétől.

A jelölés: **IP** és utána két számjegy, például IP**xy**.

## A két számjegy

- Az **első számjegy** (x) a **szilárd testek** elleni védelmet adja meg: az érintés elleni védelmet (ujj, szerszám) és a por behatolása elleni védelmet. Minél nagyobb a szám, annál kisebb tárgyakat tart ki, és annál jobban véd a portól.
- A **második számjegy** (y) a **víz** elleni védelmet adja meg: csepegő víztől a zuhogó esőn, a vízsugáron át a víz alá merítésig. Minél nagyobb a szám, annál erősebb vízhatás ellen véd.

A számjegyek pontos jelentését táblázat adja; a fenti irány (nagyobb szám = erősebb védelem) az, amit biztosan tudnod kell. Az **X** jel azt jelenti, hogy az adott szempontból nem vizsgálták.

## Miért fontos?

A burkolat védettsége két célt szolgál:

1. **Személyvédelem:** az első számjegy az alapvédelem része: megakadályozza, hogy az ujj vagy szerszám az aktív részekhez érjen.
2. **A készülék védelme:** a por és a nedvesség a szigetelést tönkreteheti, és zárlatot okozhat.

## Hol milyen védettség kell?

A környezet határozza meg a szükséges védettséget:

- **Száraz, védett belső tér:** alacsonyabb védettség elég.
- **Nedves helyiségek (például fürdőszoba, konyha):** a víz elleni védelem fontos; a fürdőszobában a vízhez való közelség határozza meg, hol milyen IP-fokozat szükséges.
- **Kültér:** eső, por és ütés ellen magasabb védettség kell.
- **Poros, nedves ipari környezet:** a legerősebb védettségek.

A konkrét előírt értékek táblázatból és a vonatkozó szabványból olvashatók ki; tervezéskor és szereléskor mindig az adott helyre előírt IP-fokozatot kell betartani.

:::safety
A védettséget a **teljes** szerelvényegyüttesnek biztosítania kell: egy IP-védett burkolat is csak akkor véd, ha a kábelbevezetés, a fedél és a tömítés is szakszerű. A kitört vagy hiányzó tömítés, a rosszul lezárt bevezetés megszünteti a védettséget.
:::

:::mistake
„A készüléknek jó az IP-fokozata, ezért bárhol használható.” A védettség csak a készülékre vonatkozik. Ha a bekötésnél a védettséget lerontod (kábelbevezetés tömítés nélkül, nyitva hagyott fedél), a készülék környezetben nem lesz védett.
:::

:::exam
A II. részben az IP-kód felépítését és jelentését kérdezik: melyik számjegy mire utal, és milyen védettség kell egy adott helyen. A pontos fokozatok táblázatból derülnek ki.
:::

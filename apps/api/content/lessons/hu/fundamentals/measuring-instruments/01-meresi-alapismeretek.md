---
title: Mérési alapismeretek
summary: Analóg és digitális műszerek, a méréshatár megválasztása, a pontossági osztály és a digitális műszer hibahatára, és hogyan olvasod le helyesen a mért értéket.
verify:
  - "Analóg műszer pontossága a végkitérés (méréshatár) százalékában értendő – Wikipedia: Multimeter (Accuracy); számított példa (1,5 osztály, 300 V → ±4,5 V)"
  - "Digitális műszer hibahatára ±(a leolvasott érték %-a + n digit/count) – Wikipedia: Multimeter (Accuracy); számított példa (230,0 V, ±(0,5 % + 2 digit) → ±1,35 V)"
  - "HIÁNYZIK: a pontossági osztályok szabványos számsora (0,5; 1; 1,5; 2,5) – olvasott forrás nélkül, tanári ellenőrzés kell"
---

:::goals
- Ismered az analóg és a digitális műszer felépítésének és használatának különbségeit.
- Helyesen választod meg a méréshatárt.
- Ki tudod számítani egy analóg műszer hibáját a pontossági osztályából.
- Ki tudod számítani egy digitális műszer hibáját az adatlapi hibahatárból.
:::

## Analóg és digitális műszerek

**Analóg műszer:** a mért értéket egy mutató kitérése jelzi egy skálán. Előnye, hogy a változások (ingadozás, lassú emelkedés) jól láthatók. Hátránya, hogy a leolvasás pontossága a szemtől függ, és a skálát a méréshatárhoz kell igazítva olvasni.

**Digitális műszer:** a mért értéket számjegyekkel mutatja. Előnye a könnyű és egyértelmű leolvasás, a nagy belső ellenállás feszültségmérésnél, és sok műszer automatikusan választja a méréshatárt. Hátránya, hogy gyorsan változó értéknél a számjegyek ugrálnak.

A villanyszerelő ma szinte kizárólag digitális multimétert, lakatfogót és installációs mérőműszert használ, de analóg műszerrel elosztószekrényekben (beépített panelműszer) és régebbi mérőeszközöknél még találkozol.

## A méréshatár

A **méréshatár** a műszer adott állásában mérhető legnagyobb érték.

- Ha a mért érték nagyobb a méréshatárnál, a digitális műszer túlcsordulást jelez (általában „OL” felirat), az analóg műszer mutatója kiakad, és a műszer károsodhat.
- Ha a méréshatár jóval nagyobb a mért értéknél, a mérés pontatlan lesz.

**Szabály:** ismeretlen nagyságú mennyiségnél mindig a **legnagyobb** méréshatárral kezdj, és lépésenként haladj lefelé, amíg a mért érték a méréshatár felső részébe nem esik. Analóg műszernél a legpontosabb a mérés, ha a mutató a skála felső harmadában áll.

## Az analóg műszer pontossági osztálya

Az analóg műszer pontosságát a **pontossági osztály** adja meg (például 0,5; 1; 1,5; 2,5). A szám azt mutatja, hogy a hiba legfeljebb a **méréshatár** hány százaléka lehet, a skála bármely pontján.

`ΔU = (pontossági osztály / 100) · méréshatár`

:::example
Egy 1,5-ös pontossági osztályú voltmérő 300 V-os méréshatárban 230 V-ot mutat. Mekkora a hiba?

1. ΔU = 0,015 · 300 V = ±4,5 V.
2. A valódi érték 225,5 V és 234,5 V között van.
3. A relatív hiba: 4,5 V / 230 V ≈ 2,0 %.
:::

Ha ugyanezzel a műszerrel ugyanebben a méréshatárban 30 V-ot mérsz, a hiba továbbra is ±4,5 V, ami 15 %. Ezért kell a méréshatárt a mért értékhez igazítani.

## A digitális műszer hibahatára

A digitális műszer adatlapja a hibát két részből adja meg: `±(a leolvasott érték %-a + n digit)`. A **digit** az utolsó kijelzett helyiérték egysége (a felbontás).

:::example
Egy multiméter hibahatára AC feszültségmérésnél ±(0,5 % + 2 digit). A kijelző 230,0 V-ot mutat, a felbontás 0,1 V.

1. A százalékos rész: 0,005 · 230,0 V = 1,15 V.
2. A digitrész: 2 · 0,1 V = 0,2 V.
3. A teljes hiba: ±(1,15 V + 0,2 V) = ±1,35 V.
4. A valódi érték 228,65 V és 231,35 V között van.
:::

## Helyes leolvasás

- Analóg műszernél a skálára **merőlegesen** nézz. Ha a skálán tükörsáv van, akkor olvass le, amikor a mutató és a tükörképe fedi egymást. Ferde rálátásnál **parallaxishiba** keletkezik.
- Digitális műszernél figyelj a mértékegység-előtagra (mV vagy V, kΩ vagy MΩ) és a tizedesvessző helyére.
- Mindig jegyezd fel a mértékegységet és a méréshatárt is, ne csak a számot.

:::mistake
Gyakori hiba, hogy az analóg műszer pontossági osztályát a **leolvasott** értékre számítják. A pontossági osztály a **méréshatárra** vonatkozik: kis kitérésnél a relatív hiba sokszorosa lehet a pontossági osztálynak.
:::

:::exam
Az alapvizsgán kérdés lehet a méréshatár helyes megválasztása, és a mérési hiba kiszámítása a pontossági osztályból vagy a hibahatárból.
:::

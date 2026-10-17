---
title: A terhelhetőséget befolyásoló tényezők
summary: Mitől függ egy vezeték terhelhetősége a keresztmetszeten kívül, és mi az a helyesbítő tényező.
verify:
  - "A terhelhetőséget a szerelési mód, a környezeti hőmérséklet, a csoportosítás és a szigetelés anyaga befolyásolja – MSZ HD 60364-5-52 szerkezete szerint; táblázati értékek nélkül"
  - "HIÁNYZIK: a szerelési referencia-módok (A1, A2, B1, B2, C, D, E, F, G) pontos jelentése és táblázatai – MSZ HD 60364-5-52 B melléklet; a K8 hivatkozási táblázatokban kell rögzíteni"
  - "HIÁNYZIK: a környezeti hőmérséklet és a csoportosítás helyesbítő tényezőinek értékei – MSZ HD 60364-5-52 B melléklet; hitelesített táblázatból"
---

:::goals
- Fel tudod sorolni, mi befolyásolja a vezeték terhelhetőségét.
- Érted, hogy a hűtés romlásakor miért csökken a terhelhetőség.
- Tudod, mi a helyesbítő tényező, és hogyan alkalmazod.
:::

## Mindig a hőleadás számít

A vezeték terhelhetőségét az dönti el, hogy a keletkező hő mennyire tud eltávozni. Minél rosszabb a hűtés, annál kisebb áramot vihet át tartósan a vezeték. Négy fő tényező számít.

## 1. Szerelési mód

Ugyanaz a vezeték másképp hűl, ha szabadon a levegőben van, ha falon van rögzítve, ha csőben fut, hőszigetelt falban halad, vagy a földben fekszik. A szabvány ezeket **szerelési referencia-módokra** osztja, és mindegyikhez külön terhelhetőségi értékeket ad meg. A hőszigetelt falban futó vezeték hűlése a legrosszabb, ott a legkisebb a terhelhetőség.

## 2. Környezeti hőmérséklet

A terhelhetőségi táblázatok egy alapul vett környezeti hőmérsékletre vonatkoznak. Ha a környezet melegebb (például tetőtér, kazánház), a vezeték kevésbé tud hőt leadni, ezért a terhelhetősége **csökken**. Hidegebb környezetben nőhetne, de a szabvány ennek kihasználását szigorúan szabályozza.

## 3. Csoportosítás

Ha több áramkör vezetéke fut **egymás mellett vagy egy csőben**, kölcsönösen melegítik egymást, és kevésbé hűlnek. Minél több az egymás mellett haladó áramkör, annál kisebb az egyes vezetékek terhelhetősége.

## 4. A szigetelés anyaga

A különböző szigetelőanyagok más hőmérsékletet bírnak el tartósan. Amelyik anyag magasabb hőmérsékletet visel, az azonos keresztmetszetű vezetéken nagyobb áramot enged meg.

## A helyesbítő tényező

A terhelhetőségi táblázat egy **alapfeltételre** (adott szerelési mód, adott környezeti hőmérséklet, egyedül futó vezeték) ad értéket. Ha a valós körülmények eltérnek, az alapértéket **helyesbítő tényezőkkel** (k) szorozzuk meg:

`I_z = k₁ · k₂ · … · I_z,táblázat`

- I_z: a tényleges terhelhetőség a valós körülmények között, A,
- k₁, k₂, …: a helyesbítő tényezők (például a hőmérséklet és a csoportosítás), egynél kisebb értékek rosszabb hűlésnél,
- I_z,táblázat: a táblázatból kiolvasott alapérték, A.

Több eltérő körülmény esetén a tényezőket **összeszorozzuk**. Az eredmény mindig kisebb, mint a táblázati érték, ha a hűtés romlik.

:::mistake
A tényezőket nem kell és nem szabad összeadni vagy átlagolni. Ha két rosszabb körülmény áll fenn (meleg környezet és csoportosítás), a kettő hatása szorzódik.
:::

:::safety
A helyesbítés elhagyása a terhelhetőség **túlbecsléséhez** vezet: a vezeték a szükségesnél vékonyabb lesz, és tartósan túlmelegszik. Soha ne hagyd el a helyesbítést „mert a vezeték úgyis csak ritkán van teljes terhelésen”.
:::

:::exam
A III. rész feladataiban a táblázatot és a helyesbítő tényezők értékeit kivonatként kapod meg. A feladatod az, hogy a megfelelő sort kiolvasd, és helyesen alkalmazd a tényezőket.
:::

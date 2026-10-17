---
title: Az ÁVK alkalmazása és bekötése
summary: Az ÁVK típusai (AC, A, F, B), a kioldási idők, hol kötelező a 30 mA-es kiegészítő védelem, és hogyan kell helyesen bekötni és próbagombbal ellenőrizni.
verify:
  - "Típusok: AC – szinuszos váltakozó különbözeti áram; A – ezen felül lüktető egyenáramú különbözeti áram; F – ezen felül vegyes frekvenciájú (1 kHz-ig) különbözeti áram; B – ezen felül sima egyenáramú különbözeti áram is – de.wikipedia: Fehlerstrom-Schutzschalter; Wikipedia: Residual-current device"
  - "Legnagyobb kioldási idő késleltetés nélküli ÁVK-nál: 0,3 s IΔn-nél, 0,15 s 2·IΔn-nél, 0,04 s 5·IΔn-nél; szelektív (késleltetett, S) ÁVK-nál 0,5 s / 0,2 s / 0,15 s – de.wikipedia: Fehlerstrom-Schutzschalter (EN 61008-1); hu.wikipedia: Áram-védőkapcsoló (adatlappélda: 300 ms / 150 ms / 40 ms)"
  - "Legfeljebb 30 mA-es ÁVK szükséges: laikusok által általános használatra szánt, legfeljebb 32 A-es dugaszolóaljzatok végáramköreire; szabadban használt hordozható eszközök legfeljebb 32 A-es végáramköreire; lakások világítási áramköreire – de.wikipedia: Fehlerstrom-Schutzschalter (DIN VDE 0100-410:2018, 411.3.3 = HD 60364-4-41); MEE VÉT kézikönyv, 350. o. (kiegészítő védelem legfeljebb 30 mA-es ÁVK-val)"
  - "HIÁNYZIK: a hazai MSZ HD 60364-4-41 és -7-701 (fürdőszoba) szövege a 30 mA-es ÁVK kötelező alkalmazási helyeiről – a tanár ellenőrizze a hatályos magyar szöveg szerint"
  - "A próbagomb belső vizsgáló áramkörrel mesterséges különbözeti áramot hoz létre – Wikipedia: Residual-current device"
---

:::goals
- Ismered az ÁVK típusait, és tudod, melyik milyen hibaáramot érzékel.
- Ismered a kioldási idők követelményeit.
- Tudod, hol kötelező a legfeljebb 30 mA-es kiegészítő védelem.
- Helyesen kötöd be az ÁVK-t, és tudod, hogyan ellenőrzöd a próbagombbal.
:::

## Az ÁVK típusai

A korszerű fogyasztók (frekvenciaváltók, inverterek, elektromos autó töltők, tápegységek) hibája esetén a különbözeti áram nem mindig szinuszos. Az ÁVK típusa azt mutatja, milyen alakú különbözeti áramot érzékel megbízhatóan:

- **AC típus:** csak **szinuszos váltakozó** különbözeti áramot érzékel. Elektronikus fogyasztók egyenáramú összetevőjét tartalmazó hibájánál nem old ki biztosan.
- **A típus:** az AC típuson felül **lüktető egyenáramú** különbözeti áramot is érzékel (például egyenirányítós, diódás tápegységek hibájánál). Ez a leggyakrabban használt típus.
- **F típus:** az A típuson felül **vegyes frekvenciájú** (1 kHz-ig) különbözeti áramot is érzékel. Egyfázisú frekvenciaváltós készülékekhez (például inverteres mosógép, hőszivattyú) való.
- **B típus:** az F típuson felül **sima (szűrt) egyenáramú** különbözeti áramot is érzékel. Háromfázisú frekvenciaváltókhoz és más olyan berendezésekhez használják, amelyek hibája sima egyenáramú különbözeti áramot okozhat; ha a gyártó előírja, például elektromos autó töltőhöz.

A típust a készülék előlapján betűvel és rajzjellel jelölik. Mindig a fogyasztó gyártójának előírása szerinti típust építsd be.

## Kioldási idők

A szabvány előírja, legfeljebb mennyi idő alatt kell az ÁVK-nak kioldania. Késleltetés nélküli (általános) ÁVK-nál:

- IΔn-nél: legfeljebb **0,3 s**,
- 2 · IΔn-nél: legfeljebb **0,15 s**,
- 5 · IΔn-nél: legfeljebb **0,04 s**.

A **szelektív** (S jelű, késleltetett) ÁVK szándékosan lassabb: IΔn-nél legfeljebb 0,5 s, 2 · IΔn-nél 0,2 s, 5 · IΔn-nél 0,15 s. Főelosztóba, sorba kapcsolt ÁVK-k közül a betáplálási oldalra kerül, hogy egy végáramköri hibánál csak a hibás kör alatti ÁVK oldjon ki.

:::example
Egy 30 mA-es, késleltetés nélküli ÁVK vizsgálatakor a mérőműszer 150 mA-es próbaáramot ad. Legfeljebb mennyi idő alatt kell kioldania?

1. 150 mA / 30 mA = 5, tehát a próbaáram 5 · IΔn.
2. A megengedett leghosszabb kioldási idő: 0,04 s = 40 ms.
:::

## Hol kötelező a 30 mA-es ÁVK?

A legfeljebb 30 mA-es ÁVK **kiegészítő védelem**: arra az esetre, ha az alapvédelem és a hibavédelem is meghibásodik, vagy a felhasználó gondatlan. Legfeljebb 30 mA-es ÁVK-val kell védeni:

- a laikusok által általános használatra szánt, legfeljebb **32 A-es dugaszolóaljzatok** végáramköreit,
- a **szabadban** használt hordozható készülékek legfeljebb **32 A-es** végáramköreit,
- a **lakások világítási** áramköreit.

Ezen felül a különleges helyiségekre (fürdőszoba, uszoda, szauna, építési terület) külön előírások vonatkoznak, amelyeket az adott helyiség szabványrésze tartalmaz.

## Bekötés és próbagomb

Bekötési szabályok:

- Az ÁVK-n a védett kör **összes** üzemi vezetőjét át kell vezetni: a fázisvezető(ke)t **és a nullavezetőt** is.
- A **védővezetőt (PE) nem** szabad átvezetni rajta.
- Az ÁVK utáni nullavezetőt **nem szabad** más ÁVK nullavezetőjével vagy egy védelem nélküli kör nullájával összekötni, és a védővezetővel sem: a különbözeti áram miatt az ÁVK indokolatlanul kiold, vagy a hibát nem érzékeli.
- Az ÁVK TN-C rendszerben nem használható, csak a PEN-vezető szétválasztása után (TN-C-S, TN-S), illetve TT-rendszerben.
- Az ÁVK nem véd túláram ellen: a kör túláramvédelméről külön kismegszakítóval vagy kombinált (RCBO) készülékkel gondoskodni kell.

A **próbagomb** (T jelű) a készülék belső vizsgáló áramkörén mesterséges különbözeti áramot hoz létre. Megnyomásakor az ÁVK-nak ki kell oldania. A próbagomb a kioldó mechanikát ellenőrzi, a kioldási időt és a tényleges kioldóáramot csak műszeres méréssel lehet ellenőrizni.

:::safety
- Az ÁVK-t és a hozzá tartozó áramköröket csak feszültségmentes állapotban, az öt biztonsági művelet után szabad bekötni vagy átkötni.
- Az ÁVK bekötése után a próbagombbal és műszeres méréssel is ellenőrizd a működést, mielőtt a berendezést átadod.
- Ha az ÁVK visszakapcsolás után azonnal újra kiold, ne próbáld erővel bekapcsolva tartani: a körben szigetelési hiba van, amelyet meg kell keresni.
- A 30 mA-es ÁVK kiegészítő védelem: nem helyettesíti a védővezetőt és nem teszi megengedetté a feszültség alatti munkát.
:::

:::mistake
Gyakori hiba, hogy a nullavezetőt nem az ÁVK-n át, hanem közvetlenül a nullasínről kötik a védett körre. Ilyenkor a fogyasztó üzemi árama is különbözeti áramnak látszik, és az ÁVK az első bekapcsolásnál kiold.
:::

:::exam
A vizsgán kérdés lehet az ÁVK típusainak jelentése, a 30 mA-es kiegészítő védelem kötelező alkalmazási helyei, és a helyes bekötés (N átvezetése, PE nem).
:::

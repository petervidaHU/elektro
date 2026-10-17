---
title: Az ÁVK működése
summary: Hogyan érzékeli az áram-védőkapcsoló a hibaáramot az összegáram-transzformátorral, és mire nem véd.
verify:
  - "Az ÁVK az összegáram-transzformátorral a fázis- és a nullavezető áramának vektorösszegét figyeli; egészséges áramkörben az összeg nulla, hibaáramnál (a föld felé folyó áram) nem nulla, és az ÁVK kiold – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "Az ÁVK nem véd a fázis és a nulla (vagy két fázis) egyidejű érintése ellen, és önmagában nem túláramvédelem (kivéve a kombinált ÁVK-kismegszakítót) – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
---

:::goals
- Meg tudod magyarázni az ÁVK működési elvét.
- Érted, miért érzékeli a földzárlatot.
- Tudod, mire nem véd az ÁVK.
:::

## Mi az ÁVK?

Az :term[áram-védőkapcsoló]{id=rcd} (ÁVK) olyan védőkészülék, amely a **hibaáramot** érzékeli: azt az áramot, amely nem a vezetőkön tér vissza, hanem valahol máshol, például a földbe vagy az emberi testen át folyik el. Ha a hibaáram eléri a névleges kioldó áramát, az ÁVK gyorsan lekapcsolja az áramkört.

## Az összegáram-transzformátor

Az ÁVK lelke az **összegáram-transzformátor**: egy gyűrű alakú vasmag, amelyen átfűzik az áramkör összes vezetőjét (a fázist és a nullát, háromfázisú készüléknél mind a három fázist és a nullát).

Ép áramkörben a fázison befolyó áram **pontosan akkora**, mint a nullán visszafolyó, a két áram a vasmagban ellentétes mágneses mezőt hoz létre, és a mezők kioltják egymást. A mező összege nulla, a vasmagon lévő mérőtekercsben nem indukálódik feszültség, az ÁVK nem old ki.

## Mi történik hibánál?

Ha például testzárlat vagy egy ember érintése miatt áram folyik a **föld felé**, a fázison befolyó áram nagyobb lesz, mint a nullán visszafolyó: a különbség a **hibaáram**. Ekkor a két mágneses mező nem oltja ki egymást, a vasmagban maradó mező a mérőtekercsben feszültséget indukál, amely a kioldó szerkezetet működteti, és az ÁVK megszakítja az áramkört.

Az ÁVK-t tehát nem a hibaáram **nagysága** érdekli abszolút értékben, hanem az, hogy **a vezetők áramának összege nem nulla**. Ezért már nagyon kis hibaáramot is képes érzékelni, sokkal kisebbet, mint amit a kismegszakító észrevenne.

## A próbagomb

Minden ÁVK-n van egy **próbagomb** (T). Megnyomásakor a készülék belső ellenálláson keresztül szándékos hibaáramot hoz létre. Ha az ÁVK jól működik, kiold. A próbagombot rendszeresen meg kell nyomni, hogy lehessen tudni, a szerkezet nem ragadt-e be.

## Mire nem véd az ÁVK?

- **Fázis és nulla egyidejű érintése ellen nem véd.** Ha az ember a fázist és a nullát együtt érinti, az áram a fázison megy be és a nullán jön vissza: az összegáram nulla marad, az ÁVK nem érzékeli. Az áram a testen át a nullavezetőn tér vissza, ezért a vezetők áramának összege nulla marad.
- **Önmagában nem túláramvédelem.** A klasszikus ÁVK nem védi a vezetéket zárlat vagy túlterhelés ellen, ezért mellé kismegszakító vagy biztosító kell. A kettőt egy készülékben egyesítő **kombinált** ÁVK-kismegszakító mindkettőt elvégzi.
- **Nem helyettesíti a védővezetőt.** Az ÁVK a hibavédelem kiegészítője, nem a helyettese.

:::safety
Az ÁVK nem ad teljes védelmet: **csak a föld felé folyó hibaáramot érzékeli**. Ezért a feszültség alatt végzett munkát, amelynél a fázist és a nullát érintheted, nem teszi biztonságossá. Szerelés előtt az ÁVK-s áramkör is feszültségmentesítendő.
:::

:::mistake
„Van ÁVK, tehát nyugodtan hozzáérhetek a vezetékhez." Nem: ha a fázist és a nullát egyszerre érinted, az ÁVK nem old ki. Az ÁVK nem „áramütés ellen véd mindig".
:::

:::exam
A IV. rész kérdezi az ÁVK működési elvét (összegáram-transzformátor), a próbagomb szerepét és azt, hogy mi ellen nem véd.
:::

---
title: Az ÁVK alkalmazása és bekötése
summary: Az ÁVK típusai és névleges kioldó áramai, hol kötelező, és hogyan kell bekötni: a nullavezetőt is át kell vezetni.
verify:
  - "A bekötésnél az áramkör összes aktív vezetőjét (fázis, nulla) át kell vezetni az ÁVK-n; az ÁVK utáni nullavezető nem érintkezhet az ÁVK előtti nullával vagy a védővezetővel – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: az ÁVK névleges kioldó áramai (pl. 10 mA, 30 mA, 100 mA, 300 mA) és a használatuk szerinti felosztás – MSZ EN 61008-1 / MSZ EN 61009-1"
  - "HIÁNYZIK: az ÁVK típusai (AC, A, F, B) és melyik fogyasztónál melyik kell – MSZ EN 61008-1"
  - "HIÁNYZIK: hol kötelező ÁVK-t alkalmazni (kiegészítő védelem: konnektorok, fürdőszoba, kültér, stb.) – MSZ HD 60364-4-41, 41.3. és az OTSZ/MSZ 2364 vonatkozó szakaszai"
---

:::goals
- Tudod, hogyan kell az ÁVK-t bekötni, és miért kell a nullavezetőt is átvezetni rajta.
- Tudod, mit jelent a névleges kioldó áram és a típusjelölés.
- Tudod, mikor használunk ÁVK-t kiegészítő védelemként.
:::

## A névleges kioldó áram és a típus

Az ÁVK-n két alapadat van:

- **Névleges kioldó áram (I_Δn):** az a hibaáram, amelynél az ÁVK kioldásra képes. Minél kisebb, annál érzékenyebb, de annál könnyebben old ki zavaró hatásokra is. A konkrét szabványos értékeket a tervezés választja ki, az értékeket táblázatból kell kiolvasni.
- **Típus:** az ÁVK-k különböző típusúak aszerint, hogy milyen alakú hibaáramot érzékelnek (szinuszos váltakozó, pulzáló egyenáramú, sima egyenáramú összetevővel). A fogyasztók (például elektronikus készülékek, frekvenciaváltók) többféle hibaáramot okozhatnak, ezért a típust a fogyasztó szerint kell választani.

## Hol alkalmazzuk?

Az ÁVK kétféle szerepben van:

- **Hibavédelem:** ott, ahol a túláramvédelem önmagában nem biztosítja a gyors lekapcsolást, például **TT-rendszerben**, ahol a földelési ellenállás nagy.
- **Kiegészítő védelem:** olyan helyeken, ahol az áramütés veszélye fokozott (például konnektoros áramkörök, nedves helyiségek, kültér). A kis kioldó áramú ÁVK itt a második védvonal, ha az alapvédelem vagy a hibavédelem hibásodna.

A kötelező alkalmazás helyeit a vonatkozó előírások adják meg; ezt a tervezésnél mindig a hatályos szabvány szerint kell meghatározni.

## A bekötés szabályai

1. **Minden aktív vezetőt át kell vezetni az ÁVK-n.** Egyfázisú áramkörben a fázist **és** a nullát, háromfázisúban mind a három fázist és a nullát. Az ÁVK csak így tudja képezni az összegáramot. A **védővezető nem megy át** az ÁVK-n.
2. **Az ÁVK utáni nullavezető elkülönített.** Az ÁVK után a nullavezető nem érintkezhet a védővezetővel, és nem kerülhet össze az **ÁVK előtti** nullával vagy más áramkör nullavezetőjével. Ha az ÁVK után a nulla bárhol kapcsolatba kerül a védővezetővel vagy másik nullával, az áram „kitér" a mérőn kívülre, és az ÁVK feleslegesen, vagy egyáltalán nem old ki.
3. **Egy ÁVK mögé csak az ahhoz tartozó áramköröket kell kötni**, és a nullát nem szabad több ÁVK között megosztani.
4. A **bekötés után** próbagombbal ki kell próbálni, és a berendezés ellenőrzésénél műszeres kioldóáram-méréssel is.

:::safety
Rossz bekötésnél (például az ÁVK utáni nulla összekötve a védővezetővel) az ÁVK **kioldhat feleslegesen**, vagy ami veszélyesebb, a védelem **nem működik**, miközben a próbagomb még kioldat. A bekötés után ezért a próbagomb önmagában nem elég: a szerelői ellenőrzés a műszeres vizsgálatot is tartalmazza.
:::

:::mistake
„Elég az ÁVK-n átvezetni a fázist, a nulla mehet mellette." Nem: ha a nulla nem megy át az ÁVK-n, az összegáram nem lesz nulla ép áramkörben sem, és az ÁVK folyton kiold, vagy épp nem érzékeli a hibát.
:::

:::exam
A IV. részben kérdezik a bekötést (mely vezetők mennek át az ÁVK-n), az ÁVK-s nulla elkülönítését és a próbagomb szerepét. A projektvizsgán a hibás ÁVK-bekötés érintésvédelmi hibának számít.
:::

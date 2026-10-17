---
title: A földelés alapfogalmai
summary: Mi a földelő, a földelővezető, a védővezető és a fő földelősín, és mi a különbség az üzemi és a védőföldelés között.
verify:
  - "A földelés fogalmai (földelő, földelővezető, védővezető, fő földelősín) – MSZ HD 60364-1 definíciói szerint; szakmai alapismeret, forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "A védővezető színe zöld-sárga, a nullavezetőé kék – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
---

:::goals
- Meg tudod nevezni a földelés részeit: földelő, földelővezető, védővezető, fő földelősín.
- Meg tudod különböztetni az üzemi és a védőföldelést.
- Érted, mit jelent a földelési ellenállás.
:::

## Mi a földelés?

A **földelés** a villamos berendezés valamely pontjának **szándékos, vezetőképes összekötése a földdel**. A földet vezetőnek tekintjük: nagy kiterjedése miatt a benne folyó áram sehol nem okoz észrevehető feszültségesést, és a potenciálja gyakorlatilag nulla.

A földelésnek két célja lehet, ennek megfelelően kétféle földelést különböztetünk meg.

## Üzemi és védőföldelés

- **Üzemi földelés:** a hálózat egy pontjának (például a transzformátor csillagpontjának) földelése. A hálózat működéséhez tartozik, és meghatározza a hálózati rendszert (TN, TT).
- **Védőföldelés:** a berendezések fém testének földelése, az emberi élet védelmére. Hiba esetén ezen keresztül folyik a hibaáram.

## A földelés részei

1. **Földelő:** a földdel közvetlenül érintkező fém vezető rész, amely a hibaáramot a földbe vezeti. Lehet földbe vert rúd, a földbe fektetett szalag, vagy az épület alapjában elhelyezett vezető.
2. **Földelővezető:** a földelőt a fő földelősínnel (földelő csatlakozóval) összekötő vezető.
3. **Fő földelősín:** az a gyűjtősín, amelyhez a földelővezető, a védővezetők és az egyenpotenciálra hozó vezetők csatlakoznak. Az épület fő védőcsomópontja.
4. **Védővezető (PE):** a berendezések fém testét köti a fő földelősínhez (:term[védővezető]{id=protective-conductor}). Színe **zöld-sárga**.

A hibaáram útja testzárlatnál: fázisvezető → hibahely → védővezető → (fő földelősín) → a tápforrás földelt pontja vagy földelő → vissza a tápforráshoz.

## A földelési ellenállás

A földelő és a távoli föld közötti ellenállás a **földelési ellenállás** (:term[földelési ellenállás]{id=earth-resistance}). Minél kisebb, annál jobban vezeti a földelő a hibaáramot a földbe, és annál kisebb feszültség alakul ki a földelő környezetében.

A földelési ellenállás nem állandó: a talaj nedvességétől, hőmérsékletétől és összetételétől függ. Ezért kell a földelést rendszeresen mérni (a mérésről a Mérés modulban lesz szó).

:::safety
A földelés és a védővezető folytonossága a **hibavédelem alapja**. Egy megszakadt, lazán csatlakozó vagy korrodált védővezető-kötés nem látszik, a készülék közben működik, de a védelem nem működik. Szereléskor minden védővezető-csatlakozást szorosan, szakszerűen kell kialakítani, és a zöld-sárga vezetőt **csak védővezetőként** szabad használni.
:::

:::mistake
„A védővezető is vezeti az üzemi áramot, mint a nulla.” Nem: a védővezetőn normál üzemben **nem folyik áram**. Csak hiba esetén vezeti a hibaáramot. Ha a védővezetőn üzemi áram folyna, az hibát jelez (például a nulla és a védővezető összekötése a szétválasztás után).
:::

:::exam
A IV. részben gyakori kérdés a földelés részeinek megnevezése és a védővezető szerepe. A fő földelősín és a földelővezető különbségét is kérdezik.
:::

---
title: Az elosztó készülékei
summary: A főkapcsoló, a kismegszakítók, az ÁVK, a túlfeszültség-levezető, a sorkapcsok, az N- és PE-sín, és a feliratozás.
verify:
  - "Az elosztó készülékeinek feladata (főkapcsoló, kismegszakító, ÁVK, túlfeszültség-levezető, sorkapocs, N- és PE-sín, feliratozás) – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
---

:::goals
- Fel tudod sorolni az elosztó fő készülékeit.
- Tudod, mi a feladatuk.
- Tudod, miért fontos a feliratozás.
:::

## A készülékek sorrendje

Az elosztóban a készülékek a **betáplálástól a fogyasztók felé** haladva következnek. A tipikus lakáselosztó sorrendje:

1. **Főkapcsoló**,
2. **túlfeszültség-levezető** (ha van),
3. **ÁVK**,
4. **kismegszakítók** (az egyes áramkörökhöz),
5. **sorkapcsok** és **N-, PE-sín**.

## A főkapcsoló

A **főkapcsoló** az egész elosztót (vagy a lakást) **leválasztja a hálózatról**. Terhelés alatt is kapcsolható, és az elosztó fő leválasztó elemeként szolgál. A főkapcsoló lekapcsolása nem feszültségmentesít mindent: a betáplálás felőli kapcsok feszültség alatt maradnak.

## A kismegszakítók

Minden áramkörhöz külön **kismegszakító** tartozik, amely a vezetéket túlterhelés és zárlat ellen védi. A kismegszakító névleges árama a vezeték terhelhetőségéhez igazodik (`I_b ≤ I_n ≤ I_z`).

## Az ÁVK

Az **áram-védőkapcsoló** a hibaáram ellen véd. Egy ÁVK több áramkört is védhet, de a nulla- és fázisvezetők ennek megfelelően az ÁVK-n át vezetnek. Az ÁVK-t rendszeresen próbagombbal ki kell próbálni.

## A túlfeszültség-levezető

A **túlfeszültség-levezető** a villámcsapás vagy kapcsolási túlfeszültség ellen védi az elosztó mögötti készülékeket. A hálózati feszültséghez és a védelmi fokozathoz kell választani.

## Sorkapcsok, N- és PE-sín

- **Sorkapocs:** vezetékek biztonságos, szerelhető összekötésére.
- **N-sín:** az áramkörök nullavezetőinek közös csatlakozási helye.
- **PE-sín:** az áramkörök védővezetőinek közös csatlakozási helye; ez van összekötve a fő földelősínnel.

Az N-sín és a PE-sín **szigetelten** van az elosztószekrénytől és egymástól (TN-S rendszerű belső hálózatnál), és a két sín nem köthető össze.

## A feliratozás

Az elosztón minden áramkört **fel kell tüntetni**: melyik kismegszakító melyik áramkört védi (például „konyha dugalj", „világítás"). A feliratozás nélkül a hibakeresés és a **feszültségmentesítés** nehéz, és kockázatos.

:::safety
A feliratozás **életvédelmi kérdés**: ha a kismegszakító felirata téves, a szerelő rossz áramkört kapcsol le, és a javítandó áramkör feszültség alatt marad. Ezért a feszültségmentességet **mindig ellenőrizni kell** a munkahelyen, a felirat ellenére.
:::

:::mistake
„Az ÁVK-t az N-sínre kötöm, mert ott van a nulla.” Az ÁVK-n a fázisvezetők **és** a nullavezető is átmegy, az ÁVK utáni nullát külön kell kezelni: az ÁVK utáni nulla nem érintkezhet az ÁVK előtti nullával.
:::

:::exam
A projektvizsgán az elosztó helyes feliratozása és a készülékek sorrendje az értékelés része. Elméletben a készülékek feladatát kérdezik.
:::

---
title: Érintésvédelmi osztályok
summary: A villamos készülékek 0., I., II. és III. érintésvédelmi osztálya, jelölésük, és mit jelent ez a készülék bekötésénél.
verify:
  - "0. osztály: csak alapszigetelés, védővezető-csatlakozás nincs; az EU-ban nem engedélyezett, saját jele nincs – de.wikipedia: Schutzklasse (Elektrotechnik); Wikipedia: Appliance classes"
  - "I. osztály: az érinthető vezetőképes részek a védővezetőhöz csatlakoznak; zöld-sárga védővezető – de.wikipedia: Schutzklasse (Elektrotechnik); Wikipedia: Appliance classes"
  - "II. osztály: kettős vagy megerősített szigetelés, nem kell védőföldelés; jele két egymásba rajzolt négyzet – Wikipedia: Appliance classes"
  - "III. osztály: SELV- (vagy PELV-) forrásról táplálható – Wikipedia: Appliance classes; de.wikipedia: Schutzklasse (Elektrotechnik)"
  - "HIÁNYZIK: a III. érintésvédelmi osztály rajzjele (rombuszba írt III) és az I. osztályú készülék védőföldelési kapcsának jele – IEC 60417 (forrás nem olvasva)"
  - "A projektvizsgán az érintésvédelmi hiba érvénytelen vizsgát jelent – docs/THEORY_TOC.md (shock-protection témakör)"
---

:::goals
- Ismered a négy érintésvédelmi osztályt és a különbségüket.
- Felismered a II. osztályú készülékek jelölését.
- Tudod, hogyan kell bekötni az I. és a II. osztályú készüléket.
- Tudod, melyik osztályhoz milyen táplálás kell.
:::

## Mit mutat az érintésvédelmi osztály?

Az érintésvédelmi osztály azt mutatja meg, hogyan oldja meg a **készülék** a hibavédelmet, vagyis mi akadályozza meg, hogy egy belső szigetelési hiba esetén a megérinthető részek veszélyes feszültség alá kerüljenek. Ebből következik, hogyan kell a készüléket a hálózatra kötni.

## 0. osztály

A 0. osztályú készüléknek csak **alapszigetelése** van, és nincs védővezető-csatlakozása. Ha az alapszigetelés meghibásodik, a fémháza feszültség alá kerülhet, és semmi nem kapcsolja le.

A 0. osztályú készülék az Európai Unióban **nem engedélyezett**, saját jele nincs. Régi berendezésekben még találkozhatsz vele: ilyen készüléket nem szabad újra üzembe helyezni.

## I. osztály

Az I. osztályú készülékben az alapszigetelés mellett a **megérinthető fémrészek** a **védővezetőhöz** csatlakoznak. A hibavédelmet a védővezető és a hálózat védelmi eszköze együtt adja: testzárlatkor a hibaáram a védővezetőn folyik, és a kismegszakító vagy az ÁVK lekapcsol.

Bekötése:

- a csatlakozózsinór **háromeres** (egyfázisú készüléknél fázis, nulla, védővezető), a védővezető **zöld-sárga**,
- a dugó **védőérintkezős**, és csak védőérintkezős dugaszolóaljzatba szabad csatlakoztatni,
- fix bekötésnél a zöld-sárga vezetőt a készülék védőföldelési kapcsára kell kötni.

Ilyen a legtöbb fémházas készülék: mosógép, villanytűzhely, vízmelegítő, sok lámpatest.

## II. osztály

A II. osztályú készüléknek **kettős vagy megerősített szigetelése** van. A hibavédelmet maga a szigetelés adja, ezért **nem kell** a védővezetőhöz kötni.

- Jelölése két, egymásba rajzolt **négyzet** (⧈).
- Csatlakozózsinórja általában **kéteres**, dugója védőérintkező nélküli.
- Ha a II. osztályú készüléket fixen kötöd be, és a vezetékben van védővezető, azt nem kötöd a készülékre, hanem szigetelten lezárod.

Ilyenek a kézi elektromos szerszámok többsége, a hajszárítók, porszívók, sok kis háztartási készülék.

## III. osztály

A III. osztályú készüléket **törpefeszültségű, SELV- vagy PELV-forrásról** kell táplálni (például biztonsági transzformátorról vagy SELV-tápegységről). A hibavédelmet a kis feszültség adja.

A III. osztályú készüléket **nem szabad** közvetlenül a 230 V-os hálózatra kötni, és olyan forrásról sem, amely nem biztosít biztonsági elválasztást.

:::example
Egy mennyezeti lámpatest dobozán a két egymásba rajzolt négyzet jele látható. A falból háromeres vezeték (barna, kék, zöld-sárga) jön ki. Hogyan kötöd be?

1. A jel szerint a lámpatest II. osztályú, nem kell védővezető.
2. A barnát a fázis-, a kéket a nullakapocsra kötöd.
3. A zöld-sárga vezetőt nem kötöd a lámpatestre, hanem szigetelten, sorkapoccsal lezárod, hogy egy későbbi I. osztályú lámpatesthez felhasználható maradjon.
:::

:::safety
- I. osztályú készüléket csak védővezetővel szabad üzemeltetni. A védőérintkező nélküli hosszabbító vagy elosztó használata megszünteti a hibavédelmet.
- A védővezetőt soha ne kösd a nullavezetőre, és ne használd fázis- vagy nullavezetőként.
- II. osztályú készülék burkolatát ne bontsd meg, és ne pótold fém alkatrésszel: a hibavédelmet a burkolat adja.
- Bekötés előtt mindig feszültségmentesítsd az áramkört.
:::

:::mistake
Gyakori hiba, hogy egy II. osztályú készülék fémfelületét (például díszlécet) a védővezetőre kötik, vagy egy I. osztályú készüléket kéteres zsinórral kötnek be, „mert úgy is működik”. Az I. osztályú készülék védővezető nélkül hiba esetén életveszélyes.
:::

:::exam
A projektvizsgán az érintésvédelmi hiba (például bekötetlen vagy rosszul bekötött védővezető) érvénytelen vizsgát jelent. Minden bekötésnél ellenőrizd a készülék érintésvédelmi osztályát és a védővezető helyes bekötését.
:::

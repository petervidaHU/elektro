---
title: A földelés alapfogalmai
summary: Mi a földelő, a földelővezető, a védővezető és a fő földelősín, mi a különbség az üzemi és a védőföldelés között, és mekkora keresztmetszetű védővezető kell.
verify:
  - "Földelő: szigeteletlen, villamosan vezető elem, a földelőrendszer része, a földdel közvetlen érintkezésben – de.wikipedia: Erder (Elektroinstallation)"
  - "Védővezető: a PE-, a PEN-vezető és az EPH-vezető közös gyűjtőneve; PE-vezető: a hibavédelem céljára a villamos szerkezetek testére csatlakozó vezető – MEE VÉT kézikönyv II.16. táblázat, 349. o."
  - "Fő földelősín (MEB) / fő földelőkapocs (MET); a fő földelősínt megfelelő földelőn keresztül földpotenciálra kell rögzíteni; minden vezetéket külön oldható kötéssel kell rá rögzíteni – MEE VÉT kézikönyv, 308. és 310. o."
  - "Üzemi földelés: az üzemszerűen áramot vezető pontok földhöz viszonyított potenciáljának rögzítése; védőföldelés: az üzemszerűen feszültség alatt nem álló fémrészek földelése – MEE VÉT kézikönyv, 351. o."
  - "Védővezető legkisebb keresztmetszete: fázisvezető ≤ 16 mm² → azonos; ≤ 35 mm² → 16 mm²; > 35 mm² → legalább a fele – de.wikipedia: Schutzleiter (DIN VDE 0100-540, harmonizált HD 60364-5-54)"
  - "Zöld-sárga szín csak védővezetőre (és PEN-re) használható – de.wikipedia: Schutzleiter"
  - "HIÁNYZIK: a külön (kábelen kívül) szerelt védővezető legkisebb keresztmetszete (mechanikai védelemmel / anélkül) – MSZ HD 60364-5-54, 543.1.3"
---

:::goals
- Ismered a földelőrendszer elemeit és elnevezésüket.
- Meg tudod különböztetni az üzemi és a védőföldelést.
- Tudod, mi a fő földelősín feladata.
- Ki tudod választani a védővezető legkisebb keresztmetszetét a fázisvezetőhöz.
:::

## A földelőrendszer elemei

Egy épület földelőrendszere a következő elemekből áll:

- **Földelő:** a földben elhelyezett, **szigeteletlen**, villamosan vezető elem (rúd, szalag, az alapba betonozott acél), amely közvetlenül érintkezik a talajjal. Ezen keresztül jut az áram a földbe.
- **Földelővezető:** a földelőt a fő földelősínnel összekötő vezető.
- **Fő földelősín** (fő földelőkapocs): az épület földelőrendszerének központi csatlakozási pontja. Ide fut be a földelővezető, ide csatlakoznak a védővezetők és az egyenpotenciálra hozó (EPH) vezetők. A fő földelősínt megfelelő földelőn keresztül a földhöz kell kötni, és minden vezetőt **külön-külön, oldható kötéssel** kell rá rögzíteni, hogy mérés céljából egyenként leválaszthatók legyenek.
- **Védővezető:** a gyűjtőneve a PE-, a PEN- és az EPH-vezetőnek.
- **PE-vezető:** a hibavédelem céljára a készülékek, elosztók testére csatlakozó vezető.

[Ábra: épület földelőrendszere. A földbe fektetett földelő, földelővezetővel a fő földelősínhez kötve; a sínre csatlakozik a betáplálás PEN-vezetője, az elosztó PE-vezetője, a víz- és gázvezeték EPH-vezetője.]

## Üzemi és védőföldelés

A földelésnek két, különböző célú fajtája van:

- **Üzemi földelés:** a villamos rendszer egy **üzemszerűen áramot vezető** pontját (jellemzően a transzformátor csillagpontját) köti a földhöz. Célja, hogy a rendszer potenciálját a földhöz képest rögzítse. Ez az elosztóhálózat feladata.
- **Védőföldelés:** a berendezések **üzemszerűen feszültség alatt nem álló** fémrészeit (testeit) köti a földhöz. Célja az érintésvédelem: hiba esetén a test potenciálja a föld potenciálja közelében maradjon, és a hibaáram lefolyhasson.

TN-rendszerben a testek a védővezetőn keresztül a földelt csillagponthoz kapcsolódnak, a fő földelősín földelése pedig az épület potenciálját is a földhöz köti. TT-rendszerben a védőföldelés közvetlenül a hibavédelem része.

## A védővezető keresztmetszete

A védővezetőnek testzárlatkor a teljes hibaáramot el kell bírnia, amíg a védelem lekapcsol. Ezért a keresztmetszete a fázisvezetőéhez igazodik. A kábelben, a fázisvezetővel együtt vezetett védővezető legkisebb keresztmetszete (azonos anyagnál):

- ha a fázisvezető legfeljebb **16 mm²**: a védővezető **ugyanakkora**, mint a fázisvezető,
- ha a fázisvezető **16 mm² felett, legfeljebb 35 mm²**: a védővezető legalább **16 mm²**,
- ha a fázisvezető **35 mm² felett**: a védővezető legalább a fázisvezető **fele**.

:::example
Mekkora védővezető kell a következő fázisvezetőkhöz?

1. 2,5 mm² fázis: 2,5 mm² védővezető.
2. 25 mm² fázis: 16 mm² védővezető.
3. 70 mm² fázis: legalább 35 mm² védővezető.
:::

A védővezető színe **zöld-sárga**. Ez a színkombináció **csak** védővezetőre (és PEN-vezetőre) használható, semmi másra.

:::safety
- A földelővezetőt és a fő földelősín kötéseit csak feszültségmentesített berendezésen szabad bontani. Üzemelő berendezésben a földelővezető megszakítása a testek védelmét is megszünteti.
- Zöld-sárga vezetőt soha ne használj fázis- vagy nullavezetőként, még ideiglenesen sem.
:::

:::mistake
Gyakori hiba, hogy a földelést és a nullavezetőt azonosnak tekintik, „mert mindkettő földpotenciálon van”. A nullavezető üzemi áramot vezet, a védővezető csak hibaáramot. A szétválasztás után a kettőt összekötni tilos.
:::

:::exam
A vizsgán kérdés lehet a földelőrendszer elemeinek megnevezése, az üzemi és a védőföldelés különbsége, és a védővezető keresztmetszetének kiválasztása.
:::

---
title: A hálózati rendszerek betűjelei
summary: Mit jelent a TN, a TT és az IT jelölés első és második betűje, mit jelent a -C, -S és -C-S kiegészítés, és mi a különbség az N-, a PE- és a PEN-vezető között.
verify:
  - "1. betű: T = egy ponton közvetlenül földelt, I = a földtől elszigetelt vagy impedancián keresztül földelt; 2. betű: T = a testek közvetlenül a földhöz csatlakoznak, N = a testek az energiaellátó rendszer földelt pontjához csatlakoznak; S = külön védővezető, C = közös PEN-vezető – MEE VÉT kézikönyv VII. fejezet, 351. o."
  - "N: üzemi nullavezető (csak üzemi áramokat vezethet), PE: védővezető (csak testzárlati áramokat vezethet), PEN: közösített nullavezető (mindkettőt vezetheti) – MEE VÉT kézikönyv, 352. o. (II.21. ábra)"
  - "TT: földeléses rendszer védőföldeléssel; IT: szigetelt rendszer védőföldeléssel – MEE VÉT kézikönyv, 351. o.; Wikipedia: Earthing system"
---

:::goals
- Ismered a hálózati rendszerek jelölésének felépítését.
- Meg tudod mondani, mit jelent az első és a második betű.
- Tudod, mit jelent a TN-rendszerek -C, -S és -C-S kiegészítése.
- Meg tudod különböztetni az N-, a PE- és a PEN-vezetőt.
:::

## Miért fontos a hálózati rendszer?

A hálózati rendszer (földelési rendszer) azt írja le, hogyan kapcsolódik a földhöz a **táplálás** (a transzformátor csillagpontja) és a **fogyasztói berendezés testei** (a készülékek, elosztók fémburkolatai). Ettől függ, milyen úton folyik a hibaáram egy testzárlatkor, mekkora lesz, és ezért milyen védelem kapcsolja le a hibát. Mielőtt egy berendezés érintésvédelmét megtervezed vagy ellenőrzöd, tudnod kell, milyen rendszerről táplálják.

## Az első betű: a táplálás és a föld

Az első betű az **energiaellátó rendszer** (a transzformátor) kapcsolatát adja meg a földdel:

- **T** (francia *terre*, föld): a táplálás egy pontja, általában a transzformátor csillagpontja, **közvetlenül földelt**.
- **I** (angol *isolated*, elszigetelt): a táplálás minden aktív része **el van szigetelve a földtől**, vagy egy pontja **impedancián keresztül** földelt.

## A második betű: a testek és a föld

A második betű a **fogyasztói berendezés testeinek** kapcsolatát adja meg:

- **T:** a testek **közvetlenül a földhöz** csatlakoznak, saját földelőn keresztül, amely független a táplálás földelésétől.
- **N** (*neutral*): a testek az energiaellátó rendszer **földelt pontjához** (a csillagponthoz) csatlakoznak, egy vezetőn keresztül.

Ebből három alaprendszer adódik:

- **TN-rendszer:** földelt csillagpont, a testek védővezetővel a csillagponthoz kötve.
- **TT-rendszer:** földelt csillagpont, a testek saját földelőhöz kötve. Közkeletű neve: *földeléses rendszer védőföldeléssel*.
- **IT-rendszer:** földtől elszigetelt táplálás, a testek földelve. Közkeletű neve: *szigetelt rendszer védőföldeléssel*.

## A TN-rendszerek további betűi

TN-rendszerben a nullavezető és a védővezető lehet külön vezető vagy egy közös vezető. Ezt a kötőjel utáni betű jelzi:

- **S** (*separated*, különválasztott): a védelmi feladatot **külön védővezető** látja el. **TN-S**: a teljes rendszerben külön N és PE.
- **C** (*common*, közös): a nullavezető és a védővezető **közös**, ez a **PEN-vezető**. **TN-C**: a teljes rendszerben PEN.
- **TN-C-S:** a rendszer egy részében közös PEN-vezető van, egy ponton ezt szétválasztják külön N- és PE-vezetőre.

A hazai lakóépületek többsége TN-C-S rendszerű: a szolgáltató hálózata a csatlakozásig PEN-vezetővel érkezik, és az épületben ezt szétválasztják.

## Az N-, a PE- és a PEN-vezető

- **N – üzemi nullavezető:** az üzemi (a fogyasztók által felvett) áramot vezeti vissza. **Csak üzemi áramot** vezethet. Színe kék.
- **PE – védővezető:** a hibavédelem céljára a készülékek testéhez csatlakozik. **Csak hibaáramot** (testzárlati áramot) vezethet, üzemszerűen nem folyik rajta áram. Színe zöld-sárga.
- **PEN – közösített nullavezető:** egyszerre tölti be a nullavezető és a védővezető feladatát, ezért **üzemi és hibaáramot is** vezethet. Jelölése zöld-sárga, a végein kék jelöléssel (vagy kék, a végein zöld-sárgával).

A **védővezető** a PE-, a PEN-vezető és az egyenpotenciálra hozó (EPH) vezető közös gyűjtőneve.

:::safety
A PEN-vezető egyszerre szállítja az üzemi áramot és köti a testeket a csillagponthoz. Ha a PEN megszakad, a hozzá kötött készülékek fémháza a fogyasztókon keresztül **fázisfeszültséget** kaphat. Ezért a PEN- és a nullavezetőbe tilos olyan biztosítót, szakaszolót vagy más készüléket beiktatni, amely a nullavezetőt a fázisvezetők nélkül, önmagában megszakíthatja.
:::

:::mistake
Gyakori hiba, hogy a TN-rendszer „N” betűjét a nullavezetőre értik. A második betű a **testek** bekötési módját jelzi (a csillagponthoz kötve), nem azt, hogy van-e nullavezető.
:::

:::exam
A vizsgán kérdés lehet a TN, TT és IT jelölés betűinek jelentése, és az N-, PE- és PEN-vezető feladata és színe.
:::

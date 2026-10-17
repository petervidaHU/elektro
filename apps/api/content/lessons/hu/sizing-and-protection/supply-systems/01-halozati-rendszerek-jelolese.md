---
title: A hálózati rendszerek betűjelei
summary: Mit jelent a TN, TT és IT jelölés, és mi a különbség az N-, a PE- és a PEN-vezető között.
verify:
  - "A hálózati rendszerek betűjelei: első betű a tápforrás (transzformátor) földeléséhez, második betű a berendezés testének földeléséhez való viszonyt jelöli; T = közvetlen földelés, I = nincs földelve vagy nagy impedancián keresztül, N = a test a tápforrás földelt pontjához csatlakozik – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "C = nullavezető és védővezető egyesítve (PEN), S = külön vezető – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a PEN-vezető legkisebb megengedett keresztmetszete és a mechanikai védelmével kapcsolatos előírások (MSZ HD 60364-5-54) – az oktatónak kell kiegészítenie"
---

:::goals
- Meg tudod mondani, mit jelent a hálózati rendszer jelölésének első és második betűje.
- Különbséget tudsz tenni az N-, a PE- és a PEN-vezető között.
- Tudod, miért fontos, hogy melyik vezető mire való.
:::

## Miért kell hálózati rendszert megnevezni?

Az áramütés elleni védelem azon múlik, **hogyan van földelve** a tápforrás és a fogyasztó fém teste. Ha egy készülék burkolata hiba miatt feszültség alá kerül, a hibaáram útja a hálózati rendszertől függ. Ettől függ, hogy mi kapcsolja le a hibát, és mennyi idő alatt. Ezért a villamos hálózatokat rendszerekbe soroljuk, és két-három betűvel jelöljük őket.

## Az első betű: a tápforrás földelése

Az első betű azt mondja meg, hogyan viszonyul a **tápforrás** (a transzformátor csillagpontja) a földhöz:

- **T** (terra, föld): a tápforrás egy pontja **közvetlenül** földelve van.
- **I** (izolált): a tápforrás **nincs földelve**, vagy csak nagy impedancián keresztül.

## A második betű: a berendezés testének földelése

A második betű azt mondja meg, hogyan van földelve a **fogyasztó fém teste** (például a mosógép burkolata):

- **T**: a test a **saját földelőjén** keresztül közvetlenül földelve van, függetlenül a tápforrás földelésétől.
- **N** (nulla): a test a **tápforrás földelt pontjához** csatlakozik, vezetőn keresztül.

Ebből jön ki a három alaprendszer: **TN** (a tápforrás földelve, a test a tápforrás földelt pontjához kötve), **TT** (a tápforrás is, a test is külön földelve) és **IT** (a tápforrás nincs földelve, a test földelve van).

## A harmadik betű: a nulla- és a védővezető

A TN-rendszerek harmadik betűje azt adja meg, hogy a nullavezető és a védővezető **egy vezető vagy két külön vezető**:

- **C** (combined, egyesített): a két feladatot **egy** vezető látja el.
- **S** (separated, külön): a nullavezető és a védővezető **két külön** vezető.

## Három vezető, három feladat

- **N, nullavezető:** az üzemi áram visszavezetője. Normál működésnél áram folyik rajta, ezért feszültség lehet rajta a föld felé. A kapcsolási rajzokon és a bekötésnél kék.
- **PE, védővezető** (:term[védővezető]{id=protective-conductor}): a berendezések fém testét köti a földeléshez. Normál működésnél **nem folyik rajta áram**, csak hiba esetén vezeti a hibaáramot a védőkészülékhez. Zöld-sárga.
- **PEN-vezető:** a nulla- és a védővezető feladatát egyszerre ellátó vezető. Mivel üzemi áramot is visz, de védővezető is, a hibája különösen veszélyes.

:::safety
A védővezetőt és a PEN-vezetőt **soha nem szabad megszakítani** kapcsolóval, biztosítóval vagy kismegszakítóval úgy, hogy a készülék teste közben feszültség alatt maradhat. Egy szakadt védővezető mellett a készülék működik, de a burkolata már nincs védve: az első testzárlatnál életveszélyes feszültség jelenik meg rajta.
:::

:::mistake
A „nulla” és a „föld” nem ugyanaz. A TN-rendszerben a nullavezető a tápforrás földelt pontjához csatlakozik, de a nullán üzemi áram folyik, a védővezetőn nem. Ha a kettőt összekötöd vagy felcseréled, a védelem megszűnik, vagy a burkolatokon üzemi feszültség jelenhet meg.
:::

:::exam
A központi interaktív vizsga IV. (villamos biztonsági) részében gyakori kérdés a hálózati rendszerek jelölésének megfejtése, például: „Mit jelent a TN-S?” A válasz: a tápforrás földelve van, a test a tápforrás földelt pontjához kötött, és a nulla- meg a védővezető külön van vezetve.
:::

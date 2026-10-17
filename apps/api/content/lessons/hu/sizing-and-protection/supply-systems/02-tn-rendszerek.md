---
title: TN-C, TN-S, TN-C-S
summary: A TN-rendszerek három változatának felépítése, hol találkozol velük, hogyan kell szétválasztani a PEN-vezetőt, és miért tilos a szétválasztás után újra összekötni a nulla- és a védővezetőt.
verify:
  - "TN-S: a PE és az N teljesen külön vezető; TN-C: egyetlen közös PEN-vezető; TN-C-S: a rendszer egy részében PEN, amelyet egy ponton külön PE- és N-vezetőre választanak szét – Wikipedia: Earthing system; MEE VÉT kézikönyv, 351. o."
  - "A PEN-vezető szétválasztása a fő földelősínen történik; a sínt tartósan „PEN” felirattal kell ellátni; minden vezetéket külön oldható kötéssel kell rögzíteni – MEE VÉT kézikönyv, 310. o."
  - "PEN-vezető csak fixen szerelve, legalább 10 mm² réz vagy 16 mm² alumínium keresztmetszettel; hordozható készülékek csatlakozóvezetékében nem alkalmazható – de.wikipedia: PEN-Leiter (DIN VDE 0100, harmonizált HD 60364)"
  - "A szétválasztás után az N-vezetőt nem szabad a berendezés más földelt részével összekötni, sem a védővezetővel újra egyesíteni – de.wikipedia: PEN-Leiter (DIN VDE 0100-540, 543.4.3)"
  - "PEN-vezető nem kapcsolható és nem szakítható meg külön, túláramvédelmi eszközzel sem – de.wikipedia: PEN-Leiter; MEE VÉT kézikönyv, 355. o."
  - "Az ÁVK TN-C rendszerben nem működik – Wikipedia: Earthing system"
  - "PEN jelölése: zöld-sárga, a végein kék jelöléssel – de.wikipedia: PEN-Leiter"
---

:::goals
- Fel tudod rajzolni a TN-C, a TN-S és a TN-C-S rendszer felépítését.
- Tudod, hol és hogyan kell a PEN-vezetőt szétválasztani.
- Megérted, miért tilos a szétválasztás után a nulla- és a védővezetőt újra összekötni.
- Tudod, miért nem működik az áram-védőkapcsoló TN-C rendszerben.
:::

## TN-C rendszer

A TN-C rendszerben a transzformátortól a fogyasztóig **egyetlen közös PEN-vezető** látja el a nullavezető és a védővezető feladatát. Egy háromfázisú leágazás négy vezetőből áll: L1, L2, L3, PEN.

A szolgáltatói kisfeszültségű elosztóhálózat jellemzően ilyen. Új épületen belüli szerelésben a PEN csak korlátozottan használható:

- csak **fixen szerelt** vezetékben lehet,
- keresztmetszete legalább **10 mm² réz** vagy **16 mm² alumínium**,
- hordozható készülékek csatlakozóvezetékében és a lakások végáramköreiben nem alkalmazható.

A TN-C rendszer hátránya, hogy a PEN-en üzemi áram is folyik, ezért a feszültségesés miatt a hozzá kötött testek potenciálja eltér a földétől, és a PEN szakadásakor a testek fázisfeszültséget kaphatnak. **Áram-védőkapcsoló TN-C rendszerben nem működik**, mert a hibaáram a PEN-en tér vissza, és így átmegy a védőkapcsolón.

[Ábra: TN-C rendszer. Transzformátor földelt csillagponttal, L1, L2, L3 és PEN vezető; a fogyasztó fémháza a PEN-re kötve.]

## TN-S rendszer

A TN-S rendszerben a nullavezető (N) és a védővezető (PE) a **teljes rendszerben külön** vezető. Egy háromfázisú leágazás öt vezetőből áll: L1, L2, L3, N, PE. A védővezetőn üzemszerűen nem folyik áram, a testek potenciálja a földével egyezik.

Ilyen rendszert ott alakítanak ki, ahol a táplálás saját transzformátorról történik (ipari üzemek, nagyobb épületek), és a transzformátor csillagpontjától kezdve öt vezetővel szerelnek.

[Ábra: TN-S rendszer. Transzformátor földelt csillagponttal, L1, L2, L3, N és PE vezető; a fogyasztó fémháza a PE-re kötve.]

## TN-C-S rendszer

A TN-C-S rendszerben a hálózat egy része TN-C (PEN-vezetővel), egy ponton a PEN-t **szétválasztják** külön N- és PE-vezetőre, és onnan a rendszer TN-S. Ez a leggyakoribb kialakítás lakóépületekben: a szolgáltató PEN-vezetővel érkezik, az épületben pedig külön N és PE fut.

A szétválasztás helye a **fő földelősín**. A szabályok:

- A fő földelősínt jól látható, tartós **„PEN”** felirattal kell ellátni.
- A beérkező PEN-vezető a fő földelősínre csatlakozik. Innen indul a PE-vezető, és innen indul az N-vezető is, egy külön N-sínről vagy kapocsról, a PEN-hez kötve.
- A fő földelősínre minden vezetéket **külön-külön, oldható kötéssel** kell rögzíteni.
- A fő földelősínt földelőn keresztül a földhöz kell kötni.

[Ábra: TN-C-S rendszer. A PEN-vezető a fő földelősínre érkezik; onnan külön PE és N vezető indul a fogyasztók felé.]

## A szétválasztás után: soha többé együtt

A szétválasztás pont után a nullavezetőt és a védővezetőt **szigorúan külön** kell vezetni:

- az N-vezetőt **nem szabad** a berendezés semmilyen más földelt részével összekötni,
- az N-t és a PE-t **nem szabad** újra egyesíteni, egyik elosztóban és egyik készülékben sem.

Ha a szétválasztás után az N-t és a PE-t valahol újra összekötik, a nullavezető üzemi árama a védővezetőn és a testeken, az épület fémszerkezetein is folyni kezd. Ennek következményei:

- a testeken feszültség jelenik meg,
- az áram-védőkapcsoló a különbségi áram miatt indokolatlanul kiold, ha az összekötés a védőkapcsoló után van.

:::safety
- A PEN-vezetőt és a nullavezetőt tilos önmagában megszakítani. Biztosítót, szakaszolót vagy más olyan készüléket, amely a nullát a fázisvezetők nélkül szakítja meg, nem szabad beiktatni. Kapcsolni csak a fázisvezetőket, vagy mechanikusan csatolt két- vagy négypólusú kapcsolóval együtt az összes vezetőt szabad.
- A PEN-vezető bontása előtt a teljes berendezést feszültségmentesítsd az öt biztonsági művelettel: ha a PEN terhelés alatt szakad meg, a testek fázisfeszültséget kaphatnak.
- Szétválasztás után az N-t és a PE-t soha ne kösd össze újra, még „ideiglenesen” sem.
:::

:::mistake
Gyakori hiba, hogy egy régi, kétvezetékes (fázis + PEN) áramkörben a dugaszolóaljzat védőérintkezőjét egy átkötéssel a nullakapocsra kötik („nullázás a dugaljban”). Ha ez a vezető megszakad, a csatlakoztatott készülék fémháza fázisfeszültséget kap. A korszerűsítéskor külön védővezetőt kell kiépíteni.
:::

:::exam
A vizsgán kérdés lehet a TN-C, TN-S és TN-C-S rendszer felépítése, a PEN-vezető szétválasztásának helye, és hogy miért tilos a szétválasztás után újra egyesíteni.
:::

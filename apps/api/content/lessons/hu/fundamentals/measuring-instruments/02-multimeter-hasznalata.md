---
title: A multiméter használata
summary: Feszültség-, áram- és ellenállásmérés multiméterrel: hogyan kötöd be, hogyan választod meg a méréshatárt, és mit jelentenek a mérési kategóriák (CAT II–IV).
verify:
  - "Mérési kategóriák (CAT I–IV) meghatározása és példái; 300 V-os munkafeszültségnél a tranziens túlfeszültség CAT II 2500 V, CAT III 4000 V, CAT IV 6000 V – Wikipedia: Measurement category (IEC 61010-1 alapján)"
  - "Árammérő tartományok biztosítéka; ellenállás- vagy árammérő állásban feszültségforrásra kötött műszer tönkremegy – Wikipedia: Multimeter"
  - "Ellenállásmérésnél a műszer saját telepéből hajt áramot az alkatrészen; az alkatrészt le kell választani a körről – Wikipedia: Multimeter"
---

:::goals
- Helyesen kötöd be a multimétert feszültség-, áram- és ellenállásméréshez.
- Megválasztod a mérés fajtáját (AC, DC) és a méréshatárt.
- Ismered a mérési kategóriák (CAT II, CAT III, CAT IV) jelentését, és a feladathoz megfelelő műszert választasz.
- Elkerülöd a multiméter használatának veszélyes hibáit.
:::

## Feszültségmérés

A feszültséget **párhuzamosan** méred: a két mérőzsinórt annak a két pontnak érinted, amelyek között a feszültséget keresed.

1. Állítsd a forgókapcsolót **V~** (váltakozó, AC) vagy **V⎓** (egyen, DC) állásba.
2. A fekete mérőzsinór a **COM**, a piros a **V** jelű hüvelybe kerül.
3. Ha a műszer nem automatikus méréshatárú, a legnagyobb méréshatárral kezdj.

A digitális voltmérő bemeneti ellenállása nagy, ezért alig terheli a mért kört.

## Árammérés

Az áramot **sorosan** méred: a kört meg kell bontani, és a műszert a bontás helyére kell bekötni, hogy a mért áram a műszeren folyjon át.

1. Kapcsold le a kört, bontsd meg, és kösd be a műszert.
2. A piros mérőzsinórt az **A** (vagy mA) hüvelybe tedd. A forgókapcsolót **A~** vagy **A⎓** állásba állítsd.
3. Kapcsold vissza a feszültséget, olvasd le az értéket, majd ismét feszültségmentesítve kösd vissza az eredeti állapotot.

Az árammérő ellenállása nagyon kicsi. Ha árammérő állásban a műszert párhuzamosan, egy feszültségforrásra kötöd, gyakorlatilag rövidzárat hozol létre. A műszer árammérő bemenetét ezért biztosító védi; a biztosító nélküli műszer ilyenkor azonnal tönkremegy.

A hálózati fogyasztók áramát a gyakorlatban nem multiméterrel, hanem **lakatfogóval** méred, mert az nem igényli a kör megbontását.

## Ellenállásmérés

Az ellenállást **csak feszültségmentes** körben vagy kiszerelt alkatrészen mérheted. Az ellenállásmérő állásban (Ω) a műszer a saját telepéből hajt kis áramot a mért alkatrészen, és ebből számítja az ellenállást. Ha a körben külső feszültség van, a mérés hibás, és a műszer károsodhat.

1. Kapcsold le és mérd meg a feszültségmentességet.
2. A mért alkatrészt legalább egyik végén válaszd le a körről, különben a vele párhuzamos ágak meghamisítják az eredményt.
3. Érintsd össze a mérőzsinórokat: a kijelzőnek közel 0 Ω-ot kell mutatnia. Ez a zsinórok ellenállása, amelyet kis értékeknél le kell vonnod.
4. Mérd meg az ellenállást.

A **folytonosságvizsgáló** (hangjelzéses) állás ugyanezen az elven működik: hangjelzést ad, ha a mért ellenállás kicsi, például egy vezeték két vége között.

## Mérési kategóriák (CAT)

A hálózatban kapcsolási folyamatok és villámcsapás miatt rövid, nagy **túlfeszültség-impulzusok** (tranziensek) keletkeznek. Minél közelebb mérsz a betápláláshoz, annál nagyobb impulzus érheti a műszert. Az IEC 61010-1 szabvány ezért **mérési kategóriákat** határoz meg:

- **CAT I:** a hálózatra közvetlenül nem csatlakozó áramkörök (például elemről táplált áramkörök).
- **CAT II:** a hálózatra közvetlenül, dugaszolóaljzaton keresztül csatlakozó készülékek: háztartási készülékek, hordozható szerszámok.
- **CAT III:** az épület fix villamos berendezése: elosztótáblák, kismegszakítók, vezetékezés, gyűjtősínek, kötődobozok, kapcsolók, fixen szerelt dugaszolóaljzatok, ipari berendezések.
- **CAT IV:** a kisfeszültségű berendezés betáplálási pontja: fogyasztásmérők, az elsődleges túláramvédelem (főbiztosíték), a csatlakozó.

A kategória mellett mindig szerepel egy feszültség, például **CAT III 600 V**. A műszernek ennyi munkafeszültségen kell elviselnie az adott kategória tranzienseit. 300 V-os munkafeszültségre a szabvány szerint a próbafeszültség-impulzus CAT II-ben 2500 V, CAT III-ban 4000 V, CAT IV-ben 6000 V.

**Szabály:** a műszer és a mérőzsinórok kategóriája legalább akkora legyen, mint a mérés helyéé. Elosztóban CAT III, a fogyasztásmérőnél és a csatlakozónál CAT IV besorolású eszközzel mérj.

:::safety
- Mérés előtt nézd meg a forgókapcsoló állását és a mérőzsinórok helyét. Ha a piros zsinór az **A** hüvelyben van, és feszültséget mérsz vele, rövidzárat okozol: ívkisülés keletkezhet, amely égési sérülést okoz.
- Mérés előtt ellenőrizd a mérőzsinórok szigetelését. Sérült, repedt zsinórral nem szabad mérni.
- Csak a műszer és a zsinórok mérési kategóriájának és feszültségének megfelelő helyen mérj.
- A mérőcsúcsokat csak a fogantyú ujjvédő pereme mögött fogd meg.
- A multiméter **nem feszültségkémlelő**: a feszültségmentesség megállapítására a szabványos kétpólusú feszültségkémlelőt használd.
:::

:::mistake
Gyakori és veszélyes hiba, hogy egy árammérés után a piros mérőzsinór az **A** hüvelyben marad, és a következő mérés feszültségmérés. Minden mérés előtt ellenőrizd a zsinór helyét.
:::

:::exam
Az alapvizsgán kérdés lehet: hogyan kell bekötni a műszert feszültség-, áram- és ellenállásméréshez, és miért csak feszültségmentes körben szabad ellenállást mérni.
:::

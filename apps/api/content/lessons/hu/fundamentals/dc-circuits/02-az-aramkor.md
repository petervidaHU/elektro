---
title: Az áramkör felépítése
summary: Milyen részekből áll egy áramkör, mikor folyik benne áram, és hogyan csoportosítjuk a forrásokat és a fogyasztókat.
---

:::goals
- Fel tudod sorolni az áramkör négy alapvető részét és a szerepüket.
- Meg tudod különböztetni a zárt kört, a nyitott kört és a rövidzárat.
- Szavakkal le tudod írni az alapvető rajzjeleket.
- Csoportosítani tudod a villamos energiaforrásokat és a fogyasztókat.
:::

## Az áramkör részei

Áram csak **zárt áramkörben** folyik. Minden áramkör négy alapvető részből áll:

1. **Energiaforrás (generátor):** feszültséget hoz létre, és energiát ad a körnek. Például elem, akkumulátor, a hálózat csatlakozási pontja, napelem.
2. **Fogyasztó:** a villamos energiát más energiává alakítja: hővé, fénnyé, mozgássá. Például fűtőtest, lámpa, motor.
3. **Vezeték:** összeköti a forrást és a fogyasztót, és a lehető legkisebb veszteséggel vezeti az áramot.
4. **Kapcsoló:** zárja vagy megszakítja az áramkört, így be- és kikapcsolja a fogyasztót.

A gyakorlati áramkörben ezek mellett **védelmi eszköz** is van (biztosító, kismegszakító). Ez hiba esetén megszakítja a kört, mielőtt a vezeték túlmelegedne. Erről a túláramvédelem témában tanulsz.

## Zárt kör, nyitott kör, rövidzár

**Zárt áramkör:** a forrástól a fogyasztón át vissza a forrásig megszakítás nélküli az út. Áram folyik, a fogyasztó működik.

**Nyitott áramkör (szakadás):** az út valahol megszakad: nyitott kapcsoló, kiégett izzószál, elszakadt vezeték. Áram nem folyik. A forrás kapcsain ekkor is ott van a feszültség, ezért a nyitott kör vezetői **feszültség alatt maradhatnak**.

**Rövidzár (zárlat):** a forrás két pólusa a fogyasztó megkerülésével, nagyon kis ellenálláson keresztül záródik. Ekkor az áramot csak a vezetékek és a forrás kis ellenállása korlátozza, ezért nagyon nagy áram folyik. A vezeték néhány másodperc alatt túlmelegedhet, ív és tűz keletkezhet. A zárlatot a védelmi eszköznek azonnal le kell kapcsolnia.

## Az áramkör rajzjelei

A kapcsolási rajzokon szabványos jelekkel ábrázoljuk az elemeket. A legfontosabbak szavakkal leírva:

- **Vezeték:** egyenes vonal. Ahol két vezeték összekötött, ott a kereszteződésben teli pont van. Pont nélkül a két vonal csak keresztezi egymást, nincs összekötve.
- **Egyenfeszültségű forrás (elem):** egy hosszabb és egy rövidebb párhuzamos vonal. A hosszabb a pozitív, a rövidebb a negatív pólus.
- **Ellenállás:** kis, hosszúkás téglalap.
- **Lámpa:** kör, benne átlós kereszttel.
- **Kapcsoló:** a vezeték megszakítása, egy ferdén felálló vonallal (nyitott helyzetben rajzolva).
- **Biztosító:** kis téglalap, rajta végighaladó vonallal.

Az épületvillamossági rajzjeleket a dokumentáció témában részletesen tanulod.

## Energiaforrások és fogyasztók csoportosítása

**Energiaforrások** aszerint, hogy miből állítanak elő villamos energiát:

- **vegyi energiából:** galvánelem (nem tölthető), akkumulátor (újratölthető),
- **mechanikai energiából:** generátor (erőművekben, aggregátorban),
- **fényenergiából:** napelem,
- **hőenergiából:** hőelem (főleg mérésre).

A forrás lehet **egyenfeszültségű** (elem, akkumulátor, napelem) vagy **váltakozó feszültségű** (a hálózat, a legtöbb generátor).

**Fogyasztók** aszerint, hogy mivé alakítják a villamos energiát:

- **hővé:** vízmelegítő, főzőlap, fűtőpanel,
- **fénnyé:** lámpák (a hagyományos izzó főleg hővé alakít, a LED sokkal kevésbé),
- **mozgássá:** motorok, mágneskapcsolók, relék,
- **vegyi energiává:** akkumulátortöltés, galvanizálás,
- **jellé, információvá:** elektronikus készülékek.

:::mistake
„A kapcsoló kikapcsolt, tehát a lámpatestben nincs feszültség.” A nyitott kör vezetői feszültség alatt maradhatnak. Ha a kapcsoló a nullavezetőt szakítja meg, a lámpatest fázisvezetője továbbra is feszültség alatt van. Ezért kell munka előtt mindig feszültségmentesíteni.
:::

:::safety
Rövidzárlat nagy árammal, ívvel és tűzzel jár. Soha ne kösd össze közvetlenül egy forrás két pólusát, és ne dolgozz feszültség alatt álló áramkörben: előbb hajtsd végre a feszültségmentesítés öt lépését.
:::

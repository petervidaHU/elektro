---
title: Egyenpotenciálra hozás (EPH)
summary: Mi az egyenpotenciálra hozás célja, mit kell bekötni a fő EPH-ba, mikor kell helyi (kiegészítő) EPH, és miért véd ez az áramütés ellen.
verify:
  - "EPH-vezető: a testek és az idegen fémszerkezetek egyenpotenciálra hozására szolgáló vezető; ahol védővezetős érintésvédelmi mód van, ott ki kell alakítani az egyenpotenciálra hozó összekötést is – MEE VÉT kézikönyv, 348. és 350. o."
  - "Lakóépületben a csővezetékek az épület vasszerkezeti elemeivel együtt „házi fémhálózatot” alkotnak – MEE VÉT kézikönyv, 355. o."
  - "Fő EPH: a fő földelősínre (EPH-sínre) kötendő a betáplálás védővezetője, a földelővezető, és az épületbe belépő fém víz-, szennyvíz- és gázvezeték (a gázvezeték szigetelő közdarab után), valamint az épületen belüli fém csővezetékek, fűtés, légkondicionáló; adott esetben a villámvédelem levezetőinek bekötése – de.wikipedia: Schutzpotentialausgleich / Potentialausgleich (DIN VDE 0100-410/-540, harmonizált HD 60364)"
  - "Helyi (kiegészítő) EPH: egy helyiség vezetőképes részei és az oda vezetett áramkörök védővezetői közötti összekötés; a különleges helyiségek szabványrészei írják elő – de.wikipedia: Potentialausgleich"
  - "HIÁNYZIK: a fő és a helyi EPH-vezetők legkisebb keresztmetszete – MSZ HD 60364-5-54, 544.1 és 544.2"
  - "HIÁNYZIK: a hazai előírás a fürdőszobai helyi EPH-ról – MSZ HD 60364-7-701"
---

:::goals
- Megérted az egyenpotenciálra hozás célját.
- Tudod, mit kell bekötni a fő EPH-ba.
- Ismered a helyi (kiegészítő) EPH szerepét.
- Megérted, hogyan csökkenti az EPH az érintési feszültséget.
:::

## Mi az egyenpotenciálra hozás?

Egy épületben sok olyan fémrész van, amely nem tartozik a villamos berendezéshez, de vezeti az áramot és kapcsolatban lehet a földdel: a víz-, a gáz- és a fűtéscsövek, a szellőzőcsatornák, az épület fémszerkezetei. Ezek az **idegen vezetőképes részek**. A csővezetékek az épület vasszerkezeti elemeivel együtt egy kiterjedt **„házi fémhálózatot”** alkotnak.

Az **egyenpotenciálra hozás (EPH)** azt jelenti, hogy ezeket a fémrészeket és a villamos berendezés testeit vezetővel összekötjük, és a fő földelősínre kötjük. Így közöttük **nem alakulhat ki veszélyes feszültségkülönbség**.

Ahol a hibavédelem védővezetővel készül (a táplálás önműködő lekapcsolásával), ott az EPH-t is ki kell alakítani.

## Miért véd az EPH?

Az áramütéshez az kell, hogy a test két pontja között feszültségkülönbség legyen. Ha egy ember egyik kezével egy testzárlatos készülék házát, a másikkal egy vízcsapot fog, a rajta átfolyó áramot a ház és a csap közötti **feszültségkülönbség** hajtja.

- EPH nélkül a vízcső a talaj potenciálján lehet, a hibás készülék háza pedig a lekapcsolásig a fázisfeszültség jelentős részén. Az ember a kettő között áramkört zár.
- EPH-val a vízcső és a védővezető ugyanahhoz a fő földelősínhez kapcsolódik. Testzárlatkor a hibás ház és a csőhálózat potenciálja **együtt** mozdul el, a köztük lévő különbség kicsi marad.

Az EPH arra az esetre is véd, ha kívülről hurcolnak be potenciált: például egy hibás berendezés a szomszéd épületben feszültség alá helyezi a közös vízvezetéket.

## A fő EPH

A fő EPH-t az épület betáplálási pontjánál, a **fő földelősínen** (EPH-sínen) alakítják ki. Ide kell bekötni:

- a betáplálás **védővezetőjét** (illetve a PEN-vezetőt a szétválasztás helyén),
- a **földelővezetőt**,
- az épületbe belépő fém **vízvezetéket** és **szennyvízvezetéket**,
- a fém **gázvezetéket**, a **szigetelő közdarab után**, az épület felőli oldalon,
- az épületen belüli fém csővezetékeket, a **fűtés** és a **légkondicionáló** fém csőhálózatát,
- adott esetben a **villámvédelmi** rendszer levezetőinek és földelőjének összekötését.

Minden vezetőt külön, oldható kötéssel kell a sínre kötni.

## Helyi (kiegészítő) EPH

A **helyi EPH** egy adott helyiségben köti össze az összes egyszerre megérinthető vezetőképes részt (fémcsövek, fém szerkezetek) az oda vezetett áramkörök védővezetőivel. A helyi EPH-t egy védővezetővel a fő EPH-sínre kötik.

Helyi EPH-t a **fokozott veszélyű** helyiségekre vonatkozó előírások írnak elő: nedves helyiségek, uszodák, szaunák, orvosi helyiségek, robbanásveszélyes terek. Hogy egy adott helyiségben kell-e, és mit kell bekötni, azt az adott helyiségtípus szabványrésze határozza meg.

:::safety
- A gázvezetéket csak a szigetelő közdarab után, az épület felőli oldalon szabad az EPH-ba kötni.
- EPH-vezetéket bekötni, bontani csak a villamos berendezés feszültségmentesítése után szabad: egy hibás berendezésnél az EPH-vezetőn hibaáram folyhat.
- Ha egy csővezetéket műanyagra cserélnek, és ezzel egy fémszakasz kiesik az EPH-ból, a megmaradt fém részeket újra be kell kötni.
:::

:::mistake
Gyakori hiba, hogy egy csőszerelés után az EPH-bekötést nem állítják vissza: a vízórát vagy egy csőszakaszt kicserélik, és a kötés megszűnik. Csőszerelési munka után mindig ellenőrizd az EPH folytonosságát.
:::

:::exam
A vizsgán kérdés lehet az EPH célja, a fő EPH-ba bekötendő részek, és a helyi EPH szerepe.
:::

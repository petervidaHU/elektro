---
title: Túlterhelés és zárlat
summary: A túláram két fajtája, a túlterhelés és a zárlat: hogyan keletkeznek, mit tesznek a vezetékkel, mekkora áram folyhat zárlatkor, és mi a bekapcsolási áramlökés.
verify:
  - "Ohm törvényéből számított zárlati áramok (230 V / 0,5 Ω = 460 A; 230 V / 0,2 Ω = 1150 A) és a Joule-hő I²-tel arányos növekedése – számított értékek"
  - "A túlterhelést a kismegszakító bimetálos (termikus), a zárlatot elektromágneses kioldója kapcsolja le – Wikipedia: Circuit breaker"
  - "Példa (16 A-es kör, 2,5 mm²: 2000 W + 2200 W + 1000 W = 22,6 A) – számított érték"
---

:::goals
- Meg tudod különböztetni a túlterhelést és a zárlatot.
- Megérted, miért veszélyes mindkettő a vezetékre és a környezetére.
- Ki tudod számítani a zárlati áram nagyságát a hurok impedanciájából.
- Tudod, mi a bekapcsolási áramlökés, és miért nem hiba.
:::

## Mi a túláram?

**Túláram** minden olyan áram, amely nagyobb a vezeték vagy a berendezés névleges, tartósan megengedett áramánál. Két fajtája van, és a kettő egészen másképp viselkedik:

- **Túlterhelés:** ép áramkörben, a fogyasztók miatt folyik a megengedettnél nagyobb áram.
- **Zárlat:** hiba miatt két, különböző potenciálú vezető (például fázis és nulla, fázis és védővezető, két fázis) közvetlenül vagy nagyon kis ellenálláson át összeér.

A túláramvédelem feladata, hogy mindkettőt lekapcsolja, mielőtt a vezeték vagy a környezete károsodna.

## Túlterhelés

Túlterhelés akkor keletkezik, ha egy áramkörre egyszerre több fogyasztót kapcsolnak, mint amennyit elbír, vagy ha egy motor mechanikailag túlterhelt (megszorul, túl nagy terhet hajt).

:::example
Egy 16 A-es kismegszakítóval védett, 230 V-os konyhai áramkörön egyszerre működik egy 2000 W-os vízforraló, egy 2200 W-os mikrohullámú sütő (felvett teljesítmény) és egy 1000 W-os kávéfőző.

1. P = 2000 W + 2200 W + 1000 W = 5200 W.
2. I = P / U = 5200 W / 230 V ≈ 22,6 A.
3. Ez a 16 A-nek kb. 1,4-szerese: túlterhelés.
:::

A túlterhelési áram a névleges áramnak általában legfeljebb néhányszorosa. Nem azonnal veszélyes, de a vezetékben keletkező hő az áram **négyzetével** nő (`P = I² · R`): 1,4-szeres áramnál kb. kétszeres hő keletkezik. A vezeték lassan, percek alatt melegszik túl. A szigetelés gyorsabban öregszik, rideggé válik, végül tönkremegy, ami zárlathoz vagy tűzhöz vezet.

Mivel a túlterhelés lassú folyamat, a védelemnek nem kell azonnal lekapcsolnia: elég, ha a vezeték túlmelegedése előtt kapcsol le. A kismegszakítóban ezt a **termikus (bimetálos) kioldó** végzi.

## Zárlat

Zárlatkor az áramot már nem a fogyasztó, hanem csak a **hurok impedanciája** korlátozza: a transzformátor tekercse, a hálózati vezetékek és a lakás vezetékeinek ellenállása a hiba helyéig és vissza. Ez nagyon kicsi, ezért a zárlati áram a névleges áram sokszorosa.

`I_k = U₀ / Z_s`

- I_k: a zárlati áram, A,
- U₀: a fázisfeszültség (földhöz képest), V,
- Z_s: a zárlati hurok impedanciája, Ω.

:::example
Egy dugaszolóaljzatnál a zárlati hurok impedanciája 0,5 Ω. Mekkora áram folyik fázis–nulla zárlatkor?

1. I_k = 230 V / 0,5 Ω = 460 A.
2. Ha a hurok impedanciája csak 0,2 Ω (a transzformátorhoz közeli elosztóban), I_k = 230 V / 0,2 Ω = 1150 A.
:::

A zárlati áram 460 A-nél a 16 A-es kör névleges áramának kb. 29-szerese, a hő pedig kb. 830-szorosa. A vezeték másodperc törtrésze alatt felizzik, a hiba helyén **ív** keletkezik, amely olvasztja a fémet és tüzet okoz. Az elektromágneses erők a vezetékeket és a sínek rögzítését is megterhelik.

Ezért a zárlatot a védelemnek **azonnal**, a lehető legrövidebb idő alatt kell lekapcsolnia. A kismegszakítóban ezt az **elektromágneses (gyors) kioldó** végzi.

Ugyanez az összefüggés miatt fontos a hurokimpedancia mérése: ha a hurok impedanciája túl nagy, a zárlati áram túl kicsi lesz ahhoz, hogy a gyorskioldó működjön, és a hiba nem kapcsolódik le elég gyorsan.

## Bekapcsolási áramlökés

Egyes fogyasztók bekapcsoláskor rövid ideig a névleges áramuk többszörösét veszik fel:

- a **motorok** indításkor, amíg fel nem pörögnek (az indítóáram és a névleges áram arányát az adattábla `I_A / I_N` értéke adja meg),
- a **transzformátorok** és a vasmagos fojtók a vasmag felmágnesezésekor,
- a **kapcsolóüzemű tápegységek** és LED-meghajtók a bemeneti kondenzátorok feltöltésekor,
- a hideg **izzólámpa**, mert a hideg izzószál ellenállása kisebb.

Ez a bekapcsolási áramlökés nem hiba, és a védelemnek **nem szabad** miatta lekapcsolnia. Ezért kell a kismegszakító jelleggörbéjét a fogyasztóhoz választani: nagy indítóáramú fogyasztóhoz olyan kioldó kell, amelynek gyorskioldója csak nagyobb áramnál működik. Ezt a kismegszakítókról szóló leckében tanulod.

:::mistake
Gyakori tévhit, hogy „ha a kismegszakító lekapcsolt, nagyobbat kell betenni”. A kismegszakító a **vezetéket** védi. Ha túlterhelés miatt old ki, a fogyasztókat kell több áramkörre szétosztani. Ha zárlat miatt old ki, a hibát kell megkeresni és kijavítani.
:::

:::exam
A vizsgán kérdés lehet a túlterhelés és a zárlat különbsége, a zárlati áram kiszámítása a hurokimpedanciából, és hogy a kismegszakító melyik kioldója melyik esetben működik.
:::

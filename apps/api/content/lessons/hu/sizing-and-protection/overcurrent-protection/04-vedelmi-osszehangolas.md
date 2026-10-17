---
title: Túláramvédelem és vezeték összehangolása
summary: Mit jelent az I_b ≤ I_n ≤ I_z feltétel, hogyan választod meg a kismegszakító névleges áramát a terheléshez és a vezetékhez, miért tilos nagyobb kismegszakítót tenni egy vezetékre, és mi a szelektivitás.
verify:
  - "Összehangolási feltétel I_b ≤ I_n ≤ I_z (terhelő áram ≤ névleges áram ≤ terhelhetőség) – de.wikipedia: Überstromschutzeinrichtung (a védelem névleges árama legalább a fogyasztó üzemi árama); HIÁNYZIK: a teljes feltételrendszer (I_b ≤ I_n ≤ I_z és I₂ ≤ 1,45 · I_z) olvasott forrása – MSZ HD 60364-4-43, 433.1"
  - "Lakó- és irodahelyiségekben B jelleggörbe – de.wikipedia: Leitungsschutzschalter; szokásos névleges áramok – Wikipedia: Circuit breaker"
  - "Példák (3220 W → 14 A; a terhelhetőségi értékek a feladatban megadott kivonat szerinti szemléltető számok) – számított értékek"
---

:::goals
- Megérted a terhelő áram, a névleges áram és a terhelhetőség kapcsolatát.
- Ki tudod választani a kismegszakító névleges áramát egy áramkörhöz.
- Megérted, miért tilos a vezeték terhelhetőségénél nagyobb névleges áramú védelmet beépíteni.
- Ismered a szelektivitás elvét.
:::

## Három áram, egy feltétel

Egy áramkör méretezésekor három áramot kell összevetned:

- **I_b – terhelő áram:** az áram, amelyet az áramkör fogyasztói üzemszerűen felvesznek. A fogyasztók teljesítményéből számítod.
- **I_n – a védelem névleges árama:** a kismegszakító vagy a biztosító névleges árama.
- **I_z – a vezeték terhelhetősége:** az az áram, amelyet a vezeték az adott szerelési körülmények között tartósan, túlmelegedés nélkül elvisel. Ezt a következő témakörben tanulod.

A három áram között ennek a sorrendnek kell teljesülnie:

`I_b ≤ I_n ≤ I_z`

- **I_b ≤ I_n:** a védelem ne oldjon ki üzemszerű terhelésnél.
- **I_n ≤ I_z:** a védelem kapcsoljon le, mielőtt a vezeték tartósan túlterhelődne.

A védelem tehát a **vezetéket** védi, nem a fogyasztót. A névleges áramot a vezeték terhelhetősége korlátozza felülről.

## Kidolgozott példa

:::example
Egy 230 V-os áramkörre egy 3220 W-os, ohmos fogyasztó (cos φ = 1) kerül. A vezeték 2,5 mm²-es réz; a feladatban megadott táblázati kivonat szerint a terhelhetősége az adott szerelési módban I_z = 24 A.

1. Terhelő áram: I_b = P / U = 3220 W / 230 V = 14 A.
2. A szokásos névleges áramok közül az I_b-nél nem kisebb, legkisebb érték: 16 A.
3. Ellenőrzés: 14 A ≤ 16 A ≤ 24 A. A feltétel teljesül.
4. Választás: **B16** kismegszakító.
:::

:::example
Ugyanezt a vezetéket a feladat szerint hőszigetelt falban szerelik, ahol a kivonat alapján I_z = 18,5 A. Megfelel-e a B20?

1. I_b = 14 A ≤ 20 A, ez teljesül.
2. I_n = 20 A ≤ I_z = 18,5 A? **Nem**, 20 A nagyobb, mint 18,5 A.
3. A B20 nem építhető be. A B16 megfelel: 14 A ≤ 16 A ≤ 18,5 A.
:::

Ha egyik szokásos névleges áram sem fér be I_b és I_z közé, nagyobb keresztmetszetű vezetéket kell választani, vagy a terhelést több áramkörre kell szétosztani.

## Miért tilos nagyobb kismegszakítót tenni?

Ha egy gyakran kioldó áramkörben a kismegszakítót nagyobbra cserélik (például B16 helyett B25-re egy 2,5 mm²-es vezetéken), a feltétel `I_n ≤ I_z` sérül. A következmények:

- a vezetéken a terhelhetőségénél nagyobb áram folyhat **tartósan**, kioldás nélkül,
- a vezeték túlmelegszik, a szigetelés idő előtt öregszik, rideggé válik,
- a falban vagy a kötődobozban a túlmelegedett vezeték zárlatot és **tüzet** okozhat.

A kioldás oka mindig a túlterhelés vagy egy hiba. A megoldás a terhelés szétosztása, nagyobb keresztmetszetű új vezeték, vagy a hiba megkeresése, soha nem a nagyobb védelem.

## Szelektivitás

Egy épület elosztóhálózatában a védelmek **sorba** kapcsolódnak: a csatlakozási főbiztosíték után a lakás főelosztójának kismegszakítói, azok után esetleg alelosztók következnek. **Szelektív** a védelem, ha egy hiba esetén **csak a hibához legközelebbi**, előtte lévő védelem kapcsol le, a betáplálás felé eső védelmek nem.

Példa: egy lámpatest zárlatánál csak a világítási kör kismegszakítója oldjon ki, ne a lakás főbiztosítója, mert akkor az egész lakás sötétbe borul.

A szelektivitás alapelve, hogy a betáplálás felé haladva a védelmek névleges árama (és késleltetése) **lépcsőzetesen nő**. Hogy két adott készülék valóban szelektív-e, azt a gyártók szelektivitási táblázatai alapján kell ellenőrizni. Az áram-védőkapcsolóknál ugyanezt a célt szolgálja a késleltetett (S jelű) ÁVK a betáplálási oldalon.

:::safety
- A kismegszakító névleges áramát mindig a vezeték terhelhetőségéhez igazítsd, ne a fogyasztóhoz. Egy védelem, amely nagyobb a vezeték terhelhetőségénél, tűzveszélyes.
- Védelmet cserélni csak feszültségmentesített elosztóban szabad.
:::

:::mistake
Gyakori hiba, hogy a névleges áramot a terhelő áramhoz választják úgy, hogy „legyen tartalék”, és nem ellenőrzik a vezeték terhelhetőségét. A tartalék a vezetéken kell legyen, nem a kismegszakítón.
:::

:::exam
A vizsga III. részében a vezetékválasztás része a védelem kiválasztása: az `I_b ≤ I_n ≤ I_z` feltétel ellenőrzése a feladatban megadott táblázati értékekkel.
:::

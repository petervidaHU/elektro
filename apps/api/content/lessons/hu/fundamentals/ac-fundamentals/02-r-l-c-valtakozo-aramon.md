---
title: Ellenállás, tekercs és kondenzátor váltakozó áramon
summary: Hogyan viselkedik az ellenállás, az induktivitás és a kapacitás szinuszos feszültségen, mi a fáziseltolás, és hogyan számítod az induktív és a kapacitív reaktanciát.
verify:
  - "X_L = 2πfL, X_C = 1/(2πfC), fázisviszonyok (ideális L-nél az áram 90°-ot késik, ideális C-nél 90°-ot siet) – Wikipedia: Electrical reactance"
  - "Példák (0,1 H → 31,42 Ω; 10 µF → 318,3 Ω) – számított értékek"
---

:::goals
- Tudod, hogy az ellenálláson, a tekercsen és a kondenzátoron milyen fázisviszonyban van az áram és a feszültség.
- Ki tudod számítani az induktív és a kapacitív reaktanciát.
- Megérted, hogyan függ a reaktancia a frekvenciától.
- Ki tudod számítani az áramot egy tisztán induktív vagy kapacitív fogyasztónál.
:::

## Ohmos ellenállás váltakozó áramon

Az ellenálláson (izzószál, fűtőszál, vízmelegítő betét) az áram és a feszültség **fázisban van**: egyszerre érik el a csúcsukat és egyszerre haladnak át a nullán. A fáziseltolás szöge: **φ = 0°**.

Az ellenállás értéke a hálózati frekvencián gyakorlatilag ugyanannyi, mint egyenáramon, és Ohm törvénye az effektív értékekkel ugyanúgy érvényes:

`I = U / R`

Egy 2000 W-os, 230 V-os fűtőbetét ellenállása: R = U² / P = 230² / 2000 = 26,45 Ω, árama I = 230 V / 26,45 Ω ≈ 8,7 A.

## Tekercs: induktív reaktancia

A tekercs (induktivitás, jele L, mértékegysége a **henry, H**) a rajta átfolyó áram változását akadályozza: minden áramváltozás önindukciós feszültséget kelt benne, amely a változás ellen hat. Ezért váltakozó áramon a tekercsnek **induktív reaktanciája** (induktív ellenállása) van:

`X_L = 2 · π · f · L = ω · L`

- X_L: induktív reaktancia, Ω,
- f: frekvencia, Hz,
- L: induktivitás, H.

Ideális (veszteségmentes) tekercsen az **áram 90°-ot késik** a feszültséghez képest.

Az X_L a frekvenciával **egyenesen arányos**: kétszeres frekvencián kétszeres. Egyenáramon (f = 0) X_L = 0, ott a tekercs csak a huzal ohmos ellenállásaként viselkedik. Ezért nem szabad egy váltakozó áramra tervezett tekercset (mágneskapcsoló, transzformátor) egyenfeszültségre kötni: a kis ohmos ellenálláson nagy áram folyik, és a tekercs leég.

:::example
Egy 0,1 H induktivitású tekercset 230 V, 50 Hz-es feszültségre kötünk (az ohmos ellenállását elhanyagoljuk). Mekkora az áram?

1. X_L = 2 · π · 50 Hz · 0,1 H = 31,42 Ω.
2. I = U / X_L = 230 V / 31,42 Ω ≈ 7,32 A.
3. Az áram 90°-ot késik a feszültséghez képest.
:::

## Kondenzátor: kapacitív reaktancia

A kondenzátor (kapacitás, jele C, mértékegysége a **farad, F**; a gyakorlatban µF és nF) két, szigeteléssel elválasztott fegyverzetből áll. Egyenáramon feltöltődik, utána nem folyik át rajta áram. Váltakozó feszültségen folyamatosan töltődik és kisül, ezért a körben áram folyik. A kondenzátornak **kapacitív reaktanciája** van:

`X_C = 1 / (2 · π · f · C) = 1 / (ω · C)`

- X_C: kapacitív reaktancia, Ω,
- C: kapacitás, F.

Ideális kondenzátoron az **áram 90°-ot siet** a feszültséghez képest.

Az X_C a frekvenciával **fordítottan arányos**: nagyobb frekvencián kisebb. Egyenáramon (f = 0) X_C végtelen nagy, a kondenzátor nem vezet.

:::example
Egy 10 µF-os kondenzátort 230 V, 50 Hz-es hálózatra kötünk. Mekkora az áram?

1. C = 10 µF = 0,00001 F.
2. X_C = 1 / (2 · π · 50 Hz · 0,00001 F) = 1 / 0,0031416 ≈ 318,3 Ω.
3. I = U / X_C = 230 V / 318,3 Ω ≈ 0,72 A.
4. Az áram 90°-ot siet a feszültséghez képest.
:::

:::safety
A kondenzátor a lekapcsolás után is **feltöltve maradhat**, és a csatlakozóin veszélyes feszültség lehet. Motorüzemi kondenzátort, fázisjavító kondenzátort vagy tápegységet a lekapcsolás után csak a kisütés és a feszültségmentesség mérése után érints meg.
:::

## Összefoglalás és megjegyzési szabály

- Ellenállás: φ = 0°, R nem függ a frekvenciától.
- Tekercs: az áram **késik** 90°-ot, X_L nő a frekvenciával.
- Kondenzátor: az áram **siet** 90°-ot, X_C csökken a frekvenciával.

A reaktancia (X_L, X_C) mértékegysége ugyanúgy ohm, mint az ellenállásé, de a reaktancián **nem keletkezik hő**: a tekercs és a kondenzátor az energiát félperiódusonként eltárolja és visszaadja a hálózatnak.

:::mistake
Gyakori hiba, hogy a kapacitást µF-ban írják be a képletbe. A `X_C = 1 / (2 · π · f · C)` képletbe a kapacitást **faradban** kell beírni: 10 µF = 10 · 10⁻⁶ F.
:::

:::exam
A vizsga III. részében számítási feladat lehet: X_L vagy X_C kiszámítása adott frekvencián, majd az áram meghatározása Ohm törvényével.
:::

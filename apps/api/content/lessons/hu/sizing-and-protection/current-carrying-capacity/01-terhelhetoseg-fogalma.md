---
title: A terhelhetőség fogalma
summary: Miért melegszik a vezeték, mi szabja meg, mekkora áramot visel el tartósan, és mit jelent a terhelhetőség (I_z).
verify:
  - "PVC szigetelés megengedett üzemi hőmérséklete +70 °C, hőálló PVC +90 °C, EPR (etilén-propilén gumi) tartós üzemi hőmérséklete 90 °C – de.wikipedia: Mantelleitung (vezetékjelölési kódok)"
  - "Terhelhetőség (ampacity): az a legnagyobb áram, amelyet a vezető a használati körülmények között tartósan vezethet a hőmérsékleti határa túllépése nélkül – Wikipedia: Ampacity"
  - "HIÁNYZIK: a térhálósított polietilén (XLPE/VPE) szigetelés megengedett üzemi hőmérséklete – MSZ HD 60364-5-52, 52.1 táblázat"
  - "Példák (2,5 mm², 20 m: 0,18 Ω, 16 A → 46 W; 25 A → 112,5 W) – számított értékek"
---

:::goals
- Megérted, miért melegszik a terhelt vezeték.
- Tudod, mi korlátozza a vezetéken tartósan átvihető áramot.
- Ismered a terhelhetőség (I_z) fogalmát.
- Ki tudod számítani a vezetékben keletkező hőteljesítményt.
:::

## Miért melegszik a vezeték?

Minden vezetőnek van ellenállása. Ha áram folyik rajta, a vezetőben **hő** keletkezik (Joule-hő). A hőteljesítmény:

`P_v = I² · R`

- P_v: a vezetékben hővé alakuló teljesítmény (veszteség), W,
- I: az áram, A,
- R: a vezető ellenállása, Ω.

A hő az áram **négyzetével** arányos: kétszeres áramnál négyszeres hő keletkezik.

:::example
Egy 20 m hosszú, 2,5 mm²-es rézvezeték egy erének ellenállása üzemi hőmérsékleten (ρ = 0,0225 Ω·mm²/m) 0,18 Ω. Egyfázisú körben a fázis- és a nullavezetőn is folyik az áram.

1. A két ér ellenállása: 2 · 0,18 Ω = 0,36 Ω.
2. 16 A-nél: P_v = 16² · 0,36 = 92,16 W, erenként kb. 46 W.
3. 25 A-nél: P_v = 25² · 0,36 = 225 W, erenként 112,5 W.
:::

A 20 m-es vezetéken 25 A-nél 225 W hő keletkezik: mintha két izzólámpa égne a falban. Ezt a hőt a vezetéknek a szigetelésén és a környezetén keresztül le kell adnia.

## Hőegyensúly

A bekapcsolás után a vezeték melegedni kezd. Ahogy a hőmérséklete nő, egyre több hőt ad le a környezetének. Egy idő után beáll a **hőegyensúly**: a vezeték annyi hőt ad le, amennyi keletkezik benne, és a hőmérséklete állandósul.

Az állandósult hőmérséklet attól függ:

- **mekkora az áram** (mennyi hő keletkezik),
- **mekkora a keresztmetszet** (vastagabb vezetőnek kisebb az ellenállása, kevesebb hő keletkezik),
- **mennyire tudja leadni a hőt** (szabad levegőn jól, hőszigetelt falban, csőben, kötegben rosszul),
- **milyen meleg a környezet** (melegebb környezetbe kevesebb hő tud távozni).

## Mi szabja meg a határt?

A vezető fém (réz, alumínium) sokkal nagyobb hőmérsékletet is elviselne. A határt a **szigetelés** szabja meg: ha túl meleg lesz, gyorsan öregszik, rideggé válik, megrepedezik, végül elveszti szigetelőképességét. Ez zárlathoz, áramütéshez vagy tűzhöz vezet.

A szigetelőanyagok megengedett tartós üzemi hőmérséklete:

- **PVC:** 70 °C,
- **hőálló PVC:** 90 °C,
- **EPR (etilén-propilén gumi):** 90 °C.

A lakásszerelésben használt vezetékek szigetelése túlnyomórészt PVC.

## A terhelhetőség

A vezeték **terhelhetősége**, jele **I_z**, az a legnagyobb áram, amelyet a vezeték az adott használati körülmények között **tartósan** vezethet anélkül, hogy a szigetelése túllépné a megengedett hőmérsékletet.

Fontos: a terhelhetőség nem csak a keresztmetszettől függ. Ugyanaz a 2,5 mm²-es vezeték szabadon, falon szerelve több áramot visel el, mint hőszigetelő anyagba ágyazva vagy sok más vezetékkel egy kötegben. A terhelhetőséget befolyásoló tényezőket a következő lecke tárgyalja.

A terhelhetőség értékeit szabványos táblázatok tartalmazzák, szerelési módonként és keresztmetszetenként. A vizsgán és a gyakorlati feladatokban ezeket a táblázati értékeket a feladat megadja.

:::safety
- A vezeték túlterhelése nem azonnal látható: a szigetelés lassan, évek alatt károsodik, és a zárlat vagy a tűz sokkal később keletkezik. Ezért kell a vezetéket a terhelhetőségéhez illő védelemmel ellátni.
- Elszíneződött, megkeményedett, repedezett szigetelésű vezetéket ne helyezz vissza üzembe: cseréld ki, és keresd meg a túlmelegedés okát.
:::

:::mistake
Gyakori hiba, hogy egy vezeték terhelhetőségét csak a keresztmetszetéből „tudni vélik” („a 2,5-ös 20 A-t bír”). A terhelhetőség mindig a szerelési módtól, a környezeti hőmérséklettől és a csoportosítástól is függ.
:::

:::exam
A vizsga III. részének vezetékválasztási feladatában a terhelhetőséget a megadott táblázati kivonatból kell kiolvasni és szükség esetén helyesbíteni.
:::

---
title: "Hibavédelem: a táplálás önműködő lekapcsolása"
summary: Mi történik testzárlatkor, milyen úton folyik a hibaáram, hogyan működik együtt a védővezető és a védelmi eszköz, és mennyi idő alatt kell lekapcsolni.
verify:
  - "Hibavédelem: a meghibásodás miatt potenciálra kerülő test megérintéséből származó balesetek megelőzése – MEE VÉT kézikönyv, 347. o."
  - "Megengedett tartós érintési feszültség (U_L): 50 V AC (100 Hz-ig), 120 V DC – MEE VÉT kézikönyv, 349. o."
  - "Lekapcsolási idők legfeljebb 32 A-es végáramkörökben, U₀ ≤ 230 V: TN 0,4 s, TT 0,2 s; elosztó áramkörökben és 32 A feletti végáramkörökben TN 5 s, TT 1 s – MEE VÉT kézikönyv II.17. táblázat, 353. o. (MSZ HD 60364-4-41:2007, 411.3.2)"
  - "Feltétel TN-rendszerben: Z_s · I_a ≤ U₀ – MEE VÉT kézikönyv, 353. o."
  - "Kismegszakító pillanatkioldása: B 3–5 · Iₙ, C 5–10 · Iₙ – Wikipedia: Circuit breaker"
  - "Példák (B16, Z_s = 0,8 Ω: 64 V, 287,5 A; Z_s = 3,5 Ω: 280 V, 65,7 A) – számított értékek"
---

:::goals
- Megérted, mi a testzárlat, és milyen úton folyik a hibaáram TN-rendszerben.
- Tudod, hogyan működik együtt a védővezető és a túláramvédelmi eszköz.
- Ismered a megengedett leghosszabb lekapcsolási időket.
- Ellenőrizni tudod a `Z_s · I_a ≤ U₀` feltételt.
:::

## Testzárlat és érintési feszültség

**Testzárlat** akkor keletkezik, ha egy készülékben a szigetelés meghibásodik, és egy aktív rész (például a fázisvezető) összeér a készülék fémházával, a **testtel**. Ha a test nincs bekötve a védővezetőbe, a fázisfeszültséget kapja, és aki megérinti, áramütést szenved.

A **hibavédelem** célja, hogy egy ilyen hiba ne okozhasson veszélyes áramütést. A leggyakoribb módja a **táplálás önműködő lekapcsolása**: a hibás áramkört egy védelmi eszköz rövid időn belül automatikusan lekapcsolja.

A tartósan megengedett érintési feszültség (U_L) 100 Hz-ig terjedő frekvenciájú váltakozó feszültségnél **50 V**, egyenfeszültségnél **120 V**. Ha egy test feszültsége ennél nagyobb lehet, a hibát megadott időn belül le kell kapcsolni.

## A hibaáram útja TN-rendszerben

TN-rendszerben a testeket a **védővezető (PE)** köti a transzformátor földelt csillagpontjához. Testzárlatkor a hibaáram zárt körben folyik:

transzformátor tekercse → fázisvezető → hiba helye → test → védővezető (PE vagy PEN) → csillagpont.

Ennek a körnek az impedanciája a **hurokimpedancia** (Z_s). Mivel a kör csak fémes vezetőkből áll, Z_s kicsi, és a hibaáram nagy, zárlati nagyságrendű. Ez a nagy áram működteti a kismegszakító **elektromágneses gyorskioldóját**, amely a hibás kört a másodperc törtrésze alatt lekapcsolja.

[Ábra: TN-S rendszer testzárlattal. A hibaáram útja nyilakkal: transzformátor → L vezető → a készülék testzárlata → PE vezető → csillagpont. A kismegszakító az L vezetőben.]

A hibavédelem tehát **két elem együttműködése**:

- a **védővezető** biztosítja a kis impedanciájú visszautat,
- a **védelmi eszköz** (kismegszakító, biztosító vagy ÁVK) kapcsolja le a hibát.

Ha bármelyik hiányzik vagy hibás (megszakadt PE, túl nagy hurokimpedancia, rossz védelem), a test tartósan veszélyes feszültségen maradhat.

## Lekapcsolási idők

A védelmi eszköznek a hibát a megengedett időn belül kell lekapcsolnia. A megengedett leghosszabb lekapcsolási idők 230 V-os fázisfeszültségnél:

- **legfeljebb 32 A-es végáramkörökben:** TN-rendszerben **0,4 s**, TT-rendszerben **0,2 s**,
- **elosztó áramkörökben és 32 A feletti végáramkörökben:** TN-rendszerben **5 s**, TT-rendszerben **1 s**.

A végáramkörök (dugaszolóaljzatok, kézi készülékek körei) rövidebb időt kapnak, mert ott nagyobb az esélye, hogy valaki a hiba pillanatában fogja a készüléket.

## A feltétel: Z_s · I_a ≤ U₀

A lekapcsolás akkor biztos, ha a hibaáram eléri azt az áramot (I_a), amely a védelmi eszközt a megengedett időn belül működteti:

`Z_s · I_a ≤ U₀`

- Z_s: a hurokimpedancia, Ω,
- I_a: a védelmi eszközt az előírt időn belül működtető áram, A (kismegszakítónál a gyorskioldási tartomány felső határa, ÁVK-nál IΔn),
- U₀: a fázisfeszültség, V.

:::example
Egy 230 V-os dugaszolóaljzat-kört B16-os kismegszakító véd. A mért hurokimpedancia Z_s = 0,8 Ω. Megfelel-e a hibavédelem?

1. I_a = 5 · 16 A = 80 A (a B jelleggörbe felső határa: ennél a gyorskioldó biztosan működik).
2. Z_s · I_a = 0,8 Ω · 80 A = 64 V, ez nem nagyobb 230 V-nál. **Megfelel.**
3. A várható hibaáram: 230 V / 0,8 Ω = 287,5 A, ez jóval több a szükséges 80 A-nél.
:::

:::example
Ugyanez a kör egy hosszú, vékony vezetékkel: Z_s = 3,5 Ω.

1. Z_s · I_a = 3,5 Ω · 80 A = 280 V, ez **nagyobb** 230 V-nál. Nem felel meg.
2. A hibaáram csak 230 V / 3,5 Ω ≈ 65,7 A, a B16 gyorskioldója nem működik biztosan.
3. Megoldás: rövidebb vagy nagyobb keresztmetszetű vezeték, kisebb névleges áramú védelem, vagy ÁVK alkalmazása.
:::

:::safety
- A hibavédelem csak ép védővezetővel működik. A védővezetőt soha ne szakítsd meg, ne hagyd bekötetlenül, és ne használd más célra.
- Új vagy átalakított áramkört csak akkor szabad üzembe helyezni, ha a védővezető folytonosságát és a hurokimpedanciát megmérték, és a `Z_s · I_a ≤ U₀` feltétel teljesül.
- Hibakeresést és javítást csak feszültségmentesített áramkörön végezz.
:::

:::mistake
Gyakori hiba azt hinni, hogy a kismegszakító „mindig lekapcsol”. Ha a hurokimpedancia túl nagy, a hibaáram csak a termikus kioldót indítja, amely percekig is késlekedhet, miközben a test veszélyes feszültségen van.
:::

:::exam
A vizsgán és a projektfeladatban kérdés lehet a hibaáram útja, a megengedett lekapcsolási idők, és a `Z_s · I_a ≤ U₀` feltétel ellenőrzése mért értékkel.
:::

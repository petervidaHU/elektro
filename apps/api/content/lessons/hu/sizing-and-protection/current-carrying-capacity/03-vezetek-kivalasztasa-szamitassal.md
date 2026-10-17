---
title: Vezeték kiválasztása számítással
summary: A vizsga III. részének menete lépésről lépésre: a terhelő áramtól a feszültségesés ellenőrzéséig és a végleges keresztmetszetig.
verify:
  - "A vezetékkiválasztás lépéssora: terhelő áram, szükséges terhelhetőség a helyesbítő tényezőkkel, keresztmetszet a táblázatból, feszültségesés ellenőrzése, végleges választás – a vizsga III. részének felépítése (THEORY_TOC és fejlesztési terv szerint)"
  - "HIÁNYZIK: kidolgozott példa terhelhetőségi táblázat-kivonattal – a hitelesített hivatkozási táblázatból (K8, K9) kell kiegészíteni"
---

:::goals
- Végig tudod vinni a vezeték kiválasztásának lépéseit a terhelő áramtól a végleges keresztmetszetig.
- Tudod, mikor a terhelhetőség, és mikor a feszültségesés dönt.
- Tudod, miért kell mindkét feltételt ellenőrizni.
:::

## A lépések

Egy áramkör vezetékét két feltétel együtt határozza meg: bírja-e **melegedés** szempontjából (terhelhetőség), és elég kicsi-e a **feszültségesése**. A választás menete:

1. **Terhelő áram (I_b) kiszámítása** a fogyasztó teljesítményéből.
2. **Szükséges terhelhetőség:** a helyesbítő tényezőkkel visszaszámolod, mekkora legyen a táblázati érték.
3. **Keresztmetszet a terhelhetőség alapján:** a táblázatból kiválasztod a legkisebb keresztmetszetet, amelynek terhelhetősége elég.
4. **Feszültségesés ellenőrzése** ezzel a keresztmetszettel.
5. **Végleges választás:** ha a feszültségesés túl nagy, nagyobb keresztmetszetet választasz; a nagyobb a két feltétel közül a döntő.

## 1. A terhelő áram

Egyfázisú fogyasztónál `I_b = P / (U · cos φ)`, háromfázisúnál `I_b = P / (√3 · U · cos φ)`, ahol P a hatásos teljesítmény, U a feszültség (háromfázisúnál a vonali), cos φ a teljesítménytényező.

:::example
Egy 3,45 kW-os, ohmos (cos φ = 1) egyfázisú fogyasztó áramfelvétele 230 V-on:

`I_b = 3450 / (230 · 1) = 15 A`
:::

## 2. A szükséges terhelhetőség

A tényleges terhelhetőség a helyesbítő tényezőkkel: `I_z = k · I_z,táblázat`. A vezetéknek legalább az áramot kell bírnia, ezért `I_z ≥ I_b`. Ebből a táblázati értéknek legalább `I_b / k`-nak kell lennie, ahol k az összes helyesbítő tényező szorzata.

Ha például k = 0,8, a táblázati terhelhetőségnek legalább `15 / 0,8 = 18,75 A`-nak kell lennie.

## 3. Keresztmetszet a táblázatból

A hitelesített terhelhetőségi táblázat megfelelő oszlopában (szerelési mód, szigetelés, anyag) megkeresed azt a **legkisebb keresztmetszetet**, amelynek táblázati terhelhetősége nem kisebb a szükségesnél. A táblázat értékeit a feladat vagy a hivatkozási táblázat adja; ne tanuld meg fejből.

## 4. Feszültségesés ellenőrzése

Ezzel a keresztmetszettel kiszámolod a :term[feszültségesést]{id=voltage-drop} a megismert módon, és összeveted a megengedett értékkel. Ha megfelel, ez a végleges keresztmetszet. Ha nem, a következő nagyobb szabványos keresztmetszettel ismételed az ellenőrzést, amíg meg nem felel.

## Melyik feltétel dönt?

- **Rövid vezeték, nagy áram:** többnyire a terhelhetőség dönt.
- **Hosszú vezeték:** gyakran a feszültségesés dönt, mert a vezeték hosszával nő az ellenállás.

Mindkettőt mindig ki kell számolni, és a **nagyobb** keresztmetszetet kell választani.

:::safety
A vezeték kiválasztása után a túláramvédelmet is össze kell hangolni a vezetékkel (`I_b ≤ I_n ≤ I_z`). A lépéssor ezzel zárul; a túláramvédelem leckéjében szerepel.
:::

:::mistake
Csak a feszültségesés alapján választani keresztmetszetet. Ha a feszültségesés megfelel, de a vezeték terhelhetősége kisebb a terhelő áramnál, a vezeték túlmelegszik.
:::

:::exam
A központi interaktív vizsga III. részének fő feladata pontosan ez a menet. A terhelhetőségi és helyesbítő táblázatokat kivonatként kapod; a lépések sorrendje és a számítások a te dolgod.
:::

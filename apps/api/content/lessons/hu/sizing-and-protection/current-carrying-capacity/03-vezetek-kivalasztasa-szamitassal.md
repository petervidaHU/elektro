---
title: Vezeték kiválasztása számítással
summary: A vizsga III. részének vezetékválasztási menete lépésről lépésre: terhelő áram, védelem, terhelhetőség helyesbítéssel, feszültségesés ellenőrzése, végső választás.
verify:
  - "Réz fajlagos ellenállása üzemi hőmérsékleten 0,0225 Ω·mm²/m – MSZ HD 60364-5-52, G melléklet (packages/shared/src/reference/conductors.ts); szabványos keresztmetszet-sor – MSZ EN 60228"
  - "Összehangolás I_b ≤ I_n ≤ I_z – lásd overcurrent-protection/04 (forrásjelölés ott)"
  - "A példa táblázati kivonata (2,5 mm²: 24 A; 4 mm²: 32 A; 6 mm²: 41 A), a 0,87-es helyesbítő tényező és a 3 %-os megengedett feszültségesés a feladat szemléltető adatai, nem szabványos értékek – a diák csak a feladatban megadott értékekkel számol"
  - "Számított értékek: I_b = 20 A; I_z(2,5) = 20,88 A; ΔU(2,5) = 9 V = 3,91 %; Sₘᵢₙ = 3,26 mm²; ΔU(4) = 5,625 V = 2,45 %; I_z(4) = 27,84 A"
---

:::goals
- Ismered a vezetékválasztás lépéseinek sorrendjét.
- Ki tudod választani a védelmet a terhelő áramhoz és a vezetékhez.
- A táblázati kivonatból kiolvasott terhelhetőséget helyesbíted, és összeveted a védelemmel.
- A feszültségesést ellenőrzöd, és a két feltétel alapján döntesz a keresztmetszetről.
:::

## A menet áttekintése

A vezetékválasztásnál a keresztmetszetnek egyszerre két feltételnek kell megfelelnie:

1. **Terhelhetőség:** a vezeték tartósan elviselje a terhelést, és a védelem megvédje a túlterheléstől (`I_b ≤ I_n ≤ I_z`).
2. **Feszültségesés:** a feszültségesés ne legyen nagyobb a megengedettnél.

A lépések:

1. A terhelő áram (I_b) kiszámítása a teljesítményből.
2. A védelem névleges áramának (I_n) kiválasztása: a legkisebb szokásos érték, amely nem kisebb I_b-nél.
3. A keresztmetszet kiválasztása terhelhetőségre: a táblázati értéket helyesbíted, és ellenőrzöd, hogy `I_n ≤ I_z`.
4. A feszültségesés ellenőrzése a választott keresztmetszettel. Ha túl nagy, a feszültségesésre számított legkisebb keresztmetszetet veszed.
5. Végső választás: a két feltétel közül a **nagyobb** keresztmetszetet adó a döntő.

A feladat megadja a terhelhetőségi táblázat kivonatát, a helyesbítő tényezőket, a fajlagos ellenállást és a megengedett feszültségesést. Mindig ezekkel az adatokkal dolgozz.

## Kidolgozott feladat: 1–3. lépés

:::example
**Feladat:** Egy 230 V-os, egyfázisú áramkör egy 4,6 kW-os, ohmos fogyasztót (cos φ = 1) táplál. A rézvezeték egyirányú hossza 25 m. A feladat adatai:
- terhelhetőség az adott szerelési módban (kivonat): 2,5 mm² – 24 A; 4 mm² – 32 A; 6 mm² – 41 A,
- helyesbítő tényező a környezeti hőmérséklet miatt: f_θ = 0,87 (csoportosítás nincs),
- ρ = 0,0225 Ω·mm²/m, megengedett feszültségesés: 3 %.

**1. lépés – terhelő áram:**
I_b = P / U = 4600 W / 230 V = 20 A.

**2. lépés – védelem:**
A legkisebb szokásos névleges áram, amely nem kisebb 20 A-nél: I_n = 20 A. Választás: B20 kismegszakító.

**3. lépés – terhelhetőség:**
- 2,5 mm²: I_z = 24 A · 0,87 = 20,88 A.
- Ellenőrzés: 20 A ≤ 20 A ≤ 20,88 A. Terhelhetőségre a **2,5 mm² megfelel**.
:::

## Kidolgozott feladat: 4–5. lépés

:::example
**4. lépés – feszültségesés a 2,5 mm²-es vezetéken:**
1. ΔU = 2 · 0,0225 · 25 / 2,5 · 20 · 1 = 9 V.
2. ΔU% = 9 / 230 · 100 ≈ 3,91 %. Ez **több** a megengedett 3 %-nál, a 2,5 mm² nem felel meg.

**Szükséges keresztmetszet feszültségesésre:**
1. ΔUₘₐₓ = 3 · 230 / 100 = 6,9 V.
2. Sₘᵢₙ = 2 · 0,0225 · 25 · 20 · 1 / 6,9 ≈ 3,26 mm², a következő szabványos méret 4 mm².
3. Ellenőrzés: ΔU = 2 · 0,0225 · 25 / 4 · 20 = 5,625 V, ΔU% ≈ 2,45 %. Megfelel.

**5. lépés – végső választás:**
1. Terhelhetőségre elég lenne a 2,5 mm², feszültségesésre 4 mm² kell. A nagyobb a döntő: **4 mm²**.
2. Ellenőrzés a választott vezetékkel: I_z = 32 A · 0,87 = 27,84 A; 20 A ≤ 20 A ≤ 27,84 A. Megfelel.
3. **Eredmény:** 4 mm²-es rézvezeték, B20 kismegszakító.
:::

Ebben a feladatban a **feszültségesés** döntött, mert a vezeték viszonylag hosszú. Rövid vezetéknél általában a terhelhetőség a döntő.

## Gyakori buktatók

- **A helyesbítés kimarad.** A táblázati 24 A helyett a helyesbített 20,88 A-rel kell összevetni.
- **A keresztmetszet nő, a védelem marad.** Ha nagyobb keresztmetszetet választasz, a védelem névleges árama maradhat ugyanaz (itt 20 A): a nagyobb vezeték csak a tartalékot növeli.
- **A feszültségesés-ellenőrzés kimarad.** A terhelhetőségre megfelelő vezeték is lehet túl hosszú.
- **Rossz névleges feszültség.** Egyfázisú körnél 230 V-hoz, háromfázisúnál 400 V-hoz viszonyítasz.

:::safety
A végső választást mindig ellenőrizd a választott keresztmetszettel és védelemmel újra mindkét feltételre. Egy kimaradt ellenőrzés túlterhelt, túlmelegedő vezetéket vagy a fogyasztónál túl alacsony feszültséget eredményez.
:::

:::mistake
Gyakori hiba, hogy a vizsgázó a terhelhetőségre kapott keresztmetszetnél megáll, és a feszültségesést már nem ellenőrzi. A feladat csak akkor teljes, ha mindkét feltételt ellenőrizted, és a nagyobb keresztmetszetet választottad.
:::

:::exam
A központi interaktív vizsga III. (számítási) részében pontosan ez a feladat: a csatlakozó vezeték keresztmetszetének kiválasztása terhelhetőségre és feszültségesésre, a megadott táblázati kivonattal.
:::

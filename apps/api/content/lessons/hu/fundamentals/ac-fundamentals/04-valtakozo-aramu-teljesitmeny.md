---
title: Hatásos, meddő és látszólagos teljesítmény
summary: A hatásos, a meddő és a látszólagos teljesítmény, a teljesítményháromszög, a cos φ szerepe az áramfelvételben, és a fázisjavítás elve.
verify:
  - "P = U·I·cos φ, Q = U·I·sin φ, S = U·I, S² = P² + Q²; mértékegységek W, var, VA – Wikipedia: AC power"
  - "Példák (S = 1058 VA, P = 846,4 W, Q = 634,8 var; 1,5 kW, cos φ 0,8 → 8,15 A) – számított értékek"
---

:::goals
- Meg tudod különböztetni a hatásos, a meddő és a látszólagos teljesítményt, és ismered a mértékegységüket.
- Ki tudod számítani mindhármat egyfázisú körben.
- Ki tudod számítani egy egyfázisú fogyasztó áramfelvételét a teljesítményéből és a cos φ-ből.
- Megérted, miért káros a kis teljesítménytényező, és mit csinál a fázisjavító kondenzátor.
:::

## Háromféle teljesítmény

Egyenáramon a teljesítmény egyszerűen `P = U · I`. Váltakozó áramon, ha a fogyasztó induktív vagy kapacitív, az áram és a feszültség között φ fáziseltolás van, és a szorzatukból csak egy rész végez hasznos munkát.

- **Hatásos teljesítmény (P)** – mértékegysége **watt (W)**. Ez alakul át hővé, fénnyé, mechanikai munkává. Ezt méri a fogyasztásmérő.

`P = U · I · cos φ`

- **Meddő teljesítmény (Q)** – mértékegysége **voltamper reaktív (var)**. A tekercsek mágneses terének és a kondenzátorok villamos terének felépítéséhez kell. Ez az energia félperiódusonként ide-oda áramlik a hálózat és a fogyasztó között, munkát nem végez.

`Q = U · I · sin φ`

- **Látszólagos teljesítmény (S)** – mértékegysége **voltamper (VA)**. Az áram és a feszültség effektív értékének szorzata. Ez határozza meg a vezetékek, transzformátorok és generátorok terhelését, ezért a transzformátorok névleges teljesítményét VA-ben vagy kVA-ben adják meg.

`S = U · I`

## A teljesítményháromszög

A három teljesítmény derékszögű háromszöget alkot, ugyanúgy, mint az impedanciaháromszög:

`S² = P² + Q²`, tehát `S = √(P² + Q²)`

`cos φ = P / S`

[Ábra: teljesítményháromszög. Vízszintes befogó P (W), függőleges befogó Q (var), átfogó S (VA); a P és S közötti szög φ.]

:::example
Az előző lecke soros RL-köre: U = 230 V, I = 4,6 A, cos φ = 0,8 (sin φ = 0,6).

1. S = U · I = 230 V · 4,6 A = 1058 VA.
2. P = S · cos φ = 1058 · 0,8 = 846,4 W.
3. Q = S · sin φ = 1058 · 0,6 = 634,8 var.
4. Ellenőrzés: P = I² · R = 4,6² · 40 = 846,4 W. A hő csak az ellenálláson keletkezik.
:::

## Áramfelvétel a teljesítményből

A gépek adattábláján a hatásos teljesítmény és a cos φ szerepel. Az áramfelvétel egyfázisú fogyasztónál:

`I = P / (U · cos φ)`

Motornál az adattáblán a **leadott mechanikai** teljesítmény szerepel. A felvett villamos teljesítmény ennél a hatásfok miatt nagyobb: `P_fel = P_le / η`.

:::example
Egy egyfázisú berendezés felvett hatásos teljesítménye 1,5 kW, cos φ = 0,8, U = 230 V. Mekkora az áramfelvétele?

1. I = P / (U · cos φ) = 1500 W / (230 V · 0,8) = 1500 / 184 ≈ 8,15 A.
2. Ha cos φ = 1 lenne, az áram csak 1500 / 230 ≈ 6,52 A lenne.
:::

Ugyanakkora hasznos teljesítményhez kisebb cos φ mellett **nagyobb áram** kell. A nagyobb áram nagyobb vezetékveszteséget (`P_v = I² · R`) és nagyobb feszültségesést okoz, és a vezetéket, a védelmet is nagyobbra kell méretezni.

## Fázisjavítás

Az induktív fogyasztók (motorok, transzformátorok, fojtós előtétek) meddő teljesítményét a hálózatnak kell szállítania. Ha a fogyasztóval párhuzamosan **kondenzátort** kapcsolunk, a kondenzátor kapacitív meddő teljesítménye kompenzálja a tekercs induktív meddő teljesítményét. A meddő energia ezután a kondenzátor és a tekercs között áramlik, nem a hálózaton.

A fázisjavítás eredménye:

- nő a cos φ (közelít az 1-hez),
- csökken a hálózatból felvett áram,
- a hatásos teljesítmény **nem változik**.

Ezért van a fojtós fénycsőelőtétekben és sok motorban párhuzamos kondenzátor, és ezért szerelnek nagyobb üzemekben központi fázisjavító berendezést.

:::mistake
Gyakori hiba, hogy a VA-ben megadott látszólagos teljesítményt wattként kezelik. Egy 1000 VA-es szünetmentes tápegység cos φ = 0,8 mellett csak 800 W hatásos teljesítményt ad le. Mindig nézd meg, melyik teljesítmény szerepel az adattáblán.
:::

:::exam
A vizsga III. részében számítási feladat: P, Q és S kiszámítása, valamint egyfázisú fogyasztó áramfelvétele a teljesítményből és a cos φ-ből.
:::

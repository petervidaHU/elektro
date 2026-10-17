---
title: Szimmetrikus és aszimmetrikus terhelés
summary: Mikor folyik áram a nullavezetőben, mi történik nullavezető-szakadáskor, és hogyan hoz létre a háromfázisú rendszer forgó mágneses mezőt.
verify:
  - "Ohmos terhelésnél I_N = √(I₁² + I₂² + I₃² − I₁I₂ − I₂I₃ − I₃I₁) – a 120°-os fázisvektorok összegéből levezetett összefüggés; Wikipedia: Three-phase electric power (neutral current)"
  - "Nullavezető-szakadásnál a csillagpont eltolódik, a fázisfeszültségek a terhelések arányában oszlanak meg (akár 400 V-ig) – Wikipedia: Three-phase electric power"
  - "Példák (10/5/0 A → 8,66 A; 46 Ω és 230 Ω sorosan 400 V-on → 1,449 A, 66,7 V, 333,3 V) – számított értékek"
  - "Forgó mágneses mező három, 120°-kal eltolt tekercsből – Wikipedia: Rotating magnetic field"
---

:::goals
- Megérted, mikor szimmetrikus és mikor aszimmetrikus egy háromfázisú terhelés.
- Ki tudod számítani a nullavezető áramát ohmos terhelésnél.
- Megérted, miért veszélyes a nullavezető szakadása, és ki tudod számítani a kialakuló feszültségeket.
- Ismered a forgó mágneses mező keletkezésének elvét.
:::

## Szimmetrikus terhelés

A terhelés **szimmetrikus**, ha mindhárom fázisban azonos nagyságú és azonos fázisszögű áram folyik. Ilyen a háromfázisú motor és a háromfázisú fűtőkészülék.

Szimmetrikus terhelésnél a három fázisáram pillanatértékeinek összege minden pillanatban nulla, ezért **a nullavezetőben nem folyik áram**. A háromfázisú motorhoz ezért nem kell nullavezető.

## Aszimmetrikus terhelés és a nullavezető árama

A lakóépületekben az egyfázisú fogyasztók (világítás, aljzatok, háztartási gépek) a három fázis között oszlanak meg, és sosem terhelik őket egyformán. Ez **aszimmetrikus terhelés**. Ilyenkor a három áram összege nem nulla, és a különbség a **nullavezetőn** folyik vissza a transzformátor csillagpontjába.

Tisztán ohmos terhelésnél a nullavezető árama:

`I_N = √(I₁² + I₂² + I₃² − I₁ · I₂ − I₂ · I₃ − I₃ · I₁)`

:::example
Egy lakás fázisáramai: I₁ = 10 A, I₂ = 5 A, I₃ = 0 A (ohmos fogyasztók).

1. I₁² + I₂² + I₃² = 100 + 25 + 0 = 125.
2. I₁ · I₂ + I₂ · I₃ + I₃ · I₁ = 50 + 0 + 0 = 50.
3. I_N = √(125 − 50) = √75 ≈ 8,66 A.
:::

A nullavezető árama itt kisebb, mint a legnagyobb fázisáram, mert a fázisáramok részben kioltják egymást. Ha csak egy fázis terhelt, az egész fázisáram a nullavezetőn folyik vissza. A nullavezető feladata, hogy a csillagpont potenciálját rögzítse, és így minden egyfázisú fogyasztó a terheléstől függetlenül 230 V-ot kapjon.

## Nullavezető-szakadás

Ha a közös nullavezető megszakad (például egy laza kötés a fogyasztásmérő előtt vagy a lépcsőházi elosztóban), az egyfázisú fogyasztók nem a nullavezetőhöz, hanem egymáshoz képest kapcsolódnak, és **sorosan** kerülnek két fázis közé, azaz 400 V-ra. A feszültség a fogyasztók ellenállásának arányában oszlik meg: a **kis teljesítményű** (nagy ellenállású) fogyasztó kapja a **nagyobb** feszültséget.

:::example
Nullavezető-szakadás után az L1 fázison egy 1150 W-os vízforraló (46 Ω), az L2 fázison egy 230 W-os televízió (230 Ω) maradt bekapcsolva. A két fázis között 400 V van.

1. Eredő ellenállás: R = 46 Ω + 230 Ω = 276 Ω.
2. Áram: I = 400 V / 276 Ω ≈ 1,449 A.
3. A vízforraló feszültsége: U₁ = 1,449 A · 46 Ω ≈ 66,7 V.
4. A televízió feszültsége: U₂ = 1,449 A · 230 Ω ≈ 333,3 V.
:::

A televízió 230 V helyett 333 V-ot kap, és tönkremegy, a vízforraló pedig alig melegszik. Ezért okoz a nullavezető-szakadás egyszerre több lakásban tömeges készülékkárt, és ezért kell a nullavezető minden kötését ugyanolyan gondosan meghúzni és ellenőrizni, mint a fázisvezetőét.

[Ábra: két fázis között sorba kapcsolt két fogyasztó, megszakadt nullavezető, a két fogyasztón jelölve a 66,7 V és a 333,3 V.]

:::safety
Nullavezető-szakadásnál a megszakadt ponton túli nullavezető a fogyasztókon keresztül fázisfeszültséget kap: érintése ugyanolyan veszélyes, mint a fázisvezetőé. Ha egy lakásban a lámpák fényereje a fogyasztók be- és kikapcsolásával erősen ingadozik, vagy egyes készülékek túl erősen, mások gyengén működnek, kapcsold le a főkapcsolót, és mérd meg a fázis–nulla feszültségeket minden fázison. A nullavezető kötéseit csak feszültségmentes állapotban szabad megbontani.
:::

## A forgó mágneses mező

Ha a háromfázisú motor állórészében három tekercset helyezünk el egymáshoz képest **120°-kal** elforgatva, és mindegyiket egy-egy fázisról tápláljuk, a három tekercs mágneses terének eredője **állandó nagyságú, egyenletesen forgó** mágneses mező. Ez a mező forgatja a motor forgórészét. A háromfázisú aszinkron motor ezért külön indítóeszköz nélkül, önmagától elindul.

- 50 Hz-en egy póluspárú motor mezője percenként 50 · 60 = 3000 fordulatot tesz.
- A forgás iránya a **fázissorrendtől** függ: két fázis felcserélésével a motor forgásiránya megfordul.

Ha a három fázis közül egy kiesik (például egy biztosító kiold), a motor nem indul el, járó motor pedig túlterhelődik. Ezért kell a motort motorvédő kapcsolóval védeni.

:::mistake
Gyakori tévhit, hogy a nullavezetőben sosem folyik áram, „mert nulla”. Aszimmetrikus terhelésnél a nullavezetőben akár a teljes fázisáram is folyhat, ezért a keresztmetszetét és a kötéseit ugyanúgy méretezni kell, mint a fázisvezetőét.
:::

:::exam
A vizsgán kérdés lehet: mi történik nullavezető-szakadáskor, miért kell a nullavezető kötéseire különösen ügyelni, és mitől függ a háromfázisú motor forgásiránya.
:::

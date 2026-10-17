---
title: A hurokimpedancia kiértékelése
summary: Hogyan értékeljük a mért hurokimpedanciát a védőkészülék kioldóáramához és a lekapcsolási időhöz viszonyítva.
verify:
  - "A kiértékelés feltétele: Z_s · I_a ≤ U₀, ahol I_a a védőkészülék előírt időn belüli kioldását biztosító áram – MSZ HD 60364-4-41 szerkezete szerint; szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a megengedett lekapcsolási idők és a védőkészülékek I_a értékei jelleg és névleges áram szerint – MSZ HD 60364-4-41 és MSZ EN 60898-1; hitelesített táblázatból"
---

:::goals
- Meg tudod magyarázni a Z_s · I_a ≤ U₀ feltétel jelentését.
- Ki tudod számolni az egy védőkészülékhez megengedett legnagyobb hurokimpedanciát.
- Értékelni tudsz egy mért értéket.
:::

## A feltétel

A mért hurokimpedanciát azzal vetjük össze, hogy a védőkészülék **kellően gyorsan** old-e ki hiba esetén. A feltétel:

`Z_s · I_a ≤ U₀`

- Z_s: a mért hurokimpedancia, Ω,
- I_a: az az áram, amelynél a védőkészülék az **előírt időn belül kioldja** az áramkört, A,
- U₀: a fázis és a föld közti feszültség, V.

A feltétel átrendezve: `Z_s ≤ U₀ / I_a`. Ez a **legnagyobb megengedett hurokimpedancia** az adott védőkészülékhez.

## Mi az I_a?

Az I_a a védőkészülék **kioldási áramértéke** az előírt lekapcsolási időre. Kismegszakítónál az elektromágneses (azonnali) kioldó áramtartományából következik, a készülék jellegétől (B, C, D) és névleges áramától függ. Értékét **táblázatból vagy a gyártó adatlapjáról** kell kiolvasni, és a feladat is megadja. A megengedett lekapcsolási időt a szabvány rögzíti.

## A kiértékelés lépései

1. Olvasd ki a védőkészülék **I_a** értékét (a feladatból vagy a táblázatból).
2. Számold ki a **megengedett legnagyobb hurokimpedanciát**: `Z_s,max = U₀ / I_a`.
3. Hasonlítsd össze a **mért értékkel**: `Z_s,mért ≤ Z_s,max` esetén megfelel.
4. Ha **nem felel meg**, javítani kell (nagyobb keresztmetszet, jobb kötés, más védőkészülék), és újra mérni.

:::example
Egy áramkör védőkészülékének a feladat szerint az előírt időn belüli kioldásához I_a = 160 A kell, U₀ = 230 V (a példában a feladat adja az I_a értéket).

1. Z_s,max = 230 / 160 = 1,4375 Ω
2. A mért hurokimpedancia 1,2 Ω: 1,2 ≤ 1,4375, tehát **megfelel**.
3. Ha 1,6 Ω-t mértek volna: 1,6 > 1,4375, tehát **nem felel meg**.

::calculator{id="short-circuit-current" voltage=230 impedance=1.2 trip=160}
:::

## Mi a teendő, ha nem felel meg?

- Ellenőrizd a **kötéseket** (a laza kötés növeli az impedanciát).
- Növeld a vezeték vagy a **védővezető keresztmetszetét**.
- Válassz **kisebb kioldóáramú** (érzékenyebb) védőkészüléket vagy **ÁVK-t** is alkalmazz.
- Újabb mérés a javítás után.

:::safety
Ha a hurokimpedancia nem felel meg, a berendezés **nem adható át**: hiba esetén a védőkészülék nem old ki időben, és a burkolatok veszélyes feszültségen maradhatnak. Soha ne cseréld nagyobb védőkészülékre a megfelelés érdekében: az csak növeli az I_a értékét, a hurok pedig nem lesz jobb.
:::

:::mistake
„A mért érték kisebb, mint a névleges áram osztva a feszültséggel, ezért jó.” A feltétel a kioldás áramára vonatkozik (I_a), nem a névleges áramra. A névleges áram helyett a készülék I_a értékét kell használni.
:::

:::exam
A III. részben vagy a IV. részben a mért Z_s értékelése számítási feladat: I_a adott, U₀ adott, ki kell számolni a legnagyobb megengedett Z_s-t és dönteni kell.
:::

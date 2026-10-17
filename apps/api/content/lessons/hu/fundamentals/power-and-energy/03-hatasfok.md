---
title: Hatásfok
summary: A hasznos és a felvett teljesítmény kapcsolata, a veszteség, a hatásfok kiszámítása, és több egymás utáni átalakító eredő hatásfoka.
---

:::goals
- Meg tudod határozni a hatásfok fogalmát, és ki tudod számítani.
- Ki tudod számítani a veszteségi teljesítményt.
- Ki tudod számítani több egymás után kapcsolt berendezés eredő hatásfokát.
- Megérted, hová lesz a veszteség, és miért melegszenek a gépek.
:::

## Hasznos és felvett teljesítmény

Egyetlen berendezés sem alakítja át a teljes felvett energiát hasznos formává: egy része **veszteségként**, többnyire hőként távozik.

- **Felvett teljesítmény** (P₁ vagy P_f): amit a berendezés a hálózatból felvesz. Ezt méri a fogyasztásmérő.
- **Hasznos (leadott) teljesítmény** (P₂ vagy P_h): amit a berendezés a kívánt formában lead. Egy motornál a tengelyen leadott mechanikai teljesítmény.
- **Veszteségi teljesítmény** (P_v): a kettő különbsége.

`P_v = P₁ − P₂`

**Figyelj:** a motorok adattábláján a névleges teljesítmény a **leadott mechanikai** teljesítmény (P₂), nem a felvett villamos teljesítmény.

## A hatásfok

A **hatásfok** megmutatja, hogy a felvett teljesítmény hányad része hasznosul. Jele **η** (éta):

`η = P₂ / P₁`

A hatásfok mértékegység nélküli szám, mindig **kisebb 1-nél**. Százalékban is megadhatjuk: `η% = η · 100 %`.

Ugyanez energiával is felírható: `η = W₂ / W₁`, ha a két energia ugyanarra az időtartamra vonatkozik.

:::example
Egy motor 2,5 kW villamos teljesítményt vesz fel, és 2,2 kW mechanikai teljesítményt ad le a tengelyén. Mekkora a hatásfoka és a vesztesége?

1. η = P₂ / P₁ = 2,2 kW / 2,5 kW = 0,88, azaz 88 %.
2. P_v = P₁ − P₂ = 2,5 kW − 2,2 kW = 0,3 kW = 300 W.
3. Ez a 300 W hővé alakul, és melegíti a motort.
:::

:::example
Egy 4 kW névleges (leadott) teljesítményű motor hatásfoka 85 %. Mekkora teljesítményt vesz fel a hálózatból?

1. P₁ = P₂ / η = 4 kW / 0,85 ≈ 4,71 kW.
2. A veszteség: 4,71 kW − 4 kW = 0,71 kW.
:::

## Hová lesz a veszteség?

- **Vezetékek és tekercsek:** az áram a tekercsek ellenállásán `I² · R` hőveszteséget okoz (**rézveszteség**).
- **Vasmag:** a motorok és transzformátorok vasmagjában a változó mágneses tér miatt hő keletkezik (**vasveszteség**).
- **Súrlódás és légellenállás:** a forgó gépek csapágyaiban és hűtőventilátorában (**mechanikai veszteség**).
- **Elektronika:** a tápegységek és a LED-meghajtók félvezetőiben.

A veszteség mindig hővé alakul. Ezért melegszenek a motorok, a transzformátorok és a tápegységek, és ezért kell gondoskodni a hűtésükről. Az eltakart szellőzőnyílás túlmelegedést okoz.

A villamos fűtőkészülékek különlegesek: náluk a hő a hasznos energia, ezért a hatásfokuk gyakorlatilag 100 %.

## Egymás után kapcsolt berendezések

Ha az energia több átalakítón halad át egymás után (például transzformátor → motor → hajtómű), az **eredő hatásfok az egyes hatásfokok szorzata**:

`η_e = η₁ · η₂ · η₃ · …`

:::example
Egy motor hatásfoka 90 %, a hozzá kapcsolt hajtóműé 95 %. Mekkora az eredő hatásfok, és mennyi teljesítményt kell felvenni 3 kW hasznos teljesítményhez?

1. η_e = 0,90 · 0,95 = 0,855, azaz 85,5 %.
2. P₁ = 3 kW / 0,855 ≈ 3,51 kW.
:::

Az eredő hatásfok mindig kisebb a legrosszabb egyedi hatásfoknál.

:::mistake
A hatásfok nem lehet nagyobb 100 %-nál. Ha a számításodban 1-nél nagyobb érték jön ki, felcserélted a hasznos és a felvett teljesítményt: a hasznos mindig a számlálóban van.
:::

:::exam
A vizsga III. részében a fogyasztók jellemzőinek meghatározásánál a hatásfokkal számolsz: a motor felvett teljesítményét a leadott teljesítményből és a hatásfokból.
:::

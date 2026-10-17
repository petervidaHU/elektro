---
title: Keresztmetszet választása feszültségesésre
summary: Hogyan számolod ki a megengedett feszültségesésből a szükséges legkisebb keresztmetszetet, és hogyan választasz belőle szabványos méretet.
verify:
  - "A szabványos keresztmetszet-sor (1,5; 2,5; 4; 6; 10; 16; 25; 35 mm²) az alkalmazás referenciaadata, a tankönyvi sorral össze kell vetni – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a megengedett feszültségesés szabványos értéke (fogyasztói leágazás, főelosztó-vezeték, világítás/egyéb) – a példában a feladat adja meg"
---

:::goals
- Ki tudod számítani a megengedett feszültségesést voltban.
- Ki tudod számolni a legkisebb keresztmetszetet, és szabványos méretre kerekíted felfelé.
- Ellenőrizni tudod, hogy a kiválasztott keresztmetszettel a feszültségesés valóban megfelel.
:::

## A feladat: ismert a megengedett érték

Az előző leckében kiszámoltad, mekkora a feszültségesés egy adott vezetéken. A tervezésnél fordítva kérdezünk: **mekkora keresztmetszet kell**, hogy a :term[feszültségesés]{id=voltage-drop} egy megadott határon belül maradjon? A határt a feladat vagy a tervezési előírás adja meg százalékban.

## 1. lépés: a megengedett feszültségesés voltban

A százalékos határt először át kell váltani voltra a névleges feszültség alapján:

::formula{id="permitted-voltage-drop"}

## 2. lépés: a legkisebb keresztmetszet

A feszültségesés képletét átrendezzük a keresztmetszetre:

::formula{id="minimum-cross-section"}

- b: 2 egyfázisú, √3 háromfázisú áramkörben,
- ρ: a fajlagos ellenállás (ebben a tananyagban az üzemi hőmérsékletre vonatkozó érték: réz 0,0225 Ω·mm²/m),
- L: a vezeték egyirányú hossza, m,
- I: a terhelő áram, A,
- cos φ: a teljesítménytényező,
- ΔUₘₐₓ: a megengedett feszültségesés voltban.

Az eredmény a **matematikai minimum**, amely pontosan a határra esik. Ennél kisebb keresztmetszet nem felel meg.

## 3. lépés: kerekítés a szabványos sorra

Keresztmetszetet csak a szabványos sorból választhatsz: 1,5; 2,5; 4; 6; 10; 16; 25; 35 mm². A kiszámolt minimumot **mindig felfelé** kerekítjük a következő szabványos értékre, mert a lefelé kerekítés megsértené a határt.

## 4. lépés: ellenőrzés a választott keresztmetszettel

A választott keresztmetszettel újra kiszámoljuk a feszültségesést:

::formula{id="voltage-drop-direct"}

Ennek kisebbnek kell lennie, mint a megengedett érték. Ez az ellenőrzés kiszűri a számítási hibát is.

## Kidolgozott példa

:::example
Egy egyfázisú, 230 V-os áramkör 40 m hosszú rézvezetéken 16 A-es ohmos terhelést (cos φ = 1) táplál. A feladat a megengedett feszültségesést 3 %-ban adja meg. Fajlagos ellenállás: 0,0225 Ω·mm²/m.

1. ΔUₘₐₓ = 3 · 230 / 100 = 6,9 V
2. Sₘᵢₙ = 2 · 0,0225 · 40 · 16 · 1 / 6,9 = 28,8 / 6,9 ≈ 4,17 mm²
3. Felfelé kerekítve a szabványos sorban: **6 mm²**
4. Ellenőrzés: ΔU = 2 · 0,0225 · 40 / 6 · 16 · 1 = 4,8 V, vagyis 4,8 / 230 · 100 ≈ 2,09 %, ami kisebb, mint 3 %.

::calculator{id="voltage-drop" system=single-phase material=copper current=16 length=40 crossSection=6}
:::

:::mistake
A 4,17 mm²-t nem „kerekítjük 4-re”. A 4 mm² kisebb a szükséges minimumnál, a feszültségesés meghaladná a megengedett értéket. Mindig a következő nagyobb szabványos keresztmetszetet válaszd.
:::

:::safety
A feszültségesés szerint kiválasztott keresztmetszet még nem biztos, hogy megfelel a **terhelhetőség** és a **túláramvédelem** szempontjából. Mindhárom feltételnek teljesülnie kell, és a három közül a legnagyobb keresztmetszetet adó dönt.
:::

:::exam
A központi interaktív vizsga III. részében a megengedett feszültségesést a feladat adja meg. A lépések: százalék átváltása voltra, Sₘᵢₙ kiszámítása, felfelé kerekítés a szabványos sorra, ellenőrzés.
:::

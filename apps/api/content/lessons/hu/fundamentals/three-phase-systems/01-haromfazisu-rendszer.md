---
title: A háromfázisú feszültségrendszer
summary: Hogyan keletkezik a három, egymáshoz képest 120°-kal eltolt fázisfeszültség, mi a fázis- és a vonali feszültség, és miért 230/400 V a hálózatunk.
verify:
  - "Három fázis 120°-os eltolással; U_v = √3 · U_f; 230/400 V rendszer – Wikipedia: Three-phase electric power"
  - "Vezetékjelölés L1, L2, L3, N, PE; színek barna, fekete, szürke, kék, zöld-sárga – Wikipedia: Electrical wiring (IEC 60446 / HD 308 S2 színkód)"
  - "√3 · 230 V = 398,4 V – számított érték"
---

:::goals
- Megérted, hogyan állítja elő a generátor a háromfázisú feszültséget.
- Ismered a fázisfeszültség és a vonali feszültség fogalmát és kapcsolatát.
- Ki tudod számítani a vonali feszültséget a fázisfeszültségből és fordítva.
- Ismered a háromfázisú hálózat vezetőinek jelölését és színét.
:::

## Hogyan keletkezik a háromfázisú feszültség?

A háromfázisú generátor állórészében **három tekercs** van, egymáshoz képest **120°-kal** elforgatva. A forgórész mágneses tere mindhárom tekercsben szinuszos feszültséget indukál. A három feszültség frekvenciája és nagysága azonos, de időben egymáshoz képest **120°-kal (egyharmad periódussal) eltolva** érik el a csúcsukat.

50 Hz-en egy periódus 20 ms, így két szomszédos fázis csúcsa között 20 ms / 3 ≈ 6,67 ms telik el.

A három fázis jele: **L1, L2, L3**. A sorrendjük a **fázissorrend** (forgásirány). Ha két fázist felcserélsz, a háromfázisú motor ellenkező irányba forog.

[Ábra: három szinuszgörbe egy közös időtengelyen, L1, L2, L3 jelöléssel, egymáshoz képest 120°-kal eltolva. Mellette a három feszültség vektorábrája: három egyforma hosszú nyíl, egymással 120°-os szöget bezárva.]

A három fázisfeszültség pillanatértékeinek összege **minden pillanatban nulla**. Ezért tudja a háromfázisú rendszer a három tekercs energiáját közös visszavezető nélkül, illetve szimmetrikus terhelésnél áramtalan nullavezetővel szállítani.

## Fázisfeszültség és vonali feszültség

- **Fázisfeszültség (U_f):** egy fázisvezető és a nullavezető (N) közötti feszültség.
- **Vonali feszültség (U_v):** két fázisvezető közötti feszültség.

A vonali feszültség a két fázisfeszültség **vektoros különbsége**. Mivel a fázisok 120°-kal el vannak tolva, a vonali feszültség nem a kétszerese, hanem a √3-szorosa a fázisfeszültségnek:

`U_v = √3 · U_f`, illetve `U_f = U_v / √3`

(√3 ≈ 1,732.)

:::example
A magyar kisfeszültségű hálózat fázisfeszültsége 230 V. Mekkora a vonali feszültség?

1. U_v = √3 · U_f = 1,732 · 230 V ≈ 398,4 V.
2. Ezt a gyakorlatban **400 V**-ra kerekítve adjuk meg: a hálózat **230/400 V**-os.
:::

:::example
Egy ipari hálózat vonali feszültsége 690 V. Mekkora a fázisfeszültsége?

1. U_f = U_v / √3 = 690 V / 1,732 ≈ 398 V, kerekítve **400 V**.
:::

## Három- és négyvezetékes rendszer

- **Négyvezetékes rendszer (L1, L2, L3, N):** két feszültséget ad, a 230 V-os fázisfeszültséget az egyfázisú fogyasztóknak (lámpák, dugaszolóaljzatok), és a 400 V-os vonali feszültséget a háromfázisú fogyasztóknak (motorok, tűzhelyek, hőszivattyúk). A lakóépületek ellátása ilyen.
- **Háromvezetékes rendszer (L1, L2, L3):** csak a vonali feszültséget adja. Tisztán háromfázisú, szimmetrikus fogyasztókhoz (például motorokhoz) elég.

Mindkét rendszerhez ezenfelül védővezető (PE) tartozik.

## A vezetők jelölése és színe

A vezetők szigetelésének színét szabvány rögzíti:
- L1: **barna**,
- L2: **fekete**,
- L3: **szürke**,
- N (nullavezető): **kék**,
- PE (védővezető): **zöld-sárga**.

A zöld-sárga színt **kizárólag** védővezetőre szabad használni, és a védővezetőt csak zöld-sárga színnel szabad jelölni.

:::safety
A háromfázisú rendszer két fázisa között **400 V** van. Ha egy fogyasztót tévedésből két fázis közé kötsz egy nullavezető helyett, 230 V helyett 400 V-ot kap, és tönkremegy. Bekötés előtt mérd meg a feszültséget, és ne hagyatkozz csak a vezeték színére: régi szerelésekben a színkódolás eltérhet.
:::

:::mistake
Gyakori hiba, hogy a vonali feszültséget a fázisfeszültség kétszeresének veszik (2 · 230 V = 460 V). A helyes szorzó √3, mert a fázisok között 120°, nem 180° a szög.
:::

:::exam
A vizsga III. részében a háromfázisú számítások alapja a fázis- és a vonali feszültség közötti `√3`-szoros kapcsolat.
:::

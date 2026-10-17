---
title: A szigetelési ellenállás mérése
summary: A szigetelési ellenállás mérésének célja, előkészítése, menete, és az eredmény értelmezése.
verify:
  - "A szigetelési ellenállás mérése szigetelésmérővel, egyenfeszültséggel, a vezetők között és a vezetők és a föld között; a mérés alatt a berendezés feszültségmentes, a fogyasztók leválasztva – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a mérőfeszültségek a névleges feszültség szerint és a minimálisan megengedett szigetelési ellenállások – MSZ HD 60364-6, 61.3. táblázat"
---

:::goals
- Meg tudod magyarázni, mit jelent a szigetelési ellenállás.
- Le tudod írni a mérés előkészítését és menetét.
- Tudod, mire kell vigyázni a mérés során.
:::

## Mi a szigetelési ellenállás?

A :term[szigetelési ellenállás]{id=insulation-resistance} a vezetők szigetelésének ellenállása: az aktív vezetők egymás közötti, illetve a vezetők és a föld közötti ellenállás. Egészséges szigetelésnél ez **nagyon nagy**, mert a szigetelés nem engedi át az áramot. Ha a szigetelés sérül, nedvesedik vagy öregszik, az ellenállása **csökken**, és szivárgóáram, majd zárlat léphet fel.

## Miért mérjük?

A szigetelés állapota szabad szemmel nem látható. A mérés megmutatja, hogy a berendezést **feszültség alá lehet-e helyezni** anélkül, hogy zárlat vagy testzárlat keletkezne. Ezért a feszültség alá helyezés előtt végezzük.

## Az előkészítés

1. **Feszültségmentesítsd** a mérendő áramkört (öt lépés), és ellenőrizd a feszültségmentességet.
2. **Válaszd le a fogyasztókat**: a csatlakoztatott készülékeket húzd ki, a kapcsolókat kapcsold be (hogy a lámpák vezetékei is méréssel lefedettek legyenek).
3. **Védd az érzékeny elektronikát** (dimmerek, elektronikus készülékek, túlfeszültség-levezetők): ezeket a mérőfeszültség tönkreteheti, ezért le kell választani.
4. **Állítsd be a mérőfeszültséget** a mérendő áramkör névleges feszültségének megfelelően (az értéket a szabvány táblázata adja).

## A mérés menete

A szigetelésmérő **egyenfeszültséget** ad a mérendő pontok közé, és méri az ellenállást.

1. Mérd a **fázis- és nullavezető együtt** és a **védővezető (föld)** közötti szigetelést.
2. Mérd a **fázis- és nullavezető** közötti szigetelést (ha a nulla külön van).
3. Három fázisú áramkörnél mérd a **fázisok** közötti szigetelést is.
4. Olvasd le az értéket, amikor a kijelzés megáll, és jegyezd fel.

A mért értéknek a **minimális megengedett érték fölött** kell lennie. Ha kisebb, a szigetelés hibás; meg kell keresni a hibahelyet (fogyasztók leválasztása, szakaszolás), és ki kell javítani.

## Utómunkák

A mérés után a szigetelésmérő **kisüti** a vezetőket, mert a mérőfeszültség töltést hagyhat a vezetéken. A mérés végén a fogyasztókat vissza lehet csatlakoztatni.

:::safety
A szigetelésmérő **veszélyes feszültséget** (több száz volt egyenfeszültséget) ad a vezetőkre. Mérés közben ne érints semmit, ne engedd, hogy más hozzáérjen a mérendő vezetőkhöz, és mérés után várd meg a vezetők kisülését. A mérés előtt mindig **feszültségmentesítsd** a berendezést, és ellenőrizd a feszültségmentességet. Elektronikus készüléket ne mérj át, mert tönkremegy.
:::

:::mistake
„Szigetelési ellenállást mérek, miközben a fogyasztók csatlakoztatva vannak." A csatlakoztatott fogyasztók (hőfejlesztők, elektronika) miatt a mért érték félrevezető, és az elektronika károsodhat. A fogyasztókat le kell választani.
:::

:::exam
A vizsgán a szigetelési ellenállás mérésének előkészítése (feszültségmentesítés, a fogyasztók leválasztása) és a mérés menete a gyakori kérdés. Az értékeket táblázatból kell kiolvasni.
:::

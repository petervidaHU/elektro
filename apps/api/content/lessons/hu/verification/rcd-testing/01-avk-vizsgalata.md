---
title: Az ÁVK vizsgálata
summary: A próbagomb és a műszeres mérés különbsége, a kioldási idő és a kioldási áram mérése.
verify:
  - "A próbagomb csak a mechanikus kioldót ellenőrzi, a műszeres mérés a kioldási áramot és időt méri – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a vizsgálati áramok (az I_Δn többszörösei), a megengedett kioldási idők és a vizsgálat pontos menete – MSZ HD 60364-6 és MSZ EN 61557-6"
---

:::goals
- Meg tudod különböztetni a próbagombos és a műszeres vizsgálatot.
- Fel tudod sorolni, mit mérünk az ÁVK-n.
- Le tudod írni a mérés menetét és a kiértékelés elvét.
:::

## Miért kell vizsgálni?

Az ÁVK a személyvédelem egyik legfontosabb eszköze, de a hibája nem látszik. Az, hogy a próbagomb kioldja, még nem bizonyítja, hogy **megfelelő hibaáramnál, megfelelő idő alatt** old ki. Ezért a szerelői ellenőrzésben **műszeres vizsgálat** is szükséges.

## A próbagomb és a műszeres vizsgálat

- **Próbagomb:** a gomb megnyomása a készülékben **kis hibaáramot** hoz létre, és az ÁVK kioldását ellenőrzi. Gyors, bárki elvégezheti, rendszeresen ajánlott, de csak azt mutatja, hogy a kioldó szerkezet **működik**. Nem mér áramot és időt, és nem vizsgálja a bekötést.
- **Műszeres mérés:** az ÁVK-vizsgáló műszer **ismert hibaáramot** hoz létre a vizsgált áramkörben, és méri, **mekkora árammal és mennyi idő alatt** old ki az ÁVK. Ez a szerelői ellenőrzés kötelező része.

## Mit mérünk?

1. **Kioldási idő:** mennyi idő telik el a hibaáram megjelenése és a lekapcsolás között, adott vizsgálati áramnál.
2. **Kioldási áram:** mekkora áramnál old ki az ÁVK (a műszer növekvő árammal vizsgál).

Mindkét értéknek az **előírt határokon belül** kell lennie. Az értékeket a szabvány és a készülék típusa határozza meg.

## A mérés menete

1. Ellenőrizd, hogy a **védővezető folytonossága** és a **hurokimpedancia** rendben van.
2. Csatlakoztasd a vizsgáló műszert az **ÁVK utáni áramkörre** (például egy dugaszolóaljzatra).
3. Válaszd ki az ÁVK **névleges kioldó áramát** és típusát a műszeren.
4. Indítsd a vizsgálatot a megadott vizsgálati árammal (és szükség szerint a másik polaritással is).
5. Olvasd le a **kioldási időt** (és a kioldási áramot), és hasonlítsd az előírt értékhez.
6. Jegyezd fel a jegyzőkönyvbe.

A vizsgálat előtt az ÁVK mögötti fogyasztókat érdemes leválasztani, mert a szivárgóáramuk befolyásolhatja az eredményt.

:::safety
Az ÁVK vizsgálatakor a berendezés **feszültség alatt** van, és az ÁVK ki fog oldani: tudatnod kell a berendezés használóival, hogy áramszünet lesz. Az ÁVK-t a vizsgálat után kapcsold vissza, és a próbagombbal is ellenőrizd. Ha az ÁVK nem old ki, vagy túl lassan oldana, a berendezés nem adható át: javítani vagy cserélni kell az ÁVK-t.
:::

:::mistake
„A próbagomb kioldott, tehát az ÁVK megfelel." A próbagomb nem mér időt és áramot, és a bekötés hibáját sem fedi fel: például olyan ÁVK is kioldhat a próbagombra, amelynek utána a nulla rosszul van bekötve. A szerelői ellenőrzéshez műszeres mérés kell.
:::

:::exam
A IV. részben az ÁVK vizsgálatának célját, a próbagomb és a műszeres mérés különbségét kérdezik. A projektvizsgán az ÁVK-vizsgálat elvégzése és dokumentálása is az értékelés része.
:::

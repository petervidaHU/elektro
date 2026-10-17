---
title: Kismegszakítók
summary: A kismegszakító működése (termikus és elektromágneses kioldó), a B, C és D jelleg különbsége, és a megszakítóképesség.
verify:
  - "A kismegszakító termikus (bimetál) kioldója a túlterhelés, az elektromágneses kioldó a zárlat ellen véd – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "A B, C, D jelleg sorrendje: a mágneses kioldás a névleges áram többszöröse, B a legkisebb, D a legnagyobb – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a B, C, D jelleg mágneses kioldási tartományai a névleges áram többszörösében – MSZ EN 60898-1 (a K8 hivatkozási táblázatban kell rögzíteni)"
  - "HIÁNYZIK: a megszakítóképesség szokásos értékei (pl. 6 kA, 10 kA) és a feltétel, hogy a hálózat várható zárlati árama ne haladja meg – MSZ EN 60898-1"
---

:::goals
- Meg tudod magyarázni a kismegszakító két kioldójának a feladatát.
- Meg tudod különböztetni a B, C és D jelleget.
- Tudod, mit jelent a megszakítóképesség.
:::

## Mi a kismegszakító?

A :term[kismegszakító]{id=mcb} kézzel visszakapcsolható védőkészülék. Túlterhelés és zárlat esetén önműködően lekapcsolja az áramkört, és a hiba megszüntetése után egyszerűen visszakapcsolható: nem kell kicserélni, mint az olvadóbiztosítót. Ezért a lakásokban és épületekben ez a legelterjedtebb túláramvédelem.

## A két kioldó

A kismegszakítóban két, egymástól független kioldó dolgozik:

- **Termikus kioldó (túlterhelés ellen):** egy **bimetál** szalag, amelyen a terhelőáram átfolyik. Az áram melegíti, a két fém eltérő hőtágulása miatt elhajlik, és ha elég sokáig tart a túlterhelés, kioldja a szerkezetet. Minél nagyobb a túláram, annál hamarabb hajlik el, vagyis a kioldás **időfüggő**.
- **Elektromágneses kioldó (zárlat ellen):** egy **tekercs**, amelyen szintén átfolyik az áram. Zárlatnál a nagy áram erős mágneses mezőt hoz létre, amely azonnal, szinte késleltetés nélkül kioldja a szerkezetet.

## A kioldási jelleg: B, C, D

A kismegszakítók nem egyformán érzékenyek a zárlatra. A **jelleg** (betűjel) azt mutatja meg, hogy a **névleges áram hányszorosánál** old ki az elektromágneses kioldó:

- **B jelleg:** a legkisebb áramnál old ki. Hosszú vezetékekre, világítási és konnektoros áramkörökre való, ahol nincs jelentős áramlökés.
- **C jelleg:** nagyobb áramnál old ki. Olyan fogyasztókhoz való, amelyeknek mérsékelt bekapcsolási áramlökésük van (például motorok, nagyobb világítási kör).
- **D jelleg:** a legnagyobb áramnál old ki. Nagy bekapcsolási áramlökésű fogyasztókhoz (transzformátorok, nagy motorok).

A sorrend tehát B < C < D: minél nagyobb a betűjel, annál nagyobb áramnál old ki az elektromágneses kioldó. A jelleg kiválasztásakor két dolgot kell egyensúlyban tartani: ne oldjon ki az áramlökésen, de a vezeték végén fellépő legkisebb zárlati áramnál még kioldjon.

## Jellemző adatok

- **Névleges áram (I_n):** az az áram, amelyet a kismegszakító tartósan elvisel. A vezeték védelme ehhez kötődik.
- **Jelleg (B, C, D):** a fenti kioldási jelleg.
- **Névleges feszültség:** amelyre a kismegszakító szolgál.
- **Megszakítóképesség:** a legnagyobb zárlati áram, amelyet a kismegszakító még biztonságosan meg tud szakítani. Ha a telepítés helyén a várható zárlati áram ennél nagyobb, a kismegszakító nem képes megbízhatóan megszakítani, és megrongálódhat.

:::safety
A kismegszakító **nem személyvédelem**. A lekapcsolása az ember védelmét csak akkor biztosítja, ha a hibahurok impedanciája elég kicsi, és a hibaáram eléri a kioldási értéket. Munka előtt a kismegszakító kikapcsolása **nem feszültségmentesítés**: a feszültségmentesítés öt lépését el kell végezni.
:::

:::mistake
„Ha a kismegszakító sokszor leold, nagyobbra cserélem.” A leoldás jelzi, hogy túlterhelés vagy hiba van. Nagyobb kismegszakítóval a vezeték védelme megszűnik, és tűzveszélyes lesz.
:::

:::exam
A vizsga a két kioldó feladatát, a B, C és D jelleg különbségét és a megszakítóképesség jelentését kérdezi. A kioldási tartományok értékeit táblázatból kapod, nem fejből kell tudnod.
:::

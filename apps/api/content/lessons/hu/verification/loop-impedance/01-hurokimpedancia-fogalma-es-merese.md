---
title: A hurokimpedancia és mérése
summary: Mi a hibahurok, hogyan folyik a hibaáram, és hogyan mérjük a hurokimpedanciát.
verify:
  - "A hibahurok: tápforrás, fázisvezető, hibahely, védővezető (TN-rendszerben a PEN/PE), vissza a tápforráshoz – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "A hurokimpedancia mérése feszültség alatt, a műszer rövid ideig terheli a hurkot és a feszültségesésből számol – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
---

:::goals
- Meg tudod határozni a hibahurkot.
- Tudod, mi a hurokimpedancia, és miért fontos.
- Le tudod írni a mérés elvét és menetét.
:::

## A hibahurok

Testzárlatnál a hibaáram egy **zárt hurkon** folyik: a tápforrásból (transzformátorból) a **fázisvezetőn** át a hibahelyre, majd a **védővezetőn** (TN-rendszerben a PE vagy PEN) vissza a tápforráshoz. Ezt az áramutat nevezzük **hibahurognak**.

## A hurokimpedancia

A hibahurok eredő impedanciája a :term[hurokimpedancia]{id=loop-impedance}. Jele: Z_s. A hibaáram nagyságát ez határozza meg:

`I_hiba = U₀ / Z_s`

- I_hiba: a hibaáram, A,
- U₀: a fázis és a föld közti feszültség, V,
- Z_s: a hurokimpedancia, Ω.

Minél kisebb a Z_s, annál nagyobb a hibaáram, és annál gyorsabban old ki a védőkészülék. Ha a Z_s túl nagy (rossz kötés, hosszú vagy vékony vezeték, gyenge védővezető), a hibaáram kicsi marad, a védőkészülék nem old ki időben, és a burkolat veszélyes feszültségen marad.

::calculator{id="short-circuit-current" voltage=230 impedance=0.5}

## Miért kell mérni?

A hurokimpedancia kiszámítása a vezetékek adataiból közelítő. A **mérés** a tényleges értéket adja, a kötések, a csatlakozások és a hálózat állapotával együtt. Ezért a szerelői ellenőrzés kötelező része.

## A mérés elve

A hurokimpedancia-mérő **feszültség alatt** méri az impedanciát. Röviden terheli a hurkot (rövid ideig kis ellenállást kapcsol a fázis és a védővezető közé), méri a feszültségesést, és ebből számolja az impedanciát. A mérés rövid ideig tart, és a védőkészüléket nem oldja ki (a műszerek erre vannak kialakítva).

## A mérés menete

1. **Ellenőrizd**, hogy a védővezető folytonossága már ki van mérve, és a berendezés épnek tűnik.
2. Csatlakoztasd a műszert **a mérendő pontra**: a fázis- és a védővezető érintkezőjére (például a dugaszolóaljzat érintkezőire).
3. Indítsd a mérést, és olvasd le az értéket.
4. Mérd a **legtávolabbi pontokon**, mert ott a legnagyobb a hurokimpedancia.
5. Jegyezd fel az értéket a jegyzőkönyvbe.

:::safety
A hurokimpedancia mérése **feszültség alatt** történik, ezért csak ép védővezető mellett végezhető: ha a védővezető szakadt, a mérés közben a műszer vagy a vezetők feszültség alá kerülhetnek. A mérés előtt győződj meg a védővezető folytonosságáról. A műszert és a mérővezetékeket a szigetelésük épségének ellenőrzése után használd.
:::

:::mistake
„A hurokimpedanciát elég kiszámolni a vezeték adataiból." A számítás nem veszi figyelembe a kötések ellenállását és a hálózat tényleges állapotát. A szerelői ellenőrzésben a mérés kötelező.
:::

:::exam
A vizsgán a hibahurok útját, a hurokimpedancia jelentését és a hibaáram `I = U₀ / Z_s` összefüggését kérdezik, valamint azt, hogy a mérést mely ponton végezzük.
:::

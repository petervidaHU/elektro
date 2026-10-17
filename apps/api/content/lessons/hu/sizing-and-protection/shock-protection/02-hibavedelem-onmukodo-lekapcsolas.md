---
title: "Hibavédelem: a táplálás önműködő lekapcsolása"
summary: Mi a testzárlat, hogyan folyik a hibaáram, és hogyan teszik biztonságossá a védővezető és a védőkészülék együtt a hibás berendezést.
verify:
  - "A hibavédelem fő módja a táplálás önműködő lekapcsolása védővezető és védőkészülék együttműködésével; a védővezető a test és a tápforrás földelt pontja között alacsony impedanciájú hurkot ad – MSZ HD 60364-4-41 szerkezete szerint; szakmai alapismeret, forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a megengedett lekapcsolási idők (TN- és TT-rendszerben, a névleges feszültség szerint) – MSZ HD 60364-4-41, 41.1. táblázat"
  - "HIÁNYZIK: a megengedett érintési feszültség határértéke (UL) – MSZ HD 60364-4-41"
---

:::goals
- Meg tudod magyarázni, mi a testzárlat, és hogyan folyik a hibaáram.
- Érted, miért kell kis impedanciájú védővezető a lekapcsoláshoz.
- Tudod, mely feltételek mellett kapcsol le a védőkészülék.
:::

## Mi a testzárlat?

**Testzárlat** akkor keletkezik, ha egy aktív vezető (például a fázis) valamilyen hiba miatt összeér a készülék **fém testével**. Ilyenkor a fém burkolat feszültség alá kerül. Aki megérinti, áramütést szenved.

A hibavédelem célja: a veszélyes feszültségű állapot **ne tartson sokáig**, vagy ne legyen jelen.

## Az önműködő lekapcsolás elve

A leggyakoribb hibavédelem a **táplálás önműködő lekapcsolása**. Három elem működik együtt:

1. A készülék fém testét a **védővezetővel** (PE) a tápforrás földelt pontjával (TN-rendszerben) vagy a saját földelővel (TT-rendszerben) kötjük össze.
2. Testzárlatnál a fázisvezetőről a hibahelyen át a **védővezetőn** keresztül zárt áramhurok jön létre.
3. A hurok kis impedanciája miatt **nagy hibaáram** folyik, amelyet a **védőkészülék** (kismegszakító, biztosító vagy ÁVK) érzékel, és az előírt időn belül lekapcsol.

A hibás berendezés tehát a feszültségmentes állapotba kerül, mielőtt a burkolatán tartósan veszélyes feszültség alakulna ki.

## A hibaáram és a hurokimpedancia

A hibaáram nagyságát Ohm törvénye adja:

`I_hiba = U₀ / Z_s`

- I_hiba: a hibaáram, A,
- U₀: a fázis és a föld közti feszültség, V,
- Z_s: a hibahurok impedanciája, Ω (:term[hurokimpedancia]{id=loop-impedance}).

Minél kisebb a Z_s, annál nagyobb a hibaáram, és annál gyorsabban old ki a védőkészülék. A Z_s a tápforrás, a fázisvezeték, a hibahely és a **védővezető** impedanciájából áll össze. Ezért kritikus, hogy a védővezető ép és megfelelő keresztmetszetű legyen.

## A feltétel

A védelem akkor megfelelő, ha a hibaáram **elég nagy ahhoz, hogy a védőkészülék a megengedett időn belül kioldjon**. A megengedett lekapcsolási idő az áramütés veszélyétől függ: minél nagyobb a feszültség a testen, annál rövidebb idő engedhető meg. Az értékeket a szabvány adja meg, a tervezés és az ellenőrzés ehhez méri a hurokimpedanciát.

## Mi egészíti ki a védelmet?

- **Védővezető:** nélküle nincs hibahurok, a védőkészülék nem old ki, és a test feszültség alatt marad.
- **Egyenpotenciálra hozás (EPH):** a fém részek közti feszültségkülönbséget csökkenti.
- **ÁVK:** kiegészítő védelem, amely kis hibaáramra is gyorsan lekapcsol.

:::safety
A védővezető **megszakítása vagy hiánya** a hibavédelmet teljesen megszünteti. A készülék ilyenkor működik, de a burkolata hiba esetén feszültség alá kerül, és nincs ami lekapcsoljon. A védővezetőt ezért soha nem szabad kapcsolóval megszakítani, és a bekötését minden szerelés után ellenőrizni kell.
:::

:::mistake
„A készülék működik, tehát a védővezető rendben van." A védővezető nem vesz részt az üzemi működésben, ezért hibája nem tűnik fel. Csak mérés (folytonosság, hurokimpedancia) mutatja ki.
:::

:::exam
A IV. rész kérdezi a testzárlat, a hibaáram útja és a védőkészülék együttműködését. A projektvizsgán a védővezető hibás bekötése vagy hiánya érvénytelen vizsgát jelent.
:::

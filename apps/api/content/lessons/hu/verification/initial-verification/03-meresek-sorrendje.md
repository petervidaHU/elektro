---
title: A mérések sorrendje
summary: A mérések logikus sorrendje: folytonosság, szigetelés, majd a feszültség alatti mérések és a működési próbák, és az, hogy miért ez a sorrend.
verify:
  - "A mérések sorrendje: szemrevételezés, feszültségmentes mérések (védővezető folytonosság, szigetelési ellenállás), majd feszültség alatti mérések (hurokimpedancia, ÁVK), végül működési próbák – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a mérések szabványos sorrendje és teljes listája (pl. polaritás, fázissorrend, feszültségesés) – MSZ HD 60364-6"
---

:::goals
- Fel tudod sorolni a mérések logikus sorrendjét.
- Meg tudod indokolni, miért ez a sorrend.
- Tudod, mely mérések feszültségmentesen, melyek feszültség alatt történnek.
:::

## A sorrend lényege

A méréseknek **logikus, biztonságos sorrendje** van: előbb azokat végezzük, amelyek **feszültségmentesen** elvégezhetők és a biztonságot alapozzák meg, utána azokat, amelyekhez a berendezést feszültség alá kell helyezni.

## A sorrend

1. **Szemrevételezés** (feszültségmentesen).
2. **A védővezetők (PE) és az EPH folytonossága** (feszültségmentesen).
3. **Szigetelési ellenállás** (feszültségmentesen, a fogyasztók leválasztva).
4. **Feszültség alá helyezés.**
5. **Hurokimpedancia** mérése (feszültség alatt).
6. **ÁVK vizsgálata** (feszültség alatt).
7. **Működési próbák** (kapcsolók, védelmek, vezérlések).

A pontos lista tartalmazhat további vizsgálatokat is (polaritás, fázissorrend), de az alapvető logika ez.

## Miért ez a sorrend?

- **A védővezető folytonossága a szigetelési mérés és minden feszültség alatti mérés előtt** jön. Ha a védővezető hibás (megszakadt), a hurokimpedancia és az ÁVK vizsgálatának eredménye megbízhatatlan, és ami még fontosabb, a berendezés feszültség alá helyezése életveszélyes lehet.
- **A szigetelési ellenállást a feszültség alá helyezés előtt** mérjük. Ha a szigetelés rossz (zárlat), feszültség alatt zárlat és tűz keletkezne.
- **Csak ezek után** helyezzük feszültség alá a berendezést, amikor már tudjuk, hogy a védővezető ép és a szigetelés megfelelő.
- A **feszültség alatti mérések** (hurokimpedancia, ÁVK) a védelem tényleges működését igazolják.
- A **működési próbák** a végén jönnek, mert ezek a rendszer egészét vizsgálják.

:::safety
A feszültség alá helyezés **előtt** a védővezető folytonosságát és a szigetelést mindig meg kell mérni. Ha ezt kihagyod, egy hibás berendezést teszel feszültség alá: a testzárlatos burkolaton veszélyes feszültség jelenik meg, és védővezető nélkül semmi sem kapcsol le.
:::

:::mistake
„Gyorsabb, ha előbb feszültség alá teszem, és közben mérek mindent.” Ez veszélyes: a feszültség alatti mérésekhez ép védővezető és megfelelő szigetelés kell. A sorrend a biztonságot védi, nem csak a rendet.
:::

:::exam
A IV. részben gyakori kérdés a mérések helyes sorrendje és annak indoklása. A projektvizsgán a mérések sorrendjének megsértése hibának számít.
:::

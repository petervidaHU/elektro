---
title: Feszültségszintek és a munkavégzők
summary: A törpe-, kis- és nagyfeszültség pontos határai, a hálózatok üzemi felosztása, és az, hogy ki milyen villamos munkát végezhet.
verify:
  - "Törpefeszültség (ELV): váltakozó áramnál legfeljebb 50 V, hullámosságmentes egyenáramnál legfeljebb 120 V; ide tartozik a SELV, a PELV és a FELV – MEE VÉT kézikönyv VII.1.1–VII.1.2 (MSZ 1)"
  - "Kisfeszültség (LV): váltakozó áramnál legfeljebb 1000 V, egyenáramnál legfeljebb 1500 V; nagyfeszültség (HV): ezek felett – MEE VÉT kézikönyv VII.1.1 (MSZ 1)"
  - "KIF: legfeljebb 1 kV; KÖF: 1 kV felett, legfeljebb 35 kV; NAF: 35 kV felett – MEE VÉT kézikönyv VII.1.1"
  - "Az MSZ 1585:2016 I–V. személycsoportjai és meghatározásuk – ITM: Villamos biztonsági ismeretek (2022)"
  - "Villamos munkát csak szakképzett vagy kioktatott személy végezhet, vagy ilyen személy felügyelete alatt – MSZ 1585:2016 (feszultsegmentesites.hu összefoglaló)"
  - "HIÁNYZIK: az egyes személycsoportok által végezhető munkák pontos listája – MSZ 1585:2016"
---

:::goals
- Pontosan meg tudod adni a törpe-, kis- és nagyfeszültség határait váltakozó és egyenfeszültségen.
- Ismered a KIF, KÖF és NAF hálózatok feszültséghatárait.
- Ki tudod mondani, mi a különbség a képzetlen, a kioktatott és a szakképzett személy között.
- Ismered az MSZ 1585 öt személycsoportját.
:::

## Miért osztjuk szintekre a feszültséget?

A villamos berendezéseket életvédelmi szempontból a feszültségük szerint csoportokba soroljuk. A feszültségszinttől függ, hogy milyen szigetelés és védőtávolság kell, milyen áramütés elleni védelmet kell alkalmazni, és ki dolgozhat a berendezésen. A besorolás mindig a **névleges feszültség** alapján történik: azon az értéken, amelyre a hálózatot tervezték.

## A három feszültségszint

Az MSZ 1 szabvány három feszültségszintet határoz meg.

**Törpefeszültség (ELV).** Váltakozó áramnál legfeljebb **50 V**, hullámosságmentes egyenáramnál legfeljebb **120 V**. Ide tartozik:

- **SELV:** biztonsági törpefeszültség, földeletlen áramkör,
- **PELV:** védelmi törpefeszültség, földelt áramkör,
- **FELV:** üzemi törpefeszültség, amelyet üzemi okból alkalmazunk, de nem biztonsági forrásról táplálunk.

A SELV és a PELV önmagában is áramütés elleni védelem. Ezekről az áramütés elleni védelemnél részletesen tanulsz.

**Kisfeszültség (LV).** Váltakozó áramnál legfeljebb **1000 V**, egyenáramnál legfeljebb **1500 V**. Ide tartozik a lakások és az üzemek **230/400 V**-os hálózata, vagyis szinte minden, amin villanyszerelőként dolgozol. A „kis” szó ne tévesszen meg: a kisfeszültség **életveszélyes**.

**Nagyfeszültség (HV).** Váltakozó áramnál **1000 V felett**, egyenáramnál **1500 V felett**. Nagyfeszültségű berendezés közelében már a megközelítés is életveszélyes, mert a feszültség a levegőn át is átívelhet.

## A hálózatok üzemi felosztása

Az áramszolgáltatók és a villamos hálózatokkal dolgozók a nagyfeszültséget tovább bontják:

- **KIF – kisfeszültségű hálózat:** legfeljebb 1 kV névleges feszültség (például a 230/400 V-os elosztóhálózat),
- **KÖF – középfeszültségű hálózat:** 1 kV felett, legfeljebb 35 kV (a településeket ellátó hálózatok),
- **NAF – nagyfeszültségű hálózat:** 35 kV felett (az országos átviteli és főelosztó hálózat).

Biztonsági szempontból a KÖF is nagyfeszültség: minden nagyfeszültségre vonatkozó szabály érvényes rá.

:::mistake
„A 24 V-os áramkör veszélytelen, azon bármit csinálhatok.” A törpefeszültség áramütés szempontjából valóban kisebb kockázat, de rövidzárlatkor nagy áram folyhat, ami égést vagy tüzet okoz. Ráadásul ugyanabban a dobozban vagy elosztóban gyakran 230 V-os részek is vannak.
:::

## Ki dolgozhat villamos berendezésen?

A villamos berendezések üzemeltetésének és a rajtuk végzett munkának a szabályait az **MSZ 1585:2016** szabvány írja elő. Alapszabálya: villamos munkában csak **szakképzett** vagy **kioktatott** személy vehet részt, vagy olyan, aki ilyen személy **felügyelete alatt** dolgozik.

A három alapkategória:

- **Képzetlen (laikus) személy:** nincs villamos szakképzettsége, és nem kapott kioktatást. A berendezéseket csak rendeltetésszerűen használhatja (lámpát kapcsol, dugót dug be). Villamos munkát önállóan nem végezhet.
- **Kioktatott személy:** nincs villamos szakképzettsége, de az általa végzendő munka villamos veszélyeire és az ezzel kapcsolatos helyes magatartásra bizonyítottan kioktatták. A kioktatás mindig egy adott munkakörre szól.
- **Szakképzett személy:** igazolt villamos szakmai képesítéssel, tudással és gyakorlattal rendelkezik, amely képessé teszi a villamosság okozta kockázatok értékelésére és a veszélyek elkerülésére.

Az MSZ 1585:2016 ezt öt **személycsoportra** bontja:

1. **I. csoport:** semmilyen szakképzettségük nincs, és kioktatást sem kaptak (képzetlen személyek).
2. **II. csoport:** az általuk végzendő tevékenységre műszaki, de nem villamos jellegű kioktatást kaptak.
3. **III. csoport:** villamos szakképzettségük nincs, de a munkájuk villamos veszélyeire bizonyítottan kioktatták őket (kioktatott személyek).
4. **IV. csoport:** villamos energetikai (erősáramú) szakképzettségű személyek. Ez hat alcsoportra (IV/a–IV/f) oszlik, például IV/e: az érintésvédelmi szabványossági felülvizsgáló.
5. **V. csoport:** erősáramú szakképzettségű villamosmérnök, villamos technikus vagy villamos szakmunkás, akit a munkáltatója villamos munkák irányításával vagy vezetésével bízott meg.

A villanyszerelő szakmai vizsga után a IV. csoportba kerülhetsz. Tanulóként villamos munkát kizárólag szakképzett személy **felügyelete alatt** végzel.

:::safety
Soha ne végezz olyan munkát, amelyre nincs képzettséged vagy kioktatásod, akkor sem, ha valaki megkér rá. Tanulóként csak feszültségmentesített berendezésen, felügyelet alatt dolgozol. A feszültségmentesítés öt lépését a következő témában tanulod.
:::

:::exam
A vizsgán gyakori kérdés: a feszültségszintek határai (50 V, 120 V, 1000 V, 1500 V), a KIF/KÖF/NAF felosztás, és az, hogy egy adott munkát képzetlen, kioktatott vagy szakképzett személy végezhet-e.
:::

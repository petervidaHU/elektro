---
title: Alapvédelem
summary: A közvetlen érintés elleni védelem eszközei: szigetelés, burkolat, elhatárolás, akadály és elérhetőségen kívül helyezés, valamint az IP-védettség jelölése.
verify:
  - "Alapvédelem: a közvetlen megérintés elleni védelem; hibavédelem: a közvetett érintés elleni védelem – MEE VÉT kézikönyv, 346–347. o."
  - "Kiegészítő védelem legfeljebb 30 mA névleges kioldóáramú ÁVK-val – MEE VÉT kézikönyv, 350. o."
  - "IP-kód első számjegye: 0 nincs védelem; 1 > 50 mm (kézhát); 2 > 12,5 mm (ujj); 3 > 2,5 mm (szerszám, vastag huzal); 4 > 1 mm (huzal, vékony csavar); 5 porvédett; 6 portömör. Második számjegy: 0 nincs; 1 csepegő víz; 2 csepegő víz 15°-os döntésnél; 3 permetező víz; 4 fröccsenő víz; 5 vízsugár; 6 erős vízsugár; 7 ideiglenes bemerítés 1 m-ig; 8 tartós bemerítés 1 m felett; 9 nagynyomású, magas hőmérsékletű vízsugár; X: nem vizsgált – Wikipedia: IP code"
  - "IP44 védettségű, tokozott szekrény mint példa – MEE VÉT kézikönyv, 341. o."
  - "Az alapvédelem módjai (szigetelés, burkolat/elhatárolás, akadály, elérhetőségen kívül helyezés) és feltételeik – nem olvasott forrás, ellenőrizendő: MSZ HD 60364-4-41 A és B melléklet"
  - "HIÁNYZIK: az IP-kód kiegészítő betűinek (A, B, C, D) jelentése és a burkolatokra előírt legkisebb védettség (IPXXB / IP2X, IPXXD / IP4X felső felületen) – MSZ EN 60529, MSZ HD 60364-4-41 A melléklet"
---

:::goals
- Megérted az alapvédelem célját és a hibavédelemtől való különbségét.
- Ismered az alapvédelem módjait.
- Ki tudod olvasni az IP-védettség jelöléséből a szilárd test és a víz elleni védettséget.
- Tudod, mi a kiegészítő védelem szerepe.
:::

## Alapvédelem és hibavédelem

Az áramütés elleni védelem (érintésvédelem) két, egymást kiegészítő részből áll:

- **Alapvédelem:** a **közvetlen** érintés elleni védelem. Megakadályozza, hogy valaki üzemszerűen feszültség alatt álló részt (aktív részt), például egy vezetőt vagy egy kapcsot megérintsen.
- **Hibavédelem:** a **közvetett** érintés elleni védelem. Ha az alapvédelem meghibásodik (például egy készülékben a szigetelés megsérül), és egy üzemszerűen feszültségmentes fémrész (test) feszültség alá kerül, a hibavédelem gondoskodik arról, hogy ez ne okozzon veszélyes áramütést.

Egy szabályos berendezésben **mindkettőnek** működnie kell. Ez a lecke az alapvédelemmel foglalkozik.

## Az alapvédelem módjai

**Szigetelés:** az aktív részeket teljesen befedő szigetelés, amelyet csak roncsolással lehet eltávolítani. Ilyen a vezetékek szigetelése. A festék, a lakk vagy a zománc nem számít szigetelésnek.

**Burkolat és elhatárolás:** az aktív részeket burkolat (tok, doboz, elosztószekrény ajtaja és fedele) zárja körbe, amely megakadályozza az érintést. A burkolatot csak szerszámmal vagy kulccsal lehessen eltávolítani, vagy eltávolításkor a mögötte lévő részek legyenek feszültségmentesek.

**Akadály:** korlát vagy védőháló, amely a véletlen érintést akadályozza meg, a szándékosat nem. Csak villamosan szakképzett vagy kioktatott személyek által felügyelt helyen alkalmazható.

**Elérhetőségen kívül helyezés:** az aktív részeket olyan távolságra helyezik el, hogy kézzel ne lehessen elérni őket (például szabadvezetékek). Szintén csak szakképzett személyek által felügyelt helyen alkalmazható.

Lakásokban és a laikusok által használt helyeken az alapvédelem a **szigetelés** és a **burkolat**.

## Az IP-védettség

A burkolat védettségét az **IP-kód** jelöli, két számjeggyel, például **IP44**.

Az **első számjegy** a szilárd testek behatolása és az érintés elleni védettség:

- 0: nincs védelem,
- 1: 50 mm-nél nagyobb tárgy ellen (kézhát),
- 2: 12,5 mm-nél nagyobb tárgy ellen (**ujj**),
- 3: 2,5 mm-nél nagyobb tárgy ellen (szerszám, vastag huzal),
- 4: 1 mm-nél nagyobb tárgy ellen (huzal, vékony csavar),
- 5: porvédett,
- 6: portömör.

A **második számjegy** a víz elleni védettség:

- 0: nincs védelem,
- 1: függőlegesen csepegő víz,
- 2: csepegő víz 15°-os megdöntésnél,
- 3: permetező víz,
- 4: **fröccsenő víz** minden irányból,
- 5: vízsugár,
- 6: erős vízsugár,
- 7: ideiglenes bemerítés (1 m mélységig),
- 8: tartós bemerítés (1 m-nél mélyebben),
- 9: nagynyomású, magas hőmérsékletű vízsugár.

Ha valamelyik számjegy helyén **X** áll (például IPX4), arra a védettségre a terméket nem vizsgálták.

:::example
Egy kültéri dugaszolóaljzat jelölése IP44. Mit jelent?

1. Első számjegy 4: az 1 mm-nél vastagabb tárgyak (huzal, csavarhúzó hegye) nem hatolnak be.
2. Második számjegy 4: minden irányból fröccsenő víz ellen védett.
:::

## Kiegészítő védelem

A legfeljebb **30 mA** névleges kioldó különbözeti áramú áram-védőkapcsoló **kiegészítő védelmet** ad: ha az alapvédelem a felhasználó gondatlansága miatt hatástalan (például sérült vezetékkel dolgozik), és a hibaáram a testén át a földbe folyik, az ÁVK lekapcsol. A kiegészítő védelem nem helyettesíti az alapvédelmet, csak csökkenti a kockázatot.

:::safety
- Elosztószekrényt, kötődobozt, szerelvényt fedél vagy burkolat nélkül soha ne hagyj feszültség alatt: a hiányzó burkolat megszünteti az alapvédelmet.
- Sérült szigetelésű vezetéket, repedt burkolatú szerelvényt nem szabad üzemben tartani, és szigetelőszalaggal „megjavítani” sem: ki kell cserélni.
- Az alapvédelmet megszüntető munkát (fedél levétele, burkolat bontása) csak feszültségmentesítés után végezhetsz.
:::

:::mistake
Gyakori hiba, hogy a második számjegyet keverik az elsővel: az IP20 érintés ellen védett, de víz ellen egyáltalán nem. Nedves helyre ilyen szerelvény nem kerülhet.
:::

:::exam
A vizsgán kérdés lehet az alapvédelem módjai és az IP-kód számjegyeinek jelentése.
:::

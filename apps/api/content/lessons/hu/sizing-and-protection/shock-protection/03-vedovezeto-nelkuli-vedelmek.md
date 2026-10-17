---
title: Védővezető nélküli védelmi módok
summary: Áramütés elleni védelem védővezető nélkül: kettős vagy megerősített szigetelés, SELV és PELV törpefeszültség, villamos elválasztás; elvük, feltételeik és jelölésük.
verify:
  - "Áramütés elleni védelmi módok: a táplálás önműködő lekapcsolása, kettős vagy megerősített szigetelés, villamos elválasztás, SELV és PELV – MEE VÉT kézikönyv, 347. o."
  - "ELV: legfeljebb 50 V AC, 120 V DC; SELV: földeletlen, PELV: földelt érintésvédelmi törpefeszültség – MEE VÉT kézikönyv, 308. o."
  - "PELV áramkör és az általa táplált készülékek teste földelhető – de.wikipedia: Kleinspannung (DIN VDE 0100-410:2018, 414.4.1); FELV (funkcionális törpefeszültség biztonsági elválasztás nélkül) érintésvédelmi módként nem megengedett – de.wikipedia: Kleinspannung"
  - "Kettős szigetelés: az alapszigetelésen felül megerősített védőszigetelés, nem kell védőföldelés; jelölése: két egymásba rajzolt négyzet – Wikipedia: Appliance classes; de.wikipedia: Schutzklasse (Elektrotechnik)"
  - "Villamos elválasztás: egy elválasztó transzformátorra csak egy fogyasztó csatlakozhat (több fogyasztónál földeletlen helyi EPH kell); a feszültség legfeljebb 500 V; a feszültség és a vezetékhossz szorzata kisebb 100 000 V·m-nél, a vezeték legfeljebb 500 m; két hiba (testzárlat + földzárlat) ellen nem véd – de.wikipedia: Schutztrennung"
  - "HIÁNYZIK: a SELV-áramkör aktív részeinek földelési tilalma és a biztonsági transzformátor jelölése – MSZ HD 60364-4-41, 414. szakasz; MSZ EN 61558"
---

:::goals
- Ismered azokat a védelmi módokat, amelyekhez nem kell védővezető.
- Megérted a kettős szigetelés elvét, és felismered a jelölését.
- Meg tudod különböztetni a SELV és a PELV törpefeszültséget.
- Ismered a villamos elválasztás elvét és feltételeit.
:::

## Kettős vagy megerősített szigetelés

A kettős szigetelésű készülékben az aktív részeket nem egy, hanem **két független szigetelés** választja el az érinthető részektől:

- az **alapszigetelés** az alapvédelmet adja,
- a **kiegészítő (védő) szigetelés** a hibavédelmet: ha az alapszigetelés meghibásodik, a kiegészítő szigetelés továbbra is megakadályozza, hogy az érinthető rész feszültség alá kerüljön.

A **megerősített szigetelés** egyetlen szigetelőréteg, amely ugyanakkora védelmet ad, mint a kettős szigetelés.

Mivel a hibavédelmet maga a szigetelés adja, a kettős szigetelésű készüléket **nem kell** a védővezetőhöz kötni: csatlakozózsinórja kéteres (fázis és nulla), dugója védőérintkező nélküli. Jelölése két, egymásba rajzolt **négyzet** (⧈). Ilyenek a legtöbb kézi szerszámok, porszívók, hajszárítók.

## SELV és PELV

Ennél a védelmi módnál a feszültség olyan kicsi, hogy érintése normál körülmények között nem veszélyes. A **törpefeszültség** (ELV) váltakozó áramnál legfeljebb **50 V**, egyenáramnál legfeljebb **120 V**.

A törpefeszültségű áramkört a nagyobb feszültségű hálózattól **biztonsági elválasztással** kell elválasztani, például biztonsági transzformátorral. Két változata van:

- **SELV – biztonsági törpefeszültség:** az áramkör **földeletlen**. Sem az aktív részei, sem a táplált készülékek teste nincs földelve.
- **PELV – védelmi törpefeszültség:** az áramkör vagy a táplált készülékek teste **földelhető**. Ott használják, ahol a földelés üzemi okból szükséges.

A **FELV** (funkcionális törpefeszültség) olyan törpefeszültségű kör, amelyben nincs biztonsági elválasztás a nagyobb feszültségű hálózattól. Ez **nem** érintésvédelmi mód: a FELV-áramkör érintésvédelmét a táplálás oldaláról, a nagyobb feszültségű hálózat szabályai szerint kell kialakítani.

## Villamos elválasztás

A villamos elválasztásnál a fogyasztót egy **elválasztó transzformátoron** keresztül táplálják. A transzformátor szekunder köre semmilyen ponton nem kapcsolódik a földhöz vagy a hálózat más részéhez. Ha valaki a szekunder kör egyik vezetőjét megérinti, miközben a földön áll, nincs zárt áramkör, amelyen áram folyhatna.

A feltételek:

- egy elválasztó transzformátorra **csak egy fogyasztó** csatlakozhat (több fogyasztónál a testeiket egymással földeletlen egyenpotenciálra hozó vezetővel kell összekötni),
- a szekunder feszültség legfeljebb **500 V**,
- a szekunder vezeték hossza legfeljebb **500 m**, és a feszültség és a vezetékhossz szorzata kisebb **100 000 V·m**-nél.

:::example
Egy 230 V-os elválasztó transzformátor szekunder köre milyen hosszú lehet legfeljebb?

1. 100 000 V·m / 230 V ≈ 434,8 m.
2. Ez kisebb az 500 m-es felső határnál, tehát a vezeték legfeljebb kb. 434 m lehet.
:::

A villamos elválasztás **két hiba** ellen nem véd: ha a fogyasztó testzárlatos, és közben a szekunder kör egy másik pontja földzárlatot kap, a test feszültség alá kerül a földhöz képest.

:::safety
- Kettős szigetelésű készülék burkolatát nem szabad fémcsavarral, fémlemezzel kiegészíteni vagy megbontva használni: a burkolat a hibavédelem része.
- SELV-áramkör aktív részeit soha ne kösd a védővezetőhöz vagy a földhöz.
- Elválasztó transzformátorra egynél több fogyasztót csak a feltételek teljesülése esetén szabad kötni.
:::

:::mistake
Gyakori hiba, hogy a 24 V-os, de biztonsági elválasztás nélkül, például takarékkapcsolású transzformátorról táplált kört „törpefeszültségűnek, tehát biztonságosnak” tekintik. Biztonsági elválasztás nélkül a kör FELV, és a nagyobb feszültségű hálózat feszültsége hiba esetén megjelenhet rajta.
:::

:::exam
A vizsgán kérdés lehet a SELV és a PELV különbsége, a kettős szigetelés jelölése, és a villamos elválasztás feltételei.
:::

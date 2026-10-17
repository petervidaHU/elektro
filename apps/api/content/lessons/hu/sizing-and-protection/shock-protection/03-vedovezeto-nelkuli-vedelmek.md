---
title: Védővezető nélküli védelmi módok
summary: Kettős és megerősített szigetelés, SELV és PELV törpefeszültség, védőelválasztás: az elvük és a jelölésük.
verify:
  - "Törpefeszültség: legfeljebb 50 V AC / 120 V DC – MEE VÉT kézikönyv VII.1.1 (MSZ 1)"
  - "SELV: földeletlen törpefeszültségű áramkör, a többi áramkörtől védőelválasztással (pl. biztonsági transzformátor) elválasztva; PELV: azonos, de földelt áramkör – MSZ HD 60364-4-41 szerint; szakmai alapismeret, forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "A II. érintésvédelmi osztály jele két egymásba rajzolt négyzet – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a védőelválasztás feltételei (az elválasztó transzformátor feszültség- és teljesítményhatára, az áramkör hossza, egy fogyasztó a transzformátorra) – MSZ HD 60364-4-41"
---

:::goals
- Meg tudod nevezni az áramütés elleni védelem védővezető nélküli módjait.
- Elmagyarázod a SELV és a PELV különbségét.
- Fel tudod ismerni a kettős szigetelés jelét.
:::

## Védelem védővezető nélkül

Az eddigi védelmek (önműködő lekapcsolás) a védővezetőre épülnek. Vannak azonban védelmi módok, amelyek **nem a lekapcsolásra**, hanem arra támaszkodnak, hogy a hiba esetén sem alakul ki veszélyes érintési feszültség. Három fontos van belőlük.

## Kettős vagy megerősített szigetelés

A **kettős szigetelés** azt jelenti, hogy a veszélyes részeket **két egymástól független szigetelés** választja el a használótól: az alap- és a kiegészítő szigetelés. Ha az egyik megsérül, a másik még véd. A **megerősített szigetelés** egyetlen, de olyan erős szigetelés, amely a kettős szigetelésnek megfelelő védelmet ad.

Az ilyen készülék fém burkolata nincs a védővezetőre kötve, mert **nem is lehet feszültség alatt** a normál meghibásodások esetén. A kettős szigetelésű készülék jele **két egymásba rajzolt négyzet**, és a II. érintésvédelmi osztályba tartozik.

## SELV és PELV: törpefeszültség

A **törpefeszültség** legfeljebb 50 V váltakozó vagy 120 V egyenfeszültség. Ilyen kis feszültségen az érintés általában nem életveszélyes. Két változata van:

- **SELV** (biztonsági törpefeszültség): az áramkör **földeletlen**, a többi áramkörtől megbízhatóan **védőelválasztással** (például biztonsági transzformátorral) elválasztott. Nincs földelve, és a készülék teste sincs földelve.
- **PELV** (védő törpefeszültség): ugyanolyan védőelválasztású, de az áramkör (vagy a test) **földelve van**.

Fontos, hogy a törpefeszültségű áramkör csatlakozói **ne illeszkedjenek** magasabb feszültségű aljzatba, és a SELV-áramkör vezetői ne legyenek közös csőben a magasabb feszültségű vezetőkkel, hogy az átfedés ne vigyen veszélyes feszültséget a törpefeszültségű oldalra.

## Védőelválasztás

A **védőelválasztás** (villamos elválasztás) azt jelenti, hogy a fogyasztót **elválasztó transzformátorról** táplálják, amelynek a kimenete nincs földelve és nincs összekötve a védővezetővel. Ilyen körben az egyetlen test érintése nem zár áramhurkot a föld felé, ezért nem folyik áram a testen át.

A védőelválasztás csak akkor véd, ha a transzformátor kimenetére **egyetlen fogyasztót** (vagy az előírt feltételek szerint néhányat) kötnek, és az áramkör nem földelt.

## Összefoglalás

- **Kettős/megerősített szigetelés:** nem kell védővezető, a készülék a II. osztályba tartozik.
- **SELV/PELV:** nagyon kis feszültség, védőelválasztással.
- **Védőelválasztás:** földeletlen, külön transzformátoros áramkör.

:::safety
Ezek a védelmek **csak akkor védenek, ha a feltételeik teljesülnek**: a SELV-áramkört nem szabad földelni, a védőelválasztású áramkört nem szabad más áramkörhöz kötni, a kettős szigetelésű készülék burkolatát nem szabad a védővezetőre kötni. Ha ezeket megszeged, a védelem megszűnik.
:::

:::mistake
„A SELV és a PELV ugyanaz.” A különbség a földelésben van: a SELV földeletlen, a PELV földelt. A védőelválasztás feltétele mindkettőnél a megbízható elválasztás a magasabb feszültségű hálózattól.
:::

:::exam
A vizsgán a védővezető nélküli védelmek neve, elve és jele szerepel. A II. osztály jelét és a SELV/PELV különbségét gyakran kérdezik.
:::

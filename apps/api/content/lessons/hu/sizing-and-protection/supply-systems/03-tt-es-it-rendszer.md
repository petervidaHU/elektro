---
title: TT- és IT-rendszer
summary: A TT- és az IT-rendszer felépítése és alkalmazása, és az, hogy a védelem szempontjából miben különböznek a TN-rendszerektől.
verify:
  - "A TT-rendszerben a hibaáram útja a föld, ezért a hurokimpedancia nagy; a védelem jellemzően ÁVK-val oldható meg – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "Az IT-rendszerben az első testzárlat nem okoz lekapcsolást, szigetelés-ellenőrző készülék szükséges – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: az IT-rendszer alkalmazási területei (pl. kórházi operációs helyiségek, folyamatos üzemű ipar) és az erre vonatkozó szabályozás – az oktatónak kell kiegészítenie"
  - "HIÁNYZIK: a TT-rendszer földelési ellenállására vonatkozó feltétel (érintési feszültség határ és ÁVK névleges kioldó árama) – MSZ HD 60364-4-41 – az oktatónak kell kiegészítenie"
---

:::goals
- Le tudod írni a TT- és az IT-rendszer felépítését.
- Meg tudod magyarázni, miért más a hibaáram útja a TT-rendszerben, mint a TN-ben.
- Tudod, miért igényel külön figyelmet az első testzárlat az IT-rendszerben.
:::

## TT-rendszer: két külön földelés

A TT-rendszerben a tápforrás közvetlenül földelve van (az első **T**), és a fogyasztók fém teste is közvetlenül földelve van, **a tápforrás földelésétől függetlenül** (a második **T**). A két földelés között nincs fémes összeköttetés: csak a talaj köti össze őket.

Testzárlatnál ezért a hibaáram a fázisvezetőn megy a hibahelyre, onnan a **védővezetőn** (PE) a fogyasztó **saját földelőjébe**, majd a talajon át jut vissza a tápforrás földeléséhez. A talajon átfolyó áram útja nagy ellenállású, ezért a hibaáram sokkal kisebb, mint a TN-rendszerben.

## Mi következik ebből a védelemre?

A kis hibaáramot a kismegszakító vagy a biztosító gyakran nem érzékeli: lehet, hogy nem kapcsol le, miközben a burkolaton veszélyes feszültség áll. Ezért a TT-rendszerben a hibavédelmet általában **áram-védőkapcsolóval** (:term[ÁVK]{id=rcd}) oldjuk meg, amely már kis hibaáramra is gyorsan lekapcsol. A földelő ellenállása a megbízható működés feltétele, ezért rendszeresen mérni kell.

A TT-rendszer jellemzően ott fordul elő, ahol az épület saját földelővel rendelkezik, és a közcélú hálózat nem biztosít védővezetőt.

## IT-rendszer: a tápforrás nincs földelve

Az IT-rendszerben a tápforrás **nincs földelve**, vagy csak nagy impedancián keresztül. A fogyasztók fém teste földelve van.

Ha egy aktív vezető a testtel érintkezik (**első testzárlat**), a hibaáram útja nem záródik zárt hurokban, ezért csak nagyon kis áram folyik, és a berendezés **tovább működik**. Ez az előnye: az első hiba nem okoz üzemszünetet, és a testen sem alakul ki veszélyes feszültség.

A hátránya, hogy az első hibát észre kell venni és meg kell szüntetni, mielőtt egy **második hiba** is bekövetkezne egy másik fázison: akkor ugyanis a két testzárlat együtt zárlatot alkot, amelyet a védőkészüléknek kell lekapcsolnia. Ezért az IT-rendszerben **szigetelés-ellenőrző készülék** (szigetelési ellenállást folyamatosan figyelő műszer) figyeli az állapotot, és jelez az első hibánál.

## Összehasonlítás

- **TN:** a hibaáram fémes hurkon folyik, nagy; kismegszakító, biztosító is lekapcsol.
- **TT:** a hibaáram a talajon át záródik, kicsi; a védelem általában ÁVK.
- **IT:** az első hiba kis áramot okoz, nincs lekapcsolás; szigetelés-ellenőrzés szükséges, a második hibánál a védőkészülék kapcsol.

:::safety
A TT-rendszerben a készülékek védővezetőjét **mindig a saját földelőhöz** kell kötni, és az ÁVK-t rendszeresen ki kell próbálni a próbagombbal. Az IT-rendszerben az első hibát nem szabad figyelmen kívül hagyni, akkor sem, ha „minden működik”: a második hiba már életveszélyes lehet.
:::

:::exam
A vizsgán gyakran kell megnevezni a három rendszer hibaáramának útját és azt, melyik védelem lép működésbe: TN-nél a túláramvédelem, TT-nél jellemzően az ÁVK, IT-nél az első hibánál a szigetelés-ellenőrző jelez.
:::

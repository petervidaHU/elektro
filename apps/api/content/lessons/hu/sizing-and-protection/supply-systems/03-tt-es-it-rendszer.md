---
title: TT- és IT-rendszer
summary: A TT- és az IT-rendszer felépítése, hol alkalmazzák őket, és mi következik belőlük a hibavédelemre: miért kell TT-rendszerben ÁVK, és miért nem kapcsol le az IT-rendszer az első hibánál.
verify:
  - "TT: a táplálás közvetlenül földelt, a fogyasztói berendezés testei a táplálás földelésétől független, saját földelőhöz csatlakoznak – Wikipedia: Earthing system; MEE VÉT kézikönyv, 351. o."
  - "TT-rendszerben a túláramvédelem gyors működéséhez szükséges nagy hibaáram általában nem jön létre, ezért ÁVK-t alkalmaznak – Wikipedia: Earthing system; de.wikipedia: TT-System"
  - "TT-rendszer ÁVK-val: R_A · IΔn ≤ 50 V; 30 mA-nél R_A < 1667 Ω, 300 mA-nél < 167 Ω – de.wikipedia: TT-System (a képlet a forrásból kiolvasható példával); U_L = 50 V AC – MEE VÉT kézikönyv, 349. o."
  - "IT: a táplálás a földtől elszigetelt vagy nagy impedancián át földelt; az első hiba nem okozhat lekapcsolást; szigetelésfigyelő folyamatosan méri a vezetők földhöz képesti ellenállását; második hibánál önműködő lekapcsolás kell; alkalmazás: kórházi műtők – de.wikipedia: IT-System (Elektrotechnik); Wikipedia: Earthing system"
  - "Lekapcsolási idő TT-rendszerben, legfeljebb 32 A-es végáramkör, U₀ ≤ 230 V: 0,2 s – MEE VÉT kézikönyv II.17. táblázat, 353. o."
  - "Példa (R_A = 20 Ω, R_B = 2 Ω: 10,5 A, 210 V) – számított, szemléltető értékek"
---

:::goals
- Fel tudod rajzolni a TT- és az IT-rendszer felépítését.
- Megérted, miért kicsi a hibaáram TT-rendszerben, és miért kell ott áram-védőkapcsoló.
- Ki tudod számítani a TT-rendszer földelési ellenállásának felső határát ÁVK esetén.
- Tudod, mi történik az IT-rendszerben az első és a második hibánál.
:::

## A TT-rendszer felépítése

A TT-rendszerben a transzformátor csillagpontja **közvetlenül földelt** (üzemi földelés, ellenállása R_B). A fogyasztói berendezés testeit viszont nem a csillagponthoz, hanem egy **saját, független földelőhöz** kötik (védőföldelés, ellenállása R_A). A táplálás és a testek között tehát nincs fémes összeköttetés: a hibaáram csak a **földön keresztül** tud visszajutni a transzformátorhoz.

[Ábra: TT-rendszer. Transzformátor földelt csillagponttal (R_B), L1, L2, L3, N vezető; a fogyasztó fémháza PE-vezetővel egy külön földelőhöz (R_A) kötve. A hibaáram útja: fázis → testzárlat → PE → R_A → föld → R_B → csillagpont.]

## Miért kell TT-rendszerben ÁVK?

Testzárlatkor a hibaáramot a két földelési ellenállás korlátozza, amelyek a vezetékek ellenállásánál jóval nagyobbak.

:::example
TT-rendszer: a fogyasztó földelőjének ellenállása R_A = 20 Ω, az üzemi földelésé R_B = 2 Ω. Egy készüléken testzárlat keletkezik.

1. A hibaáram: I_f = U₀ / (R_A + R_B) = 230 V / (20 Ω + 2 Ω) ≈ 10,5 A.
2. A test feszültsége a földhöz képest: U_t = I_f · R_A = 10,5 A · 20 Ω = 210 V.
3. A 10,5 A egy 16 A-es kismegszakítót **egyáltalán nem** old ki, a test tartósan életveszélyes feszültségen marad.
:::

A túláramvédelem gyors működéséhez nagy zárlati áram kellene, ezt TT-rendszerben gyakorlatilag nem lehet elérni. Ezért a TT-rendszer hibavédelmét **áram-védőkapcsolóval** oldják meg: az ÁVK már néhány tized amperes hibaáramnál kiold.

A feltétel: a test feszültsége a kioldóáramnál sem haladhatja meg a megengedett 50 V-os érintési feszültséget:

`R_A · IΔn ≤ 50 V`

- R_A: a földelő és a védővezető ellenállásának összege, Ω,
- IΔn: az ÁVK névleges kioldó különbözeti árama, A.

:::example
Mekkora lehet legfeljebb a földelési ellenállás 30 mA-es, illetve 300 mA-es ÁVK esetén?

1. 30 mA-nél: R_A ≤ 50 V / 0,03 A ≈ 1667 Ω.
2. 300 mA-nél: R_A ≤ 50 V / 0,3 A ≈ 167 Ω.
:::

Az ÁVK-nak emellett a megengedett időn belül ki is kell oldania: TT-rendszerben, legfeljebb 32 A-es végáramkörben, 230 V-os fázisfeszültségnél a leghosszabb lekapcsolási idő **0,2 s**.

## Az IT-rendszer

Az IT-rendszerben a táplálás aktív részei **el vannak szigetelve a földtől**, vagy egy pontjuk **nagy impedancián** át földelt. A fogyasztói testek földelve vannak.

**Első hiba:** ha egy fázis testzárlatot kap, a hibaáramnak nincs zárt útja vissza a táplálásba (csak a vezetékek kis kapacitásán át folyik elhanyagolható áram). Ezért az első hiba **nem okozhat lekapcsolást**: a berendezés tovább üzemel. Ez az IT-rendszer legnagyobb előnye.

Az első hibát egy **szigetelésfigyelő** készülék jelzi: folyamatosan méri a vezetők földhöz képesti ellenállását, és hiba esetén fény- és hangjelzést ad. Az első hibát a lehető leghamarabb meg kell keresni és ki kell javítani.

**Második hiba:** ha egy másik fázison is testzárlat keletkezik, a két hiba között zárlati kör alakul ki. Ekkor már **önműködő lekapcsolás** szükséges, ugyanúgy, mint egy TN-rendszerben.

Az IT-rendszert ott alkalmazzák, ahol az áramszünet életveszélyt vagy súlyos kárt okozna, például a **kórházi műtőkben**.

:::safety
- TT-rendszerben a hibavédelem az ÁVK-n és a védőföldelés kis ellenállásán múlik. ÁVK nélkül, vagy túl nagy földelési ellenállással a testek tartósan életveszélyes feszültségen maradhatnak, miközben a biztosíték nem old ki.
- IT-rendszerben az első hiba után a berendezés tovább üzemel, de a második hiba már zárlatot okoz. A szigetelésfigyelő jelzését soha ne hagyd figyelmen kívül.
- Bármelyik rendszerben a hibakeresés és a javítás csak feszültségmentesített berendezésen végezhető.
:::

:::mistake
Gyakori hiba azt gondolni, hogy a TT-rendszerben a „földelés” elég a védelemhez. A példában a jól megépített, 20 Ω-os földelés mellett is 210 V marad a testen. A földelés csak az ÁVK-val együtt véd.
:::

:::exam
A vizsgán kérdés lehet a TT- és IT-rendszer felépítése, az, hogy miért kell TT-rendszerben ÁVK, és mi a szigetelésfigyelő szerepe.
:::

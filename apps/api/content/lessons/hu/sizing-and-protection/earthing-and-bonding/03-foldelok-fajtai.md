---
title: Földelők fajtái
summary: A rúdföldelő, a szalagföldelő és az alapföldelő felépítése és alkalmazása, és mitől függ a földelési ellenállás.
verify:
  - "Rúdföldelő: függőlegesen a talajba vert cső vagy köracél; mélyföldelő nedves talajban legalább 9 m mélységig – de.wikipedia: Erder (Elektroinstallation)"
  - "Felületi (szalag)földelő: kis mélységben, legalább 0,5 m-en, a felszínnel párhuzamosan fektetve; a szalagot élére állítva ássák be; vízszintes földelő lehetőleg gyűrűs kialakítású – de.wikipedia: Erder (Elektroinstallation)"
  - "Alapföldelő: az alap betonjába ágyazott gyűrűs földelő, lehetőleg zárt gyűrűként a körítő alapokban, adott esetben a betonvassal összekötve; tűzihorganyzott acélszalag vagy köracél; legnagyobb hurokméret 20 m × 20 m, villámvédelemmel 10 m × 10 m – de.wikipedia: Fundamenterder"
  - "A földelési ellenállás a talaj fajlagos ellenállásától (talajfajta, állapot, nedvességtartalom) és a földelő méreteitől, elrendezésétől függ; a nedvességtartalom ingadozása miatt csak mérsékelt pontossággal számítható – de.wikipedia: Erder (Elektroinstallation); de.wikipedia: Erdung"
  - "TT-rendszer: R_A · IΔn ≤ 50 V – lásd supply-systems/03"
  - "HIÁNYZIK: a földelők anyagára és legkisebb méreteire vonatkozó hazai előírás – MSZ HD 60364-5-54, 542.2; MSZ EN 62561-2"
---

:::goals
- Ismered a rúd-, a szalag- és az alapföldelő felépítését.
- Tudod, melyik földelőt mikor alkalmazzák.
- Megérted, mitől függ a földelési ellenállás.
- Tudod, miért változik a földelési ellenállás az év során.
:::

## Mitől jó egy földelő?

A földelő feladata, hogy az áramot **kis ellenálláson** át vezesse a talajba. A földelő és a távoli föld közötti ellenállás a **földelési ellenállás** (szétterjedési ellenállás). Minél kisebb, annál jobb a földelés.

A földelési ellenállás két dologtól függ:

- **a talaj fajlagos ellenállásától:** ez a talaj fajtájától (agyag, homok, kavics, szikla), állapotától és főként **nedvességtartalmától** függ. A nedves, agyagos talaj jól vezet, a száraz homok és a kőzet rosszul,
- **a földelő méreteitől és elrendezésétől:** a hosszabb, mélyebbre jutó, nagyobb felületen érintkező földelőnek kisebb az ellenállása.

Mivel a talaj nedvessége az évszakokkal és az időjárással változik, a földelési ellenállás is ingadozik, és csak mérsékelt pontossággal számítható előre. Ezért a földelési ellenállást **meg kell mérni**, és a mért értékkel kell a védelmet ellenőrizni.

## Rúdföldelő

A **rúdföldelő** függőlegesen a talajba vert cső vagy köracél rúd. Előnye, hogy kis helyen elhelyezhető, és a mélyebb, általában nedvesebb talajrétegeket is eléri, ezért ellenállása az év során kevésbé ingadozik.

A **mélyföldelő** a rúdföldelő hosszabb változata, toldható rudakból: nedves talajban legalább 9 m mélyre, egyes esetekben 30 m-ig verik le. Ott használják, ahol a felső talajréteg rossz vezető, és kis földelési ellenállás kell.

Ha egy rúd nem ad elég kis ellenállást, több rudat vernek le egymástól távolabb, és összekötik őket.

## Szalagföldelő

A **szalagföldelő** (felületi földelő) a felszínnel párhuzamosan, kis mélységben, **legalább 0,5 m** mélyen fektetett acélszalag vagy köracél. A szalagot **élére állítva** ássák be, mert így jobban érintkezik a talajjal.

A vízszintesen fektetett földelőt lehetőség szerint **gyűrű** alakban, az épület körül zárt hurokként kell kialakítani: a gyűrűs földelő az épület körül egyenletesebb potenciált ad.

A felszínhez közeli földelő ellenállását jobban befolyásolja a talaj kiszáradása, mint a mélyre vert rúdét.

## Alapföldelő

Az **alapföldelő** az épület alapjának betonjába ágyazott gyűrűs földelő. Lehetőleg **zárt gyűrűként** vezetik a körítő alapokban, és adott esetben összekötik a betonvassal. Anyaga tűzihorganyzott acélszalag vagy köracél.

Nagy alapterületű épületnél a gyűrűt belső összekötésekkel hálóvá bővítik: a háló egy hurka legfeljebb **20 m × 20 m** lehet, villámvédelemmel együtt tervezett épületnél legfeljebb **10 m × 10 m**.

Az alapföldelő előnye, hogy az épülettel együtt, külön földmunka nélkül készül, nagy felületen érintkezik a talajjal, és a beton védi a korróziótól. Új épületeknél ez a jellemző megoldás. Utólag viszont nem lehet elkészíteni: ha az alap öntésekor kimarad, csak rúd- vagy szalagföldelővel pótolható.

A földelőből a fő földelősínig **csatlakozó vezetéket** (földelőzászlót) vezetnek ki, amelyhez a földelővezető csatlakozik.

:::example
Egy TT-rendszerű hétvégi házban 30 mA-es ÁVK védi az áramköröket. A frissen levert rúdföldelő mért ellenállása 120 Ω. Megfelel-e?

1. A megengedett legnagyobb érték: R_A ≤ 50 V / 0,03 A ≈ 1667 Ω.
2. 120 Ω ≤ 1667 Ω, a feltétel teljesül.
3. Mivel a földelési ellenállás évszakonként változik, a mérést száraz időszakban célszerű megismételni.
:::

:::safety
- Földelőt leverni csak úgy szabad, hogy előtte tisztázod a földben futó kábelek és csővezetékek helyét: egy levert rúd átütheti a földkábelt vagy a gázvezetéket.
- A földelővezetőt üzemelő berendezésen nem szabad lekötni: előbb feszültségmentesíts.
:::

:::mistake
Gyakori hiba azt hinni, hogy egy egyszer megmért földelési ellenállás „örökre jó”. A talaj kiszáradása és a földelő korróziója növeli az ellenállást, ezért a földelést időszakosan ellenőrizni kell.
:::

:::exam
A vizsgán kérdés lehet a földelők fajtái, az alapföldelő előnye, és hogy mitől függ a földelési ellenállás.
:::

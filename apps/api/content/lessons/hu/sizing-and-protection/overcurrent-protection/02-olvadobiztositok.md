---
title: Olvadóbiztosítók
summary: Hogyan működik az olvadóbiztosító, milyen fajtái vannak (Diazed, Neozed, késes), mit jelent a gG jelölés, és hogyan ismered fel a névleges áramát a jelzőfej színéről.
verify:
  - "gG (korábban gL) üzemi osztály: teljes tartományú vezetékvédelem, „trägflink” (kis túláramnál lomha, nagy zárlati áramnál gyors); ökölszabály: 5 · Iₙ-nél 5 s-on, 10 · Iₙ-nél 0,2 s-on belül old – de.wikipedia: Schmelzsicherung"
  - "D-rendszer (Diazed) méretei és névleges áramai: DII 2–25 (35) A, DIII 35–63 A, DIV 80–100 A, DV 125–200 A; D0-rendszer (Neozed): D01 2–16 A, D02 20–63 A, D03 80–100 A – de.wikipedia: Schmelzsicherung"
  - "Illesztőelem (illesztőcsavar, illesztőgyűrű) megakadályozza a nagyobb névleges áramú betét behelyezését – de.wikipedia: Schmelzsicherung"
  - "Jelzőfej színkódja: 2 A rózsaszín, 4 A barna, 6 A zöld, 10 A piros, 16 A szürke, 20 A kék, 25 A sárga, 32 A lila, 35 A fekete, 50 A fehér, 63 A réz, 80 A ezüst, 100 A piros – de.wikipedia: Schmelzsicherung"
  - "Késes (NH) biztosítók zárlati megszakítóképessége legfeljebb 120 kA – de.wikipedia: Schmelzsicherung"
  - "HIÁNYZIK: a Diazed és Neozed betétek zárlati megszakítóképessége (kA) – MSZ EN 60269"
---

:::goals
- Megérted az olvadóbiztosító működési elvét.
- Meg tudod különböztetni a Diazed, a Neozed és a késes biztosítót.
- Tudod, mit jelent a gG üzemi osztály.
- Felismered a betét névleges áramát a jelzőfej színéről, és tudod, mire való az illesztőelem.
:::

## Működési elv

Az olvadóbiztosító a védett áramkörrel sorba kötött **olvadószálat** tartalmaz. A szál keresztmetszetét úgy méretezik, hogy a névleges áramot tartósan elviselje, nagyobb áramnál pedig felmelegedjen és **elolvadjon**, így megszakítsa az áramkört.

- **Túlterheléskor** a szál lassan melegszik, és csak hosszabb idő után olvad el.
- **Zárlatkor** a szál a hatalmas áramtól szinte azonnal elolvad.

Az olvadáskor keletkező ívet a betétet kitöltő **kvarchomok** oltja el: elnyeli az ív hőjét, és az elolvadt fém gőzével üvegszerű, szigetelő anyagot képez.

A biztosítóbetét **egyszer használatos**: kiolvadás után ki kell cserélni egy **ugyanakkora** névleges áramú, ép betétre. Kiolvadt betétet javítani, áthidalni („megfoltozni”) tilos.

## A gG üzemi osztály

A biztosítóbetéteket üzemi osztály szerint jelölik. Az épületvillamosságban a vezetékvédelemre a **gG** (korábbi jelölése gL) osztályú betét használatos:

- **g:** teljes tartományú védelem, a túlterhelést és a zárlatot is lekapcsolja,
- **G:** általános célú (vezetékvédelem).

A gG betét kis túláramnál **lomha**, nagy zárlati áramnál **gyors**. Ökölszabályként: a névleges áram ötszörösénél 5 s-on belül, tízszeresénél 0,2 s-on belül kiold.

## Fajták

**Diazed (D-rendszer):** csavaros biztosító. A betétet porcelán **biztosítófejjel** csavarod a foglalatba. Méretei:

- DII: 2–25 A (35 A),
- DIII: 35–63 A,
- DIV: 80–100 A,
- DV: 125–200 A.

**Neozed (D0-rendszer):** a Diazed kisebb, helytakarékos változata. Elosztószekrényekben, sínre szerelhető biztosítóaljzatokban használják. Méretei:

- D01: 2–16 A,
- D02: 20–63 A,
- D03: 80–100 A.

**Késes biztosító (NH):** nagy áramú biztosító, késes érintkezőkkel. A transzformátorállomásokban, a csatlakozó- és főelosztó berendezésekben használják. Zárlati megszakítóképessége elérheti a **120 kA**-t. A betétet csak **szigetelt kezelőfogantyúval** szabad kivenni és behelyezni.

## Jelzőfej és illesztőelem

A Diazed és Neozed betét végén színes **jelzőfej** (kiolvadásjelző) van. Ha a betét kiolvadt, a jelzőfej kiesik vagy elszíneződik, így a biztosítófej üvegablakán át látszik, melyik betét olvadt ki. A jelzőfej színe a **névleges áramot** is mutatja:

- 2 A rózsaszín, 4 A barna, 6 A zöld,
- **10 A piros, 16 A szürke, 20 A kék, 25 A sárga,**
- 32 A lila, 35 A fekete, 50 A fehér, 63 A réz, 80 A ezüst, 100 A piros.

A foglalat alján **illesztőelem** (Diazednél illesztőcsavar, Neozednél illesztőgyűrű) van, ugyanazzal a színkóddal. Az illesztőelem belső átmérője csak a beállított vagy annál kisebb névleges áramú betétet engedi behelyezni. Ezzel akadályozza meg, hogy valaki egy 16 A-es vezetékre 25 A-es betétet tegyen.

:::example
Egy régi lakáselosztóban három Diazed biztosító van. A jelzőfejek színe: piros, szürke, sárga. Mekkora a betétek névleges árama?

1. Piros: 10 A.
2. Szürke: 16 A.
3. Sárga: 25 A.
:::

:::safety
- Biztosítóbetétet terhelés alatt ne cserélj: előbb kapcsold le a terhelést vagy a főkapcsolót, mert a betét kihúzásakor ív keletkezhet.
- Kiolvadt betétet soha ne hidald át huzallal vagy más fémmel. A vezeték ilyenkor védelem nélkül marad, és zárlatkor kigyulladhat.
- Az illesztőelemet nem szabad nagyobbra cserélni, mint amekkorát a vezeték keresztmetszete megenged.
- Késes biztosítót csak szigetelt kezelőfogantyúval, védőkesztyűben és arcvédőben, az arra jogosult személy cserélhet.
:::

:::mistake
Gyakori hiba, hogy a kiolvadt betétet nagyobbra cserélik, „mert a kisebb mindig kiold”. A biztosító a **vezetéket** védi: ha rendszeresen kiold, a terhelést kell csökkenteni vagy a hibát kell megkeresni.
:::

:::exam
A vizsgán kérdés lehet a biztosítók fajtái, a jelzőfej színkódja és az illesztőelem feladata.
:::

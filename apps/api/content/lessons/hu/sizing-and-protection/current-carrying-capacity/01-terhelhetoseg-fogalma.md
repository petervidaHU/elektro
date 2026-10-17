---
title: A terhelhetőség fogalma
summary: Miért melegszik a vezeték, mi korlátozza a rajta tartósan átvihető áramot, és mit jelent a terhelhetőség.
verify:
  - "A vezeték melegedése az áram négyzetével arányos (P = I² · R), a szigetelés hőállósága szab határt – fizikai alapismeret"
  - "HIÁNYZIK: az egyes szigetelőanyagok (PVC, térhálós polietilén XLPE) legnagyobb tartós megengedett vezetőhőmérséklete – MSZ HD 60364-5-52"
---

:::goals
- Megérted, miért melegszik a vezeték, ha áram folyik rajta.
- Meg tudod mondani, mi korlátozza a vezeték terhelhetőségét.
- Tudod, mit jelent az I_z jelölés.
:::

## Az áram felmelegíti a vezetéket

Minden vezetőnek van ellenállása. Ha áram folyik rajta, a vezető **melegszik**: a hőteljesítmény

`P = I² · R`

- P: a vezetőben keletkező hőteljesítmény, W,
- I: az áram, A,
- R: a vezető ellenállása, Ω.

Az áram **négyzetesen** számít: kétszer akkora áram négyszer akkora hőt termel. Ezért a túlterhelés gyorsan veszélyessé válik.

## Mi korlátozza a terhelhetőséget?

A vezeték hőmérséklete addig emelkedik, amíg a keletkező hő el nem tud távozni a környezetbe. Ha a hőmérséklet túl magas, a **szigetelés** károsodik: megkeményedik, megreped, elveszti a szigetelőképességét. Ez zárlathoz, tűzhöz vagy áramütéshez vezethet.

A szigetelőanyag mondja meg, mekkora hőmérsékletet bír el tartósan. A terhelhetőséget tehát nem a vezető anyaga (a réz vagy az alumínium nem olvad meg), hanem a **szigetelés hőállósága** határozza meg.

## A terhelhetőség fogalma

A **terhelhetőség** (jele: I_z) az az áram, amelyet a vezeték **tartósan** vihet át úgy, hogy a vezető hőmérséklete nem haladja meg a szigetelés megengedett üzemi hőmérsékletét.

A terhelhetőség nem egyetlen szám a vezetékhez: függ a keresztmetszettől (nagyobb keresztmetszet = nagyobb terhelhetőség), a szigetelő anyagától, és attól, hogyan és hol van lefektetve. Ez utóbbiakról szól a következő lecke. A vezeték kiválasztásakor a terhelő áramnak ezen az értéken belül kell maradnia.

## Mi történik a határ túllépésekor?

Ha a tartós áram nagyobb a terhelhetőségnél, a vezeték melegebb lesz a megengedettnél. Ez nem azonnal látszik: a szigetelés évek alatt öregszik, aztán váratlanul tönkremegy. Ezért nem elég, hogy „a vezeték nem ég el”: a terhelhetőséget **be kell tartani**, és a túláramvédelemnek kell biztosítania, hogy a vezeték tartósan ne terhelődjön ennél jobban.

:::safety
Soha ne cserélj ki egy kismegszakítót nagyobbra csak azért, mert lekapcsol. A lekapcsolás jelzi, hogy a vezeték túl van terhelve; a nagyobb kismegszakító ezt a jelzést szünteti meg, a vezeték viszont ugyanúgy melegszik. A vezeték terhelhetősége és a túláramvédelem összetartozik.
:::

:::mistake
„Ha a vezeték nem melegszik kézzel érezhetően, nincs túlterhelve.” Téves: a szigetelés a megengedett határ felett is öregedhet úgy, hogy a vezeték kívülről nem tűnik melegnek, különösen vezetékcsatornában vagy szigetelt falban, ahol a hő nem tud eltávozni.
:::

:::exam
A III. részben a terhelhetőséget táblázatból olvasod ki. Az I_z jelölést és azt, hogy mi korlátozza, a IV. rész elméleti kérdései is kérdezhetik.
:::

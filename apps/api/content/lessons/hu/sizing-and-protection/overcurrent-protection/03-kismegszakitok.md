---
title: Kismegszakítók
summary: A kismegszakító termikus és elektromágneses kioldója, a B, C és D jelleggörbe jelentése, a névleges áram és a zárlati megszakítóképesség, és hogyan választasz kismegszakítót.
verify:
  - "Hőbimetálos (termikus) kioldó a kisebb, tartós túláramra, elektromágneses kioldó a nagy zárlati áramra azonnal – Wikipedia: Circuit breaker"
  - "Pillanatkioldási tartományok: B 3–5 · Iₙ, C 5–10 · Iₙ, D 10–20 · Iₙ – Wikipedia: Circuit breaker"
  - "Szokásos névleges áramok: 6, 10, 13, 16, 20, 25, 32, 40, 50, 63 A – Wikipedia: Circuit breaker; de.wikipedia: Leitungsschutzschalter"
  - "Lakó- és irodahelyiségekben általában B jelleggörbe; nagy bekapcsolási áramú fogyasztóhoz C, mert B-nél indításkor téves kioldás lehet – de.wikipedia: Leitungsschutzschalter"
  - "Zs · Ia ≤ U₀ – MEE VÉT kézikönyv, 353. o.; példák (B16: 48–80 A; Zs ≤ 2,875 Ω) – számított értékek"
  - "HIÁNYZIK: a kismegszakítók szabványos zárlati megszakítóképességei (Icn, pl. 6 kA, 10 kA) és a termikus kioldó vizsgálóáramai (1,13 · Iₙ / 1,45 · Iₙ) – MSZ EN 60898-1"
  - "HIÁNYZIK: a lakossági csatlakozásoknál előírt legkisebb zárlati megszakítóképesség – szolgáltatói műszaki előírás"
---

:::goals
- Megérted a kismegszakító termikus és elektromágneses kioldójának működését.
- Tudod, mit jelent a B, C és D jelleggörbe, és melyiket mikor kell választani.
- Ki tudod olvasni a kismegszakító feliratából a névleges áramot és a jelleggörbét.
- Ki tudod számítani, mekkora zárlati áram kell a gyors kioldáshoz.
:::

## Felépítés és működés

A **kismegszakító** a vezetékek túlterhelés és zárlat elleni védelmére szolgáló, újra bekapcsolható készülék. Az olvadóbiztosítóval szemben kioldás után nem kell cserélni: a hiba megszüntetése után a kapcsolókarral visszakapcsolható. Két, egymástól független kioldó szerkezete van:

- **Termikus kioldó (hőbimetál):** két, eltérő hőtágulású fémből összehengerelt lemez, amelyen a kör árama átfolyik. Túlterheléskor a lemez felmelegszik, elhajlik, és bizonyos idő után kioldja a kapcsolót. Minél nagyobb a túláram, annál gyorsabban old ki.
- **Elektromágneses (gyors) kioldó:** egy tekercs, amelyen a kör árama átfolyik. Zárlati áramnál a tekercs mágneses tere egy vasmagot ránt be, amely **késleltetés nélkül**, a másodperc törtrésze alatt kioldja a kapcsolót.

A kapcsoláskor keletkező ívet az **ívoltó kamra** fémlemezei több kis részívre bontják és lehűtik.

[Ábra: kismegszakító metszete. Jelölve a kapcsolókar, a hőbimetál, az elektromágneses kioldó tekercse, az érintkezők és az ívoltó kamra.]

## A jelleggörbe: B, C, D

A kismegszakító feliratán a névleges áram előtt egy betű áll, például **B16** vagy **C20**. A betű a **jelleggörbét** jelenti: azt, hogy a névleges áram hányszorosánál működik az elektromágneses gyorskioldó.

- **B:** 3–5 · Iₙ. Lakó- és irodahelyiségek általános áramköreihez (világítás, dugaszolóaljzatok).
- **C:** 5–10 · Iₙ. Nagyobb bekapcsolási áramú fogyasztókhoz (motorok, nagyobb transzformátorok, sok LED-meghajtó egy körön), ahol a B jelleggörbe indításkor tévesen kioldana.
- **D:** 10–20 · Iₙ. Nagyon nagy bekapcsolási áramú fogyasztókhoz (nagy transzformátorok, nehézüzemű motorok).

A tartomány alsó határánál a gyorskioldó még biztosan **nem** old ki, a felső határánál biztosan **kiold**.

:::example
Egy B16-os kismegszakító esetén mekkora áramnál működik a gyorskioldó?

1. Alsó határ: 3 · 16 A = 48 A, ennél még nem old ki gyorsan.
2. Felső határ: 5 · 16 A = 80 A, ennél biztosan azonnal kiold.
3. Ugyanez C16-nál: 80–160 A, D16-nál: 160–320 A.
:::


## Névleges áram és felirat

A kismegszakító **névleges árama (Iₙ)** az az áram, amelyet tartósan, kioldás nélkül vezet. A szokásos értékek: **6, 10, 13, 16, 20, 25, 32, 40, 50, 63 A**.

A feliraton a névleges áram és a jelleggörbe mellett szerepel a **zárlati megszakítóképesség** is, amperben, egy keretben (például egy négyszögbe írt szám). Ez a legnagyobb zárlati áram, amelyet a kismegszakító még biztonságosan meg tud szakítani. A beépítés helyén fellépő legnagyobb zárlati áram nem lehet nagyobb ennél, különben a kismegszakító zárlatkor szétéghet vagy az érintkezői összehegedhetnek.

## Gyors kioldás és hurokimpedancia

A hibavédelem akkor működik, ha testzárlatkor a gyorskioldó **biztosan** működik. Ehhez a zárlati áramnak el kell érnie a jelleggörbe felső határát (`I_a`). Az áramot a hurok impedanciája korlátozza, ezért a feltétel:

`Z_s · I_a ≤ U₀`, azaz `Z_s ≤ U₀ / I_a`

:::example
Mekkora lehet legfeljebb a hurokimpedancia egy B16-os kismegszakítóval védett 230 V-os áramkörben, hogy a gyorskioldó biztosan működjön?

1. I_a = 5 · 16 A = 80 A.
2. Z_s ≤ 230 V / 80 A = 2,875 Ω.
3. Ha ugyanezt a kört C16-tal védenék: I_a = 10 · 16 A = 160 A, Z_s ≤ 230 V / 160 A ≈ 1,44 Ω.
:::

Látható, hogy a C és a D jelleggörbéhez **kisebb** hurokimpedancia, tehát rövidebb vagy vastagabb vezeték kell. Ezért nem szabad indokolatlanul C vagy D jelleggörbét választani.

:::safety
- Kismegszakítót cserélni vagy bekötni csak feszültségmentesített elosztóban szabad, az öt biztonsági művelet után. A kismegszakító lekapcsolása nem feszültségmentesítés: a betáplálási oldalán továbbra is feszültség van.
- Kioldott kismegszakítót ne kapcsolj vissza többször egymás után: előbb keresd meg a kioldás okát.
- Kismegszakítót csak a vezetékhez illő névleges árammal és jelleggörbével szabad cserélni. Nagyobb névleges áramú vagy más jelleggörbéjű készülék a vezetéket védelem nélkül hagyhatja.
:::

:::mistake
Gyakori hiba, hogy egy gyakran kioldó B16-ost C16-osra cserélnek, „mert az erősebb”. A C16 túlterhelésre ugyanúgy véd, de testzárlatkor csak kétszer akkora áramnál old ki gyorsan, ezért a kör hurokimpedanciáját újra ellenőrizni kell.
:::

:::exam
A vizsgán kérdés lehet a termikus és az elektromágneses kioldó feladata, a B, C és D jelleggörbe jelentése, és a gyorskioldáshoz szükséges legnagyobb hurokimpedancia kiszámítása.
:::

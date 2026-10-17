---
title: Túlterhelés és zárlat
summary: A túláram két fajtája, a keletkezésük és a hatásuk, és az, hogy a bekapcsolási áramlökés miért nem hiba.
verify:
  - "A túlterhelés és a zárlat fogalma; a zárlati áram I_k = U₀ / Z_s (Ohm törvénye a hibahurokra) – fizikai alapismeret"
  - "A bekapcsolási áramlökés (motor, transzformátor, izzólámpa) rövid ideig tart, és a védelemnek nem szabad kioldania rajta – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
---

:::goals
- Meg tudod különböztetni a túlterhelést és a zárlatot.
- Meg tudod magyarázni, mit okoz a túláram a vezetékben.
- Érted, mi a bekapcsolási áramlökés, és miért nem hiba.
:::

## Mi a túláram?

**Túláramnak** nevezzük azt az áramot, amely nagyobb, mint a vezeték vagy a készülék névleges árama. Két fajtája van: a túlterhelés és a zárlat. A védelem szempontjából a kettő másképp viselkedik, ezért érdemes külön megérteni.

## Túlterhelés

**Túlterhelésről** akkor beszélünk, ha az áramkör ép, de a vezetéken a terhelhetőségénél **valamivel nagyobb** áram folyik. Például egy konnektorra túl sok fogyasztót dugnak, vagy egy motor mechanikusan elakad.

A túlterhelés nem azonnal veszélyes. Az áram a névlegesnél nagyobb, de nem nagyságrendekkel, ezért a vezeték **lassan melegszik**. A veszély időben épül fel: ha a túlterhelés elég sokáig tart, a szigetelés károsodik. A túlterhelés ellen az védekezik, hogy a védelem **idővel arányosan** old ki: kis túlterhelésnél hosszabb idő után, nagyobbnál hamarabb.

## Zárlat

**Zárlat** akkor keletkezik, ha két különböző potenciálú vezető (például fázis és nulla, vagy két fázis) **gyakorlatilag ellenállás nélkül** érintkezik. A zárlati áramot csak a hurok kis impedanciája korlátozza:

`I_k = U₀ / Z_s`

- I_k: a zárlati áram, A,
- U₀: a fázisfeszültség, V,
- Z_s: a hibahurok impedanciája, Ω.

Mivel a Z_s nagyon kicsi, az áram nagyságrendekkel nagyobb a névlegesnél. A hőteljesítmény az árammal négyzetesen nő (`P = I² · R`), ezért a zárlat a vezetéket **másodpercek törtrésze alatt** károsíthatja, ívet gyújthat, tüzet okozhat, és hatalmas mechanikai erőket fejt ki a vezetőkre. Zárlatnál ezért a védelemnek **azonnal**, a lehető leggyorsabban kell lekapcsolnia.

## Összehasonlítás

- **Túlterhelés:** az áram kicsit nagyobb a megengedettnél, a hatás lassan alakul ki, a védelem késleltetve old ki.
- **Zárlat:** az áram a névleges sokszorosa, a hatás azonnali, a védelemnek azonnal kell kioldania.

Ezért kétféle kioldó kell: egy **időfüggő** a túlterhelésre és egy **azonnali** a zárlatra. A kismegszakító mindkettőt tartalmazza.

## Bekapcsolási áramlökés

Egyes fogyasztók a bekapcsolás pillanatában **rövid ideig** a névlegesnél jóval nagyobb áramot vesznek fel. Ilyen a motor (az indításkor még áll a forgórész), a transzformátor (a bekapcsoláskor a mágnesezés) és az izzólámpa (hidegen kisebb az ellenállása).

Ez az **áramlökés** nem hiba, és néhány ezredmásodperctől legfeljebb néhány másodpercig tart. A védelmet úgy kell megválasztani, hogy az áramlökésen **ne** oldjon ki, de a valódi zárlatot mégis lekapcsolja. Ez a kioldási jelleggörbe feladata, amelyről a kismegszakítók leckéje szól.

:::safety
A zárlat elleni védelem **életvédelmi szempontból is fontos**: a zárlati áram hőt és ívet okoz, amely égési sérülést és tüzet idézhet elő. Hibakeresésnél soha ne zárd rövidre a védelmet, és ne hidald át a biztosítót.
:::

:::mistake
„A zárlat és a túlterhelés ugyanaz, csak az áram mérete más.” Nem csak a mérete: a túlterhelés ép áramkörben, a vezeték terhelhetőségének túllépésével jön létre, a zárlat pedig hibás áramkörben, ellenállás nélküli összekötéssel. A védelmük is más elven működik.
:::

:::exam
A vizsga IV. része kérdezheti a két túláram megkülönböztetését, és azt, melyik ellen milyen kioldó véd.
:::

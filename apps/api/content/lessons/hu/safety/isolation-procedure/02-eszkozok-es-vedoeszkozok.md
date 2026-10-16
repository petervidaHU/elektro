---
title: A feszültségmentesítés eszközei
summary: A feszültségkémlelő, a földelő-rövidrezáró, a lakatolás és a „Bekapcsolni tilos!” tábla helyes használata, valamint az egyéni védőeszközök.
verify:
  - "Feszültséget csak feszültségkémlelővel szabad kémlelni, egyéb eszközzel tilos; működőképességét kémlelés előtt és után ellenőrizni kell (próbagombbal vagy ismert feszültségű helyen) – ELMŰ-ÉMÁSZ 5 biztonsági szabály (tomintex.hu); MSZ 1585:2016 (feszultsegmentesites.hu)"
  - "Kisfeszültségen próbalámpával vagy 20 mA-nél nagyobb fogyasztású, szabványos, kétsarkú feszültségvizsgálóval kell kémlelni; csak hangjelzést adó készülék nem elegendő; EN 61243 szabványsorozat – MSZ 1585:2016 (feszultsegmentesites.hu)"
  - "Az egysarkú fázisceruza és az érintés nélküli feszültségjelző feszültségmentesség igazolására nem használható – feszultsegmentesites.hu (gyakorlati megjegyzés, nem szabványszöveg)"
  - "Földelő-rövidrezáró: először a földelési ponthoz, utána az aktív részhez; eltávolítás fordított sorrendben; EN 61219 / EN 61230 – MSZ 1585:2016 (feszultsegmentesites.hu, tomintex.hu)"
  - "„Bekapcsolni tilos!” figyelmeztető tábla használata – MSZ 1585:2016 (feszultsegmentesites.hu, tomintex.hu)"
  - "HIÁNYZIK: a szigetelt kéziszerszámok jelölése (MSZ EN 60900) és a szigetelő védőeszközök időszakos vizsgálati ideje"
---

:::goals
- Tudod, mivel szabad és mivel tilos a feszültség nélküli állapotot ellenőrizni.
- Hibátlanul végre tudod hajtani a feszültségkémlelést: próba előtte, kémlelés, próba utána.
- Ismered a földelő-rövidrezáró fel- és leszerelésének sorrendjét, és tudod, miért ez a sorrend.
- Fel tudod sorolni a visszakapcsolás elleni biztosítás eszközeit és az egyéni védőeszközöket.
:::

## A feszültségkémlelő

A feszültség nélküli állapot ellenőrzése (a 3. lépés) **kizárólag feszültségkémlelővel** történhet. Más eszközzel feszültséget kémlelni **tilos**.

Kisfeszültségen a kémlelést **próbalámpával** vagy **20 mA-nél nagyobb fogyasztású, szabványos, kétpólusú (kétsarkú) feszültségvizsgálóval** végzed. A készüléknek meg kell felelnie az EN 61243 szabványsorozatnak. A kis belső fogyasztás miatt a kétpólusú vizsgáló nem mutat „szellemfeszültséget”: azt a kis, ártalmatlan feszültséget, amelyet egy szomszédos vezeték kapacitív úton kelt egy lekapcsolt vezetőn.

**Nem használható** a feszültség nélküli állapot ellenőrzésére:

- az **egysarkú fázisceruza** (érintős csavarhúzó): a jelzése attól függ, hogyan állsz, milyen a cipőd és a padló, ezért megtévesztő,
- az **érintés nélküli feszültségjelző**: tájékozódásra sem megbízható,
- a **multiméter**: nem feszültségkémlelő. Rossz méréshatáron vagy üzemmódban 0 V-ot mutathat feszültség alatt álló vezetőn is,
- a **csak hangjelzést adó** készülék: zajos környezetben nem hallod meg.

**A kémlelés menete:**

1. **Próba előtte.** Közvetlenül a kémlelés előtt ellenőrizd a működőképességet: nyomd meg a próbagombot, vagy végezz próbakémlelést egy ismerten feszültség alatt álló helyen.
2. **Kémlelés a munkahelyen.** Minden fázison és pólusón: a fázisok között, és minden üzemi vezető és a föld (PE) között. Egyfázisú körnél: L–N, L–PE, N–PE. Háromfázisú körnél: L1–L2, L2–L3, L1–L3, valamint minden fázis és az N, illetve a PE között, végül N–PE.
3. **Próba utána.** Közvetlenül utána ismét próbáld ki. Ha a kémlelő közben elromlott, a „nincs feszültség” jelzés hamis volt.

:::mistake
„A kémlelő nem jelez, tehát nincs feszültség.” Ez csak akkor igaz, ha a kémlelőt közvetlenül előtte és utána is kipróbáltad, és működött. Egy lemerült elem vagy egy szakadt mérőzsinór halálos tévedéshez vezet.
:::

## A földelő-rövidrezáró eszköz

A **földelő-rövidrezáró** szigetelt vezetékekből és szorítókból álló eszköz, amellyel a leválasztott vezetőket egymással és a földdel összekötöd (a 4. lépés). Az EN 61230 (hordozható eszközök), illetve EN 61219 szabványnak megfelelő eszközt használsz.

**Felszerelés:**

1. Ellenőrizd az eszköz épségét: vezetékek, szorítók, csatlakozók.
2. **Először a földelési ponthoz** csatlakoztasd.
3. Csak ezután csatlakoztasd sorban a vezetőkhöz (aktív részekhez), a 3. lépés ellenőrzése után.

**Eltávolítás:** fordított sorrendben. **Előbb az aktív részekről**, utoljára a földelési pontról.

**Miért így?** Ha a vezetőn váratlanul mégis feszültség van, a már földelt eszköz azonnal zárlatot okoz, és a védelem lekapcsol. Ha előbb az aktív részre csatlakoznál, a kezedben lévő eszköz és annak vezetéke kerülne feszültség alá.

Ha a berendezésben beépített földelőkapcsoló van, a földelést annak működtetésével kezded, és csak utána teszed fel a hordozható eszközöket.

## A visszakapcsolás elleni biztosítás eszközei

- **Lakat:** a kapcsoló működtető szerkezetét kikapcsolt helyzetben rögzíti. Kismegszakítóra **lakatolóadaptert** teszel. A kulcs annál marad, aki a munkát végzi. Ha többen dolgoztok, mindenki a saját lakatját teszi fel, így csak akkor lehet visszakapcsolni, ha mindenki levette a magáét.
- **„Bekapcsolni tilos!” tábla:** a leválasztó készülékre vagy közvetlenül mellé kerül. A tábla önmagában nem akadályozza meg a visszakapcsolást, ezért a lakat mellé tedd, ne helyette.
- **Biztosítóbetét elvétele:** az olvadóbiztosító betétjét kiveszed, és magadnál tartod vagy elzárod.
- **Távműködtetésű készülék:** helyi működtetésre kell átállítani, és arra is „Bekapcsolni tilos!” tábla kerül.

## Egyéni védőeszközök

Az egyéni védőeszköz nem helyettesíti a feszültségmentesítést, de csökkenti a sérülést, ha valami mégis rosszul megy.

- **Szigetelt kéziszerszámok:** csavarhúzó, fogó, kés, szabványos szigeteléssel. Sérült szigetelésű szerszámot nem használsz.
- **Villamos szigetelő kesztyű:** használat előtt ellenőrzöd, hogy nincs-e rajta szakadás vagy lyuk.
- **Arcvédő vagy védőszemüveg:** a zárlati ív fénye és a fröccsenő olvadt fém ellen.
- **Íválló munkaruha** és **szigetelő talpú védőcipő**.
- **Védősisak**, ha fejsérülés veszélye áll fenn.

Minden védőeszközt használat előtt szemrevételezéssel ellenőrzöl.

:::safety
A feszültségkémlelőt minden kémlelés előtt és után kipróbálod. A földelő-rövidrezárót mindig a földelési ponton kezded felszerelni, és ott fejezed be a leszerelését. A lakatod kulcsa a munka végéig nálad marad.
:::

:::exam
A vizsga IV. részében előfordul, hogy fel kell sorolnod a feszültségmentesítés eszközeit, le kell írnod a feszültségkémlelés helyes menetét, vagy meg kell adnod a földelő-rövidrezáró felszerelésének sorrendjét.
:::

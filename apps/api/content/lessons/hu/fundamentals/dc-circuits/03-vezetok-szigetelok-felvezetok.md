---
title: Vezetők, szigetelők, félvezetők
summary: Hogyan csoportosítjuk az anyagokat villamos szempontból, mi a fajlagos ellenállás nagyságrendje az egyes csoportokban, és miért a szigetelés a biztonság alapja.
verify:
  - "Fajlagos ellenállások 20 °C-on: ezüst 1,59·10⁻⁸ Ω·m, lágyított réz 1,72·10⁻⁸ Ω·m, alumínium 2,82·10⁻⁸ Ω·m, vas 9,70·10⁻⁸ Ω·m; üveg 10¹¹–10¹⁵ Ω·m, keménygumi 10¹³ Ω·m, PTFE 10²³–10²⁵ Ω·m – Wikipedia: Electrical resistivity and conductivity (20 °C-os táblázat)"
  - "Az alumínium vezetőképessége kb. 61 %-a az azonos keresztmetszetű rézének – Wikipedia: Aluminum building wiring"
---

:::goals
- Meg tudod magyarázni, miért vezet jól a fém, és miért nem a szigetelő.
- Ismered a vezetők, félvezetők és szigetelők fajlagos ellenállásának nagyságrendjét.
- Példákat tudsz mondani mindhárom csoportra és a felhasználásukra.
- Fel tudod sorolni, mi rontja a szigetelést a gyakorlatban.
:::

## Miért vezet az egyik anyag, és miért nem a másik?

Az áram a szabad töltéshordozók mozgása. Hogy egy anyag mennyire vezet, azt az határozza meg, **hány szabadon mozgó töltéshordozó** van benne.

- A **fémekben** a külső elektronok nem kötődnek egy-egy atomhoz, hanem az egész kristályban szabadon mozognak. Ezért a fémek **jó vezetők**.
- A **szigetelőkben** az elektronok erősen kötődnek az atomokhoz. Szabad töltéshordozó alig van, ezért gyakorlatilag nem folyik áram.
- A **félvezetőkben** szobahőmérsékleten kevés a szabad töltéshordozó, de a számuk hővel, fénnyel vagy szennyező anyagok adagolásával (**adalékolás**) nagymértékben növelhető.

Az anyagok vezetőképességét a **fajlagos ellenállással** (ρ) hasonlítjuk össze: ez az anyag 1 m hosszú, 1 m² (a gyakorlatban 1 mm²) keresztmetszetű darabjának ellenállása. A vezetékszámításban az Ω·mm²/m egységet használjuk. Átváltás: `1 Ω·mm²/m = 10⁻⁶ Ω·m`.

## Vezetők

A villamos vezetékek anyaga szinte mindig **réz** vagy **alumínium**. Fajlagos ellenállásuk 20 °C-on:

- **ezüst:** 0,0159 Ω·mm²/m (a legjobb vezető, de drága: érintkezők bevonatára használják),
- **réz:** 0,0172 Ω·mm²/m (a vezetékek, kábelek, tekercsek fő anyaga),
- **alumínium:** 0,0282 Ω·mm²/m (szabadvezetékek, nagyobb keresztmetszetű kábelek),
- **vas:** 0,097 Ω·mm²/m (a rézénél kb. hatszor nagyobb; vezetékként nem, szerkezeti anyagként használjuk).

Az alumínium vezetőképessége a rézének kb. 61 %-a. Azonos ellenálláshoz tehát nagyobb keresztmetszetű alumíniumvezető kell, viszont az alumínium sokkal könnyebb és olcsóbb.

A vezetékek számításánál a tananyag az üzemi hőmérsékletre vonatkozó értékekkel számol (réz 0,0225, alumínium 0,036 Ω·mm²/m). Ennek okát a „Vezetők ellenállása” témában tanulod.

## Szigetelők

A szigetelők fajlagos ellenállása a fémekénél **sokszor tízmilliárdszor** nagyobb:

- **üveg:** 10¹¹–10¹⁵ Ω·m,
- **keménygumi:** 10¹³ Ω·m,
- **teflon (PTFE):** 10²³–10²⁵ Ω·m.

Összehasonlításként a réz 1,72·10⁻⁸ Ω·m. A szigetelők választják el a feszültség alatt álló részeket egymástól és az embertől. Gyakori szigetelőanyagok a villanyszerelésben: **PVC** (vezetékek szigetelése és köpenye), **térhálósított polietilén (XLPE)** (kábelek), **gumi**, **porcelán** és **üveg** (szabadvezetéki szigetelők), **műanyag** készülékházak.

## Félvezetők

A legfontosabb félvezető a **szilícium** (Si), régebben a **germánium** (Ge) is. Ezekből készülnek:

- a **dióda** (az áramot csak egy irányba engedi át; egyenirányítókban),
- a **LED** (fényt kibocsátó dióda; a mai világítás alapja),
- a **tranzisztor** (kapcsol és erősít; minden elektronikában),
- a **napelem** cellái (a fényt villamos energiává alakítják).

Villanyszerelőként félvezetőkkel a LED-es lámpákban, az elektronikus kapcsolókban, a dimmerekben, a frekvenciaváltókban és a napelemes inverterekben találkozol.

## Miért fontos a szigetelés a gyakorlatban?

Az áramütés elleni védelem első szintje, az **alapvédelem**, a feszültség alatt álló részek szigetelésén alapul. A szigetelés minősége az idővel romlik. A leggyakoribb okok:

- **hő:** túlterhelt vezeték, rossz kötés, napsugárzás; a PVC megkeményedik, megreped,
- **nedvesség és szennyeződés:** a nedves, poros felületen kúszóáram indul,
- **mechanikai sérülés:** megtört, elvágott, rágcsálók által megrágott szigetelés, falba fúrás,
- **öregedés és UV-sugárzás:** kültéren a nem UV-álló anyagok elridegednek.

A szigetelés állapotát a **szigetelési ellenállás mérésével** ellenőrizzük. Ezt az ellenőrzés és mérés modulban tanulod.

:::mistake
„A víz szigetel, hiszen a desztillált víz rossz vezető.” A gyakorlatban a víz mindig tartalmaz oldott sókat, ezért **jól vezet**. A nedves szigetelés, a nedves bőr és a nedves talaj mind sokszorosára növeli az áramütés veszélyét.
:::

:::safety
Sérült szigetelésű vezetéket, készüléket vagy szerszámot nem használsz, és nem hagysz üzemben. A sérült szigetelés közvetlen áramütés-veszélyt jelent: a hibás részt feszültségmentesíteni kell, és ki kell cserélni.
:::

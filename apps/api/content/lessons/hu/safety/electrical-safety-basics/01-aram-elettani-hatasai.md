---
title: A villamos áram élettani hatásai
summary: Mi történik az emberi testben áramütéskor, mekkora áram milyen hatást okoz, és mitől függ a sérülés súlyossága.
verify:
  - "Érzékelési küszöb: 0,5 mA, a behatási időtől függetlenül – IEC/TS 60479-1 (EMF-Portal összefoglaló)"
  - "Elengedési küszöb: 5 mA (6 s-nál hosszabb behatásnál) és 200 mA (10 ms-os behatásnál) között, időfüggő – IEC/TS 60479-1 (EMF-Portal összefoglaló)"
  - "Kamrafibrilláció: kb. 40 mA már halálos lehet, ha 2 s-nál tovább folyik – IEC/TS 60479-1 (EMF-Portal összefoglaló)"
  - "Az ábrák és határértékek a 15–100 Hz-es váltakozó áramra és bal kéz – két láb áramútra érvényesek – IEC/TS 60479-1 (EMF-Portal összefoglaló)"
  - "Áramütés után orvosi megfigyelés szükséges panaszmentesség esetén is, és orvosi engedély nélkül nem szabad itatni – ITM: Villamos biztonsági ismeretek (2022)"
  - "HIÁNYZIK: az emberi test impedanciájának értékei (kéz–kéz, 230 V) – IEC/TS 60479-1 táblázata"
---

:::goals
- Megérted, mi történik a testben, amikor áram folyik át rajta.
- Ismered az áram hatásainak küszöbértékeit: 0,5 mA, 5 mA, 40 mA.
- Fel tudod sorolni a hat tényezőt, amelytől az áramütés súlyossága függ.
- Meg tudod magyarázni, miért kell orvoshoz menni akkor is, ha a sérült jól érzi magát.
:::

## Mi az áramütés?

**Áramütés** akkor történik, amikor az emberi testen keresztül villamos áram folyik. Ehhez a testnek két olyan ponton kell érintkeznie, amelyek között feszültség van. Tipikus eset: a kezeddel megérintesz egy fázisvezetőt, és közben a lábad a földön áll. Ekkor az áram a kezeden be-, a lábadon kilép.

Az áram útját a testben **áramútnak** nevezzük: például bal kéz – két láb, kéz – kéz, kéz – láb.

A sérülést az **áram** okozza. A feszültség azért döntő, mert Ohm törvénye szerint ez hajtja át az áramot a testen:

`I = Uₑ / Rₜ`

- I: a testen átfolyó áram, A (az áramütésnél mA, azaz milliamper nagyságrendű),
- Uₑ: az érintési feszültség, vagyis a két érintett pont közötti feszültség, V,
- Rₜ: a test ellenállása az áramút mentén, Ω.

Minél nagyobb az érintési feszültség, és minél kisebb a test ellenállása, annál nagyobb áram folyik.

## Mekkora áram mit okoz?

Az áram élettani hatásait az **IEC/TS 60479-1** szabvány írja le. Az itt megadott értékek az 50 Hz-es hálózati váltakozó áramra és a bal kéz – két láb áramútra vonatkoznak.

**0,5 mA – érzékelési küszöb.** Eddig az áramerősségig az áramot nem, vagy alig érzed, akármeddig folyik.

**5 mA felett – elengedési küszöb.** Az izmokat idegi jelek, vagyis kis villamos impulzusok vezérlik. A kívülről érkező áram ezt felülírja: az izmok görcsösen összehúzódnak. Ha a kezed rámarkol a vezetőre, nem tudod elengedni, és az áram tovább folyik. Az elengedési küszöb a behatási időtől függ: hosszú (6 s-nál hosszabb) behatásnál már 5 mA, nagyon rövid (10 ms-os) behatásnál 200 mA.

**40 mA – kamrafibrilláció.** A szív is villamos jelekre húzódik össze. Ha kb. 40 mA 2 másodpercnél tovább folyik a testen át, **kamrafibrilláció** alakulhat ki: a szívkamrák összehangolt összehúzódás helyett csak remegnek, a szív nem pumpál vért. Azonnali újraélesztés és defibrillálás nélkül ez perceken belül halálhoz vezet.

Vesd össze: egy 230 V-os konnektorról egy fogyasztó ampereket vesz fel. A halálos áram ennek csak néhány század része.

Az áram további hatásai:

- **Légzésbénulás:** ha az áram a mellkason folyik át, a légzőizmok görcsbe rándulnak.
- **Égés:** az áram be- és kilépési helyén a bőr ellenállásán hő keletkezik. Az áram útja mentén a mély szövetek is megéghetnek, ezért a sérülés belül súlyosabb, mint amilyennek kívülről látszik.
- **Ívhatás:** zárlati ívnél a hő és a fény akkor is súlyos égést és szemsérülést okoz, ha az áram nem folyik át a testen.
- **Másodlagos sérülés:** az áramütéstől megrándulva leesel a létráról, vagy elesel.

## Mitől függ az áramütés súlyossága?

1. **Az áramerősség.** Minél nagyobb, annál súlyosabb a hatás (lásd a küszöbértékeket).
2. **A behatási idő.** Minél tovább folyik az áram, annál nagyobb a kamrafibrilláció és az égés veszélye. A 40 mA-es érték is 2 s-nál hosszabb behatásra vonatkozik. Ezért kell a kismegszakítónak és az áram-védőkapcsolónak (ÁVK) a hibás áramkört **gyorsan** lekapcsolnia.
3. **Az áramút.** A legveszélyesebb az az áramút, amely a **szíven** át vezet: bal kéz – láb, kéz – kéz.
4. **A frekvencia.** Az élettani határértékek a 15–100 Hz-es tartományra vonatkoznak. A hálózati 50 Hz ebbe a tartományba esik.
5. **A test ellenállása.** Ezt főleg a bőr állapota és az érintkezési felület határozza meg. Nedves, izzadt vagy sérült bőrnél és nagy érintkezési felületnél az ellenállás sokkal kisebb, így ugyanaz a feszültség nagyobb áramot hajt át. Ezért különösen veszélyes a fürdőszoba, a kültér és minden nedves környezet.
6. **Az egyéni állapot.** A fáradtság, a betegség, a szívprobléma és az alkohol növeli a kockázatot.

:::mistake
„A 230 V nem halálos, engem már sokszor megrázott.” Ez téves. A 230 V nedves bőrön, szíven át vezető áramúttal könnyen 40 mA-nél nagyobb áramot hajt át a testen. Hogy egy áramütés csak megráz vagy megöl, azt a pillanatnyi körülmények döntik el, nem a feszültség „mérete”.
:::

## Áramütés után

Az áramütött embert **mindig orvosi megfigyelés alá kell helyezni**, akkor is, ha nincs panasza. A szívritmuszavar az áramütés után később is kialakulhat, a belső égési sérülések pedig kívülről nem látszanak. Az orvos engedélye nélkül a sérültnek nem szabad inni adni. Az áramütést a munkahelyen jelenteni kell a munkahelyi vezetőnek.

:::safety
Ha megrázott az áram, azonnal hagyd abba a munkát, szólj a munkavezetődnek, és menj orvoshoz. A biztonság alapja: villamos berendezésen csak feszültségmentesített állapotban dolgozol, így áram a testeden nem folyhat át.
:::

:::exam
Az ágazati alapvizsgán és a központi interaktív vizsga IV. (villamos biztonsági) részében kérdezik: az áramütés súlyosságát befolyásoló tényezőket, az áram élettani hatásait, és azt, miért a szíven át vezető áramút a legveszélyesebb.
:::

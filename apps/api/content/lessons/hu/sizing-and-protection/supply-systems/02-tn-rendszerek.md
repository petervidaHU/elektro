---
title: TN-C, TN-S és TN-C-S rendszer
summary: A három TN-rendszer felépítése, és az, hogy a PEN-vezető szétválasztása után miért tilos a két vezetőt újra összekötni.
verify:
  - "A TN-C-S rendszerben a PEN-vezető a szétválasztás után nem köthető újra össze a nullavezetővel és a védővezetővel – szakmai alapismeret; forrásból nem ellenőriztem, az oktatónak kell megerősítenie"
  - "HIÁNYZIK: a PEN-vezető legkisebb keresztmetszete (rézre és alumíniumra) és a szétválasztás helyének előírt kialakítása – MSZ HD 60364-5-54"
  - "HIÁNYZIK: a hazai kisfeszültségű közcélú hálózat jellemző rendszere és ennek aktuális szabályozása (DSO-előírás, pl. csatlakozási szabályzat) – az oktatónak kell kiegészítenie"
---

:::goals
- Le tudod írni a TN-C, TN-S és TN-C-S rendszer felépítését.
- Meg tudod mondani, hol szét kell választani a PEN-vezetőt.
- Érted, miért tilos a szétválasztott vezetők újraegyesítése.
:::

## A TN-rendszerek közös tulajdonsága

Mindhárom TN-rendszerben a tápforrás (a transzformátor csillagpontja) közvetlenül földelve van, és a fogyasztók fém teste **vezetőn keresztül ehhez a földelt ponthoz csatlakozik**. Testzárlatnál ezért a hibaáram nem a földön át, hanem egy fémes vezetőhurkon folyik vissza a tápforráshoz: a fázisvezetőn megy, a védő- vagy PEN-vezetőn jön vissza. A hurok kis impedanciája miatt nagy hibaáram alakul ki, amelyet a túláramvédelem (kismegszakító, biztosító) le tud kapcsolni.

## TN-C: egyesített nulla- és védővezető

A TN-C rendszerben a nulla- és a védővezető feladatát **végig egy PEN-vezető** látja el. A készülékek testét a PEN-vezetőre kötik.

A rendszer olcsó, mert kevesebb vezeték kell hozzá. Hátránya, hogy a PEN-vezető üzemi áramot is visz, ezért feszültség lehet rajta, és ha megszakad, a készülékek burkolatán veszélyes feszültség jelenhet meg. A modern épületek belső hálózatán ezért nem ezt alakítjuk ki.

## TN-S: külön nulla- és védővezető

A TN-S rendszerben a nullavezető (N) és a védővezető (PE) **a tápforrástól kezdve végig két külön vezető**. A fogyasztók testét a PE-vezetőre kötik.

A védővezetőn normál üzemben nem folyik áram, ezért a készülék teste biztosan nincs feszültség alatt, és a rendszer a legbiztonságosabb a TN-rendszerek közül.

## TN-C-S: a kettő kombinációja

A TN-C-S rendszerben a hálózat elején PEN-vezető van, az épületben pedig a vezeték **két részre válik**: egy ponton a PEN-vezetőt N- és PE-vezetőre szétválasztják, onnan TN-S rendszerként épül tovább. Az épületek jellemző kialakítása ez: a közcélú hálózat felől PEN-vezető érkezik, a fő csatlakozási pont után pedig külön N- és PE-vezető fut tovább.

A szétválasztás előtt a PEN-vezetőt a fő földelősínhez (főelosztó, csatlakozó berendezés) kötik, onnan indul a PE és az N.

:::safety
A PEN-vezető szétválasztása után az N- és a PE-vezetőt **soha nem szabad újra összekötni**. Ha a szétválasztás után az N és a PE valahol összeér (például egy hibás fogyasztó nullavezetője a testtel), a nullavezető üzemi árama a védővezetőre kerül: a fém burkolatokon és csővezetékeken áram folyik, és feszültség jelenhet meg rajtuk. A szétválasztás helye után az N-vezetőt a PE-től **elszigetelten** kell vezetni.
:::

:::mistake
„A PEN-vezetőt a szétválasztás helye után is fel lehet használni nullavezetőnek, ha a szín stimmel.” Nem lehet: a PEN-vezető szétválasztás után külön N-vezetőre és külön PE-vezetőre kerül, és a két vezetőnek különböző a szerepe, színe és bekötése.
:::

:::exam
Gyakori vizsgakérdés: „Hol kell a PEN-vezetőt N-re és PE-re szétválasztani, és mi a szétválasztás utáni legfontosabb szabály?” A válasz a csatlakozó berendezésnél (fő földelősín), és az, hogy a szétválasztás után az N és a PE tilos újra összekötni.
:::

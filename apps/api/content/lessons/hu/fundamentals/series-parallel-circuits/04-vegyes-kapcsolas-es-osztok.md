---
title: Vegyes kapcsolás, feszültség- és áramosztó
summary: A vegyes kapcsolás lépésenkénti egyszerűsítése, a terheletlen és terhelt feszültségosztó, az áramosztó és a Wheatstone-híd elve.
---

:::goals
- Lépésenként ki tudod számítani egy vegyes kapcsolás eredő ellenállását, áramait és feszültségeit.
- Ki tudod számítani a feszültségosztó kimeneti feszültségét terheletlen és terhelt állapotban.
- Az áramosztó szabályával ki tudod számítani két párhuzamos ág áramát.
- Meg tudod határozni a Wheatstone-híd kiegyenlítési feltételét.
:::

## Vegyes kapcsolás

**Vegyes** a kapcsolás, ha soros és párhuzamos részeket is tartalmaz. A számítás menete mindig ugyanaz:

1. Megkeresed a **legbelső** tisztán soros vagy tisztán párhuzamos csoportot, és kiszámolod az eredőjét.
2. A csoportot helyettesíted az eredőjével, és újrarajzolod a kapcsolást.
3. Addig ismétled, amíg egyetlen eredő ellenállás marad.
4. Kiszámolod a főáramot, majd **visszafelé** haladva az egyes részek feszültségét és áramát.

:::example
R₁ = 10 Ω sorosan kapcsolódik R₂ = 30 Ω és R₃ = 60 Ω párhuzamos csoportjával. A forrás 24 V. Számítsd ki az áramokat és a feszültségeket!

1. A párhuzamos csoport: R₂₃ = 30 · 60 / (30 + 60) = 1800 / 90 = 20 Ω.
2. Az eredő: R_e = R₁ + R₂₃ = 10 Ω + 20 Ω = 30 Ω.
3. A főáram: I = 24 V / 30 Ω = 0,8 A.
4. R₁ feszültsége: U₁ = 10 Ω · 0,8 A = 8 V.
5. A párhuzamos csoport feszültsége: U₂₃ = 20 Ω · 0,8 A = 16 V (ellenőrzés: 8 V + 16 V = 24 V ✓).
6. Az ágáramok: I₂ = 16 V / 30 Ω ≈ 0,533 A, I₃ = 16 V / 60 Ω ≈ 0,267 A (összegük 0,8 A ✓).
:::

## A feszültségosztó

Két sorosan kapcsolt ellenállás a bemeneti feszültséget az ellenállások arányában osztja meg. Az R₂-n mérhető kimeneti feszültség **terheletlen** állapotban (ha a kimenetre semmi nincs kötve):

`U₂ = U · R₂ / (R₁ + R₂)`

**Terhelt** állapotban a kimenetre kötött R_t terhelő ellenállás párhuzamosan kapcsolódik R₂-vel. Az eredőjük kisebb R₂-nél, ezért **a kimeneti feszültség csökken**. Ilyenkor a képletben R₂ helyére az `R₂ · R_t / (R₂ + R_t)` eredő kerül.

:::example
U = 24 V, R₁ = R₂ = 10 kΩ.

1. Terheletlenül: U₂ = 24 V · 10 / (10 + 10) = 12 V.
2. 10 kΩ-os terheléssel: R₂ és R_t eredője = 10 · 10 / 20 = 5 kΩ.
3. Terhelten: U₂ = 24 V · 5 / (10 + 5) = 8 V.
:::

A terhelt osztó kimeneti feszültsége akkor marad közel a terheletlenhez, ha a terhelő ellenállás sokkal (legalább tízszer) nagyobb R₂-nél. Feszültségosztót használnak a műszerek méréshatár-kiterjesztésénél, a potenciométerben és sok elektronikus érzékelőben.

## Az áramosztó

Két párhuzamos ág között a főáram az ellenállásokkal **fordított** arányban oszlik meg:

`I₁ = I · R₂ / (R₁ + R₂)`

`I₂ = I · R₁ / (R₁ + R₂)`

Figyeld meg: I₁ képletének számlálójában a **másik** ág ellenállása áll.

:::example
A főáram 0,8 A, R₂ = 30 Ω és R₃ = 60 Ω párhuzamos (a fenti vegyes kapcsolás).

1. I₂ = 0,8 A · 60 / (30 + 60) ≈ 0,533 A.
2. I₃ = 0,8 A · 30 / (30 + 60) ≈ 0,267 A.
:::

## A Wheatstone-híd

A **Wheatstone-híd** ismeretlen ellenállás pontos mérésére szolgál. Négy ellenállásból áll, két párhuzamos ágban, ágonként kettő sorosan. Az egyik ágban R₁ és R₂, a másikban R₃ és az ismeretlen R_x. A két ág középpontja közé érzékeny árammérőt (nullindikátort) kötünk.

[Ábra: rombusz alakú hídkapcsolás. Bal felső ág R₁, bal alsó R₂, jobb felső R₃, jobb alsó R_x. A bal és jobb csúcs között a nullindikátor, a felső és alsó csúcsra kapcsolódik a forrás.]

A híd **kiegyenlített**, ha a nullindikátoron nem folyik áram. Ekkor a két ág azonos arányban osztja a feszültséget:

`R₁ / R₂ = R₃ / R_x`, ebből `R_x = R₂ · R₃ / R₁`

:::example
A híd kiegyenlített, ha R₁ = 100 Ω, R₂ = 200 Ω, R₃ = 150 Ω. Mekkora R_x?

1. R_x = R₂ · R₃ / R₁ = 200 · 150 / 100 = 300 Ω.
2. Ellenőrzés: 100 / 200 = 0,5 és 150 / 300 = 0,5. ✓
:::

A kiegyenlítés a tápfeszültség nagyságától független, ezért a mérés nagyon pontos. A hídkapcsolás elvén működnek a hőmérséklet- és nyúlásmérők is.

:::mistake
A vegyes kapcsolásnál a leggyakoribb hiba, hogy a soros ellenállást a párhuzamos csoport egyik tagjához adják hozzá. Mindig a legbelső csoporttal kezdj, és minden lépés után rajzold újra a kapcsolást.
:::

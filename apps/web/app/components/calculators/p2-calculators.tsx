import { useState, type ReactNode } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  calculateAcImpedance,
  calculateAcValues,
  calculateCapacitors,
  calculateIlluminance,
  calculateInductors,
  calculateMaterialList,
  calculateMeasurementError,
  calculateMotor,
  calculatePeContinuityCheck,
  calculateShortCircuit,
  calculateVoltageSource,
  formatNumber,
  formatPercent,
  solveCharge,
  solveKirchhoff,
  solveMeterRange,
  solveTransformer,
  solveWheatstone,
  type CalculatorId,
} from "@elektro/shared";
import { attempt, Choice, NumField, num, optional, pc, pn, ResultCard, useEng, useQ, type Props } from "./kit";

/** Lines under a result: "label: value". */
function Facts({ rows }: { rows: ([string, ReactNode] | null | false | undefined)[] }) {
  return (
    <Stack gap={2}>
      {rows.map((row) =>
        row ? (
          <Text size="sm" key={row[0]}>
            {row[0]}: {row[1]}
          </Text>
        ) : null,
      )}
    </Stack>
  );
}

const MODES = ["single", "series", "parallel"] as const;
type Mode = (typeof MODES)[number];

// ---- AC impedance (series R, L, C) -----------------------------------------------

function AcImpedance({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const eng = useEng(locale);
  const [r, setR] = useState<number | string>(pn(prefill, "resistance", 30));
  const [l, setL] = useState<number | string>(pn(prefill, "inductance", 127));
  const [c, setC] = useState<number | string>(pn(prefill, "capacitance", 0));
  const [f, setF] = useState<number | string>(pn(prefill, "frequency", 50));
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 230));

  const lh = optional(l);
  const cf = optional(c);
  const outcome = attempt(() =>
    calculateAcImpedance({
      resistance_ohm: num(r),
      ...(lh !== undefined && { inductance_H: lh / 1000 }),
      ...(cf !== undefined && { capacitance_F: cf / 1e6 }),
      frequency_Hz: num(f),
      voltage_V: num(u),
    }),
  );

  return (
    <Stack gap="md">
      <NumField label={t("calculators.quantity.resistance")} unit={t("unit.ohm")} value={r} onChange={setR} />
      <NumField label={t("calculators.acImpedance.inductance")} unit={`m${t("unit.henry")}`} value={l} onChange={setL} step={10} />
      <NumField label={t("calculators.acImpedance.capacitance")} unit={`µ${t("unit.farad")}`} value={c} onChange={setC} step={10} />
      <NumField label={t("calculators.acImpedance.frequency")} unit={t("unit.hertz")} value={f} onChange={setF} step={10} />
      <NumField label={t("calculators.quantity.voltage")} unit={t("unit.volt")} value={u} onChange={setU} step={10} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `Z = ${q(outcome.result.impedance_ohm, "ohm")}`}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            [t("calculators.quantity.current"), q(outcome.result.current_A, "ampere")],
            [t("calculators.acImpedance.phaseAngle"), `${formatNumber(outcome.result.phaseAngle_deg, locale, { maximumFractionDigits: 1 })} °`],
            [t("calculators.quantity.powerFactor"), formatNumber(outcome.result.powerFactor, locale, { maximumFractionDigits: 3 })],
            [t("calculators.acImpedance.characterOf"), t(outcome.result.phaseAngle_deg > 0.05 ? "calculators.acImpedance.inductive" : outcome.result.phaseAngle_deg < -0.05 ? "calculators.acImpedance.capacitive" : "calculators.acImpedance.resistive")],
            [t("calculators.acImpedance.uR"), q(outcome.result.resistorVoltage_V, "volt")],
            lh !== undefined && [t("calculators.acImpedance.uL"), q(outcome.result.inductorVoltage_V, "volt")],
            cf !== undefined && [t("calculators.acImpedance.uC"), q(outcome.result.capacitorVoltage_V, "volt")],
            lh !== undefined && [t("calculators.acImpedance.xL"), eng(outcome.result.inductiveReactance_ohm, "ohm")],
            cf !== undefined && [t("calculators.acImpedance.xC"), eng(outcome.result.capacitiveReactance_ohm, "ohm")],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- capacitors -----------------------------------------------------------------------

function Capacitors({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const eng = useEng(locale);
  const q = useQ(locale);
  const [mode, setMode] = useState<Mode>(pc<Mode>(prefill, "mode", "single"));
  const [values, setValues] = useState<(number | string)[]>([pn(prefill, "c1", 100), pn(prefill, "c2", 220), pn(prefill, "c3", 47)]);
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 10));
  const [r, setR] = useState<number | string>(pn(prefill, "resistance", 1000));
  const [ms, setMs] = useState<number | string>(pn(prefill, "time", 100));

  const used = mode === "single" ? 1 : 2;
  const outcome = attempt(() =>
    calculateCapacitors({
      mode,
      capacitances_F: values.slice(0, mode === "single" ? 1 : values.length).map((value) => num(value) / 1e6),
      voltage_V: num(u),
      ...(optional(r) !== undefined && { resistance_ohm: optional(r)! }),
      ...(optional(r) !== undefined && optional(ms) !== undefined && { time_s: optional(ms)! / 1000 }),
    }),
  );
  const shown = mode === "single" ? 1 : 3;

  return (
    <Stack gap="md">
      <Choice label={t("calculators.combination.mode")} value={mode} onChange={setMode} options={MODES.map((v) => ({ value: v, label: t(`calculators.combination.${v}`) }))} />
      {values.slice(0, shown).map((value, index) => (
        <NumField key={index} label={t("calculators.capacitors.capacitorN", { n: index + 1 })} unit={`µ${t("unit.farad")}`} value={value} onChange={(v) => setValues((c) => c.map((x, k) => (k === index ? v : x)))} step={10} />
      ))}
      {used > 1 && <Text size="sm" c="dimmed">{t("calculators.combination.thirdOptional")}</Text>}
      <NumField label={t("calculators.quantity.voltage")} unit={t("unit.volt")} value={u} onChange={setU} />
      <NumField label={t("calculators.capacitors.resistance")} unit={t("unit.ohm")} value={r} onChange={setR} step={100} />
      <NumField label={t("calculators.capacitors.time")} unit={`m${t("unit.second")}`} value={ms} onChange={setMs} step={10} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `C = ${eng(outcome.result.capacitance_F, "farad")}`}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            [t("calculators.capacitors.charge"), eng(outcome.result.charge_C, "coulomb")],
            [t("calculators.capacitors.energy"), eng(outcome.result.energy_J, "joule")],
            outcome.result.timeConstant_s !== undefined && [t("calculators.capacitors.tau"), eng(outcome.result.timeConstant_s, "second")],
            outcome.result.chargingVoltage_V !== undefined && [t("calculators.capacitors.charging"), q(outcome.result.chargingVoltage_V, "volt")],
            outcome.result.dischargingVoltage_V !== undefined && [t("calculators.capacitors.discharging"), q(outcome.result.dischargingVoltage_V, "volt")],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- inductors --------------------------------------------------------------------------

function Inductors({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const eng = useEng(locale);
  const q = useQ(locale);
  const [mode, setMode] = useState<Mode>(pc<Mode>(prefill, "mode", "single"));
  const [values, setValues] = useState<(number | string)[]>([pn(prefill, "l1", 500), pn(prefill, "l2", 200), pn(prefill, "l3", 100)]);
  const [i, setI] = useState<number | string>(pn(prefill, "current", 2));
  const [r, setR] = useState<number | string>(pn(prefill, "resistance", 5));
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 10));
  const [ms, setMs] = useState<number | string>(pn(prefill, "time", 100));

  const outcome = attempt(() =>
    calculateInductors({
      mode,
      inductances_H: values.slice(0, mode === "single" ? 1 : 3).map((value) => num(value) / 1000),
      current_A: num(i),
      ...(optional(r) !== undefined && { resistance_ohm: optional(r)! }),
      ...(optional(u) !== undefined && { voltage_V: optional(u)! }),
      ...(optional(ms) !== undefined && { time_s: optional(ms)! / 1000 }),
    }),
  );
  const shown = mode === "single" ? 1 : 3;

  return (
    <Stack gap="md">
      <Choice label={t("calculators.combination.mode")} value={mode} onChange={setMode} options={MODES.map((v) => ({ value: v, label: t(`calculators.combination.${v}`) }))} />
      {values.slice(0, shown).map((value, index) => (
        <NumField key={index} label={t("calculators.inductors.inductorN", { n: index + 1 })} unit={`m${t("unit.henry")}`} value={value} onChange={(v) => setValues((c) => c.map((x, k) => (k === index ? v : x)))} step={50} />
      ))}
      <NumField label={t("calculators.quantity.current")} unit={t("unit.ampere")} value={i} onChange={setI} step={0.5} />
      <NumField label={t("calculators.inductors.resistance")} unit={t("unit.ohm")} value={r} onChange={setR} />
      <NumField label={t("calculators.quantity.voltage")} unit={t("unit.volt")} value={u} onChange={setU} />
      <NumField label={t("calculators.capacitors.time")} unit={`m${t("unit.second")}`} value={ms} onChange={setMs} step={10} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `L = ${eng(outcome.result.inductance_H, "henry")}`}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            [t("calculators.capacitors.energy"), eng(outcome.result.energy_J, "joule")],
            outcome.result.timeConstant_s !== undefined && [t("calculators.capacitors.tau"), eng(outcome.result.timeConstant_s, "second")],
            outcome.result.risingCurrent_A !== undefined && [t("calculators.inductors.rising"), q(outcome.result.risingCurrent_A, "ampere")],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- real voltage source ------------------------------------------------------------------

function VoltageSource({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [e, setE] = useState<number | string>(pn(prefill, "emf", 12));
  const [ri, setRi] = useState<number | string>(pn(prefill, "internalResistance", 1));
  const [rl, setRl] = useState<number | string>(pn(prefill, "loadResistance", 5));

  const outcome = attempt(() =>
    calculateVoltageSource({
      emf_V: num(e),
      internalResistance_ohm: num(ri),
      ...(optional(rl) !== undefined && { loadResistance_ohm: optional(rl)! }),
    }),
  );

  return (
    <Stack gap="md">
      <NumField label={t("calculators.voltageSource.emf")} unit={t("unit.volt")} value={e} onChange={setE} />
      <NumField label={t("calculators.voltageSource.internal")} unit={t("unit.ohm")} value={ri} onChange={setRi} step={0.5} />
      <NumField label={t("calculators.voltageSource.load")} unit={t("unit.ohm")} value={rl} onChange={setRl} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && (outcome.result.terminalVoltage_V !== undefined ? `U = ${q(outcome.result.terminalVoltage_V, "volt")}` : `I_k = ${q(outcome.result.shortCircuitCurrent_A, "ampere")}`)}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            outcome.result.current_A !== undefined && [t("calculators.quantity.current"), q(outcome.result.current_A, "ampere")],
            outcome.result.loadPower_W !== undefined && [t("calculators.voltageSource.loadPower"), q(outcome.result.loadPower_W, "watt")],
            outcome.result.efficiency !== undefined && [t("calculators.powerDc.efficiency"), formatPercent(outcome.result.efficiency * 100, locale, { maximumFractionDigits: 1 })],
            [t("calculators.voltageSource.shortCircuit"), q(outcome.result.shortCircuitCurrent_A, "ampere")],
            [t("calculators.voltageSource.matched"), q(outcome.result.matchedLoad_ohm, "ohm")],
            [t("calculators.voltageSource.maxPower"), q(outcome.result.maxPower_W, "watt")],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- transformer -----------------------------------------------------------------------------

function TransformerRatio({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  type Unknown = "secondaryVoltage" | "primaryVoltage" | "secondaryTurns" | "primaryTurns";
  const [unknown, setUnknown] = useState<Unknown>(pc<Unknown>(prefill, "unknown", "secondaryVoltage"));
  const [u1, setU1] = useState<number | string>(pn(prefill, "primaryVoltage", 230));
  const [u2, setU2] = useState<number | string>(pn(prefill, "secondaryVoltage", 23));
  const [n1, setN1] = useState<number | string>(pn(prefill, "primaryTurns", 1000));
  const [n2, setN2] = useState<number | string>(pn(prefill, "secondaryTurns", 100));
  const [i2, setI2] = useState<number | string>(pn(prefill, "secondaryCurrent", 10));

  const outcome = attempt(() =>
    solveTransformer({
      ...(unknown !== "primaryVoltage" && { primaryVoltage_V: num(u1) }),
      ...(unknown !== "secondaryVoltage" && { secondaryVoltage_V: num(u2) }),
      ...(unknown !== "primaryTurns" && { primaryTurns: num(n1) }),
      ...(unknown !== "secondaryTurns" && { secondaryTurns: num(n2) }),
      ...(optional(i2) !== undefined && { secondaryCurrent_A: optional(i2)! }),
    }),
  );
  const labels: Record<Unknown, string> = {
    secondaryVoltage: t("calculators.transformer.u2"),
    primaryVoltage: t("calculators.transformer.u1"),
    secondaryTurns: t("calculators.transformer.n2"),
    primaryTurns: t("calculators.transformer.n1"),
  };

  return (
    <Stack gap="md">
      <Choice label={t("calculators.ohmsLaw.unknown")} value={unknown} onChange={setUnknown} options={(Object.keys(labels) as Unknown[]).map((v) => ({ value: v, label: labels[v] }))} />
      {unknown !== "primaryVoltage" && <NumField label={labels.primaryVoltage} unit={t("unit.volt")} value={u1} onChange={setU1} step={10} />}
      {unknown !== "secondaryVoltage" && <NumField label={labels.secondaryVoltage} unit={t("unit.volt")} value={u2} onChange={setU2} />}
      {unknown !== "primaryTurns" && <NumField label={labels.primaryTurns} value={n1} onChange={setN1} step={10} decimals={0} />}
      {unknown !== "secondaryTurns" && <NumField label={labels.secondaryTurns} value={n2} onChange={setN2} step={10} decimals={0} />}
      <NumField label={t("calculators.transformer.i2")} unit={t("unit.ampere")} value={i2} onChange={setI2} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome &&
          (unknown === "secondaryVoltage" ? q(outcome.result.secondaryVoltage_V, "volt") : unknown === "primaryVoltage" ? q(outcome.result.primaryVoltage_V, "volt") : unknown === "secondaryTurns" ? formatNumber(outcome.result.secondaryTurns, locale) : formatNumber(outcome.result.primaryTurns, locale))}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            [t("calculators.transformer.ratio"), formatNumber(outcome.result.turnsRatio, locale, { maximumFractionDigits: 3 })],
            outcome.result.primaryCurrent_A !== undefined && [t("calculators.transformer.i1"), q(outcome.result.primaryCurrent_A, "ampere")],
            [t("calculators.transformer.ideal"), ""],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- charge and current ----------------------------------------------------------------------------

function ChargeCurrent({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const eng = useEng(locale);
  type Unknown = "charge" | "current" | "time";
  const [unknown, setUnknown] = useState<Unknown>(pc<Unknown>(prefill, "unknown", "charge"));
  const [qv, setQ] = useState<number | string>(pn(prefill, "charge", 60));
  const [i, setI] = useState<number | string>(pn(prefill, "current", 2));
  const [s, setS] = useState<number | string>(pn(prefill, "time", 30));

  const outcome = attempt(() =>
    solveCharge({
      ...(unknown !== "charge" && { charge_C: num(qv) }),
      ...(unknown !== "current" && { current_A: num(i) }),
      ...(unknown !== "time" && { time_s: num(s) }),
    }),
  );

  return (
    <Stack gap="md">
      <Choice label={t("calculators.ohmsLaw.unknown")} value={unknown} onChange={setUnknown} options={(["charge", "current", "time"] as const).map((v) => ({ value: v, label: t(`calculators.charge.${v}`) }))} />
      {unknown !== "charge" && <NumField label={t("calculators.charge.charge")} unit={t("unit.coulomb")} value={qv} onChange={setQ} step={10} />}
      {unknown !== "current" && <NumField label={t("calculators.charge.current")} unit={t("unit.ampere")} value={i} onChange={setI} step={0.5} />}
      {unknown !== "time" && <NumField label={t("calculators.charge.time")} unit={t("unit.second")} value={s} onChange={setS} step={5} />}
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && (unknown === "charge" ? eng(outcome.result.charge_C, "coulomb") : unknown === "current" ? eng(outcome.result.current_A, "ampere") : eng(outcome.result.time_s, "second"))}
      </ResultCard>
    </Stack>
  );
}

// ---- AC values --------------------------------------------------------------------------------------

function AcValues({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const eng = useEng(locale);
  type Given = "rms" | "peak";
  const [given, setGiven] = useState<Given>(pc<Given>(prefill, "given", "rms"));
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 230));
  const [f, setF] = useState<number | string>(pn(prefill, "frequency", 50));

  const outcome = attempt(() =>
    calculateAcValues({
      ...(given === "rms" ? { rms_V: num(u) } : { peak_V: num(u) }),
      ...(optional(f) !== undefined && { frequency_Hz: optional(f)! }),
    }),
  );

  return (
    <Stack gap="md">
      <Choice label={t("calculators.acValues.given")} value={given} onChange={setGiven} options={(["rms", "peak"] as const).map((v) => ({ value: v, label: t(`calculators.acValues.${v}`) }))} />
      <NumField label={t(`calculators.acValues.${given}`)} unit={t("unit.volt")} value={u} onChange={setU} step={10} />
      <NumField label={t("calculators.acImpedance.frequency")} unit={t("unit.hertz")} value={f} onChange={setF} step={10} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && (given === "rms" ? `Uₘ = ${q(outcome.result.peak_V, "volt")}` : `U = ${q(outcome.result.rms_V, "volt")}`)}
      </ResultCard>
      {outcome?.result.period_s !== undefined && (
        <Facts
          rows={[
            [t("calculators.acValues.period"), eng(outcome.result.period_s, "second")],
            [t("calculators.acValues.omega"), `${formatNumber(outcome.result.angularFrequency_rad_s ?? 0, locale, { maximumFractionDigits: 1 })} rad/s`],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- Kirchhoff (two sources) ------------------------------------------------------------------------------

function Kirchhoff({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [e1, setE1] = useState<number | string>(pn(prefill, "emf1", 10));
  const [r1, setR1] = useState<number | string>(pn(prefill, "resistance1", 10));
  const [e2, setE2] = useState<number | string>(pn(prefill, "emf2", 5));
  const [r2, setR2] = useState<number | string>(pn(prefill, "resistance2", 10));
  const [r3, setR3] = useState<number | string>(pn(prefill, "resistance3", 10));

  const outcome = attempt(() =>
    solveKirchhoff({ emf1_V: num(e1), resistance1_ohm: num(r1), emf2_V: num(e2), resistance2_ohm: num(r2), resistance3_ohm: num(r3) }),
  );
  const allowNegative = { min: -1000 } as const;

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">{t("calculators.kirchhoff.hint")}</Text>
      <NumField label={t("calculators.kirchhoff.emfN", { n: 1 })} unit={t("unit.volt")} value={e1} onChange={setE1} {...allowNegative} />
      <NumField label={t("calculators.equivalent.resistorN", { n: 1 })} unit={t("unit.ohm")} value={r1} onChange={setR1} />
      <NumField label={t("calculators.kirchhoff.emfN", { n: 2 })} unit={t("unit.volt")} value={e2} onChange={setE2} {...allowNegative} />
      <NumField label={t("calculators.equivalent.resistorN", { n: 2 })} unit={t("unit.ohm")} value={r2} onChange={setR2} />
      <NumField label={t("calculators.equivalent.resistorN", { n: 3 })} unit={t("unit.ohm")} value={r3} onChange={setR3} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `U_ab = ${q(outcome.result.nodeVoltage_V, "volt")}`}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            [t("calculators.kirchhoff.currentN", { n: 1 }), q(outcome.result.current1_A, "ampere")],
            [t("calculators.kirchhoff.currentN", { n: 2 }), q(outcome.result.current2_A, "ampere")],
            [t("calculators.kirchhoff.currentN", { n: 3 }), q(outcome.result.current3_A, "ampere")],
            [t("calculators.kirchhoff.nodeLaw"), `${formatNumber(outcome.result.current1_A + outcome.result.current2_A, locale, { maximumFractionDigits: 4 })} = ${formatNumber(outcome.result.current3_A, locale, { maximumFractionDigits: 4 })}`],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- Wheatstone bridge --------------------------------------------------------------------------------------

function WheatstoneBridge({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [r1, setR1] = useState<number | string>(pn(prefill, "resistance1", 100));
  const [r2, setR2] = useState<number | string>(pn(prefill, "resistance2", 200));
  const [r3, setR3] = useState<number | string>(pn(prefill, "resistance3", 300));
  const [rx, setRx] = useState<number | string>(pn(prefill, "unknownResistance", 0));
  const [u, setU] = useState<number | string>(pn(prefill, "supply", 12));

  const outcome = attempt(() =>
    solveWheatstone({
      resistance1_ohm: num(r1),
      resistance2_ohm: num(r2),
      resistance3_ohm: num(r3),
      ...(optional(rx) !== undefined && { unknownResistance_ohm: optional(rx)! }),
      ...(optional(u) !== undefined && { supplyVoltage_V: optional(u)! }),
    }),
  );

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">{t("calculators.wheatstone.hint")}</Text>
      <NumField label={t("calculators.equivalent.resistorN", { n: 1 })} unit={t("unit.ohm")} value={r1} onChange={setR1} />
      <NumField label={t("calculators.equivalent.resistorN", { n: 2 })} unit={t("unit.ohm")} value={r2} onChange={setR2} />
      <NumField label={t("calculators.equivalent.resistorN", { n: 3 })} unit={t("unit.ohm")} value={r3} onChange={setR3} />
      <NumField label={t("calculators.wheatstone.actualRx")} unit={t("unit.ohm")} value={rx} onChange={setRx} />
      <NumField label={t("calculators.quantity.supplyVoltage")} unit={t("unit.volt")} value={u} onChange={setU} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `Rₓ = ${q(outcome.result.balancingResistance_ohm, "ohm")}`}
      </ResultCard>
      {outcome?.result.bridgeVoltage_V !== undefined && (
        <Facts rows={[[t("calculators.wheatstone.bridgeVoltage"), q(outcome.result.bridgeVoltage_V, "volt")]]} />
      )}
    </Stack>
  );
}

// ---- meter range extension ---------------------------------------------------------------------------------------

function MeterRange({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  type Kind = "ammeter" | "voltmeter";
  const [kind, setKind] = useState<Kind>(pc<Kind>(prefill, "kind", "ammeter"));
  const [rm, setRm] = useState<number | string>(pn(prefill, "meterResistance", 100));
  const [im, setIm] = useState<number | string>(pn(prefill, "meterCurrent", 1));
  const [target, setTarget] = useState<number | string>(pn(prefill, "target", kind === "ammeter" ? 0.01 : 10));

  const outcome = attempt(() =>
    solveMeterRange({ kind, meterResistance_ohm: num(rm), meterCurrent_A: num(im) / 1000, targetRange: num(target) }),
  );

  return (
    <Stack gap="md">
      <Choice
        label={t("calculators.meterRange.kind")}
        value={kind}
        onChange={(value) => {
          setKind(value);
          setTarget(value === "ammeter" ? 0.01 : 10);
        }}
        options={(["ammeter", "voltmeter"] as const).map((v) => ({ value: v, label: t(`calculators.meterRange.${v}`) }))}
      />
      <NumField label={t("calculators.meterRange.meterResistance")} unit={t("unit.ohm")} value={rm} onChange={setRm} />
      <NumField label={t("calculators.meterRange.meterCurrent")} unit={`m${t("unit.ampere")}`} value={im} onChange={setIm} step={0.5} />
      <NumField
        label={kind === "ammeter" ? t("calculators.meterRange.targetCurrent") : t("calculators.meterRange.targetVoltage")}
        unit={kind === "ammeter" ? t("unit.ampere") : t("unit.volt")}
        value={target}
        onChange={setTarget}
        step={kind === "ammeter" ? 0.01 : 1}
      />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `${kind === "ammeter" ? t("calculators.meterRange.shunt") : t("calculators.meterRange.seriesResistor")}: ${q(outcome.result.resistor_ohm, "ohm")}`}
      </ResultCard>
    </Stack>
  );
}

// ---- measurement error -----------------------------------------------------------------------------------------------

function MeasurementError({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const [reading, setReading] = useState<number | string>(pn(prefill, "reading", 230));
  const [percent, setPercent] = useState<number | string>(pn(prefill, "percent", 0.5));
  const [digits, setDigits] = useState<number | string>(pn(prefill, "digits", 2));
  const [resolution, setResolution] = useState<number | string>(pn(prefill, "resolution", 0.1));

  const outcome = attempt(() =>
    calculateMeasurementError({ reading: num(reading), percentOfReading: num(percent), digits: num(digits), resolution: num(resolution) }),
  );
  const f = (value: number) => formatNumber(value, locale, { maximumSignificantDigits: 6 });

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">{t("calculators.measurementError.hint")}</Text>
      <NumField label={t("calculators.measurementError.reading")} value={reading} onChange={setReading} step={1} />
      <NumField label={t("calculators.measurementError.percent")} unit="%" value={percent} onChange={setPercent} step={0.1} />
      <NumField label={t("calculators.measurementError.digits")} value={digits} onChange={setDigits} decimals={0} />
      <NumField label={t("calculators.measurementError.resolution")} value={resolution} onChange={setResolution} step={0.01} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `± ${f(outcome.result.absoluteError)}`}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            [t("calculators.measurementError.range"), `${f(outcome.result.minimum)} … ${f(outcome.result.maximum)}`],
            [t("calculators.measurementError.relative"), formatPercent(outcome.result.relativeErrorPercent, locale, { maximumFractionDigits: 2 })],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- motor basics ---------------------------------------------------------------------------------------------------------

function MotorBasics({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [f, setF] = useState<number | string>(pn(prefill, "frequency", 50));
  const [p, setP] = useState<number | string>(pn(prefill, "polePairs", 2));
  const [n, setN] = useState<number | string>(pn(prefill, "rotorSpeed", 1425));
  const [kw, setKw] = useState<number | string>(pn(prefill, "ratedPower", 4));
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 400));
  const [eta, setEta] = useState<number | string>(pn(prefill, "efficiency", 0.85));
  const [pf, setPf] = useState<number | string>(pn(prefill, "powerFactor", 0.8));
  const [ratio, setRatio] = useState<number | string>(pn(prefill, "startingRatio", 0));

  const speed = attempt(() =>
    calculateMotor({ frequency_Hz: num(f), polePairs: num(p), ...(optional(n) !== undefined && { rotorSpeed_rpm: optional(n)! }) }),
  );
  const current = attempt(() =>
    calculateMotor({
      ratedPower_W: num(kw) * 1000,
      voltage_V: num(u),
      efficiency: num(eta),
      powerFactor: num(pf),
      ...(optional(ratio) !== undefined && { startingCurrentRatio: optional(ratio)! }),
    }),
  );

  return (
    <Stack gap="lg">
      <Stack gap="md">
        <Text fw={600}>{t("calculators.motor.speedSection")}</Text>
        <NumField label={t("calculators.acImpedance.frequency")} unit={t("unit.hertz")} value={f} onChange={setF} step={10} />
        <NumField label={t("calculators.motor.polePairs")} value={p} onChange={setP} decimals={0} />
        <NumField label={t("calculators.motor.rotorSpeed")} unit={t("unit.revolutionPerMinute")} value={n} onChange={setN} step={10} />
        <ResultCard outcome={speed} steps={speed?.steps ?? []} locale={locale}>
          {speed && `n_s = ${q(speed.result.synchronousSpeed_rpm ?? 0, "revolutionPerMinute")}`}
        </ResultCard>
        {speed?.result.slip !== undefined && <Facts rows={[[t("calculators.motor.slip"), formatPercent(speed.result.slip * 100, locale, { maximumFractionDigits: 2 })]]} />}
      </Stack>
      <Stack gap="md">
        <Text fw={600}>{t("calculators.motor.currentSection")}</Text>
        <NumField label={t("calculators.motor.ratedPower")} unit="kW" value={kw} onChange={setKw} step={0.5} />
        <NumField label={t("calculators.quantity.lineVoltage")} unit={t("unit.volt")} value={u} onChange={setU} step={10} />
        <NumField label={t("calculators.motor.efficiency")} value={eta} onChange={setEta} min={0} max={1} step={0.01} decimals={2} />
        <NumField label={t("calculators.quantity.powerFactor")} value={pf} onChange={setPf} min={0} max={1} step={0.01} decimals={2} />
        <NumField label={t("calculators.motor.startingRatio")} value={ratio} onChange={setRatio} step={0.5} />
        <ResultCard outcome={current} steps={current?.steps ?? []} locale={locale}>
          {current && `I = ${q(current.result.ratedCurrent_A ?? 0, "ampere")}`}
        </ResultCard>
        {current?.result.directStartCurrent_A !== undefined && (
          <Facts
            rows={[
              [t("calculators.motor.directStart"), q(current.result.directStartCurrent_A, "ampere")],
              [t("calculators.motor.starDeltaStart"), q(current.result.starDeltaStartCurrent_A ?? 0, "ampere")],
            ]}
          />
        )}
      </Stack>
    </Stack>
  );
}

// ---- short-circuit current ---------------------------------------------------------------------------------------------------------

function ShortCircuit({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 230));
  const [z, setZ] = useState<number | string>(pn(prefill, "impedance", 0.5));
  const [trip, setTrip] = useState<number | string>(pn(prefill, "trip", 0));

  const outcome = attempt(() =>
    calculateShortCircuit({ phaseVoltage_V: num(u), loopImpedance_ohm: num(z), ...(optional(trip) !== undefined && { tripCurrent_A: optional(trip)! }) }),
  );

  return (
    <Stack gap="md">
      <NumField label={t("calculators.shortCircuit.voltage")} unit={t("unit.volt")} value={u} onChange={setU} step={10} />
      <NumField label={t("calculators.shortCircuit.impedance")} unit={t("unit.ohm")} value={z} onChange={setZ} step={0.1} />
      <NumField label={t("calculators.shortCircuit.trip")} unit={t("unit.ampere")} value={trip} onChange={setTrip} step={10} />
      <Text size="sm" c="dimmed">{t("calculators.shortCircuit.tripHint")}</Text>
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `I_k = ${q(outcome.result.shortCircuitCurrent_A, "ampere")}`}
      </ResultCard>
      {outcome?.result.tripReached !== undefined && (
        <Text size="sm" fw={600} c={outcome.result.tripReached ? "green" : "red"} data-testid="trip-verdict">
          {outcome.result.tripReached ? "✓ " : "✗ "}
          {t(outcome.result.tripReached ? "calculators.shortCircuit.trips" : "calculators.shortCircuit.noTrip", { max: q(outcome.result.maxLoopImpedance_ohm ?? 0, "ohm") })}
        </Text>
      )}
    </Stack>
  );
}

// ---- illuminance ----------------------------------------------------------------------------------------------------------------

function Illuminance({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [flux, setFlux] = useState<number | string>(pn(prefill, "flux", 3000));
  const [area, setArea] = useState<number | string>(pn(prefill, "area", 20));
  const [target, setTarget] = useState<number | string>(pn(prefill, "target", 0));
  const [each, setEach] = useState<number | string>(pn(prefill, "luminaireFlux", 1500));
  const [eta, setEta] = useState<number | string>(pn(prefill, "utilisation", 1));

  const outcome = attempt(() =>
    calculateIlluminance({
      luminousFlux_lm: num(flux),
      area_m2: num(area),
      ...(optional(target) !== undefined && { targetIlluminance_lx: optional(target)!, fluxPerLuminaire_lm: num(each), utilisationFactor: num(eta) }),
    }),
  );

  return (
    <Stack gap="md">
      <NumField label={t("calculators.illuminance.flux")} unit={t("unit.lumen")} value={flux} onChange={setFlux} step={100} />
      <NumField label={t("calculators.illuminance.area")} unit={t("unit.squareMetre")} value={area} onChange={setArea} />
      <NumField label={t("calculators.illuminance.target")} unit={t("unit.lux")} value={target} onChange={setTarget} step={50} />
      <NumField label={t("calculators.illuminance.luminaireFlux")} unit={t("unit.lumen")} value={each} onChange={setEach} step={100} />
      <NumField label={t("calculators.illuminance.utilisation")} value={eta} onChange={setEta} min={0} max={1} step={0.05} decimals={2} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `E = ${q(outcome.result.illuminance_lx, "lux")}`}
      </ResultCard>
      {outcome?.result.luminairesNeeded !== undefined && (
        <Facts rows={[[t("calculators.illuminance.needed"), formatNumber(outcome.result.luminairesNeeded, locale, { maximumFractionDigits: 0 })]]} />
      )}
      <Text size="xs" c="dimmed">{t("calculators.illuminance.note")}</Text>
    </Stack>
  );
}

// ---- PE continuity check -----------------------------------------------------------------------------------------------------------

function PeContinuity({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [rho, setRho] = useState<number | string>(pn(prefill, "resistivity", 0.0225));
  const [length, setLength] = useState<number | string>(pn(prefill, "length", 20));
  const [section, setSection] = useState<number | string>(pn(prefill, "crossSection", 2.5));
  const [measured, setMeasured] = useState<number | string>(pn(prefill, "measured", 0.27));
  const [allowed, setAllowed] = useState<number | string>(pn(prefill, "allowedFactor", 0));

  const outcome = attempt(() =>
    calculatePeContinuityCheck({
      resistivity_ohm_mm2_per_m: num(rho),
      length_m: num(length),
      crossSection_mm2: num(section),
      measuredResistance_ohm: num(measured),
      ...(optional(allowed) !== undefined && { allowedFactor: optional(allowed)! }),
    }),
  );

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">{t("calculators.peContinuity.note")}</Text>
      <NumField label={t("calculators.peContinuity.resistivity")} unit={t("unit.ohmSquareMillimetrePerMetre")} value={rho} onChange={setRho} step={0.001} decimals={4} />
      <NumField label={t("calculators.peContinuity.length")} unit={t("unit.metre")} value={length} onChange={setLength} />
      <NumField label={t("calculators.peContinuity.crossSection")} unit={t("unit.squareMillimetre")} value={section} onChange={setSection} step={0.5} />
      <NumField label={t("calculators.peContinuity.measured")} unit={t("unit.ohm")} value={measured} onChange={setMeasured} step={0.01} />
      <NumField label={t("calculators.peContinuity.allowed")} value={allowed} onChange={setAllowed} step={0.1} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `R = ${q(outcome.result.expectedResistance_ohm, "ohm")}`}
      </ResultCard>
      {outcome && (
        <Facts
          rows={[
            [t("calculators.peContinuity.ratio"), formatNumber(outcome.result.ratio, locale, { maximumFractionDigits: 2 })],
            outcome.result.withinAllowed !== undefined && [t("calculators.peContinuity.verdict"), t(outcome.result.withinAllowed ? "calculators.peContinuity.within" : "calculators.peContinuity.over")],
          ]}
        />
      )}
    </Stack>
  );
}

// ---- material list ---------------------------------------------------------------------------------------------------------------------

const MAX_LINES = 8;

function MaterialList({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const [lines, setLines] = useState<{ quantity: number | string; price: number | string }[]>(() => {
    const given = Array.from({ length: MAX_LINES }, (_x, k) => k + 1).filter((n) => prefill[`quantity${n}`] !== undefined);
    return given.length > 0
      ? given.map((n) => ({ quantity: pn(prefill, `quantity${n}`, 1), price: pn(prefill, `price${n}`, 0) }))
      : [{ quantity: 50, price: 120 }, { quantity: 10, price: 300 }];
  });
  const [reserve, setReserve] = useState<number | string>(pn(prefill, "reserve", 0));

  const outcome = attempt(() =>
    calculateMaterialList({
      lines: lines.map((line) => ({ quantity: num(line.quantity), unitPrice: num(line.price) })),
      ...(optional(reserve) !== undefined && { reservePercent: optional(reserve)! }),
    }),
  );
  const money = (value: number) => formatNumber(value, locale, { maximumFractionDigits: 0 });
  const update = (index: number, key: "quantity" | "price", value: number | string) =>
    setLines((current) => current.map((line, k) => (k === index ? { ...line, [key]: value } : line)));

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">{t("calculators.materialList.hint")}</Text>
      {lines.map((line, index) => (
        <Stack key={index} gap="xs" data-line-index={index}>
          <Group justify="space-between">
            <Text fw={500}>{t("calculators.materialList.lineN", { n: index + 1 })}</Text>
            {lines.length > 1 && (
              <Button variant="subtle" size="xs" color="red" onClick={() => setLines((c) => c.filter((_x, k) => k !== index))}>
                {t("calculators.loadDemand.remove")}
              </Button>
            )}
          </Group>
          <NumField label={t("calculators.materialList.quantity")} value={line.quantity} onChange={(v) => update(index, "quantity", v)} />
          <NumField label={t("calculators.materialList.price")} value={line.price} onChange={(v) => update(index, "price", v)} step={10} decimals={0} />
          {outcome && <Text size="sm" c="dimmed">{t("calculators.materialList.lineTotal")}: {money(outcome.result.lineTotals[index] ?? 0)}</Text>}
        </Stack>
      ))}
      {lines.length < MAX_LINES && (
        <Button variant="light" onClick={() => setLines((c) => [...c, { quantity: 1, price: 0 }])}>
          {t("calculators.materialList.add")}
        </Button>
      )}
      <NumField label={t("calculators.materialList.reserve")} unit="%" value={reserve} onChange={setReserve} step={5} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `${t("calculators.materialList.total")}: ${money(outcome.result.total)}`}
      </ResultCard>
      {outcome?.result.totalWithReserve !== undefined && (
        <Facts rows={[[t("calculators.materialList.totalWithReserve"), money(outcome.result.totalWithReserve)]]} />
      )}
    </Stack>
  );
}

/** The calculator pages of the P2 set, by calculator id. */
export const P2_CALCULATORS: Partial<Record<CalculatorId, (props: Props) => ReactNode>> = {
  "ac-impedance": (props) => <AcImpedance {...props} />,
  capacitors: (props) => <Capacitors {...props} />,
  inductors: (props) => <Inductors {...props} />,
  "voltage-source": (props) => <VoltageSource {...props} />,
  "transformer-ratio": (props) => <TransformerRatio {...props} />,
  "charge-current": (props) => <ChargeCurrent {...props} />,
  "ac-values": (props) => <AcValues {...props} />,
  kirchhoff: (props) => <Kirchhoff {...props} />,
  "wheatstone-bridge": (props) => <WheatstoneBridge {...props} />,
  "meter-range-extension": (props) => <MeterRange {...props} />,
  "measurement-error": (props) => <MeasurementError {...props} />,
  "motor-basics": (props) => <MotorBasics {...props} />,
  "short-circuit-current": (props) => <ShortCircuit {...props} />,
  illuminance: (props) => <Illuminance {...props} />,
  "pe-continuity-check": (props) => <PeContinuity {...props} />,
  "material-list": (props) => <MaterialList {...props} />,
};

import { useState } from "react";
import { Button, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  balancePhases,
  calculateConnectionPower,
  calculateLoadDemand,
  calculatePhaseLoad,
  formatPercent,
  formatQuantity,
  powerDc,
  powerSinglePhase,
  powerThreePhase,
  solveMixedCircuit,
  solveOhmsLaw,
  solveParallelBranches,
  solveSeriesCircuit,
  type CalculatorId,
  type Locale,
} from "@elektro/shared";
import { attempt, NumField, ResultCard } from "./kit";

interface Props {
  locale: Locale;
  /** Pre-filled inputs from a lesson example (validated by `readPrefill`). */
  prefill: Record<string, string>;
}

/** A pre-filled number, or the default. */
const pn = (prefill: Record<string, string>, key: string, fallback: number): number =>
  prefill[key] === undefined ? fallback : Number(prefill[key].replace(",", "."));
/** A pre-filled choice, or the default; the value was checked against the calculator's spec. */
const pc = <T extends string>(prefill: Record<string, string>, key: string, fallback: T): T =>
  (prefill[key] as T | undefined) ?? fallback;

const num = (value: number | string) => (value === "" ? Number.NaN : Number(value));
const optional = (value: number | string) => (value === "" || Number(value) === 0 ? undefined : Number(value));

/** Quantity formatter bound to the unit labels and the locale. */
function useQ(locale: Locale) {
  const { t } = useTranslation();
  return (value: number, unit: string, digits = 4) =>
    formatQuantity(value, t(`unit.${unit}`), locale, { maximumSignificantDigits: digits });
}

function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <Text fw={500} mb={4}>
        {label}
      </Text>
      <SegmentedControl fullWidth value={value} onChange={(next) => onChange(next as T)} data={options} />
    </div>
  );
}

// ---- Ohm's law ---------------------------------------------------------------

function OhmsLaw({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  type Unknown = "voltage" | "current" | "resistance";
  const [unknown, setUnknown] = useState<Unknown>(pc<Unknown>(prefill, "unknown", "current"));
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 230));
  const [i, setI] = useState<number | string>(pn(prefill, "current", 5));
  const [r, setR] = useState<number | string>(pn(prefill, "resistance", 46));

  const outcome = attempt(() =>
    solveOhmsLaw({
      ...(unknown !== "voltage" && { voltage_V: num(u) }),
      ...(unknown !== "current" && { current_A: num(i) }),
      ...(unknown !== "resistance" && { resistance_ohm: num(r) }),
    }),
  );

  return (
    <Stack gap="md">
      <Choice
        label={t("calculators.ohmsLaw.unknown")}
        value={unknown}
        onChange={setUnknown}
        options={(["voltage", "current", "resistance"] as const).map((v) => ({ value: v, label: t(`calculators.quantity.${v}`) }))}
      />
      {unknown !== "voltage" && <NumField label={t("calculators.quantity.voltage")} unit={t("unit.volt")} value={u} onChange={setU} />}
      {unknown !== "current" && <NumField label={t("calculators.quantity.current")} unit={t("unit.ampere")} value={i} onChange={setI} step={0.5} />}
      {unknown !== "resistance" && <NumField label={t("calculators.quantity.resistance")} unit={t("unit.ohm")} value={r} onChange={setR} />}
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome &&
          q(
            unknown === "voltage" ? outcome.result.voltage_V : unknown === "current" ? outcome.result.current_A : outcome.result.resistance_ohm,
            unknown === "voltage" ? "volt" : unknown === "current" ? "ampere" : "ohm",
          )}
      </ResultCard>
    </Stack>
  );
}

// ---- Equivalent resistance ---------------------------------------------------

function EquivalentResistance({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  type Mode = "series" | "parallel" | "mixed";
  const [mode, setMode] = useState<Mode>(pc<Mode>(prefill, "mode", "series"));
  const [count, setCount] = useState<"2" | "3">("2");
  const [supply, setSupply] = useState<number | string>(pn(prefill, "supply", 24));
  const [rs, setRs] = useState<(number | string)[]>([pn(prefill, "r1", 10), pn(prefill, "r2", 20), pn(prefill, "r3", 30)]);

  const setR = (index: number, value: number | string) => setRs((current) => current.map((r, k) => (k === index ? value : r)));
  const used = mode === "mixed" ? 3 : Number(count);
  const values = rs.slice(0, used).map(num);

  const series = mode === "series" ? attempt(() => solveSeriesCircuit({ supplyVoltage_V: num(supply), resistances_ohm: values })) : null;
  const parallel = mode === "parallel" ? attempt(() => solveParallelBranches({ supplyVoltage_V: num(supply), resistances_ohm: values })) : null;
  const mixed =
    mode === "mixed"
      ? attempt(() => solveMixedCircuit({ supplyVoltage_V: num(supply), seriesResistance_ohm: values[0]!, parallelResistances_ohm: values.slice(1) }))
      : null;
  const outcome = series ?? parallel ?? mixed;

  return (
    <Stack gap="md">
      <Choice
        label={t("calculators.equivalent.mode")}
        value={mode}
        onChange={setMode}
        options={(["series", "parallel", "mixed"] as const).map((v) => ({ value: v, label: t(`calculators.equivalent.${v}`) }))}
      />
      {mode !== "mixed" && (
        <Choice
          label={t("calculators.equivalent.count")}
          value={count}
          onChange={setCount}
          options={[{ value: "2", label: "2" }, { value: "3", label: "3" }]}
        />
      )}
      {mode === "mixed" && <Text size="sm" c="dimmed">{t("calculators.equivalent.mixedHint")}</Text>}
      <NumField label={t("calculators.quantity.supplyVoltage")} unit={t("unit.volt")} value={supply} onChange={setSupply} />
      {rs.slice(0, used).map((r, index) => (
        <NumField key={index} label={t("calculators.equivalent.resistorN", { n: index + 1 })} unit={t("unit.ohm")} value={r} onChange={(v) => setR(index, v)} />
      ))}
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && q(outcome.result.totalResistance_ohm, "ohm")}
      </ResultCard>
      {series && (
        <Stack gap={2} data-testid="series-details">
          <Text size="sm">{t("calculators.equivalent.current")}: {q(series.result.current_A, "ampere")}</Text>
          {series.result.voltages_V.map((v, k) => (
            <Text size="sm" key={k}>{t("calculators.equivalent.voltageN", { n: k + 1 })}: {q(v, "volt")}</Text>
          ))}
        </Stack>
      )}
      {parallel && (
        <Stack gap={2} data-testid="parallel-details">
          <Text size="sm">{t("calculators.equivalent.totalCurrent")}: {q(parallel.result.totalCurrent_A, "ampere")}</Text>
          {parallel.result.branchCurrents_A.map((a, k) => (
            <Text size="sm" key={k}>{t("calculators.equivalent.branchN", { n: k + 1 })}: {q(a, "ampere")}</Text>
          ))}
        </Stack>
      )}
      {mixed && (
        <Stack gap={2} data-testid="mixed-details">
          <Text size="sm">{t("calculators.equivalent.totalCurrent")}: {q(mixed.result.totalCurrent_A, "ampere")}</Text>
          <Text size="sm">{t("calculators.equivalent.voltageN", { n: 1 })}: {q(mixed.result.seriesVoltage_V, "volt")}</Text>
          <Text size="sm">{t("calculators.equivalent.parallelVoltage")}: {q(mixed.result.parallelVoltage_V, "volt")}</Text>
          {mixed.result.branchCurrents_A.map((a, k) => (
            <Text size="sm" key={k}>{t("calculators.equivalent.branchN", { n: k + 2 })}: {q(a, "ampere")}</Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ---- DC power and energy -----------------------------------------------------

function PowerDc({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  type Pair = "ui" | "ir" | "ur";
  const [pair, setPair] = useState<Pair>(pc<Pair>(prefill, "known", "ui"));
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", 230));
  const [i, setI] = useState<number | string>(pn(prefill, "current", 10));
  const [r, setR] = useState<number | string>(pn(prefill, "resistance", 23));
  const [hours, setHours] = useState<number | string>(pn(prefill, "duration", 2));
  const [useful, setUseful] = useState<number | string>(pn(prefill, "useful", 0));

  const outcome = attempt(() =>
    powerDc({
      ...(pair !== "ir" && { voltage_V: num(u) }),
      ...(pair !== "ur" && { current_A: num(i) }),
      ...(pair !== "ui" && { resistance_ohm: num(r) }),
      ...(optional(hours) !== undefined && { duration_h: optional(hours)! }),
      ...(optional(useful) !== undefined && { usefulPower_W: optional(useful)! }),
    }),
  );

  return (
    <Stack gap="md">
      <Choice
        label={t("calculators.powerDc.known")}
        value={pair}
        onChange={setPair}
        options={[
          { value: "ui", label: "U, I" },
          { value: "ir", label: "I, R" },
          { value: "ur", label: "U, R" },
        ]}
      />
      {pair !== "ir" && <NumField label={t("calculators.quantity.voltage")} unit={t("unit.volt")} value={u} onChange={setU} />}
      {pair !== "ur" && <NumField label={t("calculators.quantity.current")} unit={t("unit.ampere")} value={i} onChange={setI} step={0.5} />}
      {pair !== "ui" && <NumField label={t("calculators.quantity.resistance")} unit={t("unit.ohm")} value={r} onChange={setR} />}
      <NumField label={t("calculators.powerDc.duration")} unit={t("unit.hour")} value={hours} onChange={setHours} step={0.5} />
      <NumField label={t("calculators.powerDc.useful")} unit={t("unit.watt")} value={useful} onChange={setUseful} step={10} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && q(outcome.result.power_W, "watt")}
      </ResultCard>
      {outcome?.result.energy_kWh !== undefined && (
        <Text size="sm">{t("calculators.powerDc.energy")}: {q(outcome.result.energy_kWh, "kilowattHour")}</Text>
      )}
      {outcome?.result.efficiency !== undefined && (
        <Text size="sm">{t("calculators.powerDc.efficiency")}: {formatPercent(outcome.result.efficiency * 100, locale)}</Text>
      )}
    </Stack>
  );
}

// ---- Load demand -------------------------------------------------------------

const MAX_LOADS = 8;

function LoadDemand({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [system, setSystem] = useState<"single-phase" | "three-phase">(pc(prefill, "system", "single-phase"));
  const [pf, setPf] = useState<number | string>(pn(prefill, "powerFactor", 1));
  const [days, setDays] = useState<number | string>(pn(prefill, "days", 30));
  const [loads, setLoads] = useState<{ power: number | string; hours: number | string }[]>(() => {
    const given = Array.from({ length: 8 }, (_x, k) => k + 1).filter((n) => prefill[`power${n}`] !== undefined);
    return given.length > 0
      ? given.map((n) => ({ power: pn(prefill, `power${n}`, 1000), hours: pn(prefill, `hours${n}`, 1) }))
      : [
          { power: 2000, hours: 1.5 },
          { power: 100, hours: 8 },
        ];
  });

  const update = (index: number, key: "power" | "hours", value: number | string) =>
    setLoads((current) => current.map((load, k) => (k === index ? { ...load, [key]: value } : load)));
  const voltage = system === "three-phase" ? 400 : 230;

  const outcome = attempt(() =>
    calculateLoadDemand({
      loads: loads.map((load) => ({ power_W: num(load.power), hoursPerDay: num(load.hours) })),
      voltage_V: voltage,
      system,
      powerFactor: num(pf),
      daysPerMonth: num(days),
    }),
  );

  return (
    <Stack gap="md">
      <Choice
        label={t("calculators.voltageDrop.system")}
        value={system}
        onChange={setSystem}
        options={[
          { value: "single-phase", label: t("calculators.voltageDrop.singlePhase") },
          { value: "three-phase", label: t("calculators.voltageDrop.threePhase") },
        ]}
      />
      <Text size="sm" c="dimmed">{t("calculators.loadDemand.voltageNote", { voltage })}</Text>
      {loads.map((load, index) => (
        <Stack key={index} gap="xs" data-load-index={index}>
          <Group justify="space-between">
            <Text fw={500}>{t("calculators.loadDemand.loadN", { n: index + 1 })}</Text>
            {loads.length > 1 && (
              <Button variant="subtle" size="xs" color="red" onClick={() => setLoads((c) => c.filter((_l, k) => k !== index))}>
                {t("calculators.loadDemand.remove")}
              </Button>
            )}
          </Group>
          <NumField label={t("calculators.loadDemand.power")} unit={t("unit.watt")} value={load.power} onChange={(v) => update(index, "power", v)} step={100} />
          <NumField label={t("calculators.loadDemand.hours")} unit={t("unit.hour")} value={load.hours} onChange={(v) => update(index, "hours", v)} step={0.5} max={24} />
        </Stack>
      ))}
      {loads.length < MAX_LOADS && (
        <Button variant="light" onClick={() => setLoads((c) => [...c, { power: 1000, hours: 1 }])}>
          {t("calculators.loadDemand.add")}
        </Button>
      )}
      <NumField label={t("calculators.quantity.powerFactor")} value={pf} onChange={setPf} min={0} max={1} step={0.05} decimals={2} />
      <NumField label={t("calculators.loadDemand.days")} unit={t("unit.day")} value={days} onChange={setDays} max={31} decimals={0} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `Ib = ${q(outcome.result.designCurrent_A, "ampere")}`}
      </ResultCard>
      {outcome && (
        <Stack gap={2}>
          <Text size="sm">{t("calculators.loadDemand.totalPower")}: {q(outcome.result.totalPower_W, "watt")}</Text>
          <Text size="sm">{t("calculators.loadDemand.dailyEnergy")}: {q(outcome.result.dailyEnergy_kWh, "kilowattHour")}</Text>
          <Text size="sm">{t("calculators.loadDemand.monthlyEnergy")}: {q(outcome.result.monthlyEnergy_kWh, "kilowattHour")}</Text>
          <Text size="xs" c="dimmed">{t("calculators.loadDemand.noFactors")}</Text>
        </Stack>
      )}
    </Stack>
  );
}

// ---- AC power (single- and three-phase) -------------------------------------

function AcPower({ locale, prefill, threePhase }: Props & { threePhase: boolean }) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [known, setKnown] = useState<"current" | "power">(pc(prefill, "known", "current"));
  const [u, setU] = useState<number | string>(pn(prefill, "voltage", threePhase ? 400 : 230));
  const [i, setI] = useState<number | string>(pn(prefill, "current", 10));
  const [p, setP] = useState<number | string>(pn(prefill, "power", 2000));
  const [pf, setPf] = useState<number | string>(pn(prefill, "powerFactor", 0.8));

  const common = known === "current" ? { current_A: num(i) } : { activePower_W: num(p) };
  const outcome = attempt(() =>
    threePhase
      ? powerThreePhase({ lineVoltage_V: num(u), powerFactor: num(pf), ...common })
      : powerSinglePhase({ voltage_V: num(u), powerFactor: num(pf), ...common }),
  );

  return (
    <Stack gap="md">
      <Choice
        label={t("calculators.ac.known")}
        value={known}
        onChange={setKnown}
        options={[
          { value: "current", label: t("calculators.quantity.current") },
          { value: "power", label: t("calculators.quantity.activePower") },
        ]}
      />
      <NumField label={threePhase ? t("calculators.quantity.lineVoltage") : t("calculators.quantity.voltage")} unit={t("unit.volt")} value={u} onChange={setU} step={10} />
      {known === "current" ? (
        <NumField label={t("calculators.quantity.current")} unit={t("unit.ampere")} value={i} onChange={setI} step={0.5} />
      ) : (
        <NumField label={t("calculators.quantity.activePower")} unit={t("unit.watt")} value={p} onChange={setP} step={100} />
      )}
      <NumField label={t("calculators.quantity.powerFactor")} value={pf} onChange={setPf} min={0} max={1} step={0.05} decimals={2} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && `P = ${q(outcome.result.activePower_W, "watt")}`}
      </ResultCard>
      {outcome && (
        <Stack gap={2}>
          <Text size="sm">{t("calculators.quantity.current")}: {q(outcome.result.current_A, "ampere")}</Text>
          <Text size="sm">{t("calculators.quantity.apparentPower")}: {q(outcome.result.apparentPower_VA, "voltampere")}</Text>
          <Text size="sm">{t("calculators.quantity.reactivePower")}: {q(outcome.result.reactivePower_var, "var")}</Text>
        </Stack>
      )}
    </Stack>
  );
}

// ---- Connection power --------------------------------------------------------

function ConnectionPower({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [system, setSystem] = useState<"single-phase" | "three-phase">(pc(prefill, "system", "single-phase"));
  const [breaker, setBreaker] = useState<number | string>(pn(prefill, "breaker", 25));
  const [demand, setDemand] = useState<number | string>(pn(prefill, "demand", 0));
  const voltage = system === "three-phase" ? 400 : 230;

  const outcome = attempt(() =>
    calculateConnectionPower({
      system,
      voltage_V: voltage,
      mainBreaker_A: num(breaker),
      ...(optional(demand) !== undefined && { demandPower_W: optional(demand)! }),
    }),
  );

  return (
    <Stack gap="md">
      <Choice
        label={t("calculators.voltageDrop.system")}
        value={system}
        onChange={setSystem}
        options={[
          { value: "single-phase", label: t("calculators.voltageDrop.singlePhase") },
          { value: "three-phase", label: t("calculators.voltageDrop.threePhase") },
        ]}
      />
      <Text size="sm" c="dimmed">{t("calculators.loadDemand.voltageNote", { voltage })}</Text>
      <NumField label={t("calculators.connection.breaker")} unit={t("unit.ampere")} value={breaker} onChange={setBreaker} decimals={0} />
      <NumField label={t("calculators.connection.demand")} unit={t("unit.watt")} value={demand} onChange={setDemand} step={100} />
      <ResultCard outcome={outcome} steps={outcome?.steps ?? []} locale={locale}>
        {outcome && q(outcome.result.availablePower_W, "watt")}
      </ResultCard>
      {outcome?.result.sufficient !== undefined && (
        <Text size="sm" fw={600} c={outcome.result.sufficient ? "green" : "red"} data-testid="connection-verdict">
          {outcome.result.sufficient ? "✓ " : "✗ "}
          {t(outcome.result.sufficient ? "calculators.connection.enough" : "calculators.connection.notEnough", {
            margin: q(Math.abs(outcome.result.margin_W!), "watt"),
          })}
        </Text>
      )}
    </Stack>
  );
}

// ---- Phase balancing ---------------------------------------------------------

const MAX_CIRCUITS = 12;

function PhaseBalancing({ locale, prefill }: Props) {
  const { t } = useTranslation();
  const q = useQ(locale);
  const [circuits, setCircuits] = useState<{ current: number | string; phase: "0" | "1" | "2" }[]>(() => {
    const given = Array.from({ length: 12 }, (_x, k) => k + 1).filter((n) => prefill[`current${n}`] !== undefined);
    return given.length > 0
      ? given.map((n) => ({ current: pn(prefill, `current${n}`, 10), phase: pc<"0" | "1" | "2">(prefill, `phase${n}`, "0") }))
      : [
          { current: 10, phase: "0" },
          { current: 16, phase: "0" },
          { current: 6, phase: "1" },
          { current: 13, phase: "2" },
        ];
  });

  const update = (index: number, change: Partial<(typeof circuits)[number]>) =>
    setCircuits((current) => current.map((c, k) => (k === index ? { ...c, ...change } : c)));

  const parsed = circuits.map((c) => ({ current_A: num(c.current), phase: Number(c.phase) }));
  const load = attempt(() => calculatePhaseLoad(parsed));
  const suggestion = attempt(() => balancePhases(parsed.map((c) => c.current_A)));
  const names = ["L1", "L2", "L3"];

  return (
    <Stack gap="md">
      {circuits.map((circuit, index) => (
        <Stack key={index} gap="xs" data-circuit-index={index}>
          <Group justify="space-between">
            <Text fw={500}>{t("calculators.balancing.circuitN", { n: index + 1 })}</Text>
            {circuits.length > 1 && (
              <Button variant="subtle" size="xs" color="red" onClick={() => setCircuits((c) => c.filter((_x, k) => k !== index))}>
                {t("calculators.loadDemand.remove")}
              </Button>
            )}
          </Group>
          <NumField label={t("calculators.quantity.current")} unit={t("unit.ampere")} value={circuit.current} onChange={(v) => update(index, { current: v })} step={1} />
          <SegmentedControl
            fullWidth
            aria-label={t("calculators.balancing.phase")}
            value={circuit.phase}
            onChange={(v) => update(index, { phase: v as "0" | "1" | "2" })}
            data={names.map((name, k) => ({ value: String(k), label: name }))}
          />
        </Stack>
      ))}
      {circuits.length < MAX_CIRCUITS && (
        <Button variant="light" onClick={() => setCircuits((c) => [...c, { current: 10, phase: "0" }])}>
          {t("calculators.balancing.add")}
        </Button>
      )}
      <ResultCard outcome={load} steps={load?.steps ?? []} locale={locale}>
        {load && t("calculators.balancing.mostLoaded", { phase: names[load.result.mostLoadedPhase], value: q(load.result.phaseCurrents_A[load.result.mostLoadedPhase]!, "ampere") })}
      </ResultCard>
      {suggestion && load && (
        <Stack gap={2} data-testid="balancing-suggestion">
          <Text fw={600}>{t("calculators.balancing.suggestion")}</Text>
          {suggestion.result.suggestedPhases.map((phase, index) => (
            <Text size="sm" key={index}>
              {t("calculators.balancing.circuitN", { n: index + 1 })}: {names[phase]}
              {phase !== Number(circuits[index]!.phase) ? ` (${t("calculators.balancing.move")})` : ""}
            </Text>
          ))}
          <Text size="sm">
            {t("calculators.balancing.after", { before: q(load.result.imbalance_A, "ampere"), after: q(suggestion.result.after.imbalance_A, "ampere") })}
          </Text>
          <Text size="xs" c="dimmed">{t("calculators.balancing.note")}</Text>
        </Stack>
      )}
    </Stack>
  );
}

/** The calculator pages of the physics set, by calculator id. */
export const PHYSICS_CALCULATORS: Partial<Record<CalculatorId, (props: Props) => React.ReactNode>> = {
  "ohms-law": (props) => <OhmsLaw {...props} />,
  "equivalent-resistance": (props) => <EquivalentResistance {...props} />,
  "power-dc": (props) => <PowerDc {...props} />,
  "load-demand": (props) => <LoadDemand {...props} />,
  "power-ac-single": (props) => <AcPower {...props} threePhase={false} />,
  "power-three-phase": (props) => <AcPower {...props} threePhase />,
  "connection-power": (props) => <ConnectionPower {...props} />,
  "phase-balancing": (props) => <PhaseBalancing {...props} />,
};

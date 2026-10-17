import { createRng, type TaskTemplate } from "@elektro/shared";

/** The i18n sections a template's texts come from (plan §2.7). */
export interface PracticeI18n {
  practiceScenario?: Record<string, string>;
  calcStep?: Record<string, string>;
  practiceHint?: Record<string, string>;
}

export interface TaskTexts {
  scenarios: Record<string, string>;
  stepLabels: Record<string, string>;
  hints: Record<string, string>;
}

/** Seeds tried to discover every scenario variant a template can produce. */
const PROBE_SEEDS = 200;

/** The scenario keys a template can produce (e.g. single- and three-phase). */
export function scenarioKeysOf(template: TaskTemplate): string[] {
  const keys = new Set<string>();
  for (let seed = 1; seed <= PROBE_SEEDS; seed++) {
    keys.add(template.scenarioKey(template.generate(createRng(seed))));
  }
  return [...keys].sort();
}

/**
 * Collects the texts of one template from the i18n resources. Throws on a
 * missing text: a template must not reach the review tables half translated.
 */
export function collectTaskTexts(template: TaskTemplate, i18n: PracticeI18n): TaskTexts {
  const pick = (section: Record<string, string> | undefined, key: string, name: string) => {
    const text = section?.[key];
    if (text === undefined) {
      throw new Error(`Missing ${name}.${key} for template ${template.id}`);
    }
    return text;
  };

  const scenarios: Record<string, string> = {};
  for (const key of scenarioKeysOf(template)) {
    scenarios[key] = pick(i18n.practiceScenario, key, "practiceScenario");
  }

  const stepLabels: Record<string, string> = {};
  const hints: Record<string, string> = {};
  for (const step of template.steps) {
    stepLabels[step.id] = pick(i18n.calcStep, step.id, "calcStep");
    hints[step.id] = pick(i18n.practiceHint, step.id, "practiceHint");
  }
  return { scenarios, stepLabels, hints };
}

import { describe, expect, it } from "vitest";
import {
  CALCULATOR_IDS,
  CONTENT_STATUSES,
  ERROR_CODES,
  EXAM_PARTS,
  FORMULAS,
  LOCALES,
  MODULES,
  ROLES,
  TOPIC_IDS,
  UNITS,
  CONTENT_ACTIONS,
  MASTERY_LEVELS,
  MISCONCEPTION_IDS,
  REPORT_CATEGORIES,
  TABLE_ACTIONS,
  TABLE_STATUSES,
  REPORT_TARGET_KINDS,
  TEMPLATES,
  buildTask,
  calculateVoltageDrop,
} from "@elektro/shared";
import hu from "./locales/hu/common.json";
import { localeFromPathname, localePath } from "./locale";

/**
 * No hard-coded user-facing text: anything the UI can render must have a key.
 * These tests fail when a topic, status or error code is added without its
 * Hungarian translation.
 */
describe("hu translations", () => {
  it("covers every topic ID", () => {
    for (const topicId of TOPIC_IDS) {
      expect(hu.topic, `missing topic.${topicId}`).toHaveProperty(topicId);
    }
  });

  it("covers every syllabus module", () => {
    for (const module of MODULES) {
      expect(hu.module, `missing module.${module}`).toHaveProperty(module);
    }
  });

  it("covers every exam part", () => {
    for (const part of EXAM_PARTS) {
      expect(hu.examPart, `missing examPart.${part}`).toHaveProperty(part);
    }
  });

  it("covers every role", () => {
    for (const role of ROLES) {
      expect(hu.role, `missing role.${role}`).toHaveProperty(role);
    }
  });

  it("covers every unit", () => {
    for (const unit of UNITS) {
      expect(hu.unit, `missing unit.${unit}`).toHaveProperty(unit);
    }
  });

  it("names every step of the voltage-drop calculation", () => {
    const { steps } = calculateVoltageDrop({
      current_A: 1,
      length_m: 1,
      crossSection_mm2: 1,
      resistivity_ohm_mm2_per_m: 1,
      nominalVoltage_V: 1,
      system: "single-phase",
    });
    for (const step of steps) {
      expect(hu.calcStep, `missing calcStep.${step.id}`).toHaveProperty(step.id);
      expect(FORMULAS).toHaveProperty(step.formulaId);
    }
  });

  it("covers every content status", () => {
    for (const status of CONTENT_STATUSES) {
      expect(hu.lessons.status, `missing lessons.status.${status}`).toHaveProperty(status);
    }
  });

  it("covers every API error code", () => {
    for (const code of Object.values(ERROR_CODES)) {
      expect(hu.error, `missing error.${code}`).toHaveProperty(code);
    }
  });

  it("names every calculator implemented in code (content page)", () => {
    for (const id of CALCULATOR_IDS) {
      expect(hu.contentAdmin.calculatorIds, `missing contentAdmin.calculatorIds.${id}`).toHaveProperty(id);
    }
  });

  it("covers every misconception, mastery level and review action", () => {
    for (const id of MISCONCEPTION_IDS) {
      expect(hu.misconception, `missing misconception.${id}`).toHaveProperty(id);
    }
    for (const level of MASTERY_LEVELS) {
      expect(hu.mastery, `missing mastery.${level}`).toHaveProperty(level);
    }
    for (const action of CONTENT_ACTIONS) {
      expect(hu.review.action, `missing review.action.${action}`).toHaveProperty(action);
    }
  });

  it("covers every report category and target kind, and every examinable exam part", () => {
    for (const category of REPORT_CATEGORIES) {
      expect(hu.report.categories, `missing report.categories.${category}`).toHaveProperty(category);
    }
    for (const kind of REPORT_TARGET_KINDS) {
      expect(hu.report.kinds, `missing report.kinds.${kind}`).toHaveProperty(kind);
    }
    for (const action of CONTENT_ACTIONS) {
      expect(hu.teacher.review.done, `missing teacher.review.done.${action}`).toHaveProperty(action);
    }
  });

  it("covers every reference table status and action", () => {
    for (const status of TABLE_STATUSES) {
      expect(hu.referenceTables.status, `missing referenceTables.status.${status}`).toHaveProperty(status);
    }
    for (const action of [...TABLE_ACTIONS, "create"]) {
      expect(hu.referenceTables.action, `missing referenceTables.action.${action}`).toHaveProperty(action);
    }
  });

  it("covers every practice scenario, given value, step and hint", () => {
    for (const template of TEMPLATES) {
      for (let seed = 1; seed <= 40; seed++) {
        const { params } = buildTask(template.id, seed);
        const scenario = template.scenarioKey(params);
        expect(hu.practiceScenario, `missing practiceScenario.${scenario}`).toHaveProperty([scenario]);
        for (const given of template.givens(params)) {
          expect(hu.given, `missing given.${given.id}`).toHaveProperty(given.id);
        }
        if (typeof params["material"] === "string") {
          expect(hu.material, `missing material.${params["material"]}`).toHaveProperty(params["material"]);
        }
      }
      for (const step of template.steps) {
        expect(hu.calcStep, `missing calcStep.${step.id}`).toHaveProperty([step.id]);
        expect(hu.practiceHint, `missing practiceHint.${step.id}`).toHaveProperty([step.id]);
      }
    }
  });

  it("has no empty strings", () => {
    const walk = (value: unknown, path: string): void => {
      if (typeof value === "string") {
        expect(value.trim(), `empty translation at ${path}`).not.toBe("");
        return;
      }
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        walk(child, path ? `${path}.${key}` : key);
      }
    };

    walk(hu, "");
  });
});

describe("localeFromPathname", () => {
  it("reads the locale from the first path segment", () => {
    expect(localeFromPathname("/hu/lessons")).toBe("hu");
    expect(localeFromPathname("/hu")).toBe("hu");
  });

  it("falls back to the default locale for unknown or missing segments", () => {
    expect(localeFromPathname("/")).toBe("hu");
    expect(localeFromPathname("/de/lessons")).toBe("hu");
    expect(localeFromPathname("")).toBe("hu");
  });

  it("only ever returns a supported locale", () => {
    expect(LOCALES).toContain(localeFromPathname("/xx"));
  });
});

describe("localePath", () => {
  it("builds locale-prefixed URLs", () => {
    expect(localePath("hu")).toBe("/hu");
    expect(localePath("hu", "lessons")).toBe("/hu/lessons");
    expect(localePath("hu", "/lessons")).toBe("/hu/lessons");
  });
});

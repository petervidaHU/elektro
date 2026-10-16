import { describe, expect, it } from "vitest";
import {
  CONTENT_STATUSES,
  ERROR_CODES,
  EXAM_PARTS,
  FORMULAS,
  LOCALES,
  MODULES,
  ROLES,
  TOPIC_IDS,
  UNITS,
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

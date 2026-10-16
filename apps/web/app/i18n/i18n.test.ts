import { describe, expect, it } from "vitest";
import {
  CONTENT_STATUSES,
  ERROR_CODES,
  LOCALES,
  TOPIC_GROUPS,
  TOPIC_IDS,
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

  it("covers every topic group", () => {
    for (const group of TOPIC_GROUPS) {
      expect(hu.topicGroup, `missing topicGroup.${group}`).toHaveProperty(group);
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

import { describe, expect, it } from "vitest";
import {
  lessonBodySchema,
  lessonGoals,
  lessonSections,
  parseLessonBody,
  validateLessonBody,
} from "./lesson-body.js";

const VALID = `
:::goals
- Ki tudod számítani a feszültségesést.
- Tudod, mitől függ.
:::

## Mi a feszültségesés?

A vezeték ellenállásán **feszültség esik**.

::formula{id="voltage-drop"}

## Példa

:::example
16 A, 25 m, 2,5 mm² réz.
:::

:::safety
Feszültség alatt soha ne mérj ellenállást.
:::

:::mistake
Az egyirányú hossz helyett az oda-vissza hosszat veszik.
:::

:::exam
A III. vizsgarészben számolni kell vele.
:::
`;

describe("validateLessonBody", () => {
  it("accepts Markdown with the supported blocks", () => {
    expect(validateLessonBody(VALID)).toEqual({ ok: true, errors: [] });
  });

  it("rejects unknown blocks, naming them", () => {
    const result = validateLessonBody(":::quiz\nKérdés?\n:::");
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual({ code: "unknown-block", block: "quiz" });
  });

  it("rejects a formula block without a registered formula", () => {
    expect(validateLessonBody('::formula{id="no-such-formula"}').errors).toContainEqual({
      code: "unknown-formula",
      block: "formula",
      value: "no-such-formula",
    });
    expect(validateLessonBody("::formula").errors).toContainEqual({
      code: "unknown-formula",
      block: "formula",
      value: "",
    });
  });

  it("rejects a known block written in the wrong form", () => {
    // `formula` is a leaf (`::formula{...}`), `safety` a container (`:::safety`).
    expect(validateLessonBody(':::formula{id="voltage-drop"}\n:::').ok).toBe(false);
    expect(validateLessonBody("::safety").ok).toBe(false);
  });

  it("treats colons inside ordinary text as text, not as blocks", () => {
    expect(validateLessonBody("Arány: 1:2, idő 16:30, jelölés :x").ok).toBe(true);
  });

  it("rejects an empty body", () => {
    expect(validateLessonBody("  \n").ok).toBe(false);
  });
});

describe("lessonBodySchema", () => {
  it("is the zod form of the validator, for request bodies", () => {
    expect(lessonBodySchema.safeParse(VALID).success).toBe(true);
    expect(lessonBodySchema.safeParse(":::quiz\nx\n:::").success).toBe(false);
  });
});

describe("lessonSections", () => {
  it("lists the level-2 headings with stable, URL-safe ids", () => {
    expect(lessonSections(parseLessonBody(VALID))).toEqual([
      { id: "mi-a-feszultsegeses", title: "Mi a feszültségesés?" },
      { id: "pelda", title: "Példa" },
    ]);
  });

  it("keeps ids unique when headings repeat", () => {
    const sections = lessonSections(parseLessonBody("## Példa\n\n## Példa"));
    expect(sections.map((section) => section.id)).toEqual(["pelda", "pelda-2"]);
  });
});

describe("lessonGoals", () => {
  it("returns the items of the goals block", () => {
    expect(lessonGoals(parseLessonBody(VALID))).toEqual([
      "Ki tudod számítani a feszültségesést.",
      "Tudod, mitől függ.",
    ]);
  });

  it("is empty when the lesson has no goals block", () => {
    expect(lessonGoals(parseLessonBody("Szöveg."))).toEqual([]);
  });
});

describe("glossary term references", () => {
  it("keeps :term[label]{id=key} as a term reference and accepts it", () => {
    const body = "A :term[feszültségesés]{id=voltage-drop} fontos.";
    expect(validateLessonBody(body).ok).toBe(true);
    const tree = parseLessonBody(body);
    const paragraph = tree.children[0] as { children: { type: string; name?: string }[] };
    expect(paragraph.children.some((node) => node.type === "textDirective" && node.name === "term")).toBe(true);
  });

  it("rejects a term reference without a valid id", () => {
    expect(validateLessonBody(":term[valami]").ok).toBe(false);
    expect(validateLessonBody(":term[valami]{id=Bad Id}").ok).toBe(false);
  });

  it("still treats other inline colons as plain text", () => {
    expect(validateLessonBody("Arány 1:2, idő 16:30 és :valami.").ok).toBe(true);
  });
});

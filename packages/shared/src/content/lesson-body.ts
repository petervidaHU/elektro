import type { Nodes, Parent, Root, RootContent } from "mdast";
import { directiveFromMarkdown } from "mdast-util-directive";
import { fromMarkdown } from "mdast-util-from-markdown";
import { directive } from "micromark-extension-directive";
import { z } from "zod";
import { isFormulaId } from "../calc/formulas.js";

/**
 * Lesson bodies are Markdown plus a small set of blocks
 * (docs/DEVELOPMENT_PLAN.md §1.3), parsed once here so that saving (API
 * validation) and reading (web renderer) agree on the same tree:
 *
 *     :::goals / :::example / :::safety / :::mistake / :::exam   container blocks
 *     ::formula{id="voltage-drop"}                                 leaf block
 *
 *     :term[label]{id=voltage-drop}                                inline glossary reference
 *
 * A formula is rendered from the shared registry, so the text and the engine
 * can never disagree. Anything else written as a block is rejected on save.
 * The `next` links are added by the reader, never authored.
 */
export const LESSON_CONTAINER_BLOCKS = ["goals", "example", "safety", "mistake", "exam"] as const;
export const LESSON_LEAF_BLOCKS = ["formula"] as const;

export type LessonContainerBlock = (typeof LESSON_CONTAINER_BLOCKS)[number];

export type LessonBodyError =
  | { code: "empty" }
  | { code: "invalid-term"; value: string }
  | { code: "unknown-block"; block: string }
  | { code: "unknown-formula"; block: "formula"; value: string };

export interface LessonSection {
  id: string;
  title: string;
}

/**
 * Parses a lesson body. Inline `:name` text directives are turned back into
 * plain text, so ordinary colons ("16:30", "Arány: 1:2") are never blocks.
 */
export function parseLessonBody(markdown: string): Root {
  const tree = fromMarkdown(markdown, {
    extensions: [directive()],
    mdastExtensions: [directiveFromMarkdown()],
  });
  restoreTextDirectives(tree, markdown);
  return tree;
}

/** Glossary term keys are slugs (schemas/glossary.ts). */
const TERM_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `:term[label]{id=key}` with a label and a slug key is a glossary reference. */
function isTermReference(node: { name: string; attributes?: Record<string, string | null | undefined> | null; children: unknown[] }): boolean {
  return node.name === "term" && node.children.length > 0 && TERM_KEY.test(node.attributes?.["id"] ?? "");
}

function restoreTextDirectives(parent: Parent, source: string): void {
  parent.children = parent.children.map((child) => {
    if (child.type === "textDirective" && !isTermReference(child)) {
      const start = child.position?.start.offset;
      const end = child.position?.end.offset;
      const value =
        start !== undefined && end !== undefined ? source.slice(start, end) : `:${child.name}`;
      return { type: "text", value } as RootContent;
    }
    if ("children" in child) {
      restoreTextDirectives(child as Parent, source);
    }
    return child;
  }) as Parent["children"];
}

export function validateLessonBody(markdown: string): { ok: boolean; errors: LessonBodyError[] } {
  if (markdown.trim() === "") {
    return { ok: false, errors: [{ code: "empty" }] };
  }

  const errors: LessonBodyError[] = [];
  let termReferences = 0;

  visit(parseLessonBody(markdown), (node) => {
    if (node.type === "textDirective") {
      // Only valid term references survive parsing; anything else is plain text.
      termReferences++;
      return;
    }
    if (node.type === "containerDirective") {
      if (!(LESSON_CONTAINER_BLOCKS as readonly string[]).includes(node.name)) {
        errors.push({ code: "unknown-block", block: node.name });
      }
    } else if (node.type === "leafDirective") {
      if (!(LESSON_LEAF_BLOCKS as readonly string[]).includes(node.name)) {
        errors.push({ code: "unknown-block", block: node.name });
      } else {
        const id = node.attributes?.["id"] ?? "";
        if (!isFormulaId(id)) {
          errors.push({ code: "unknown-formula", block: "formula", value: id });
        }
      }
    }
  });

  // Every `:term[` the author wrote must have become a valid reference.
  const written = (markdown.match(/:term\[/g) ?? []).length;
  if (written !== termReferences) {
    errors.push({ code: "invalid-term", value: "term" });
  }

  return { ok: errors.length === 0, errors };
}

/** For request bodies: a lesson body that passes `validateLessonBody`. */
export const lessonBodySchema = z
  .string()
  .max(200_000)
  .superRefine((value, context) => {
    for (const error of validateLessonBody(value).errors) {
      context.addIssue({ code: "custom", message: error.code, params: error });
    }
  });

/** Level-2 headings: the sections the reader tracks for progress and resume. */
export function lessonSections(tree: Root): LessonSection[] {
  const used = new Map<string, number>();
  const sections: LessonSection[] = [];

  for (const node of tree.children) {
    if (node.type === "heading" && node.depth === 2) {
      const title = plainText(node);
      const base = slugify(title) || "szakasz";
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      sections.push({ id: count === 1 ? base : `${base}-${count}`, title });
    }
  }

  return sections;
}

/** The items of the `:::goals` block - what the lesson summary repeats. */
export function lessonGoals(tree: Root): string[] {
  const goals = tree.children.find(
    (node) => node.type === "containerDirective" && node.name === "goals",
  );
  if (!goals || !("children" in goals)) {
    return [];
  }

  const items: string[] = [];
  visit(goals, (node) => {
    if (node.type === "listItem") {
      items.push(plainText(node).trim());
    }
  });
  return items;
}

/** The text content of a node, without Markdown syntax. */
export function plainText(node: Nodes): string {
  if ("value" in node && typeof node.value === "string") {
    return node.value;
  }
  if ("children" in node) {
    return (node.children as Nodes[]).map(plainText).join(node.type === "listItem" ? " " : "");
  }
  return "";
}

/** URL-safe id from a heading: lower case, accents removed, dashes. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function visit(node: Nodes, callback: (node: Nodes) => void): void {
  callback(node);
  if ("children" in node) {
    for (const child of node.children as Nodes[]) {
      visit(child, callback);
    }
  }
}

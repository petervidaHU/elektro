import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import {
  getTopic,
  isLocale,
  isTopicId,
  validateLessonBody,
  type TopicId,
} from "@elektro/shared";

/**
 * Lesson drafts as files (docs/THEORY_TOC.md), under `content/lessons/`:
 *
 *     <locale>/<module>/<topicId>/<NN>-<slug>.md
 *
 * The path says where the lesson belongs and its order in the topic; the
 * front matter carries the texts:
 *
 *     ---
 *     title: Ohm törvénye
 *     summary: Egy mondat a lecke tartalmáról.
 *     verify:
 *       - Állítás, amelyet az oktatónak forrás alapján ellenőriznie kell
 *     ---
 *
 * `checkLessonFiles` validates a whole folder before anything is seeded.
 */
export interface LessonFile {
  /** Path relative to the lessons root, with "/" separators. */
  path: string;
  locale: string;
  module: string;
  topicId: TopicId;
  position: number;
  slug: string;
  title: string;
  summary: string;
  /** Claims the author flagged for checking against a source. */
  verify: string[];
  body: string;
}

export interface LessonFileIssue {
  path: string;
  code:
    | "bad-path"
    | "bad-frontmatter"
    | "unknown-locale"
    | "unknown-topic"
    | "wrong-module"
    | "missing-title"
    | "missing-summary"
    | "duplicate-slug"
    | "duplicate-position"
    | "invalid-body";
  detail?: string;
}

const PATH_PATTERN = /^([a-z]{2})\/([a-z-]+)\/([a-z0-9-]+)\/(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;

export function parseLessonPath(
  path: string,
):
  | { ok: true; locale: string; module: string; topicId: string; position: number; slug: string }
  | { ok: false } {
  const match = PATH_PATTERN.exec(path);
  if (!match) {
    return { ok: false };
  }
  const [, locale, module, topicId, position, slug] = match;
  return { ok: true, locale: locale!, module: module!, topicId: topicId!, position: Number(position), slug: slug! };
}

function unquote(value: string): string {
  const trimmed = value.trim();
  return /^(["']).*\1$/.test(trimmed) ? trimmed.slice(1, -1) : trimmed;
}

/** A minimal front matter reader: `key: value` lines and `- item` lists. */
export function parseFrontmatter(
  source: string,
): { ok: true; data: { title: string; summary: string; verify: string[] }; body: string } | { ok: false } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) {
    return { ok: false };
  }

  const data = { title: "", summary: "", verify: [] as string[] };
  let listKey: string | null = null;

  for (const line of match[1]!.split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey === "verify") {
      data.verify.push(unquote(item[1]!));
      continue;
    }
    const pair = /^([a-z]+):\s*(.*)$/.exec(line);
    if (pair) {
      const [, key, value] = pair;
      listKey = value === "" ? key! : null;
      if (key === "title") data.title = unquote(value!);
      if (key === "summary") data.summary = unquote(value!);
    }
  }

  return { ok: true, data, body: source.slice(match[0].length).trim() };
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Reads every `.md` file under `root`; files that cannot be read become issues. */
export function loadLessonFiles(root: string): { files: LessonFile[]; issues: LessonFileIssue[] } {
  const files: LessonFile[] = [];
  const issues: LessonFileIssue[] = [];

  for (const full of walk(root).filter((file) => file.endsWith(".md"))) {
    const path = relative(root, full).split(sep).join("/");
    const location = parseLessonPath(path);
    if (!location.ok) {
      issues.push({ path, code: "bad-path" });
      continue;
    }
    const parsed = parseFrontmatter(readFileSync(full, "utf8"));
    if (!parsed.ok) {
      issues.push({ path, code: "bad-frontmatter" });
      continue;
    }
    files.push({
      path,
      locale: location.locale,
      module: location.module,
      topicId: location.topicId as TopicId,
      position: location.position,
      slug: location.slug,
      ...parsed.data,
      body: parsed.body,
    });
  }

  return { files: files.sort((a, b) => a.path.localeCompare(b.path)), issues };
}

/** Everything that would make a seed fail or store a wrong lesson. */
export function checkLessonFiles(files: readonly LessonFile[]): LessonFileIssue[] {
  const issues: LessonFileIssue[] = [];
  const slugs = new Map<string, string>();
  const positions = new Map<string, string>();

  for (const file of files) {
    const issue = (code: LessonFileIssue["code"], detail?: string) =>
      issues.push({ path: file.path, code, ...(detail ? { detail } : {}) });

    if (!isLocale(file.locale)) issue("unknown-locale", file.locale);
    if (!isTopicId(file.topicId)) {
      issue("unknown-topic", file.topicId);
    } else if (getTopic(file.topicId).module !== file.module) {
      issue("wrong-module", `${file.topicId} belongs to ${getTopic(file.topicId).module}`);
    }
    if (!file.title.trim()) issue("missing-title");
    if (!file.summary.trim()) issue("missing-summary");

    const slugKey = `${file.locale}/${file.slug}`;
    if (slugs.has(slugKey)) issue("duplicate-slug", `also in ${slugs.get(slugKey)}`);
    slugs.set(slugKey, file.path);

    const positionKey = `${file.locale}/${file.topicId}/${file.position}`;
    if (positions.has(positionKey)) issue("duplicate-position", `also in ${positions.get(positionKey)}`);
    positions.set(positionKey, file.path);

    const body = validateLessonBody(file.body);
    if (!body.ok) issue("invalid-body", JSON.stringify(body.errors));
  }

  return issues;
}

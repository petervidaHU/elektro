import { checkLessonFiles, loadLessonFiles } from "../content/lesson-files.js";
import { LESSONS_ROOT } from "./content-root.js";

/**
 * Validates the lesson files before seeding (docs/THEORY_TOC.md): paths,
 * front matter, topics, slugs, positions and lesson bodies. Also lists the
 * claims authors flagged for a teacher to verify. Exits 1 on any problem.
 */
const { files, issues: loadIssues } = loadLessonFiles(LESSONS_ROOT);
const issues = [...loadIssues, ...checkLessonFiles(files)];

const byTopic = new Map<string, number>();
for (const file of files) {
  byTopic.set(`${file.module}/${file.topicId}`, (byTopic.get(`${file.module}/${file.topicId}`) ?? 0) + 1);
}

console.log(`${files.length} lesson file(s) in ${byTopic.size} topic(s)`);
for (const [topic, count] of [...byTopic.entries()].sort()) {
  console.log(`  ${topic}: ${count}`);
}

const toVerify = files.filter((file) => file.verify.length > 0);
if (toVerify.length > 0) {
  console.log("\nTo verify against a source (teacher):");
  for (const file of toVerify) {
    console.log(`  ${file.path}`);
    for (const claim of file.verify) console.log(`    - ${claim}`);
  }
}

if (issues.length > 0) {
  console.error(`\n${issues.length} problem(s):`);
  for (const issue of issues) {
    console.error(`  ${issue.path}: ${issue.code}${issue.detail ? ` (${issue.detail})` : ""}`);
  }
  process.exit(1);
}
console.log("\nOK");

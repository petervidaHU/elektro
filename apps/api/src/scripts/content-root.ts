import { fileURLToPath } from "node:url";

/** `apps/api/content/lessons` - the same relative path from src/ and dist/. */
export const LESSONS_ROOT = fileURLToPath(new URL("../../content/lessons", import.meta.url));

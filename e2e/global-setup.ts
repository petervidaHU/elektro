import { readFileSync } from "node:fs";
import { request, type APIRequestContext, type FullConfig } from "@playwright/test";

/**
 * Prepares the data the acceptance tests need, through the app's own API as
 * the seeded admin:
 * - an e2e teacher with a known password,
 * - a fresh lesson in review (`e2e-…`), which the M1b test approves. The e2e
 *   teacher writes it: an admin's save would go live directly (plan Q22).
 * The returned teardown deletes the lesson again.
 *
 * Admin credentials: E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD, falling back to the
 * SEED_ADMIN_* values of the repository's .env (the dev setup).
 */
export const E2E_TEACHER = {
  email: "e2e-teacher@example.com",
  password: "e2e-teacher-password",
  name: "E2E Oktató",
};

function adminCredentials(): { email: string; password: string } {
  const fromFile: Record<string, string> = {};
  try {
    for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
      const match = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (match) fromFile[match[1]!] = match[2]!;
    }
  } catch {
    // No .env: rely on the environment.
  }
  const email = process.env.E2E_ADMIN_EMAIL ?? fromFile["SEED_ADMIN_EMAIL"];
  const password = process.env.E2E_ADMIN_PASSWORD ?? fromFile["SEED_ADMIN_PASSWORD"];
  if (!email || !password) {
    throw new Error("Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD (or SEED_ADMIN_* in .env).");
  }
  return { email, password };
}

async function ok(response: Awaited<ReturnType<APIRequestContext["post"]>>, what: string) {
  if (!response.ok()) {
    throw new Error(`${what}: ${response.status()} ${await response.text()}`);
  }
  return response;
}

const LESSON_BODY = `:::goals
- Gyakorlod a feszültségesés számítását.
:::

## Első szakasz

A feszültségesés a vezeték ellenállásán eső feszültség.

::formula{id="voltage-drop"}

## Második szakasz

:::safety
Feszültség alatt ne dolgozz.
:::
`;

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "https://elektro.fromthe.test:8443";
  const admin = await request.newContext({ baseURL, ignoreHTTPSErrors: true });
  const credentials = adminCredentials();

  await ok(await admin.post("/api/auth/sign-in/email", { data: credentials }), "admin sign-in");

  // The e2e teacher, with a known password.
  const created = await admin.post("/api/admin/users", { data: { ...E2E_TEACHER, role: "teacher" } });
  if (created.status() === 409) {
    const { users } = (await (await ok(await admin.get("/api/admin/users"), "list users")).json()) as {
      users: { id: string; email: string }[];
    };
    const teacher = users.find((user) => user.email === E2E_TEACHER.email)!;
    await ok(
      await admin.post("/api/admin/users/reset-password", {
        data: { userId: teacher.id, newPassword: E2E_TEACHER.password },
      }),
      "reset teacher password",
    );
    await ok(
      await admin.patch("/api/admin/users/role", { data: { userId: teacher.id, role: "teacher" } }),
      "teacher role",
    );
  } else {
    await ok(created, "create teacher");
  }

  // A fresh lesson in review for the M1b test, written by the teacher.
  const teacher = await request.newContext({ baseURL, ignoreHTTPSErrors: true });
  await ok(
    await teacher.post("/api/auth/sign-in/email", {
      data: { email: E2E_TEACHER.email, password: E2E_TEACHER.password },
    }),
    "teacher sign-in",
  );
  const slug = `e2e-${Date.now()}`;
  const title = `E2E lecke ${slug}`;
  await ok(
    await teacher.post("/api/lessons", { data: { topicId: "voltage-drop", slug, position: 900 } }),
    "create lesson",
  );
  await ok(
    await teacher.put(`/api/lessons/${slug}/translations`, {
      data: { locale: "hu", title, summary: "E2E gyakorló lecke.", body: LESSON_BODY },
    }),
    "lesson translation",
  );
  await ok(
    await teacher.post(`/api/lessons/${slug}/review`, {
      data: { action: "submit_for_review", locale: "hu" },
    }),
    "submit for review",
  );
  await teacher.dispose();

  process.env.E2E_LESSON_SLUG = slug;
  process.env.E2E_LESSON_TITLE = title;

  return async () => {
    await admin.delete(`/api/lessons/${slug}`);
    await admin.dispose();
  };
}

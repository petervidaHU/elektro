import { eq } from "drizzle-orm";
import { z } from "zod";
import { emailSchema, passwordSchema } from "@elektro/shared";
import { db } from "../db/index.js";
import { user } from "../db/schema/auth.js";
import { auth } from "../lib/auth.js";

/**
 * Creates the first admin user. v1 sends no e-mail, so the initial account has
 * to exist before anyone can sign in; every later teacher/admin account is
 * created by an admin through the API.
 */
const seedSchema = z.object({
  SEED_ADMIN_EMAIL: emailSchema,
  SEED_ADMIN_PASSWORD: passwordSchema,
  SEED_ADMIN_NAME: z.string().trim().min(1).max(120).default("Admin"),
});

async function main(): Promise<void> {
  const parsed = seedSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error("Seeding needs SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (at least 10 characters).");
  }

  const seed = parsed.data;

  const existing = await db()
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.email, seed.SEED_ADMIN_EMAIL))
    .limit(1);

  if (existing[0]) {
    await db()
      .update(user)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(user.id, existing[0].id));

    console.log(`existing user ${seed.SEED_ADMIN_EMAIL} promoted to admin`);
    return;
  }

  const created = await auth().api.signUpEmail({
    body: {
      email: seed.SEED_ADMIN_EMAIL,
      password: seed.SEED_ADMIN_PASSWORD,
      name: seed.SEED_ADMIN_NAME,
    },
  });

  await db()
    .update(user)
    .set({ role: "admin", emailVerified: true, updatedAt: new Date() })
    .where(eq(user.id, created.user.id));

  console.log(`admin ${seed.SEED_ADMIN_EMAIL} created`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });

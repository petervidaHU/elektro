import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { appSettings, APP_SETTING_KEYS } from "../db/schema/app.js";

/**
 * Admin settings, with the defaults that apply before an admin ever touches
 * them. Whether students see unapproved drafts is one of these - never a
 * hard-coded rule.
 */
const DEFAULTS = {
  [APP_SETTING_KEYS.allowUnapprovedDrafts]: false,
} as const;

export async function getBooleanSetting(
  key: (typeof APP_SETTING_KEYS)[keyof typeof APP_SETTING_KEYS],
): Promise<boolean> {
  const [row] = await db()
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);

  return typeof row?.value === "boolean" ? row.value : DEFAULTS[key];
}

export async function setBooleanSetting(
  key: (typeof APP_SETTING_KEYS)[keyof typeof APP_SETTING_KEYS],
  value: boolean,
  updatedBy: string,
): Promise<void> {
  await db()
    .insert(appSettings)
    .values({ key, value, updatedBy })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedBy, updatedAt: new Date() },
    });
}

export function allowUnapprovedDrafts(): Promise<boolean> {
  return getBooleanSetting(APP_SETTING_KEYS.allowUnapprovedDrafts);
}

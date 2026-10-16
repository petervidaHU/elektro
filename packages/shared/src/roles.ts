/**
 * Roles. Every API route checks the role on the server; the frontend only hides
 * what a role cannot use and is never the security boundary.
 */
export const ROLES = ["student", "teacher", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = "student";

/** Higher rank implies every permission of the lower ranks. */
const ROLE_RANK: Record<Role, number> = {
  student: 0,
  teacher: 1,
  admin: 2,
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** True when `role` is at least as privileged as `required`. */
export function hasAtLeastRole(role: Role, required: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[required];
}

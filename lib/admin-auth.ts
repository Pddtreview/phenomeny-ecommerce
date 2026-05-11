import type { User } from "@supabase/supabase-js";

/**
 * Comma-separated allowlist (lowercase). Used when JWT `role` is not set yet.
 * Defaults include the primary Nauvaraha admin email.
 */
function allowedAdminEmailsFromEnv(): string[] {
  const raw =
    process.env.ADMIN_ALLOWED_EMAILS ??
    process.env.NEXT_PUBLIC_ADMIN_ALLOWED_EMAILS ??
    "deepak@pddt.in";
  return [
    ...new Set(
      raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}

/**
 * Supabase: set `raw_app_meta_data.role` to `"admin"` on the user (see migrations),
 * or include their email in ADMIN_ALLOWED_EMAILS / NEXT_PUBLIC_ADMIN_ALLOWED_EMAILS.
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const role =
    (user.app_metadata?.role as string | undefined) ??
    (user.user_metadata?.role as string | undefined);
  if (role === "admin") return true;
  const email = (user.email ?? "").toLowerCase();
  if (!email) return false;
  return allowedAdminEmailsFromEnv().includes(email);
}

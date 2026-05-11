-- Grant admin JWT role for dashboard + middleware (requires user to exist in auth.users).
-- After running, the user should sign out and sign in again so the new JWT includes app_metadata.role.

UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
WHERE lower(email) = lower('Deepak@pddt.in');

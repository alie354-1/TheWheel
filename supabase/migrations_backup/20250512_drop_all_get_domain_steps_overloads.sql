-- Migration: Drop all overloaded versions of get_domain_steps to resolve function name conflict

-- Replace the argument types below with the actual signatures if needed.
-- These are the most common overloads based on your previous migrations.

DROP FUNCTION IF EXISTS public.get_domain_steps(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_domain_steps(uuid, uuid, boolean);

-- If you have other overloads, add them here, e.g.:
-- DROP FUNCTION IF EXISTS public.get_domain_steps();
-- DROP FUNCTION IF EXISTS public.get_domain_steps(uuid);

-- After running this, re-run the migration to create the new function.

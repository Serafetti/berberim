-- Add the district field required by the owner onboarding form.
-- This additive migration preserves all existing organization rows and policies.
alter table public.organizations
  add column if not exists district text;

grant update (district) on public.organizations to authenticated;

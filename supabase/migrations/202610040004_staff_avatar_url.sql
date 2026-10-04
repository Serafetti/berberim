-- Optional staff avatar URL; no storage bucket or upload service is introduced here.
alter table public.staff
  add column if not exists avatar_url text check (avatar_url is null or avatar_url ~* '^https?://');

grant update (avatar_url) on public.staff to authenticated;

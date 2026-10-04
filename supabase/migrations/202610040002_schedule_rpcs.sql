create function public.save_my_organization_schedule(p_org_id uuid, p_hours jsonb, p_breaks jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_org_admin(p_org_id) then raise exception 'Not authorized'; end if;
  if jsonb_typeof(p_hours) <> 'array' or jsonb_array_length(p_hours) <> 7 or jsonb_typeof(p_breaks) <> 'array' then raise exception 'Invalid schedule'; end if;
  if (select count(distinct (value->>'day_of_week')::integer) from jsonb_array_elements(p_hours)) <> 7 then raise exception 'Invalid weekdays'; end if;
  if not exists (select 1 from jsonb_array_elements(p_hours) h where coalesce((h.value->>'active')::boolean, false)) then raise exception 'At least one working day is required'; end if;

  delete from public.working_hours where organization_id = p_org_id and staff_id is null;
  insert into public.working_hours(organization_id, staff_id, day_of_week, start_time, end_time, active)
  select p_org_id, null, (h.value->>'day_of_week')::smallint, (h.value->>'start_time')::time, (h.value->>'end_time')::time, true
  from jsonb_array_elements(p_hours) h(value) where coalesce((h.value->>'active')::boolean, false);

  delete from public.breaks where organization_id = p_org_id and staff_id is null;
  insert into public.breaks(organization_id, staff_id, day_of_week, start_time, end_time)
  select p_org_id, null, (b.value->>'day_of_week')::smallint, (b.value->>'start_time')::time, (b.value->>'end_time')::time
  from jsonb_array_elements(p_breaks) b(value)
  where coalesce((b.value->>'active')::boolean, false)
    and exists (select 1 from public.working_hours h where h.organization_id = p_org_id and h.staff_id is null and h.day_of_week = (b.value->>'day_of_week')::smallint and h.active);
end;
$$;

create function public.save_my_staff_schedule(p_org_id uuid, p_staff_id uuid, p_hours jsonb, p_breaks jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_org_admin(p_org_id)
    or not exists (select 1 from public.staff s where s.id = p_staff_id and s.organization_id = p_org_id and s.active and s.deleted_at is null) then raise exception 'Not authorized'; end if;
  if jsonb_typeof(p_hours) <> 'array' or jsonb_array_length(p_hours) <> 7 or jsonb_typeof(p_breaks) <> 'array' then raise exception 'Invalid schedule'; end if;
  if (select count(distinct (value->>'day_of_week')::integer) from jsonb_array_elements(p_hours)) <> 7 then raise exception 'Invalid weekdays'; end if;
  if not exists (select 1 from jsonb_array_elements(p_hours) h where coalesce((h.value->>'active')::boolean, false)) then raise exception 'At least one working day is required'; end if;

  delete from public.working_hours where organization_id = p_org_id and staff_id = p_staff_id;
  insert into public.working_hours(organization_id, staff_id, day_of_week, start_time, end_time, active)
  select p_org_id, p_staff_id, (h.value->>'day_of_week')::smallint, (h.value->>'start_time')::time, (h.value->>'end_time')::time, true
  from jsonb_array_elements(p_hours) h(value) where coalesce((h.value->>'active')::boolean, false);

  delete from public.breaks where organization_id = p_org_id and staff_id = p_staff_id;
  insert into public.breaks(organization_id, staff_id, day_of_week, start_time, end_time)
  select p_org_id, p_staff_id, (b.value->>'day_of_week')::smallint, (b.value->>'start_time')::time, (b.value->>'end_time')::time
  from jsonb_array_elements(p_breaks) b(value)
  where coalesce((b.value->>'active')::boolean, false)
    and exists (select 1 from public.working_hours h where h.organization_id = p_org_id and h.staff_id = p_staff_id and h.day_of_week = (b.value->>'day_of_week')::smallint and h.active);
end;
$$;

revoke all on function public.save_my_organization_schedule(uuid, jsonb, jsonb) from public;
revoke all on function public.save_my_staff_schedule(uuid, uuid, jsonb, jsonb) from public;
grant execute on function public.save_my_organization_schedule(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.save_my_staff_schedule(uuid, uuid, jsonb, jsonb) to authenticated;

import { CircleUserRound } from "lucide-react";
import { addTimeOffAction, deleteTimeOffAction, saveStaffHoursAction } from "@/app/actions/panel";
import { StaffManagementForm, StaffRowActions } from "@/components/staff-management-form";
import { WeeklyHoursForm } from "@/components/weekly-hours-form";
import { requireOrganization } from "@/lib/tenant";
import type { WeeklyScheduleValues } from "@/lib/management-validation";

type Props = { searchParams: Promise<{ edit?: string; hata?: string }> };
const weekDaysMondayFirst = [1, 2, 3, 4, 5, 6, 0];

export default async function StaffPage({ searchParams }: Props) {
  const { edit, hata } = await searchParams;
  const { supabase, organization, membership } = await requireOrganization();
  const [{ data: staff, error: staffError }, { data: services, error: servicesError }, { data: mappings, error: mappingsError }, { data: hours, error: hoursError }, { data: breaks, error: breaksError }, { data: timeOff, error: timeOffError }] = await Promise.all([
    supabase.from("staff").select("id,name,phone,role,active,avatar_url").eq("organization_id", organization.id).is("deleted_at", null).order("name"),
    supabase.from("services").select("id,name").eq("organization_id", organization.id).eq("active", true).is("deleted_at", null).order("name"),
    supabase.from("staff_services").select("staff_id,service_id").eq("organization_id", organization.id),
    supabase.from("working_hours").select("staff_id,day_of_week,start_time,end_time,active").eq("organization_id", organization.id),
    supabase.from("breaks").select("staff_id,day_of_week,start_time,end_time").eq("organization_id", organization.id),
    supabase.from("time_off").select("id,staff_id,start_at,end_at,reason").eq("organization_id", organization.id).gt("end_at", new Date().toISOString()).order("start_at").limit(50),
  ]);
  const queryError = staffError || servicesError || mappingsError || hoursError || breaksError || timeOffError;
  const editing = staff?.find((member) => member.id === edit);
  const assignedIds = mappings?.filter((mapping) => mapping.staff_id === editing?.id).map((mapping) => mapping.service_id) ?? [];
  const editable = membership.role === "owner" || membership.role === "admin";
  const weekdays = weekDaysMondayFirst.map((day, index) => ({ day_of_week: day, active: index < 6, start_time: "09:00", end_time: "18:00" }));
  const groupedHours = (memberId: string): WeeklyScheduleValues["hours"] => {
    const individual = hours?.filter((row) => row.staff_id === memberId) ?? [];
    const businessHours = hours?.filter((row) => row.staff_id === null) ?? [];
    const chosen = individual.length ? individual : businessHours;
    return weekdays.map((day) => {
      const row = chosen.find((item) => item.day_of_week === day.day_of_week);
      return row ? { ...day, active: row.active, start_time: row.start_time.slice(0, 5), end_time: row.end_time.slice(0, 5) } : { ...day, active: false };
    });
  };
  const groupedBreaks = (memberId: string): WeeklyScheduleValues["breaks"] => {
    const individual = breaks?.filter((row) => row.staff_id === memberId) ?? [];
    const businessBreaks = breaks?.filter((row) => row.staff_id === null) ?? [];
    const chosen = individual.length ? individual : businessBreaks;
    return weekdays.map((day) => {
      const row = chosen.find((item) => item.day_of_week === day.day_of_week);
      return row ? { ...day, active: true, start_time: row.start_time.slice(0, 5), end_time: row.end_time.slice(0, 5) } : { ...day, active: false };
    });
  };

  if (queryError) return <section className="rounded-2xl border border-[#f0d6d2] bg-white p-6"><p role="alert" className="text-sm text-[#9b4e45]">Personel bilgileri yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.</p></section>;

  return <div className="space-y-6">
    <header><p className="text-xs font-medium text-[#7a8277]">Ekip yönetimi · {organization.name}</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">Personel</h1><p className="mt-2 text-sm text-[#777d74]">Birden fazla uzman, farklı uzmanlıklar ve hizmet atamaları tek işletmede yönetilir.</p></header>
    <section className="rounded-2xl border border-[#e7e9e3] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#eff3ed] text-[#567159]"><CircleUserRound size={17} aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-[#30352e]">{editing ? "Personeli düzenle" : "Ekip üyesi ekle"}</h2><p className="mt-1 text-[10px] text-[#858b82]">Çalışma saatleri ve molalar her personel için ayrıca özelleştirilebilir.</p></div></div>{editable ? <StaffManagementForm key={editing?.id ?? "new-staff"} services={services ?? []} staff={editing ? { id: editing.id, name: editing.name, phone: editing.phone ?? "", role: editing.role, active: editing.active, avatarUrl: editing.avatar_url ?? "", serviceIds: assignedIds } : undefined} /> : <p className="mt-4 text-xs text-[#858b82]">Personel kayıtlarını yalnızca işletme yöneticisi değiştirebilir.</p>}</section>
    <section className="space-y-3"><div className="flex items-end justify-between gap-3"><div><h2 className="text-sm font-semibold text-[#30352e]">Ekip ve çalışma programları</h2><p className="mt-1 text-[10px] text-[#858b82]">{staff?.length ?? 0} personel</p></div><a href="/panel/calisma-saatleri" className="text-[10px] font-semibold text-[#526c55] hover:underline">İşletme saatleri</a></div>
      {staff?.length ? staff.map((member) => {
        const assignedServices = mappings?.filter((mapping) => mapping.staff_id === member.id).map((mapping) => services?.find((service) => service.id === mapping.service_id)?.name).filter(Boolean) ?? [];
        return <details key={member.id} className="group rounded-2xl border border-[#e7e9e3] bg-white"><summary className="flex cursor-pointer list-none items-center gap-3 p-4"><span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eff3ed] text-xs font-semibold text-[#567159]">{member.avatar_url ? <img src={member.avatar_url} alt="" className="size-full object-cover" /> : member.name.slice(0, 1).toLocaleUpperCase("tr-TR")}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="truncate text-xs font-semibold text-[#3e443c]">{member.name}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${member.active ? "bg-[#eff4ed] text-[#56715a]" : "bg-[#f2f2ef] text-[#797f76]"}`}>{member.active ? "Aktif" : "Pasif"}</span></span><span className="mt-1 block truncate text-[10px] text-[#858b82]">{member.role} · {assignedServices.length ? assignedServices.join(", ") : "Hizmet atanmamış"}</span></span>{editable && <StaffRowActions staff={member} />}</summary><div className="border-t border-[#eff0ec] p-4 sm:p-5"><h3 className="mb-3 text-xs font-semibold text-[#424940]">Kişiye özel çalışma saatleri ve molalar</h3><WeeklyHoursForm initial={groupedHours(member.id)} initialBreaks={groupedBreaks(member.id)} staffId={member.id} action={saveStaffHoursAction.bind(null, member.id)} disabled={!editable} />
          <div className="mt-6 border-t border-[#eff0ec] pt-4"><h3 className="text-xs font-semibold text-[#424940]">İzin / tatil</h3>{editable && <form action={addTimeOffAction} className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input type="hidden" name="staffId" value={member.id} /><label className="text-[10px] text-[#70776d]">Başlangıç<input required type="datetime-local" name="startAt" className={inputClass} /></label><label className="text-[10px] text-[#70776d]">Bitiş<input required type="datetime-local" name="endAt" className={inputClass} /></label><label className="text-[10px] text-[#70776d]">Not<input name="reason" maxLength={200} className={inputClass} placeholder="İzin, tatil…" /></label><button className={`${buttonClass} self-end`} type="submit">İzni ekle</button></form>}{timeOff?.filter((leave) => leave.staff_id === member.id).length ? <ul className="mt-3 space-y-2">{timeOff.filter((leave) => leave.staff_id === member.id).map((leave) => <li key={leave.id} className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#70776d]">{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: organization.timezone }).format(new Date(leave.start_at))} — {new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: organization.timezone }).format(new Date(leave.end_at))}{leave.reason ? ` · ${leave.reason}` : ""}{editable && <form action={deleteTimeOffAction}><input type="hidden" name="id" value={leave.id} /><button type="submit" aria-label="İzin kaydını sil" className="font-semibold text-[#9b4e45]">Kaldır</button></form>}</li>)}</ul> : <p className="mt-3 text-[10px] text-[#858b82]">Yaklaşan izin kaydı yok.</p>}</div>
        </div></details>;
      }) : <div className="rounded-xl border border-dashed border-[#dfe3dc] bg-white p-8 text-center"><CircleUserRound size={22} className="mx-auto text-[#a2aa9f]" aria-hidden="true" /><p className="mt-3 text-xs font-semibold text-[#596254]">Henüz ekip üyesi yok</p><p className="mt-1 text-[10px] text-[#858b82]">Personel eklediğinizde burada hizmetlerini ve çalışma programını yönetebilirsiniz.</p></div>}
    </section>
  </div>;
}
const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#98aa96]";
const buttonClass = "inline-flex min-h-10 items-center justify-center self-start rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d]";

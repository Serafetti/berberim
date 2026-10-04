import { Clock3 } from "lucide-react";
import { saveWeeklyHoursAction } from "@/app/actions/panel";
import { WeeklyHoursForm } from "@/components/weekly-hours-form";
import { requireOrganization } from "@/lib/tenant";
import type { WeeklyScheduleValues } from "@/lib/management-validation";

const dayDefaults = Array.from({ length: 7 }, (_, index) => ({ day_of_week: (index + 1) % 7, active: false, start_time: "09:00", end_time: "18:00" }));

export default async function WorkingHoursPage() {
  const { supabase, organization, membership } = await requireOrganization();
  const [{ data: workingHours, error: hoursError }, { data: breaks, error: breaksError }] = await Promise.all([
    supabase.from("working_hours").select("day_of_week,start_time,end_time,active").eq("organization_id", organization.id).is("staff_id", null),
    supabase.from("breaks").select("day_of_week,start_time,end_time").eq("organization_id", organization.id).is("staff_id", null),
  ]);
  if (hoursError || breaksError) return <section className="rounded-2xl border border-[#f0d6d2] bg-white p-6"><p role="alert" className="text-sm text-[#9b4e45]">Çalışma programı yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.</p></section>;

  const initialHours: WeeklyScheduleValues["hours"] = dayDefaults.map((day) => {
    const row = workingHours?.find((item) => item.day_of_week === day.day_of_week);
    return row ? { ...day, active: row.active, start_time: row.start_time.slice(0, 5), end_time: row.end_time.slice(0, 5) } : day;
  });
  const initialBreaks: WeeklyScheduleValues["breaks"] = dayDefaults.map((day) => {
    const row = breaks?.find((item) => item.day_of_week === day.day_of_week);
    return row ? { ...day, active: true, start_time: row.start_time.slice(0, 5), end_time: row.end_time.slice(0, 5) } : { ...day, active: false };
  });
  const isAdmin = membership.role === "owner" || membership.role === "admin";

  return <div className="mx-auto max-w-4xl space-y-6">
    <header><p className="text-xs font-medium text-[#7a8277]">İşletme ayarları</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">Çalışma saatleri</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#777d74]">İşletmenin haftalık açık olduğu saatleri ve günlük mola aralıklarını belirle. Personel için farklı bir program gerekiyorsa Personel sayfasından kişiye özel saatleri tanımlayabilirsin.</p></header>
    <section className="rounded-2xl border border-[#e7e9e3] bg-white p-5 sm:p-7"><div className="mb-5 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eff3ed] text-[#567159]"><Clock3 size={18} aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-[#30352e]">{organization.name}</h2><p className="mt-1 text-[10px] text-[#858b82]">Saat dilimi: {organization.timezone}</p></div></div><WeeklyHoursForm initial={initialHours} initialBreaks={initialBreaks} action={saveWeeklyHoursAction} disabled={!isAdmin} /></section>
    <aside className="rounded-xl border border-[#e8ece5] bg-[#f8faf7] p-4"><p className="text-xs font-semibold text-[#485746]">Randevu planlaması için hazır</p><p className="mt-1 text-[11px] leading-5 text-[#747d71]">İşletme saatleri temel program olarak kullanılır. Personelin özel saatleri ve molaları kendi programı olarak saklanır; sonraki randevu müsaitlik hesabı ikisini birlikte değerlendirebilir.</p></aside>
  </div>;
}

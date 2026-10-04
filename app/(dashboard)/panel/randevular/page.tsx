import { addDays, startOfWeek } from "date-fns";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus } from "lucide-react";
import { cancelAppointmentAction, updateAppointmentStatusAction } from "@/app/actions/panel";
import { AppointmentForm } from "@/components/appointment-form";
import { AppointmentEditForm } from "@/components/appointment-edit-form";
import { formatDateTimeInput, getDayRange, getTodayInTimeZone } from "@/lib/date-time";
import { requireOrganization } from "@/lib/tenant";

type Props = { searchParams: Promise<{ date?: string; view?: string; yeni?: string; hata?: string; olusturuldu?: string; iptal?: string; guncellendi?: string; durumGuncellendi?: string }> };
const statusLabels: Record<string, string> = { confirmed: "Onaylandı", completed: "Tamamlandı", cancelled: "İptal edildi", no_show: "Gelmedi" };

export default async function AppointmentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase, organization } = await requireOrganization();
  const today = getTodayInTimeZone(organization.timezone);
  const selectedDate = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today;
  const weekly = params.view === "week";
  const anchor = new Date(`${selectedDate}T12:00:00Z`);
  const periodStart = weekly ? startOfWeek(anchor, { weekStartsOn: 1 }).toISOString().slice(0, 10) : selectedDate;
  const periodEnd = weekly ? addDays(new Date(`${periodStart}T12:00:00Z`), 6).toISOString().slice(0, 10) : selectedDate;
  const rangeStart = getDayRange(periodStart, organization.timezone).start;
  const rangeEnd = getDayRange(periodEnd, organization.timezone).end;
  const [{ data: appointments }, { data: services }, { data: staff }, { data: mappings }] = await Promise.all([
    supabase.from("appointments").select("id,staff_id,service_id,customer_name,customer_phone,start_at,end_at,status,notes,services(name,price,duration_minutes),staff(name,role)").eq("organization_id", organization.id).gte("start_at", rangeStart).lte("start_at", rangeEnd).is("deleted_at", null).order("start_at").limit(500),
    supabase.from("services").select("id,name,duration_minutes,price").eq("organization_id", organization.id).eq("active", true).is("deleted_at", null).order("name"),
    supabase.from("staff").select("id,name,role").eq("organization_id", organization.id).eq("active", true).is("deleted_at", null).order("name"),
    supabase.from("staff_services").select("staff_id,service_id"),
  ]);
  const workerOptions = (staff ?? []).map((person) => ({ ...person, service_ids: mappings?.filter((mapping) => mapping.staff_id === person.id).map((mapping) => mapping.service_id) ?? [] }));
  const prev = addDays(anchor, weekly ? -7 : -1).toISOString().slice(0, 10);
  const next = addDays(anchor, weekly ? 7 : 1).toISOString().slice(0, 10);
  const base = `/panel/randevular?view=${weekly ? "week" : "day"}`;

  return <div className="space-y-6"><header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium text-[#7a8277]">Takvim yönetimi</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">Randevular</h1><p className="mt-2 text-sm text-[#777d74]">Günlük ve haftalık işletme takvimi.</p></div><a href="#yeni-randevu" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d]"><Plus size={15} /> Randevu ekle</a></header>
      {params.hata && <p role="alert" className="rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2 text-xs text-[#9b4e45]">{params.hata === "saat-alindi" ? "Bu zaman aralığı yeni bir randevuyla çakışıyor." : "İşlem tamamlanamadı. Bilgileri ve personel uygunluğunu kontrol edin."}</p>}{params.olusturuldu && <p role="status" className="rounded-lg bg-[#f3f7f1] px-3 py-2 text-xs text-[#58715b]">Randevu oluşturuldu.</p>}{params.iptal && <p role="status" className="rounded-lg bg-[#f3f7f1] px-3 py-2 text-xs text-[#58715b]">Randevu iptal edildi ve zaman aralığı boşaltıldı.</p>}{(params.guncellendi || params.durumGuncellendi) && <p role="status" className="rounded-lg bg-[#f3f7f1] px-3 py-2 text-xs text-[#58715b]">Randevu güncellendi.</p>}
    <details id="yeni-randevu" open={params.yeni === "1"} className="rounded-2xl border border-[#e7e9e3] bg-white p-5 sm:p-6"><summary className="cursor-pointer list-none text-sm font-semibold text-[#30352e]">Yeni randevu</summary><p className="mt-1 text-xs text-[#858b82]">Sistem salon saatlerini, molaları, personel izinlerini ve çakışan randevuları doğrular.</p><div className="mt-4">{services?.length && staff?.length ? <AppointmentForm services={services} staff={workerOptions} /> : <p className="rounded-lg bg-[#f7f8f6] p-3 text-xs text-[#747a72]">Randevu eklemek için önce en az bir hizmet ve personel tanımlayın.</p>}</div></details>
    <section className="overflow-hidden rounded-2xl border border-[#e7e9e3] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eff0ec] p-4 sm:px-5"><div className="flex items-center gap-2"><CalendarDays size={16} className="text-[#718871]" /><div><h2 className="text-xs font-semibold text-[#343a32]">{weekly ? "Haftalık görünüm" : "Günlük görünüm"}</h2><p className="mt-0.5 text-[10px] text-[#858b82]">{new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: organization.timezone }).format(new Date(`${periodStart}T12:00:00Z`))}{weekly ? ` — ${new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: organization.timezone }).format(new Date(`${periodEnd}T12:00:00Z`))}` : ""}</p></div></div><div className="flex items-center gap-1"><Link aria-label="Önceki dönem" href={`${base}&date=${prev}`} className={iconButton}><ChevronLeft size={15} /></Link><Link aria-label="Sonraki dönem" href={`${base}&date=${next}`} className={iconButton}><ChevronRight size={15} /></Link><Link href={`${base}&date=${today}`} className="ml-1 rounded-lg border border-[#e2e5df] px-2.5 py-2 text-[10px] font-medium text-[#535c51]">Bugün</Link><Link href={`/panel/randevular?view=${weekly ? "day" : "week"}&date=${selectedDate}`} className="ml-1 rounded-lg border border-[#e2e5df] px-2.5 py-2 text-[10px] font-medium text-[#535c51]">{weekly ? "Gün" : "Hafta"}</Link></div></div>
      {appointments?.length ? <div className="divide-y divide-[#f0f1ed]">{appointments.map((appointment) => {
        const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
        const person = Array.isArray(appointment.staff) ? appointment.staff[0] : appointment.staff;
        return <article key={appointment.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
          <div className="flex w-16 shrink-0 flex-col"><span className="text-xs font-semibold tabular-nums text-[#3d453b]">{new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: organization.timezone }).format(new Date(appointment.start_at))}</span><span className="mt-1 text-[9px] text-[#858b82]">{new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", timeZone: organization.timezone }).format(new Date(appointment.start_at))}</span></div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#373d35]">{appointment.customer_name}</p><p className="mt-1 truncate text-[10px] text-[#858b82]">{service?.name ?? "Hizmet"} · {person?.name ?? "Personel"} · {appointment.customer_phone}</p></div>
          <span className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${appointment.status === "confirmed" ? "bg-[#eff4ed] text-[#56715a]" : "bg-[#f1f2ef] text-[#73796f]"}`}>{statusLabels[appointment.status] ?? appointment.status}</span>
          {appointment.status !== "cancelled" && <details className="w-full sm:w-auto"><summary className="cursor-pointer list-none rounded-lg border border-[#eceee9] px-2.5 py-1.5 text-center text-[10px] font-medium text-[#526c55]">Düzenle</summary><div className="mt-3 w-full sm:min-w-[340px] sm:max-w-xl"><AppointmentEditForm appointmentId={appointment.id} services={services ?? []} staff={workerOptions} initialService={appointment.service_id} initialStaff={appointment.staff_id} initialStartAt={formatDateTimeInput(appointment.start_at, organization.timezone)} initialNotes={appointment.notes} /><form action={updateAppointmentStatusAction} className="mt-2 flex items-center gap-2"><input type="hidden" name="id" value={appointment.id} /><select name="status" defaultValue={appointment.status} aria-label="Randevu durumu" className="rounded-lg border border-[#e2e5df] px-2 py-2 text-[10px]">{Object.entries(statusLabels).map(([status, label]) => <option key={status} value={status}>{label}</option>)}</select><button type="submit" className="rounded-lg border border-[#e2e5df] px-3 py-2 text-[10px] font-semibold text-[#526c55]">Durumu kaydet</button></form></div></details>}
          {appointment.status === "confirmed" && <form action={cancelAppointmentAction}><input type="hidden" name="id" value={appointment.id} /><button type="submit" className="rounded-lg border border-[#eceee9] px-2.5 py-1.5 text-[10px] font-medium text-[#8c514a] hover:bg-[#fff8f7]">İptal et</button></form>}
        </article>;
      })}</div> : <div className="px-5 py-12 text-center"><Clock3 size={20} className="mx-auto text-[#a2aa9f]" /><p className="mt-3 text-xs text-[#858b82]">Bu görünümde randevu yok.</p></div>}
    </section>
  </div>;
}
const iconButton = "grid size-8 place-items-center rounded-lg border border-[#e2e5df] text-[#626a60] hover:bg-[#f7f9f6]";

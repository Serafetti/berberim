import Link from "next/link";
import { ArrowRight, CalendarPlus, CirclePlus, Clock3, Scissors, Sparkles, UsersRound, Wallet } from "lucide-react";
import { requireOrganization } from "@/lib/tenant";
import { displayTime, findOpenWindows } from "@/lib/availability";
import { getDayRange, getTodayInTimeZone } from "@/lib/date-time";

export default async function DashboardPage() {
  const { supabase, organization } = await requireOrganization();
  const today = getTodayInTimeZone(organization.timezone);
  const range = getDayRange(today, organization.timezone);
  const [appointmentsResult, schedulesResult, breaksResult, timeOffResult, staffResult, customersResult] = await Promise.all([
    supabase.from("appointments").select("id,staff_id,customer_name,customer_phone,start_at,end_at,status,services(name,price),staff(name)").eq("organization_id", organization.id).gte("start_at", range.start).lte("start_at", range.end).is("deleted_at", null).neq("status", "cancelled").order("start_at").limit(100),
    supabase.from("working_hours").select("staff_id,day_of_week,start_time,end_time,active").eq("organization_id", organization.id).not("staff_id", "is", null).eq("active", true),
    supabase.from("breaks").select("staff_id,day_of_week,start_time,end_time").eq("organization_id", organization.id),
    supabase.from("time_off").select("staff_id,start_at,end_at").eq("organization_id", organization.id).lt("start_at", range.end).gt("end_at", range.start),
    supabase.from("staff").select("id,name,role").eq("organization_id", organization.id).eq("active", true).is("deleted_at", null),
    supabase.from("customers").select("id,name,phone,created_at").eq("organization_id", organization.id).is("deleted_at", null).order("created_at", { ascending: false }).limit(5),
  ]);
  const loadError = [appointmentsResult.error, schedulesResult.error, breaksResult.error, timeOffResult.error, staffResult.error, customersResult.error].some(Boolean);
  const appointments = appointmentsResult.data ?? [];
  const planned = appointments.filter((appointment) => appointment.status !== "cancelled");
  const revenue = planned.reduce((sum, appointment) => {
    const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
    return sum + Number(service?.price ?? 0);
  }, 0);
  const gaps = findOpenWindows({ date: today, timezone: organization.timezone, schedules: schedulesResult.data ?? [], breaks: breaksResult.data ?? [], appointments: planned, timeOff: timeOffResult.data ?? [] });
  const staffById = new Map((staffResult.data ?? []).map((member) => [member.id, member]));
  const businessTitle = organization.custom_business_type ?? organization.name;

  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium text-[#7a8277]">{new Intl.DateTimeFormat("tr-TR", { dateStyle: "full", timeZone: organization.timezone }).format(new Date())}</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#262a25] sm:text-3xl">Merhaba, {businessTitle}</h1><p className="mt-2 text-sm text-[#777d74]">İşletmenin bugünkü görünümü.</p></div><div className="flex flex-wrap gap-2"><QuickLink href="/panel/randevular?yeni=1" icon={CalendarPlus} label="Randevu" /><QuickLink href="/panel/musteriler?yeni=1" icon={CirclePlus} label="Müşteri" /><QuickLink href="/panel/hizmetler?yeni=1" icon={Scissors} label="Hizmet" /><QuickLink href="/panel/personel?yeni=1" icon={UsersRound} label="Personel" /></div></div>
    {loadError && <p role="alert" className="rounded-xl border border-[#f0d6d2] bg-[#fff8f7] px-4 py-3 text-xs leading-5 text-[#8e4b43]">Bazı panel bilgileri yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.</p>}
    <section aria-label="Günlük özet" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Bugünkü randevu" value={String(planned.length)} detail="İptal edilenler hariç" icon={CalendarPlus} /><Metric title="Tahmini gelir" value={new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(revenue)} detail="Planlanan hizmetlere göre" icon={Wallet} /><Metric title="Boş saat" value={String(gaps.length)} detail="Bugünkü ekip takviminde" icon={Clock3} /><Metric title="Aktif personel" value={String(staffResult.data?.length ?? 0)} detail="Randevu almaya açık" icon={UsersRound} /></section>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
      <section className="rounded-2xl border border-[#e7e9e3] bg-white"><div className="flex items-center justify-between border-b border-[#eff0ec] px-4 py-4 sm:px-5"><div><h2 className="text-sm font-semibold text-[#30352e]">Bugünkü randevular</h2><p className="mt-1 text-[10px] text-[#858b82]">{planned.length} randevu</p></div><Link href="/panel/randevular" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#526c55]">Tümünü gör <ArrowRight size={13} /></Link></div>
        {planned.length ? <div className="divide-y divide-[#f0f1ed] px-4 sm:px-5">{planned.slice(0, 8).map((appointment) => { const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services; const worker = Array.isArray(appointment.staff) ? appointment.staff[0] : appointment.staff; return <div key={appointment.id} className="flex items-center gap-3 py-3"><span className="w-11 text-[11px] font-medium tabular-nums text-[#5b6359]">{new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: organization.timezone }).format(new Date(appointment.start_at))}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-[#363c34]">{appointment.customer_name}</p><p className="mt-1 truncate text-[10px] text-[#858b82]">{service?.name ?? "Hizmet"} · {worker?.name ?? "Personel"}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-medium ${appointment.status === "completed" ? "bg-[#f0f1ef] text-[#6a7069]" : "bg-[#eff4ed] text-[#56715a]"}`}>{appointment.status === "completed" ? "Tamamlandı" : appointment.status === "no_show" ? "Gelmedi" : "Onaylandı"}</span></div>; })}</div> : <EmptyState message="Bugün için henüz randevu yok." href="/panel/randevular?yeni=1" action="İlk randevunu ekle" />}
      </section>
      <section className="rounded-2xl border border-[#e7e9e3] bg-white"><div className="flex items-center justify-between border-b border-[#eff0ec] px-4 py-4 sm:px-5"><div><h2 className="text-sm font-semibold text-[#30352e]">Boş saatleri değerlendir</h2><p className="mt-1 text-[10px] text-[#858b82]">Takvimindeki uygun aralıklar</p></div><Sparkles size={16} className="text-[#718871]" /></div>{gaps.length ? <div className="space-y-2 p-4 sm:p-5">{gaps.slice(0, 5).map((gap, index) => <div key={`${gap.staff_id}-${gap.start}-${index}`} className="flex items-center gap-3 rounded-xl bg-[#f6f8f4] px-3 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#638067]"><Clock3 size={15} /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-[#3d493c]">{displayTime(gap.start)} – {displayTime(gap.end)} arası boş</p><p className="mt-0.5 truncate text-[10px] text-[#7e877a]">{staffById.get(gap.staff_id)?.name ?? "Personel"} · {gap.end - gap.start} dk uygun</p></div></div>)}<p className="px-1 pt-1 text-[9px] leading-4 text-[#8a9087]">Uygunluk çalışma saatleri, molalar ve kayıtlı randevulara göre hesaplanır.</p></div> : <EmptyState message="Bugün için boş çalışma aralığı bulunamadı." href="/panel/randevular" action="Randevu takvimini gör" />}</section>
    </div>
    <section className="rounded-2xl border border-[#e7e9e3] bg-white"><div className="flex items-center justify-between border-b border-[#eff0ec] px-4 py-4 sm:px-5"><div><h2 className="text-sm font-semibold text-[#30352e]">Son eklenen müşteriler</h2><p className="mt-1 text-[10px] text-[#858b82]">İşletmene ait müşteri kayıtları</p></div><Link href="/panel/musteriler" className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#526c55]">Müşteriler <ArrowRight size={13} /></Link></div>{customersResult.data?.length ? <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">{customersResult.data.map((customer) => <Link key={customer.id} href={`/panel/musteriler/${customer.id}`} className="flex items-center gap-3 rounded-xl border border-[#eef0eb] p-3 hover:bg-[#fafbf9]"><span className="grid size-8 place-items-center rounded-full bg-[#eff3ed] text-[10px] font-semibold text-[#557159]">{customer.name.slice(0, 1).toLocaleUpperCase("tr-TR")}</span><span className="min-w-0"><span className="block truncate text-xs font-medium text-[#3f453d]">{customer.name}</span><span className="mt-0.5 block text-[10px] text-[#858b82]">{customer.phone}</span></span></Link>)}</div> : <EmptyState message="Henüz müşteri kaydı yok." href="/panel/musteriler?yeni=1" action="Müşteri ekle" />}</section>
  </div>;
}

function Metric({ title, value, detail, icon: Icon }: { title: string; value: string; detail: string; icon: typeof Wallet }) {
  return <div className="rounded-2xl border border-[#e7e9e3] bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-[11px] text-[#7d847b]">{title}</p><Icon size={16} className="text-[#718871]" aria-hidden="true" /></div><p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#282d27]">{value}</p><p className="mt-1 text-[10px] text-[#898f86]">{detail}</p></div>;
}
function QuickLink({ href, icon: Icon, label }: { href: string; icon: typeof Wallet; label: string }) {
  return <Link href={href} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#e3e6e0] bg-white px-2.5 text-[10px] font-medium text-[#4b554a] hover:bg-[#f7f9f6] sm:px-3"><Icon size={13} aria-hidden="true" />{label}</Link>;
}
function EmptyState({ message, href, action }: { message: string; href: string; action: string }) {
  return <div className="px-5 py-8 text-center"><p className="text-xs text-[#858b82]">{message}</p><Link href={href} className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#526c55]">{action} <ArrowRight size={13} /></Link></div>;
}

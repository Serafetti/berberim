import { updateOrganizationAction, saveWeeklyHoursAction } from "@/app/actions/panel";
import { WeeklyHoursForm } from "@/components/weekly-hours-form";
import { requireOrganization } from "@/lib/tenant";

const days = Array.from({ length: 7 }, (_, index) => ({ day_of_week: (index + 1) % 7, active: false, start_time: "09:00", end_time: "18:00" }));
const businessOptions = [{ value: "mens_barber", label: "Erkek Berberi" }, { value: "womens_hair", label: "Kadın Kuaförü" }, { value: "beauty_salon", label: "Güzellik Salonu" }, { value: "unisex_salon", label: "Unisex Salon" }, { value: "hair_salon", label: "Saç Salonu" }, { value: "other", label: "Diğer" }];
type Props = { searchParams: Promise<{ hata?: string; kaydedildi?: string; saatlerKaydedildi?: string }> };

export default async function SettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase, organization, membership } = await requireOrganization();
  const [{ data: rows }, { data: breakRows }] = await Promise.all([
    supabase.from("working_hours").select("day_of_week,start_time,end_time,active").eq("organization_id", organization.id).is("staff_id", null),
    supabase.from("breaks").select("day_of_week,start_time,end_time").eq("organization_id", organization.id).is("staff_id", null),
  ]);
  const initialHours = days.map((day) => {
    const row = rows?.find((item) => item.day_of_week === day.day_of_week);
    return row ? { ...day, active: row.active, start_time: row.start_time.slice(0, 5), end_time: row.end_time.slice(0, 5) } : day;
  });
  const initialBreaks = (breakRows ?? []).map((pause) => ({ ...pause, active: true, start_time: pause.start_time.slice(0, 5), end_time: pause.end_time.slice(0, 5) }));
  const admin = membership.role === "owner" || membership.role === "admin";
  const errorText = params.hata ? params.hata === "slug-kullaniliyor" ? "Bu işletme adresi kullanımda. Başka bir adres deneyin." : params.hata === "yetki-yok" ? "Bu ayarı değiştirmek için yönetici yetkisi gerekiyor." : "Değişiklikler kaydedilemedi. Alanları kontrol edin." : "";
  const publicUrl = `/berber/${organization.slug}`;

  return <div className="space-y-6"><header><p className="text-xs font-medium text-[#7a8277]">İşletme profili</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">Ayarlar</h1><p className="mt-2 text-sm text-[#777d74]">İşletme bilgilerini, rezervasyon sayfanı ve çalışma düzenini yönetin.</p></header>
    <section className="rounded-2xl border border-[#e7e9e3] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-sm font-semibold text-[#30352e]">İşletme bilgileri</h2><p className="mt-1 text-xs text-[#858b82]">Halka açık randevu sayfanda gösterilir.</p></div><a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center rounded-lg border border-[#e2e5df] px-3 text-[11px] font-semibold text-[#526c55] hover:bg-[#f7f9f6]">Randevu sayfasını aç ↗</a></div>{errorText && <p role="alert" className="mt-4 rounded-lg bg-[#fff8f7] px-3 py-2 text-xs text-[#9b4e45]">{errorText}</p>}{params.kaydedildi && <p role="status" className="mt-4 rounded-lg bg-[#f3f7f1] px-3 py-2 text-xs text-[#58715b]">İşletme bilgileri kaydedildi.</p>}
      <form action={updateOrganizationAction} className="mt-5 grid gap-4 sm:grid-cols-2">{field("İşletme adı", "name", organization.name)}<label className="block text-xs font-medium text-[#555c53]">İşletme türü<select name="businessType" defaultValue={organization.business_type} className={inputClass}>{businessOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>{field("Diğer işletme türü", "customBusinessType", organization.custom_business_type ?? "", false)}<label className="block text-xs font-medium text-[#555c53]">Public bağlantı<div className="mt-1.5 flex overflow-hidden rounded-lg border border-[#e2e5df]"><span className="bg-[#f6f7f4] px-3 py-2.5 text-[10px] text-[#7b8278]">berberim.com/berber/</span><input name="slug" required pattern="[a-z0-9][a-z0-9-]*[a-z0-9]" defaultValue={organization.slug} className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" /></div></label>{field("Telefon", "phone", organization.phone ?? "", false, "tel")}{field("E-posta", "email", organization.email ?? "", false, "email")}{field("Şehir", "city", organization.city ?? "", false)}{field("İlçe", "district", organization.district ?? "", false)}{field("Adres", "address", organization.address ?? "", false)}{field("Logo URL", "logoUrl", organization.logo_url ?? "", false, "url")}<div className="sm:col-span-2"><button type="submit" disabled={!admin} className="inline-flex min-h-10 items-center rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d] disabled:cursor-not-allowed disabled:opacity-50">İşletme bilgilerini kaydet</button>{!admin && <p className="mt-2 text-[10px] text-[#8a9087]">Bu alanı değiştirmek için işletme yöneticisi olmalısınız.</p>}</div></form>
    </section>
    <section className="rounded-2xl border border-[#e7e9e3] bg-white p-5 sm:p-6"><div className="mb-4"><h2 className="text-sm font-semibold text-[#30352e]">Çalışma saatleri ve molalar</h2><p className="mt-1 text-xs text-[#858b82]">İşletmenin temel programı. <a href="/panel/calisma-saatleri" className="font-medium text-[#526c55] underline underline-offset-2">Ayrıntılı çalışma saatlerine git</a>; personel saatleri ekip sayfasında özelleştirilebilir.</p></div>{params.saatlerKaydedildi && <p role="status" className="mb-3 rounded-lg bg-[#f3f7f1] px-3 py-2 text-xs text-[#58715b]">Çalışma saatleri ve molalar kaydedildi.</p>}<WeeklyHoursForm initial={initialHours} initialBreaks={initialBreaks} action={saveWeeklyHoursAction} disabled={!admin} /></section>
  </div>;
}
function field(label: string, name: string, value: string, required = true, type = "text") { return <label className="block text-xs font-medium text-[#555c53]">{label}<input name={name} type={type} required={required} defaultValue={value} className={inputClass} /></label>; }
const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#98aa96]";

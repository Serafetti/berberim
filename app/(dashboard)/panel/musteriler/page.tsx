import Link from "next/link";
import { CirclePlus, Search, UsersRound } from "lucide-react";
import { saveCustomerAction } from "@/app/actions/panel";
import { requireOrganization } from "@/lib/tenant";

type Props = { searchParams: Promise<{ q?: string; yeni?: string; hata?: string; kaydedildi?: string }> };

export default async function CustomersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { supabase, organization } = await requireOrganization();
  const searchTerm = params.q?.trim().replace(/[^\p{L}\p{N} +\-]/gu, "").slice(0, 64);
  let customerQuery = supabase.from("customers").select("id,name,phone,email,notes,created_at").eq("organization_id", organization.id).is("deleted_at", null).order("name").limit(500);
  if (searchTerm) customerQuery = customerQuery.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
  const [{ data: customers }, { data: appointments }] = await Promise.all([
    customerQuery,
    supabase.from("appointments").select("customer_id,start_at,status,services(price)").eq("organization_id", organization.id).is("deleted_at", null).neq("status", "cancelled").order("start_at", { ascending: false }).limit(5000),
  ]);
  const stats = new Map<string, { count: number; spent: number; last: string | null }>();
  for (const appointment of appointments ?? []) {
    const current = stats.get(appointment.customer_id) ?? { count: 0, spent: 0, last: null };
    const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services;
    current.count += 1;
    if (appointment.status === "completed") current.spent += Number(service?.price ?? 0);
    if (!current.last || appointment.start_at > current.last) current.last = appointment.start_at;
    stats.set(appointment.customer_id, current);
  }
  const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });

  return <div className="space-y-6"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-medium text-[#7a8277]">Müşteri ilişkileri</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">Müşteriler</h1><p className="mt-2 text-sm text-[#777d74]">Müşteri geçmişi ve ziyaret özeti.</p></div><a href="#yeni-musteri" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d]"><CirclePlus size={15} /> Müşteri ekle</a></header>
    {params.hata && <p role="alert" className="rounded-lg bg-[#fff8f7] px-3 py-2 text-xs text-[#9b4e45]">Müşteri kaydedilemedi. Bilgileri ve düzenleme yetkinizi kontrol edin.</p>}{params.kaydedildi && <p role="status" className="rounded-lg bg-[#f3f7f1] px-3 py-2 text-xs text-[#58715b]">Müşteri kaydı kaydedildi.</p>}
    <details id="yeni-musteri" open={params.yeni === "1"} className="rounded-2xl border border-[#e7e9e3] bg-white p-5"><summary className="cursor-pointer list-none text-sm font-semibold text-[#30352e]">Yeni müşteri</summary><form action={saveCustomerAction} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-medium text-[#555c53]">Ad Soyad<input required name="name" minLength={2} className={inputClass} /></label><label className="text-xs font-medium text-[#555c53]">Telefon<input required name="phone" type="tel" minLength={8} className={inputClass} /></label><label className="text-xs font-medium text-[#555c53]">E-posta<input name="email" type="email" className={inputClass} /></label><label className="text-xs font-medium text-[#555c53]">Not<input name="notes" maxLength={2000} className={inputClass} /></label><button type="submit" className={buttonClass}>Müşteriyi kaydet</button></form></details>
    <section className="overflow-hidden rounded-2xl border border-[#e7e9e3] bg-white"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eff0ec] px-4 py-4 sm:px-5"><div className="flex items-center gap-2"><UsersRound size={16} className="text-[#718871]" /><h2 className="text-xs font-semibold text-[#343a32]">Müşteri listesi <span className="ml-1 font-normal text-[#858b82]">{customers?.length ?? 0}</span></h2></div><form className="flex items-center gap-1 rounded-lg border border-[#e7e9e3] px-2.5"><Search size={13} className="text-[#858b82]" /><input name="q" defaultValue={params.q} aria-label="Müşteri ara" placeholder="İsim veya telefon" className="w-36 py-2 text-[10px] outline-none sm:w-48" /></form></div>
      {customers?.length ? <div className="divide-y divide-[#f0f1ed]">{customers.map((customer) => { const customerStats = stats.get(customer.id) ?? { count: 0, spent: 0, last: null }; return <Link key={customer.id} href={`/panel/musteriler/${customer.id}`} className="grid gap-2 px-4 py-3.5 hover:bg-[#fafbf9] sm:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] sm:items-center sm:px-5"><span className="min-w-0"><span className="block truncate text-xs font-semibold text-[#3a4038]">{customer.name}</span><span className="mt-1 block text-[10px] text-[#858b82] sm:hidden">{customer.phone}</span></span><span className="hidden text-[11px] text-[#666e64] sm:block">{customer.phone}</span><span className="text-[10px] text-[#737a72]">Son randevu: {customerStats.last ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeZone: organization.timezone }).format(new Date(customerStats.last)) : "—"}</span><span className="text-[10px] text-[#737a72]">{customerStats.count} randevu</span><span className="text-[10px] font-medium text-[#536b53]">{money.format(customerStats.spent)}</span></Link>; })}</div> : <div className="px-5 py-12 text-center"><UsersRound size={20} className="mx-auto text-[#a2aa9f]" /><p className="mt-3 text-xs text-[#858b82]">{params.q ? "Arama sonucu bulunamadı." : "Henüz müşteri eklenmemiş."}</p></div>}
    </section>
  </div>;
}
const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] px-3 py-2.5 text-sm outline-none focus:border-[#98aa96]";
const buttonClass = "inline-flex min-h-10 items-center justify-center self-end rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d]";

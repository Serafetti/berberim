import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck2, Clock3, MapPin, Scissors } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublicProfile = { id: string; name: string; slug: string; city: string | null; business_type: string; custom_business_type: string | null; services: { id: string; name: string; description: string | null; duration_minutes: number; price: number }[]; staff: { id: string; name: string; role: string; service_ids: string[] }[] };

export default async function PublicBusinessPage({ params }: PageProps<"/berber/[slug]">) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("get_public_booking_page", { p_slug: slug });
  const profile = data as unknown as PublicProfile | null;
  if (!profile) notFound();
  const businessLabel = profile.custom_business_type ?? ({ mens_barber: "Berber", womens_hair: "Kuaför", beauty_salon: "Güzellik salonu", unisex_salon: "Unisex salon", hair_salon: "Saç salonu" } as Record<string, string>)[profile.business_type] ?? "Salon";

  return <main className="min-h-screen bg-[#fbfcfa] px-5 py-10 sm:py-16"><div className="mx-auto max-w-5xl">
    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[#283029]"><span className="grid size-8 place-items-center rounded-lg bg-[#eaf0e8] text-[#426047]"><Scissors size={16} /></span>Berberim<span className="text-[#819080]">.com</span></Link>
    <section className="mt-10 grid items-start gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
      <div className="pt-2"><span className="inline-flex rounded-full border border-[#e7ebe4] bg-white px-3 py-1.5 text-[10px] font-medium text-[#60715e]">{businessLabel}</span><h1 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[#252a24]">{profile.name}</h1>{profile.city && <p className="mt-3 flex items-center gap-1.5 text-sm text-[#777d74]"><MapPin size={15} />{profile.city}</p>}<p className="mt-5 max-w-sm text-sm leading-6 text-[#777d74]">Hizmetini ve sana uygun zamanı seçerek online randevu oluştur.</p><div className="mt-6 flex flex-wrap gap-4 text-[11px] text-[#72796f]"><span className="inline-flex items-center gap-1.5"><CalendarCheck2 size={14} />Kolay online randevu</span><span className="inline-flex items-center gap-1.5"><Clock3 size={14} />Uygun saat seçimi</span></div>
      <div className="mt-8"><h2 className="text-xs font-semibold text-[#3f473e]">Hizmetler</h2><ul className="mt-3 space-y-2">{profile.services.map((service) => <li key={service.id} className="flex items-center justify-between gap-2 rounded-lg border border-[#eceee9] bg-white px-3 py-2.5"><span><span className="block text-xs font-medium text-[#41473f]">{service.name}</span><span className="mt-1 block text-[10px] text-[#858b82]">{service.duration_minutes} dakika</span></span><span className="text-xs font-semibold text-[#506850]">₺{Number(service.price).toLocaleString("tr-TR")}</span></li>)}</ul></div>
      <Link href={`/berber/${encodeURIComponent(slug)}/randevu`} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#314d38] px-4 text-sm font-semibold text-white hover:bg-[#263e2d]">Randevu al <ArrowRight size={15} /></Link></div>
      <div className="rounded-2xl border border-[#e7e9e3] bg-white p-5 shadow-[0_20px_60px_-42px_rgba(31,44,32,0.28)] sm:p-7"><h2 className="text-sm font-semibold text-[#30352e]">Ekibimiz</h2><p className="mt-1 text-xs text-[#858b82]">Hizmetine uygun uzmanını seç.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{profile.staff.map((person) => <div key={person.id} className="flex items-center gap-3 rounded-xl border border-[#eceee9] p-3"><span className="grid size-9 place-items-center rounded-full bg-[#eff3ed] text-[11px] font-semibold text-[#567159]">{person.name.split(" ").map((part) => part[0]).join("")}</span><span><span className="block text-xs font-semibold text-[#41473f]">{person.name}</span><span className="mt-0.5 block text-[10px] text-[#858b82]">{person.role}</span></span></div>)}</div><p className="mt-5 text-[10px] leading-5 text-[#8a9087]">İşletmenin uygunluk durumu ve randevular güvenli şekilde doğrulanır.</p></div>
    </section>
  </div></main>;
}

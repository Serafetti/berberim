import { Scissors } from "lucide-react";
import { ServiceManagementForm, ServiceRowActions } from "@/components/service-management-form";
import { requireOrganization } from "@/lib/tenant";

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function ServicesPage({ searchParams }: Props) {
  const { edit } = await searchParams;
  const { supabase, organization, membership } = await requireOrganization();
  const { data: services, error } = await supabase.from("services").select("id,name,description,duration_minutes,price,active").eq("organization_id", organization.id).is("deleted_at", null).order("name");
  const editing = services?.find((service) => service.id === edit);
  const editable = membership.role === "owner" || membership.role === "admin";

  if (error) return <section className="rounded-2xl border border-[#f0d6d2] bg-white p-6"><p role="alert" className="text-sm text-[#9b4e45]">Hizmetler yüklenemedi. Bağlantınızı kontrol edip sayfayı yenileyin.</p></section>;

  return <div className="space-y-6">
    <header><p className="text-xs font-medium text-[#7a8277]">İşletme yönetimi · {organization.name}</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">Hizmetler</h1><p className="mt-2 text-sm text-[#777d74]">Saç, bakım, tırnak ve diğer hizmetlerini tek yerden yönet.</p></header>
    <section className="rounded-2xl border border-[#e7e9e3] bg-white p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#eff3ed] text-[#567159]"><Scissors size={16} aria-hidden="true" /></span><div><h2 className="text-sm font-semibold text-[#30352e]">{editing ? "Hizmeti düzenle" : "Yeni hizmet ekle"}</h2><p className="mt-1 text-[10px] text-[#858b82]">Süre ve fiyat hizmete özel olarak kaydedilir.</p></div></div>{editable ? <ServiceManagementForm key={editing?.id ?? "new-service"} service={editing ? { id: editing.id, name: editing.name, description: editing.description ?? "", duration: editing.duration_minutes, price: editing.price, active: editing.active } : undefined} /> : <p className="mt-4 text-xs text-[#858b82]">Hizmetleri düzenlemek için işletme yöneticisi yetkisi gerekir.</p>}</section>
    <section className="overflow-hidden rounded-2xl border border-[#e7e9e3] bg-white"><div className="border-b border-[#eff0ec] px-5 py-4"><h2 className="text-sm font-semibold text-[#30352e]">Hizmet kataloğu <span className="ml-1 text-xs font-normal text-[#858b82]">{services?.length ?? 0}</span></h2></div>{services?.length ? <div className="divide-y divide-[#f0f1ed]">{services.map((service) => <article key={service.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f3f5f1] text-[#6b8068]"><Scissors size={15} aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold text-[#3a4038]">{service.name}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${service.active ? "bg-[#eff4ed] text-[#56715a]" : "bg-[#f2f2ef] text-[#797f76]"}`}>{service.active ? "Aktif" : "Pasif"}</span></div><p className="mt-1 truncate text-[10px] text-[#858b82]">{service.duration_minutes} dk · ₺{Number(service.price).toLocaleString("tr-TR")}{service.description ? ` · ${service.description}` : ""}</p></div>{editable && <ServiceRowActions service={service} />}</article>)}</div> : <div className="px-5 py-12 text-center"><Scissors size={21} className="mx-auto text-[#a2aa9f]" aria-hidden="true" /><p className="mt-3 text-xs font-medium text-[#636c61]">Henüz hizmet eklenmemiş.</p><p className="mt-1 text-[10px] text-[#858b82]">Kuaför, berber ve güzellik hizmetlerini yukarıdaki formdan ekleyin.</p></div>}</section>
  </div>;
}


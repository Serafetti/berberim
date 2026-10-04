"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Archive, Check, ImagePlus, LoaderCircle, Save, ToggleLeft, ToggleRight, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { archiveStaffAction, saveStaffAction, setStaffActiveAction } from "@/app/actions/panel";
import { staffManagementSchema, type StaffManagementValues } from "@/lib/management-validation";

type ServiceOption = { id: string; name: string };
type StaffRecord = StaffManagementValues & { id: string };
const roleOptions = ["Berber", "Kuaför", "Güzellik Uzmanı", "Usta", "Personel", "Diğer"];

export function StaffManagementForm({ services, staff }: { services: ServiceOption[]; staff?: StaffRecord }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [serverError, setServerError] = useState("");
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<StaffManagementValues>({
    resolver: zodResolver(staffManagementSchema),
    defaultValues: staff ?? { name: "", phone: "", role: "Personel", serviceIds: [], active: true, avatarUrl: "" },
  });

  const submit = handleSubmit(async (values) => {
    setNotice("");
    setServerError("");
    const result = await saveStaffAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setNotice(result.message);
    router.refresh();
  });

  return <form onSubmit={submit} noValidate className="mt-4 space-y-4">
    {staff?.id && <input type="hidden" {...register("id")} />}
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Ad soyad" error={errors.name?.message}><input {...register("name")} id="staff-name" required maxLength={120} autoComplete="name" className={inputClass} placeholder="Örn. Deniz Yılmaz" /></Field><Field label="Telefon" error={errors.phone?.message}><input {...register("phone")} id="staff-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} className={inputClass} placeholder="05xx xxx xx xx" /></Field></div>
    <div className="grid gap-3 sm:grid-cols-2"><Field label="Ünvan / rol" error={errors.role?.message}><input {...register("role")} id="staff-role" list="staff-role-options" required maxLength={100} className={inputClass} placeholder="Örn. Kuaför" /><datalist id="staff-role-options">{roleOptions.map((role) => <option value={role} key={role} />)}</datalist></Field><Field label="Profil görseli URL" error={errors.avatarUrl?.message}><input {...register("avatarUrl")} id="staff-avatar" type="url" inputMode="url" className={inputClass} placeholder="https://… (isteğe bağlı)" /></Field></div>
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#e2e7e0] bg-[#fafbf9] p-3"><span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eff3ed] text-[#668066]">{staff?.avatarUrl ? <img src={staff.avatarUrl} alt="" className="size-full object-cover" /> : <ImagePlus size={17} aria-hidden="true" />}</span><div><p className="text-[10px] font-semibold text-[#515c50]">Profil görseli</p><p className="mt-0.5 text-[9px] text-[#858b82]">İsteğe bağlı güvenli HTTPS görsel adresi. Dosya yükleme/storage entegrasyonu bu aşamada yoktur.</p></div></div>
    <fieldset><legend className="mb-2 text-xs font-medium text-[#555c53]">Verebildiği hizmetler</legend>{services.length ? <Controller control={control} name="serviceIds" render={({ field }) => <div className="flex flex-wrap gap-2">{services.map((service) => { const checked = field.value.includes(service.id); return <label key={service.id} className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] ${checked ? "border-[#b8c8b4] bg-[#f5f8f4] text-[#4c654d]" : "border-[#eceee9] text-[#5d655b]"}`}><input type="checkbox" checked={checked} onChange={(event) => field.onChange(event.target.checked ? [...field.value, service.id] : field.value.filter((id) => id !== service.id))} className="accent-[#314d38]" />{service.name}</label>; })}</div>} /> : <p className="rounded-lg bg-[#f8f9f7] p-3 text-xs text-[#858b82]">Önce hizmet ekleyin. Sonra personele hizmet atayabilirsiniz.</p>}{errors.serviceIds?.message && <p role="alert" className="mt-1.5 text-[10px] text-[#9b4e45]">{errors.serviceIds.message}</p>}</fieldset>
    <label className="flex items-center gap-2 text-xs text-[#555c53]"><input type="checkbox" {...register("active")} className="size-4 accent-[#314d38]" /> Personel aktif ve randevuya açık</label>
    {serverError && <p role="alert" className="rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2.5 text-xs text-[#9b4e45]">{serverError}</p>}{notice && <p role="status" className="rounded-lg border border-[#dfe8dd] bg-[#f5f8f4] px-3 py-2.5 text-xs text-[#506750]">{notice}</p>}
    <Button type="submit" disabled={isSubmitting || services.length === 0} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d] disabled:opacity-60">{isSubmitting ? <><LoaderCircle size={14} className="animate-spin" /> Kaydediliyor…</> : <><Save size={14} /> {staff ? "Değişiklikleri kaydet" : "Personeli ekle"}</>}</Button>
  </form>;
}

export function StaffRowActions({ staff }: { staff: { id: string; name: string; active: boolean } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function toggle() {
    setBusy(true);
    setError("");
    const result = await setStaffActiveAction({ id: staff.id, active: !staff.active });
    if (!result.ok) setError(result.error);
    else router.refresh();
    setBusy(false);
  }
  async function archive() {
    if (!window.confirm(`“${staff.name}” personelini arşivlemek istiyor musunuz?`)) return;
    setBusy(true);
    setError("");
    const result = await archiveStaffAction(staff.id);
    if (!result.ok) setError(result.error);
    else router.refresh();
    setBusy(false);
  }
  return <div className="flex flex-wrap items-center gap-3"><button type="button" disabled={busy} onClick={toggle} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#526c55] disabled:opacity-50">{staff.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}{staff.active ? "Aktif" : "Pasif"}</button><a href={`/panel/personel?edit=${staff.id}`} className="text-[10px] font-medium text-[#4f694f] hover:underline">Düzenle</a><button type="button" disabled={busy} onClick={archive} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#9b4e45] disabled:opacity-50"><Archive size={13} /> Sil</button>{error && <span role="alert" className="w-full text-[10px] text-[#9b4e45]">{error}</span>}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-xs font-medium text-[#555c53]">{label}{children}{error && <span role="alert" className="mt-1 block text-[10px] text-[#9b4e45]">{error}</span>}</label>;
}
const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#98aa96]";

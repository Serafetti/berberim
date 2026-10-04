"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, Check, LoaderCircle, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { archiveServiceAction, saveServiceAction, setServiceActiveAction } from "@/app/actions/panel";
import { serviceManagementSchema, type ServiceManagementValues } from "@/lib/management-validation";

type ServiceRecord = ServiceManagementValues & { id: string };

export function ServiceManagementForm({ service }: { service?: ServiceRecord }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ServiceManagementValues>({
    resolver: zodResolver(serviceManagementSchema),
    defaultValues: service ?? { name: "", description: "", duration: 30, price: 0, active: true },
  });
  const submit = handleSubmit(async (values) => {
    setNotice("");
    setServerError("");
    const result = await saveServiceAction(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    setNotice(result.message);
    router.refresh();
  });

  return <form onSubmit={submit} noValidate className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {service?.id && <input type="hidden" {...register("id")} />}
    <Field label="Hizmet adı" error={errors.name?.message}><input {...register("name")} id="service-name" required maxLength={120} className={inputClass} placeholder="Örn. Saç kesimi" /></Field>
    <Field label="Süre (dakika)" error={errors.duration?.message}><input {...register("duration", { valueAsNumber: true })} id="service-duration" required type="number" min={5} max={720} className={inputClass} /></Field>
    <Field label="Fiyat (₺)" error={errors.price?.message}><input {...register("price", { valueAsNumber: true })} id="service-price" required type="number" min={0} step="0.01" className={inputClass} /></Field>
    <Field label="Açıklama" error={errors.description?.message}><input {...register("description")} id="service-description" maxLength={1000} className={inputClass} placeholder="İsteğe bağlı" /></Field>
    <label className="flex min-h-10 items-center gap-2 text-xs text-[#555c53]"><input type="checkbox" {...register("active")} className="size-4 accent-[#314d38]" /> Hizmet aktif ve seçilebilir</label>
    {serverError && <p role="alert" className="rounded-lg bg-[#fff8f7] px-3 py-2 text-xs text-[#9b4e45] sm:col-span-2 lg:col-span-4">{serverError}</p>}
    {notice && <p role="status" className="rounded-lg bg-[#f3f7f1] px-3 py-2 text-xs text-[#58715b] sm:col-span-2 lg:col-span-4">{notice}</p>}
    <Button type="submit" disabled={isSubmitting} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d] disabled:opacity-60">{isSubmitting ? <><LoaderCircle size={14} className="animate-spin" /> Kaydediliyor…</> : <><Save size={14} /> {service ? "Değişiklikleri kaydet" : "Hizmeti ekle"}</>}</Button>
  </form>;
}

export function ServiceRowActions({ service }: { service: Pick<ServiceRecord, "id" | "name" | "active"> }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  async function toggleActive() {
    setWorking(true);
    setError("");
    const result = await setServiceActiveAction({ id: service.id, active: !service.active });
    if (!result.ok) setError(result.error);
    else router.refresh();
    setWorking(false);
  }
  async function archive() {
    if (!window.confirm(`“${service.name}” hizmetini arşivlemek istiyor musunuz?`)) return;
    setWorking(true);
    setError("");
    const result = await archiveServiceAction(service.id);
    if (!result.ok) setError(result.error);
    else router.refresh();
    setWorking(false);
  }
  return <div className="flex flex-wrap items-center gap-3"><button type="button" disabled={working} onClick={toggleActive} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#526c55] disabled:opacity-50">{service.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}{service.active ? "Aktif" : "Pasif"}</button><a href={`/panel/hizmetler?edit=${service.id}`} className="text-[10px] font-medium text-[#4f694f] hover:underline">Düzenle</a><button type="button" disabled={working} onClick={archive} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#9b4e45] disabled:opacity-50"><Archive size={13} /> Sil</button>{error && <span role="alert" className="w-full text-[10px] text-[#9b4e45]">{error}</span>}</div>;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <label className="block text-xs font-medium text-[#555c53]">{label}{children}{error && <span role="alert" className="mt-1 block text-[10px] text-[#9b4e45]">{error}</span>}</label>;
}
const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#98aa96]";

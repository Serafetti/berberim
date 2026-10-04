"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle, MapPin, Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createOrganizationAction } from "@/app/actions/onboarding";
import { organizationOnboardingSchema } from "@/lib/validations";
import type { z } from "zod";

type FormValues = z.infer<typeof organizationOnboardingSchema>;
const businessChoices = [
  { value: "mens_barber", label: "Erkek Berberi", detail: "Berber ve erkek bakım salonu" },
  { value: "womens_hair", label: "Kadın Kuaförü", detail: "Saç kesimi, boya ve bakım" },
  { value: "beauty_salon", label: "Güzellik Salonu", detail: "Cilt, tırnak ve güzellik hizmetleri" },
  { value: "unisex_salon", label: "Unisex Salon", detail: "Herkese açık salon" },
] as const;

function slugify(value: string) {
  return value.toLocaleLowerCase("tr-TR").replaceAll("ı", "i").replaceAll("ğ", "g").replaceAll("ü", "u").replaceAll("ş", "s").replaceAll("ö", "o").replaceAll("ç", "c").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

export function OnboardingForm({ email }: { email: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(organizationOnboardingSchema),
    defaultValues: { name: "", businessType: "unisex_salon", phone: "", address: "", city: "", district: "", slug: "" },
  });
  const selectedType = useWatch({ control, name: "businessType" });

  const submit = handleSubmit(async (values) => {
    setServerError("");
    try {
      const result = await createOrganizationAction(values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.replace("/panel");
      router.refresh();
    } catch {
      setServerError("İşletme bilgileri kaydedilemedi. Lütfen tekrar deneyin.");
    }
  });

  return <form onSubmit={submit} noValidate className="space-y-6">
    <div className="flex items-center gap-3 rounded-xl border border-[#e8ece5] bg-[#f8faf7] p-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#547158]"><Sparkles size={17} aria-hidden="true" /></span>
      <div className="min-w-0"><p className="text-[11px] font-semibold text-[#3e493d]">Hesap doğrulandı</p><p className="truncate text-[10px] text-[#7e877a]">{email}</p></div>
      <Check size={15} className="ml-auto text-[#628067]" aria-hidden="true" />
    </div>

    <section className="space-y-4" aria-labelledby="business-heading">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718871]">İşletme profili</p><h2 id="business-heading" className="mt-1 text-lg font-semibold tracking-[-0.035em] text-[#292e28]">İşletmeni tanıyalım.</h2><p className="mt-1 text-xs leading-5 text-[#777d74]">Bu bilgiler işletme panelini hazırlamak ve randevuları düzenlemek için kullanılır.</p></div>
      <Field id="organization-name" label="İşletme adı" error={errors.name?.message}><input {...register("name", { onChange: (event) => { if (!slugEdited) setValue("slug", slugify(event.target.value), { shouldValidate: true }); } })} id="organization-name" autoComplete="organization" required maxLength={120} className={inputClass} placeholder="Örn. Ada Studio" /></Field>
      <fieldset>
        <legend className="mb-2 text-xs font-medium text-[#464d44]">İşletme türü</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{businessChoices.map((choice) => <label key={choice.value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${selectedType === choice.value ? "border-[#9aac98] bg-[#f5f8f4]" : "border-[#e9ebe6] bg-white hover:border-[#cbd5c8]"}`}><input {...register("businessType")} type="radio" value={choice.value} className="mt-0.5 accent-[#314d38]" /><span><span className="block text-xs font-semibold text-[#384038]">{choice.label}</span><span className="mt-0.5 block text-[10px] leading-4 text-[#81887e]">{choice.detail}</span></span></label>)}</div>
        {errors.businessType?.message && <p role="alert" className="mt-1.5 text-[11px] text-[#9b4e45]">{errors.businessType.message}</p>}
      </fieldset>
      <Field id="organization-phone" label="İşletme telefonu" error={errors.phone?.message}><input {...register("phone")} id="organization-phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={24} className={inputClass} placeholder="05xx xxx xx xx" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="organization-city" label="Şehir" error={errors.city?.message}><input {...register("city")} id="organization-city" autoComplete="address-level2" required maxLength={100} className={inputClass} placeholder="İstanbul" /></Field>
        <Field id="organization-district" label="İlçe" error={errors.district?.message}><input {...register("district")} id="organization-district" autoComplete="address-level3" required maxLength={100} className={inputClass} placeholder="Kadıköy" /></Field>
      </div>
      <Field id="organization-address" label="Açık adres" error={errors.address?.message}><textarea {...register("address")} id="organization-address" autoComplete="street-address" required rows={2} maxLength={240} className={`${inputClass} resize-y`} placeholder="Mahalle, cadde ve kapı numarası" /></Field>
      <Field id="organization-slug" label="İşletme bağlantısı" error={errors.slug?.message} hint="Müşteriler bu adresi kullanarak salonunu bulabilir.">
        <div className="mt-1.5 flex min-w-0 overflow-hidden rounded-lg border border-[#e2e5df] bg-white focus-within:border-[#98aa96] focus-within:ring-2 focus-within:ring-[#dfe8dd]"><span className="flex shrink-0 items-center border-r border-[#e2e5df] bg-[#f8f9f7] px-2.5 text-[10px] text-[#777d74] sm:px-3 sm:text-xs">berberim.com/berber/</span><input {...register("slug", { onChange: () => setSlugEdited(true) })} id="organization-slug" autoComplete="url" required minLength={3} maxLength={60} className="min-w-0 flex-1 px-2.5 py-2.5 text-sm text-[#30352e] outline-none" placeholder="ada-studio" /></div>
      </Field>
    </section>

    {serverError && <p role="alert" className="rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2.5 text-xs leading-5 text-[#9b4e45]">{serverError}</p>}
    <div className="rounded-xl bg-[#f7f9f6] p-3.5"><div className="flex items-start gap-2.5"><MapPin size={15} className="mt-0.5 shrink-0 text-[#69846b]" aria-hidden="true" /><p className="text-[10px] leading-5 text-[#737c70]">İşletme türün, salonunu Berber, kuaför ve güzellik işletmelerine uygun şekilde konumlandırır. İşletme bilgilerini daha sonra panelden güncelleyebilirsin.</p><Scissors size={14} className="mt-0.5 shrink-0 text-[#9ca99a]" aria-hidden="true" /></div></div>
    <Button type="submit" disabled={isSubmitting} className={submitButtonClass}>{isSubmitting ? <><LoaderCircle size={16} className="animate-spin" /> İşletme oluşturuluyor…</> : <>İşletmeni oluştur <ArrowRight size={16} /></>}</Button>
  </form>;
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return <div><label htmlFor={id} className="block text-xs font-medium text-[#464d44]">{label}</label>{children}{error ? <p role="alert" className="mt-1.5 text-[11px] text-[#9b4e45]">{error}</p> : hint ? <p className="mt-1.5 text-[10px] text-[#858b82]">{hint}</p> : null}</div>;
}

const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm text-[#30352e] outline-none transition placeholder:text-[#a1a69e] focus:border-[#98aa96] focus:ring-2 focus:ring-[#dfe8dd] aria-invalid:border-[#d38b80]";
const submitButtonClass = "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#314d38] px-4 text-sm font-semibold text-white hover:bg-[#263e2d] disabled:cursor-wait disabled:opacity-60";

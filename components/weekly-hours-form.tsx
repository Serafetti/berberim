"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { weeklyScheduleSchema, type WeeklyScheduleValues, type ManagementActionResult } from "@/lib/management-validation";

type Day = WeeklyScheduleValues["hours"][number];
type Pause = WeeklyScheduleValues["breaks"][number];
const dayNames = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
type ScheduleAction = (values: WeeklyScheduleValues) => Promise<ManagementActionResult>;

export function WeeklyHoursForm({ initial, initialBreaks = [], staffId, action, disabled = false }: { initial: Day[]; initialBreaks?: Pause[]; staffId?: string; action: ScheduleAction; disabled?: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const defaultBreaks = useMemo(() => Array.from({ length: 7 }, (_, day) => initialBreaks.find((pause) => pause.day_of_week === day) ?? ({ day_of_week: day, active: false, start_time: "13:00", end_time: "14:00" })), [initialBreaks]);
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<WeeklyScheduleValues>({
    resolver: zodResolver(weeklyScheduleSchema),
    defaultValues: { hours: initial, breaks: defaultBreaks },
  });
  const hours = useFieldArray({ control, name: "hours" });
  const breaks = useFieldArray({ control, name: "breaks" });

  const submit = handleSubmit(async (values) => {
    setMessage("");
    setError("");
    const result = await action(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(result.message);
    router.refresh();
  });

  return <form onSubmit={submit} noValidate className="space-y-4">
    <fieldset disabled={disabled || isSubmitting} className="space-y-4">
      <div className="divide-y divide-[#eff0ec] rounded-xl border border-[#eceee9] px-3 sm:px-4">
        {hours.fields.map((field, index) => <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 py-3 sm:grid-cols-[1fr_auto_auto_auto]"><label className="flex items-center gap-2 text-xs font-medium text-[#4b5149]"><input type="checkbox" {...register(`hours.${index}.active`)} className="accent-[#314d38]" />{dayNames[field.day_of_week]}</label><input aria-label={`${dayNames[field.day_of_week]} başlangıç`} type="time" {...register(`hours.${index}.start_time`)} className={timeClass} /><span className="text-[10px] text-[#92978f]">—</span><div><input aria-label={`${dayNames[field.day_of_week]} bitiş`} type="time" {...register(`hours.${index}.end_time`)} className={timeClass} />{errors.hours?.[index]?.end_time?.message && <p role="alert" className="mt-1 text-[9px] text-[#9b4e45]">{errors.hours[index]?.end_time?.message}</p>}</div></div>)}
      </div>
      <fieldset className="rounded-xl border border-[#eceee9] p-3 sm:p-4"><legend className="px-1 text-xs font-semibold text-[#424940]">{staffId ? "Personel molaları" : "İşletme molaları"}</legend><div className="space-y-1">{breaks.fields.map((field, index) => <div key={field.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 py-2 sm:grid-cols-[1fr_auto_auto_auto]"><label className="flex items-center gap-2 text-[10px] text-[#666e64]"><input type="checkbox" {...register(`breaks.${index}.active`)} className="accent-[#314d38]" />{dayNames[field.day_of_week]}</label><div><input aria-label={`${dayNames[field.day_of_week]} mola başlangıcı`} type="time" {...register(`breaks.${index}.start_time`)} className={timeClass} />{errors.breaks?.[index]?.start_time?.message && <p role="alert" className="mt-1 text-[9px] text-[#9b4e45]">{errors.breaks[index]?.start_time?.message}</p>}</div><span className="text-[10px] text-[#92978f]">—</span><div><input aria-label={`${dayNames[field.day_of_week]} mola bitişi`} type="time" {...register(`breaks.${index}.end_time`)} className={timeClass} />{errors.breaks?.[index]?.end_time?.message && <p role="alert" className="mt-1 text-[9px] text-[#9b4e45]">{errors.breaks[index]?.end_time?.message}</p>}</div></div>)}</div></fieldset>
    </fieldset>
    {disabled && <p className="text-[10px] text-[#858b82]">Bu programı değiştirmek için işletme yöneticisi olmalısınız.</p>}
    {error && <p role="alert" className="rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2.5 text-xs text-[#9b4e45]">{error}</p>}
    {message && <p role="status" className="rounded-lg border border-[#dfe8dd] bg-[#f5f8f4] px-3 py-2.5 text-xs text-[#506750]">{message}</p>}
    <Button type="submit" disabled={disabled || isSubmitting} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d] disabled:opacity-60">{isSubmitting ? <><LoaderCircle size={14} className="animate-spin" /> Kaydediliyor…</> : <><Save size={14} /> Saatleri kaydet <Check size={13} /></>}</Button>
  </form>;
}

const timeClass = "w-full max-w-28 rounded-md border border-[#e2e5df] bg-white px-2 py-2 text-xs text-[#30352e] outline-none focus:border-[#98aa96] disabled:bg-[#f5f6f3]";

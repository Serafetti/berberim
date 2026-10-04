"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Check, Clock3, UserRound } from "lucide-react";

type BookingService = { id: string; name: string; description: string | null; duration_minutes: number; price: number };
type BookingStaff = { id: string; name: string; role: string; service_ids: string[] };
type Slot = { slot_start: string };

export function PublicBooking({ slug, businessName, services, staff }: { slug: string; businessName: string; services: BookingService[]; staff: BookingStaff[] }) {
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [slotResult, setSlotResult] = useState<{ key: string; slots: Slot[] }>({ key: "", slots: [] });
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const service = services.find((item) => item.id === serviceId);
  const slotKey = `${serviceId}:${staffId}:${date}`;
  const slots = slotResult.key === slotKey ? slotResult.slots : [];

  useEffect(() => {
    if (!serviceId || !staffId || !date) return;
    const controller = new AbortController();
    const key = `${serviceId}:${staffId}:${date}`;
    void Promise.resolve().then(() => {
      if (!controller.signal.aborted) setLoading(true);
      return fetch(`/api/public/${encodeURIComponent(slug)}/slots?${new URLSearchParams({ serviceId, staffId, date })}`, { signal: controller.signal });
    })
      .then(async (response) => {
        const payload = await response.json() as { slots?: Slot[]; error?: string };
        if (!response.ok) throw new Error(payload.error ?? "Saatler yüklenemedi.");
        setSlotResult({ key, slots: payload.slots ?? [] });
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [slug, serviceId, staffId, date]);

  async function submitAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serviceId || !staffId || !slot) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/public/${encodeURIComponent(slug)}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, staffId, startAt: slot, customerName: name, customerPhone: phone }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Randevu oluşturulamadı.");
      setSuccess(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Randevu oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  return <section className="mx-auto w-full max-w-2xl rounded-2xl border border-[#e7e9e3] bg-white p-5 shadow-[0_20px_60px_-42px_rgba(31,44,32,0.28)] sm:p-8">
    {success ? <div className="py-8 text-center"><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#edf3eb] text-[#547158]"><Check size={23} /></span><h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#262a25]">Randevu talebin alındı.</h1><p className="mt-2 text-sm text-[#747a72]">{businessName} için seçtiğin zaman işletmeye iletildi.</p></div> : <form onSubmit={submitAppointment} className="space-y-6">
      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718871]">Online randevu</p><h1 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">{businessName}</h1><p className="mt-2 text-sm text-[#777d74]">Hizmetini, uzmanını ve sana uygun zamanı seç.</p></div>
      <fieldset><legend className="mb-2 text-xs font-semibold text-[#464d44]">1. Hizmet seç</legend><div className="grid gap-2 sm:grid-cols-2">{services.map((item) => <button type="button" key={item.id} onClick={() => { setServiceId(item.id); setStaffId(""); setSlot(""); }} className={`rounded-xl border p-3 text-left transition-colors ${serviceId === item.id ? "border-[#8da38c] bg-[#f5f8f4]" : "border-[#e9ebe6] hover:border-[#c9d3c6]"}`}><span className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#343a32]">{item.name}</span><span className="text-[11px] font-semibold text-[#506850]">{new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(item.price)}</span></span><span className="mt-1 block text-[10px] text-[#858b82]">{item.duration_minutes} dakika</span></button>)}</div></fieldset>
      {service && <fieldset><legend className="mb-2 text-xs font-semibold text-[#464d44]">2. Personel seç</legend><div className="grid gap-2 sm:grid-cols-2">{staff.filter((person) => person.name && person.service_ids.includes(service.id)).map((person) => <button type="button" key={person.id} onClick={() => { setStaffId(person.id); setSlot(""); }} className={`flex items-center gap-3 rounded-xl border p-3 text-left ${staffId === person.id ? "border-[#8da38c] bg-[#f5f8f4]" : "border-[#e9ebe6] hover:border-[#c9d3c6]"}`}><span className="grid size-8 place-items-center rounded-full bg-[#eff3ed] text-[#5a7158]"><UserRound size={15} /></span><span><span className="block text-xs font-semibold text-[#343a32]">{person.name}</span><span className="mt-0.5 block text-[10px] text-[#858b82]">{person.role}</span></span></button>)}</div></fieldset>}
      {staffId && <fieldset><legend className="mb-2 text-xs font-semibold text-[#464d44]">3. Tarih ve uygun saat</legend><label className="block max-w-xs text-[10px] font-medium text-[#747a72]">Tarih<input required type="date" value={date} onChange={(event) => { setDate(event.target.value); setSlot(""); }} className="mt-1.5 w-full rounded-lg border border-[#e2e5df] px-3 py-2.5 text-sm" /></label>{date && <div className="mt-3">{loading ? <p className="text-xs text-[#858b82]">Uygun saatler aranıyor…</p> : slots.length ? <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{slots.map((item) => <button key={item.slot_start} type="button" onClick={() => setSlot(item.slot_start)} className={`rounded-lg border px-2 py-2.5 text-xs font-medium tabular-nums ${slot === item.slot_start ? "border-[#314d38] bg-[#314d38] text-white" : "border-[#e7e9e3] text-[#4c574c] hover:border-[#9bad98]"}`}>{new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(new Date(item.slot_start))}</button>)}</div> : <p className="rounded-lg bg-[#f7f8f6] px-3 py-2.5 text-xs text-[#747a72]">Bu tarihte uygun saat bulunamadı. Başka bir gün seçebilirsin.</p>}</div>}</fieldset>}
      {slot && <><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[#464d44]">Ad Soyad<input required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e5df] px-3 py-2.5 text-sm" /></label><label className="text-xs font-medium text-[#464d44]">Telefon<input required minLength={8} maxLength={24} type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#e2e5df] px-3 py-2.5 text-sm" /></label></div><div className="flex items-center gap-2 rounded-lg bg-[#f6f8f4] p-3 text-[11px] text-[#536650]"><CalendarDays size={14} /><span>{service?.name} · {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "Europe/Istanbul" }).format(new Date(slot))} · {new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(new Date(slot))}</span><Clock3 size={13} className="ml-auto" />{service?.duration_minutes} dk</div></>}
      {error && <p role="alert" className="rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2 text-xs text-[#9b4e45]">{error}</p>}
      <button disabled={!slot || submitting} type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#314d38] px-4 text-sm font-semibold text-white hover:bg-[#263e2d] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Randevu oluşturuluyor…" : "Randevuyu oluştur"}<ArrowRight size={15} /></button>
    </form>}
  </section>;
}

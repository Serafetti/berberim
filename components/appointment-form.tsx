"use client";

import { useMemo, useState } from "react";
import { createAppointmentAction } from "@/app/actions/panel";

type Service = { id: string; name: string; duration_minutes: number; price: number };
type Worker = { id: string; name: string; role: string; service_ids: string[] };
export function AppointmentForm({ services, staff }: { services: Service[]; staff: Worker[] }) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [staffId, setStaffId] = useState("");
  const availableStaff = useMemo(() => staff.filter((person) => person.service_ids.includes(serviceId)), [staff, serviceId]);
  return <form action={createAppointmentAction} className="grid gap-3 sm:grid-cols-2">
    <label className="text-xs font-medium text-[#555c53]">Hizmet<select required name="serviceId" value={serviceId} onChange={(event) => setServiceId(event.target.value)} className={inputClass}>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.duration_minutes} dk · ₺{Number(service.price).toLocaleString("tr-TR")}</option>)}</select></label>
    <label className="text-xs font-medium text-[#555c53]">Personel<select required name="staffId" value={availableStaff.some((person) => person.id === staffId) ? staffId : availableStaff[0]?.id ?? ""} onChange={(event) => setStaffId(event.target.value)} className={inputClass}>{availableStaff.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label>
    <label className="text-xs font-medium text-[#555c53]">Tarih ve saat<input required name="startAt" type="datetime-local" step={900} className={inputClass} /></label>
    <label className="text-xs font-medium text-[#555c53]">Müşteri adı<input required name="customerName" minLength={2} maxLength={120} className={inputClass} /></label>
    <label className="text-xs font-medium text-[#555c53]">Telefon<input required name="customerPhone" type="tel" minLength={8} maxLength={24} className={inputClass} /></label>
    <label className="text-xs font-medium text-[#555c53]">Not<input name="notes" maxLength={1000} className={inputClass} /></label>
    <button type="submit" disabled={!services.length || !availableStaff.length} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#314d38] px-4 text-xs font-semibold text-white hover:bg-[#263e2d] disabled:opacity-50 sm:col-span-2">Randevuyu oluştur</button>
  </form>;
}
const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#98aa96]";

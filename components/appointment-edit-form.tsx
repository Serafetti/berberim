"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { updateAppointmentAction } from "@/app/actions/panel";

type Service = { id: string; name: string; duration_minutes: number };
type Worker = { id: string; name: string; role: string; service_ids: string[] };
export function AppointmentEditForm({ appointmentId, services, staff, initialService, initialStaff, initialStartAt, initialNotes }: { appointmentId: string; services: Service[]; staff: Worker[]; initialService: string; initialStaff: string; initialStartAt: string; initialNotes: string | null }) {
  const [serviceId, setServiceId] = useState(initialService);
  const [staffId, setStaffId] = useState(initialStaff);
  const availableStaff = useMemo(() => staff.filter((person) => person.service_ids.includes(serviceId)), [staff, serviceId]);
  return <form action={updateAppointmentAction} className="grid gap-3 rounded-xl border border-[#eceee9] bg-[#fbfcfa] p-3 sm:grid-cols-2">
    <input type="hidden" name="appointmentId" value={appointmentId} />
    <label className="text-[10px] font-medium text-[#555c53]">Hizmet<select name="serviceId" value={serviceId} onChange={(event) => setServiceId(event.target.value)} className={inputClass}>{services.map((service) => <option key={service.id} value={service.id}>{service.name} · {service.duration_minutes} dk</option>)}</select></label>
    <label className="text-[10px] font-medium text-[#555c53]">Personel<select name="staffId" value={availableStaff.some((person) => person.id === staffId) ? staffId : availableStaff[0]?.id ?? ""} onChange={(event) => setStaffId(event.target.value)} className={inputClass}>{availableStaff.map((person) => <option key={person.id} value={person.id}>{person.name} · {person.role}</option>)}</select></label>
    <label className="text-[10px] font-medium text-[#555c53]">Yeni tarih ve saat<input name="startAt" type="datetime-local" step={900} required defaultValue={initialStartAt} className={inputClass} /></label>
    <label className="text-[10px] font-medium text-[#555c53]">Not<input name="notes" maxLength={1000} defaultValue={initialNotes ?? ""} className={inputClass} /></label>
    <button type="submit" className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#314d38] px-3 text-[11px] font-semibold text-white hover:bg-[#263e2d] sm:col-span-2"><Save size={13} /> Değişiklikleri kaydet</button>
  </form>;
}
const inputClass = "mt-1 w-full rounded-lg border border-[#e2e5df] bg-white px-2.5 py-2 text-xs outline-none focus:border-[#98aa96]";

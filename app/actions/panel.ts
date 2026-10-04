"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { localDateTimeToIso } from "@/lib/date-time";
import { serviceManagementSchema, staffManagementSchema, weeklyScheduleSchema, type ManagementActionResult } from "@/lib/management-validation";
import { requireOrganization } from "@/lib/tenant";

const settingsInput = z.object({ name: z.string().trim().min(2).max(120), slug: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/), phone: z.string().trim().max(24), email: z.union([z.string().email(), z.literal("")]), address: z.string().trim().max(240), city: z.string().trim().max(100), district: z.string().trim().max(100), logoUrl: z.union([z.string().url(), z.literal("")]).refine((value) => value === "" || /^https?:\/\//i.test(value)), businessType: z.enum(["mens_barber", "womens_hair", "beauty_salon", "unisex_salon", "hair_salon", "other"]), customBusinessType: z.string().trim().max(100) });
function isOrganizationAdmin(role: string) {
  return role === "owner" || role === "admin";
}

export async function saveServiceAction(input: unknown): Promise<ManagementActionResult> {
  const parsed = serviceManagementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Hizmet bilgilerini kontrol edin." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Hizmetleri yalnızca işletme yöneticisi düzenleyebilir." };
  const { id, ...values } = parsed.data;
  const payload = { name: values.name, description: values.description || null, duration_minutes: values.duration, price: values.price, active: values.active };
  const result = id
    ? await supabase.from("services").update(payload).eq("id", id).eq("organization_id", organization.id).is("deleted_at", null).select("id").maybeSingle()
    : await supabase.from("services").insert({ ...payload, organization_id: organization.id }).select("id").single();
  if (result.error) return { ok: false, error: result.error.code === "23505" ? "Bu hizmet zaten kayıtlı." : "Hizmet kaydedilemedi. Lütfen tekrar deneyin." };
  if (!result.data) return { ok: false, error: "Hizmet bulunamadı veya düzenleme yetkiniz yok." };
  return { ok: true, message: id ? "Hizmet güncellendi." : "Hizmet eklendi." };
}

export async function setServiceActiveAction(input: unknown): Promise<ManagementActionResult> {
  const parsed = z.object({ id: z.string().uuid(), active: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Hizmet seçimi geçersiz." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Bu işlem için yönetici yetkisi gerekiyor." };
  const { data, error } = await supabase.from("services").update({ active: parsed.data.active }).eq("id", parsed.data.id).eq("organization_id", organization.id).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return { ok: false, error: "Hizmet durumu güncellenemedi." };
  return { ok: true, message: parsed.data.active ? "Hizmet yeniden etkinleştirildi." : "Hizmet pasife alındı." };
}

export async function archiveServiceAction(input: unknown): Promise<ManagementActionResult> {
  const parsed = z.string().uuid().safeParse(input);
  if (!parsed.success) return { ok: false, error: "Hizmet seçimi geçersiz." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Bu işlem için yönetici yetkisi gerekiyor." };
  const { data, error } = await supabase.from("services").update({ active: false, deleted_at: new Date().toISOString() }).eq("id", parsed.data).eq("organization_id", organization.id).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return { ok: false, error: "Hizmet arşivlenemedi." };
  return { ok: true, message: "Hizmet soft-delete ile arşivlendi." };
}

export async function saveStaffAction(input: unknown): Promise<ManagementActionResult> {
  const parsed = staffManagementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Personel bilgilerini kontrol edin." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Personeli yalnızca işletme yöneticisi düzenleyebilir." };
  const serviceIds = [...new Set(parsed.data.serviceIds)];
  const { data: services, error: serviceError } = await supabase.from("services").select("id").eq("organization_id", organization.id).in("id", serviceIds).eq("active", true).is("deleted_at", null);
  if (serviceError || services?.length !== serviceIds.length) return { ok: false, error: "Seçilen hizmetlerden biri bu işletmede aktif değil." };

  const { id, serviceIds: _serviceIds, avatarUrl, ...staffValues } = parsed.data;
  const staffPayload = { name: staffValues.name, phone: staffValues.phone || null, role: staffValues.role, active: staffValues.active, avatar_url: avatarUrl || null };
  let staffId = id;
  if (staffId) {
    const { data, error } = await supabase.from("staff").update(staffPayload).eq("id", staffId).eq("organization_id", organization.id).is("deleted_at", null).select("id").maybeSingle();
    if (error || !data) return { ok: false, error: "Personel bulunamadı veya güncellenemedi." };
  } else {
    const { data, error } = await supabase.from("staff").insert({ ...staffPayload, organization_id: organization.id }).select("id").single();
    if (error || !data) return { ok: false, error: "Personel eklenemedi." };
    staffId = data.id;
    const { data: organizationHours } = await supabase.from("working_hours").select("day_of_week,start_time,end_time,active").eq("organization_id", organization.id).is("staff_id", null).eq("active", true);
    if (organizationHours?.length) {
      const { error: hoursError } = await supabase.from("working_hours").insert(organizationHours.map((hour) => ({ ...hour, organization_id: organization.id, staff_id: staffId })));
      if (hoursError) return { ok: false, error: "Personel kaydedildi; varsayılan çalışma saatleri kopyalanamadı. Personel saatlerinden düzenleyin." };
    }
  }

  const mappingRows = serviceIds.map((serviceId) => ({ organization_id: organization.id, staff_id: staffId, service_id: serviceId }));
  const { error: mappingError } = await supabase.from("staff_services").upsert(mappingRows, { onConflict: "organization_id,staff_id,service_id", ignoreDuplicates: true });
  if (mappingError) return { ok: false, error: "Personel kaydedildi ancak hizmet ilişkileri güncellenemedi." };
  const { data: existingMappings, error: mappingsError } = await supabase.from("staff_services").select("service_id").eq("organization_id", organization.id).eq("staff_id", staffId);
  if (mappingsError) return { ok: false, error: "Personel kaydedildi ancak mevcut hizmet ilişkileri doğrulanamadı." };
  const staleServiceIds = (existingMappings ?? []).map((mapping) => mapping.service_id).filter((serviceId) => !serviceIds.includes(serviceId));
  if (staleServiceIds.length) {
    const { error: removeError } = await supabase.from("staff_services").delete().eq("organization_id", organization.id).eq("staff_id", staffId).in("service_id", staleServiceIds);
    if (removeError) return { ok: false, error: "Personel kaydedildi ancak kaldırılan hizmet ilişkileri güncellenemedi." };
  }
  return { ok: true, message: id ? "Personel bilgileri güncellendi." : "Personel eklendi." };
}

export async function setStaffActiveAction(input: unknown): Promise<ManagementActionResult> {
  const parsed = z.object({ id: z.string().uuid(), active: z.boolean() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "Personel seçimi geçersiz." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Bu işlem için yönetici yetkisi gerekiyor." };
  const { data, error } = await supabase.from("staff").update({ active: parsed.data.active }).eq("id", parsed.data.id).eq("organization_id", organization.id).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return { ok: false, error: "Personel durumu güncellenemedi." };
  return { ok: true, message: parsed.data.active ? "Personel yeniden etkinleştirildi." : "Personel pasife alındı." };
}

export async function archiveStaffAction(input: unknown): Promise<ManagementActionResult> {
  const parsed = z.string().uuid().safeParse(input);
  if (!parsed.success) return { ok: false, error: "Personel seçimi geçersiz." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Bu işlem için yönetici yetkisi gerekiyor." };
  const { data, error } = await supabase.from("staff").update({ active: false, deleted_at: new Date().toISOString() }).eq("id", parsed.data).eq("organization_id", organization.id).is("deleted_at", null).select("id").maybeSingle();
  if (error || !data) return { ok: false, error: "Personel arşivlenemedi." };
  return { ok: true, message: "Personel soft-delete ile arşivlendi." };
}

export async function saveCustomerAction(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(2).max(120), phone: z.string().trim().min(8).max(24), email: z.union([z.string().email(), z.literal("")]), notes: z.string().trim().max(2000) }).safeParse({ id: formData.get("id") || undefined, name: formData.get("name"), phone: formData.get("phone"), email: formData.get("email") ?? "", notes: formData.get("notes") ?? "" });
  if (!parsed.success) redirect("/panel/musteriler?hata=bilgileri-kontrol");
  const { supabase, organization, membership } = await requireOrganization();
  const phone = parsed.data.phone.replace(/[^0-9+]/g, "");
  const values = { name: parsed.data.name, phone, email: parsed.data.email || null, notes: parsed.data.notes || null };
  const result = parsed.data.id
    ? membership.role === "owner" || membership.role === "admin"
      ? await supabase.from("customers").update(values).eq("id", parsed.data.id).eq("organization_id", organization.id)
      : { error: new Error("Insufficient role") }
    : await supabase.from("customers").insert({ ...values, organization_id: organization.id });
  if (result.error) redirect("/panel/musteriler?hata=kaydedilemedi");
  redirect("/panel/musteriler?kaydedildi=1");
}

export async function updateOrganizationAction(formData: FormData) {
  const parsed = settingsInput.safeParse({ name: formData.get("name"), slug: formData.get("slug"), phone: formData.get("phone") ?? "", email: formData.get("email") ?? "", address: formData.get("address") ?? "", city: formData.get("city") ?? "", district: formData.get("district") ?? "", logoUrl: formData.get("logoUrl") ?? "", businessType: formData.get("businessType"), customBusinessType: formData.get("customBusinessType") ?? "" });
  if (!parsed.success || (parsed.data.businessType === "other" && !parsed.data.customBusinessType)) redirect("/panel/ayarlar?hata=bilgileri-kontrol");
  const { supabase, organization, membership } = await requireOrganization();
  if (membership.role !== "owner" && membership.role !== "admin") redirect("/panel/ayarlar?hata=yetki-yok");
  const { error } = await supabase.from("organizations").update({
    name: parsed.data.name, slug: parsed.data.slug, phone: parsed.data.phone || null,
    email: parsed.data.email || null, address: parsed.data.address || null, city: parsed.data.city || null, district: parsed.data.district || null,
    logo_url: parsed.data.logoUrl || null, business_type: parsed.data.businessType, custom_business_type: parsed.data.businessType === "other" ? parsed.data.customBusinessType : null,
  }).eq("id", organization.id);
  if (error?.code === "23505") redirect("/panel/ayarlar?hata=slug-kullaniliyor");
  if (error) redirect("/panel/ayarlar?hata=kaydedilemedi");
  redirect("/panel/ayarlar?kaydedildi=1");
}

export async function createAppointmentAction(formData: FormData) {
  const input = z.object({ serviceId: z.string().uuid(), staffId: z.string().uuid(), startAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), customerName: z.string().trim().min(2).max(120), customerPhone: z.string().trim().min(8).max(24), notes: z.string().trim().max(1000) }).safeParse({ serviceId: formData.get("serviceId"), staffId: formData.get("staffId"), startAt: formData.get("startAt"), customerName: formData.get("customerName"), customerPhone: formData.get("customerPhone"), notes: formData.get("notes") ?? "" });
  if (!input.success) redirect("/panel/randevular?hata=bilgileri-kontrol");
  const { supabase, organization } = await requireOrganization();
  let startAt: string;
  try { startAt = localDateTimeToIso(input.data.startAt, organization.timezone); } catch { redirect("/panel/randevular?hata=tarih-gecersiz"); }
  const { error } = await supabase.rpc("create_member_appointment", {
    p_org_id: organization.id, p_service_id: input.data.serviceId, p_staff_id: input.data.staffId,
    p_start_at: startAt, p_customer_name: input.data.customerName, p_customer_phone: input.data.customerPhone,
    p_notes: input.data.notes || null,
  });
  if (error) redirect(`/panel/randevular?hata=${encodeURIComponent(error.code === "23P01" ? "saat-alindi" : "randevu-olusturulamadi")}`);
  redirect("/panel/randevular?olusturuldu=1");
}

export async function cancelAppointmentAction(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/panel/randevular?hata=gecersiz-kayit");
  const { supabase, organization } = await requireOrganization();
  const { error } = await supabase.from("appointments").update({ status: "cancelled" }).eq("id", id.data).eq("organization_id", organization.id);
  if (error) redirect("/panel/randevular?hata=iptal-edilemedi");
  redirect("/panel/randevular?iptal=1");
}

export async function updateAppointmentAction(formData: FormData) {
  const input = z.object({ appointmentId: z.string().uuid(), serviceId: z.string().uuid(), staffId: z.string().uuid(), startAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), notes: z.string().trim().max(1000) }).safeParse({ appointmentId: formData.get("appointmentId"), serviceId: formData.get("serviceId"), staffId: formData.get("staffId"), startAt: formData.get("startAt"), notes: formData.get("notes") ?? "" });
  if (!input.success) redirect("/panel/randevular?hata=bilgileri-kontrol");
  const { supabase, organization } = await requireOrganization();
  let startAt: string;
  try { startAt = localDateTimeToIso(input.data.startAt, organization.timezone); } catch { redirect("/panel/randevular?hata=tarih-gecersiz"); }
  const { error } = await supabase.rpc("update_member_appointment", {
    p_org_id: organization.id, p_appointment_id: input.data.appointmentId, p_service_id: input.data.serviceId,
    p_staff_id: input.data.staffId, p_start_at: startAt, p_notes: input.data.notes || null,
  });
  if (error) redirect(`/panel/randevular?hata=${encodeURIComponent(error.code === "23P01" ? "saat-alindi" : "randevu-duzenlenemedi")}`);
  redirect("/panel/randevular?guncellendi=1");
}

export async function updateAppointmentStatusAction(formData: FormData) {
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["confirmed", "completed", "cancelled", "no_show"]) }).safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) redirect("/panel/randevular?hata=gecersiz-kayit");
  const { supabase, organization } = await requireOrganization();
  const { error } = await supabase.from("appointments").update({ status: parsed.data.status }).eq("id", parsed.data.id).eq("organization_id", organization.id);
  if (error) redirect("/panel/randevular?hata=durum-guncellenemedi");
  redirect("/panel/randevular?durum-guncellendi=1");
}

export async function saveWeeklyHoursAction(input: unknown): Promise<ManagementActionResult> {
  const parsed = weeklyScheduleSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Çalışma saatlerini kontrol edin." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Çalışma saatlerini yalnızca işletme yöneticisi değiştirebilir." };
  const { error: deleteHoursError } = await supabase.from("working_hours").delete().eq("organization_id", organization.id).is("staff_id", null);
  if (deleteHoursError) return { ok: false, error: "İşletme çalışma saatleri güncellenemedi." };
  const hours = parsed.data.hours.filter((day) => day.active).map(({ day_of_week, start_time, end_time }) => ({ organization_id: organization.id, staff_id: null, day_of_week, start_time, end_time, active: true }));
  const { error: insertHoursError } = await supabase.from("working_hours").insert(hours);
  if (insertHoursError) return { ok: false, error: "Çalışma saatleri kaydedilemedi. Tekrar deneyin." };
  const { error: deleteBreaksError } = await supabase.from("breaks").delete().eq("organization_id", organization.id).is("staff_id", null);
  if (deleteBreaksError) return { ok: false, error: "Molalar güncellenemedi." };
  const breaks = parsed.data.breaks.filter((pause) => pause.active).map(({ day_of_week, start_time, end_time }) => ({ organization_id: organization.id, staff_id: null, day_of_week, start_time, end_time }));
  if (breaks.length) {
    const { error } = await supabase.from("breaks").insert(breaks);
    if (error) return { ok: false, error: "Mola saatleri kaydedilemedi. Tekrar deneyin." };
  }
  return { ok: true, message: "İşletme çalışma saatleri kaydedildi." };
}

export async function saveStaffHoursAction(staffIdInput: unknown, input: unknown): Promise<ManagementActionResult> {
  const staffId = z.string().uuid().safeParse(staffIdInput);
  const parsed = weeklyScheduleSchema.safeParse(input);
  if (!staffId.success || !parsed.success) return { ok: false, error: parsed.success ? "Personel seçimi geçersiz." : parsed.error.issues[0]?.message ?? "Çalışma saatlerini kontrol edin." };
  const { supabase, organization, membership } = await requireOrganization();
  if (!isOrganizationAdmin(membership.role)) return { ok: false, error: "Personel çalışma saatlerini yalnızca işletme yöneticisi değiştirebilir." };
  const { data: staff, error: staffError } = await supabase.from("staff").select("id").eq("id", staffId.data).eq("organization_id", organization.id).is("deleted_at", null).maybeSingle();
  if (staffError || !staff) return { ok: false, error: "Personel bu işletmede bulunamadı." };
  const { error: deleteHoursError } = await supabase.from("working_hours").delete().eq("organization_id", organization.id).eq("staff_id", staff.id);
  if (deleteHoursError) return { ok: false, error: "Personel çalışma saatleri güncellenemedi." };
  const hours = parsed.data.hours.filter((day) => day.active).map(({ day_of_week, start_time, end_time }) => ({ organization_id: organization.id, staff_id: staff.id, day_of_week, start_time, end_time, active: true }));
  const { error: insertHoursError } = await supabase.from("working_hours").insert(hours);
  if (insertHoursError) return { ok: false, error: "Personel çalışma saatleri kaydedilemedi." };
  const { error: deleteBreaksError } = await supabase.from("breaks").delete().eq("organization_id", organization.id).eq("staff_id", staff.id);
  if (deleteBreaksError) return { ok: false, error: "Personel molaları güncellenemedi." };
  const breaks = parsed.data.breaks.filter((pause) => pause.active).map(({ day_of_week, start_time, end_time }) => ({ organization_id: organization.id, staff_id: staff.id, day_of_week, start_time, end_time }));
  if (breaks.length) {
    const { error } = await supabase.from("breaks").insert(breaks);
    if (error) return { ok: false, error: "Personel molaları kaydedilemedi." };
  }
  return { ok: true, message: "Personel çalışma saatleri kaydedildi." };
}

export async function addTimeOffAction(formData: FormData) {
  const parsed = z.object({ staffId: z.string().uuid(), startAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), endAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/), reason: z.string().trim().max(200) }).safeParse({ staffId: formData.get("staffId"), startAt: formData.get("startAt"), endAt: formData.get("endAt"), reason: formData.get("reason") ?? "" });
  if (!parsed.success || parsed.data.startAt >= parsed.data.endAt) redirect("/panel/personel?hata=izin-gecersiz");
  const { supabase, organization } = await requireOrganization();
  let startAt: string;
  let endAt: string;
  try {
    startAt = localDateTimeToIso(parsed.data.startAt, organization.timezone);
    endAt = localDateTimeToIso(parsed.data.endAt, organization.timezone);
  } catch { redirect("/panel/personel?hata=izin-gecersiz"); }
  const { error } = await supabase.from("time_off").insert({ organization_id: organization.id, staff_id: parsed.data.staffId, start_at: startAt, end_at: endAt, reason: parsed.data.reason || null });
  if (error) redirect("/panel/personel?hata=izin-kaydedilemedi");
  redirect("/panel/personel?izin-kaydedildi=1");
}

export async function deleteTimeOffAction(formData: FormData) {
  const id = z.string().uuid().safeParse(formData.get("id"));
  if (!id.success) redirect("/panel/personel?hata=izin-gecersiz");
  const { supabase, organization } = await requireOrganization();
  const { error } = await supabase.from("time_off").delete().eq("id", id.data).eq("organization_id", organization.id);
  if (error) redirect("/panel/personel?hata=izin-silinmedi");
  redirect("/panel/personel?izin-silindi=1");
}

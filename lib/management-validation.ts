import { z } from "zod";

export const serviceManagementSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Hizmet adını girin.").max(120),
  description: z.string().trim().max(1000),
  duration: z.number().int("Süre dakika olarak girilmelidir.").min(5).max(720),
  price: z.number().min(0).max(10_000_000),
  active: z.boolean(),
});
export type ServiceManagementValues = z.infer<typeof serviceManagementSchema>;

export const staffManagementSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(120),
  phone: z.string().trim().max(24),
  role: z.string().trim().min(1, "Ünvan veya rol girin.").max(100),
  serviceIds: z.array(z.string().uuid()).min(1, "En az bir hizmet seçin.").max(60),
  active: z.boolean(),
  avatarUrl: z.union([z.string().url(), z.literal("")]).refine((value) => value === "" || /^https?:\/\//i.test(value), "Profil görseli için https:// adresi kullanın."),
});
export type StaffManagementValues = z.infer<typeof staffManagementSchema>;

const hourSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  active: z.boolean(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine((value) => !value.active || value.start_time < value.end_time, {
  message: "Kapanış saati açılış saatinden sonra olmalı.",
  path: ["end_time"],
});
const breakSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  active: z.boolean(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine((value) => !value.active || value.start_time < value.end_time, {
  message: "Mola bitişi başlangıçtan sonra olmalı.",
  path: ["end_time"],
});

export const weeklyScheduleSchema = z.object({
  hours: z.array(hourSchema).length(7),
  breaks: z.array(breakSchema).length(7),
}).superRefine((value, context) => {
  const days = value.hours.map((item) => item.day_of_week);
  if (new Set(days).size !== 7) context.addIssue({ code: z.ZodIssueCode.custom, message: "Haftanın günleri eksik veya tekrarlı." });
  if (!value.hours.some((item) => item.active)) context.addIssue({ code: z.ZodIssueCode.custom, message: "En az bir çalışma günü açık olmalı." });
  for (const pause of value.breaks) {
    const hour = value.hours.find((item) => item.day_of_week === pause.day_of_week);
    if (pause.active && !hour?.active) context.addIssue({ code: z.ZodIssueCode.custom, message: "Kapalı güne mola eklenemez." });
  }
});
export type WeeklyScheduleValues = z.infer<typeof weeklyScheduleSchema>;

export type ManagementActionResult = { ok: true; message: string } | { ok: false; error: string };


import { z } from "zod";

export const businessTypes = ["mens_barber", "womens_hair", "beauty_salon", "unisex_salon", "hair_salon", "other"] as const;
export const businessTypeSchema = z.enum(businessTypes);

export const signUpSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin.").transform((email) => email.toLowerCase()),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı.").max(128),
  passwordConfirmation: z.string().min(1, "Şifre tekrarını girin."),
}).refine((values) => values.password === values.passwordConfirmation, {
  message: "Şifreler eşleşmiyor.",
  path: ["passwordConfirmation"],
});

export const signInSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin.").transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Şifrenizi girin."),
});

export const organizationOnboardingSchema = z.object({
  name: z.string().trim().min(2, "İşletme adı en az 2 karakter olmalı.").max(120),
  businessType: z.enum(["mens_barber", "womens_hair", "beauty_salon", "unisex_salon"], {
    errorMap: () => ({ message: "İşletme türünü seçin." }),
  }),
  phone: z.string().trim().min(8, "Geçerli bir telefon numarası girin.").max(24),
  address: z.string().trim().min(3, "Adresinizi girin.").max(240),
  city: z.string().trim().min(2, "Şehir seçin veya yazın.").max(100),
  district: z.string().trim().min(2, "İlçe seçin veya yazın.").max(100),
  slug: z.string().trim().min(3, "Bağlantı en az 3 karakter olmalı.").max(60)
    .regex(/^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/, "Bağlantıda küçük İngilizce harf, rakam ve tire kullanın."),
});

const serviceSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).default(""),
  duration_minutes: z.coerce.number().int().min(5).max(720),
  price: z.coerce.number().min(0).max(10000000),
});
const staffSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().max(24).default(""),
  role: z.string().trim().min(1).max(100),
  service_indexes: z.array(z.number().int().min(0)).default([]),
});
const workingHourSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  active: z.boolean(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine((hour) => !hour.active || hour.start_time < hour.end_time, { message: "Kapanış saati açılış saatinden sonra olmalı." });
const breakSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  active: z.boolean(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine((pause) => !pause.active || pause.start_time < pause.end_time, { message: "Mola bitişi başlangıçtan sonra olmalı." });

export const onboardingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().regex(/^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/),
  business_type: businessTypeSchema,
  custom_business_type: z.string().trim().max(100).default(""),
  phone: z.string().trim().max(24).default(""),
  email: z.union([z.string().email(), z.literal("")]).default(""),
  address: z.string().trim().max(240).default(""),
  city: z.string().trim().max(100).default(""),
  timezone: z.string().default("Europe/Istanbul"),
  services: z.array(serviceSchema).min(1).max(60),
  staff: z.array(staffSchema).min(1).max(40),
  working_hours: z.array(workingHourSchema).length(7),
  breaks: z.array(breakSchema).max(7),
}).refine((data) => data.business_type !== "other" || data.custom_business_type.length > 0, {
  message: "Diğer işletme türünü yazın.",
  path: ["custom_business_type"],
});

export const publicAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  startAt: z.string().datetime({ offset: true }),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(8).max(24),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

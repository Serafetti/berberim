"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { organizationOnboardingSchema } from "@/lib/validations";

export type OnboardingActionResult = { ok: true; redirectTo: "/panel" } | { ok: false; error: string };

export async function createOrganizationAction(input: unknown): Promise<OnboardingActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { ok: false, error: "Oturum doğrulanamadı. Lütfen yeniden giriş yapın." };

  const parsed = organizationOnboardingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "İşletme bilgilerini kontrol edin." };

  const { data: existingMembership, error: membershipError } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (membershipError) return { ok: false, error: "İşletme üyeliği doğrulanamadı. Lütfen tekrar deneyin." };
  if (existingMembership) return { ok: true, redirectTo: "/panel" };

  // Recover if a previous request inserted the organization but stopped before adding its owner membership.
  const { data: ownedOrganization, error: ownedLookupError } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_user_id", user.id)
    .eq("slug", parsed.data.slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (ownedLookupError) return { ok: false, error: "İşletme kaydı kontrol edilemedi. Lütfen tekrar deneyin." };

  let organizationId = ownedOrganization?.id;
  if (!organizationId) {
    const { data: organization, error } = await supabase
      .from("organizations")
      .insert({
        owner_user_id: user.id,
        name: parsed.data.name,
        slug: parsed.data.slug,
        business_type: parsed.data.businessType,
        phone: parsed.data.phone,
        email: user.email ?? null,
        address: parsed.data.address,
        city: parsed.data.city,
        district: parsed.data.district,
      })
      .select("id")
      .single();

    if (error || !organization) {
      if (error?.code === "23505") return { ok: false, error: "Bu işletme bağlantısı kullanımda. Başka bir bağlantı adı seçin." };
      if (error?.code === "42703" || error?.code === "PGRST204") {
        return { ok: false, error: "Veritabanında ilçe alanı eksik. Supabase’de organizations.district ek migration’ının uygulanması gerekiyor." };
      }
      return { ok: false, error: "İşletme oluşturulamadı. Bilgileri kontrol edip tekrar deneyin." };
    }
    organizationId = organization.id;
  }

  const { error: addMemberError } = await supabase.from("organization_members").insert({
    organization_id: organizationId,
    user_id: user.id,
    role: "owner",
  });
  if (addMemberError && addMemberError.code !== "23505") {
    return { ok: false, error: "İşletme kaydedildi ancak sahip üyeliği tamamlanamadı. Aynı bağlantıyla tekrar deneyin." };
  }

  return { ok: true, redirectTo: "/panel" };
}

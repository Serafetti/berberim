import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { OnboardingForm } from "@/components/onboarding-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "İşletme kurulumu | Berberim.com" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");
  const { data: membership } = await supabase.from("organization_members").select("organization_id").eq("user_id", user.id).is("deleted_at", null).limit(1).maybeSingle();
  if (membership) redirect("/panel");

  return <AuthLayout title="İşletmeni oluşturalım" description="Salon bilgilerini ekle, işletme panelini hemen kullanmaya başla.">
    <OnboardingForm email={user.email ?? ""} />
  </AuthLayout>;
}

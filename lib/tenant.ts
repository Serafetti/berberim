import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireOrganization() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id, role")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (!membership) redirect("/onboarding");

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, owner_user_id, name, slug, business_type, custom_business_type, phone, email, address, city, district, logo_url, timezone")
    .eq("id", membership.organization_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!organization) redirect("/onboarding");

  return { supabase, user, membership, organization };
}

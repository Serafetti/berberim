"use server";

import { redirect } from "next/navigation";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionResult = { ok: true; redirectTo?: "/onboarding" | "/panel"; message?: string } | { ok: false; error: string };

export async function signUpAction(input: unknown): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding`,
    },
  });
  if (error) return { ok: false, error: "Hesap oluşturulamadı. E-posta adresinizi kontrol edip tekrar deneyin." };
  if (data.session) return { ok: true, redirectTo: "/onboarding" };
  return { ok: true, message: "Hesabınız oluşturuldu. Devam etmek için e-posta adresinize gönderdiğimiz doğrulama bağlantısını açın." };
}

export async function signInAction(input: unknown): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Bilgileri kontrol edin." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) return { ok: false, error: "E-posta veya şifre hatalı." };

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", data.user.id)
    .is("deleted_at", null)
    .limit(1)
    .maybeSingle();
  if (!membership) return { ok: true, redirectTo: "/onboarding" };

  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", membership.organization_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!organization) return { ok: false, error: "İşletme hesabınıza erişilemiyor. Lütfen destek ekibiyle iletişime geçin." };
  return { ok: true, redirectTo: "/panel" };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/giris");
}

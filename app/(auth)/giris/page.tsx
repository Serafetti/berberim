import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { AuthForm } from "@/components/auth-form";

type Props = { searchParams: Promise<{ hata?: string; kayit?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { hata, kayit } = await searchParams;
  const notice = kayit === "onay"
    ? "Hesabın oluşturuldu. Devam etmek için e-posta doğrulama bağlantısını aç."
    : hata === "dogrulama"
      ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeniden kayıt olmayı deneyebilirsin."
      : undefined;
  return (
    <AuthLayout title="Tekrar hoş geldin" description="İşletme paneline devam etmek için giriş yap.">
      {hata && hata !== "dogrulama" && <p role="alert" className="mb-4 rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2.5 text-xs text-[#9b4e45]">Giriş bilgilerinizi kontrol edin veya yeniden deneyin.</p>}
      <AuthForm mode="sign-in" notice={notice} />
      <p className="mt-5 text-center text-xs text-[#777d74]">Henüz hesabın yok mu? <Link href="/kayit" className="font-semibold text-[#4d694f] hover:underline">Ücretsiz başla</Link></p>
    </AuthLayout>
  );
}

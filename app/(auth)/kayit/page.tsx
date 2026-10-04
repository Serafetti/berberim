import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { AuthForm } from "@/components/auth-form";

type Props = { searchParams: Promise<{ hata?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { hata } = await searchParams;
  return (
    <AuthLayout title="İşletmeni dijitale taşı" description="E-posta adresinle hesabını oluştur, işletmeni birkaç adımda kur.">
      {hata && <p role="alert" className="mb-4 rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2.5 text-xs text-[#9b4e45]">Kayıt bağlantısı doğrulanamadı. Yeniden kayıt olabilir veya giriş yapmayı deneyebilirsin.</p>}
      <AuthForm mode="sign-up" />
      <p className="mt-5 text-center text-xs text-[#777d74]">Zaten hesabın var mı? <Link href="/giris" className="font-semibold text-[#4d694f] hover:underline">Giriş yap</Link></p>
    </AuthLayout>
  );
}

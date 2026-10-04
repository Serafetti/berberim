"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInAction, signUpAction } from "@/app/actions/auth";
import { signInSchema, signUpSchema } from "@/lib/validations";

export function AuthForm({ mode, notice }: { mode: "sign-in" | "sign-up"; notice?: string }) {
  return mode === "sign-up" ? <SignUpForm notice={notice} /> : <SignInForm notice={notice} />;
}

function SignUpForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState(notice ?? "");
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", passwordConfirmation: "" },
  });

  const submit = handleSubmit(async (values) => {
    setErrorMessage("");
    setMessage("");
    try {
      const result = await signUpAction(values);
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      if (result.redirectTo) {
        router.replace(result.redirectTo);
        router.refresh();
        return;
      }
      setMessage(result.message ?? "E-postanızı doğrulama bağlantısı için kontrol edin.");
    } catch {
      setErrorMessage("Kayıt şu anda tamamlanamadı. Lütfen tekrar deneyin.");
    }
  });

  return <form onSubmit={submit} noValidate className="space-y-4">
    {message && <p role="status" className="rounded-lg border border-[#dfe8dd] bg-[#f5f8f4] px-3 py-2.5 text-xs leading-5 text-[#506750]">{message}</p>}
    {errorMessage && <p role="alert" className="rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2.5 text-xs leading-5 text-[#9b4e45]">{errorMessage}</p>}
    <FormField label="E-posta" name="email" error={errors.email?.message}><input {...register("email")} id="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} aria-invalid={Boolean(errors.email)} className={inputClass} placeholder="ornek@isletme.com" /></FormField>
    <FormField label="Şifre" name="password" error={errors.password?.message}><input {...register("password")} id="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} aria-invalid={Boolean(errors.password)} className={inputClass} placeholder="En az 8 karakter" /></FormField>
    <FormField label="Şifre tekrar" name="passwordConfirmation" error={errors.passwordConfirmation?.message}><input {...register("passwordConfirmation")} id="passwordConfirmation" type="password" autoComplete="new-password" required minLength={8} maxLength={128} aria-invalid={Boolean(errors.passwordConfirmation)} className={inputClass} placeholder="Şifrenizi tekrar girin" /></FormField>
    <Button type="submit" disabled={isSubmitting} className={submitButtonClass}>{isSubmitting ? <><LoaderCircle size={16} className="animate-spin" /> Hesap oluşturuluyor…</> : <>Ücretsiz hesabını oluştur <ArrowRight size={16} /></>}</Button>
    <p className="text-center text-[11px] leading-5 text-[#858b82]">Hesabınız için e-posta doğrulaması gerekebilir. Şimdilik ödeme bilgisi alınmaz.</p>
  </form>;
}

function SignInForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState(notice ?? "");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (values) => {
    setErrorMessage("");
    setStatusMessage("");
    try {
      const result = await signInAction(values);
      if (!result.ok) {
        setErrorMessage(result.error);
        return;
      }
      router.replace(result.redirectTo ?? "/onboarding");
      router.refresh();
    } catch {
      setErrorMessage("Giriş şu anda tamamlanamadı. Lütfen tekrar deneyin.");
    }
  });

  return <form onSubmit={submit} noValidate className="space-y-4">
    {statusMessage && <p role="status" className="rounded-lg border border-[#dfe8dd] bg-[#f5f8f4] px-3 py-2.5 text-xs leading-5 text-[#506750]">{statusMessage}</p>}
    {errorMessage && <p role="alert" className="rounded-lg border border-[#f0d6d2] bg-[#fff8f7] px-3 py-2.5 text-xs leading-5 text-[#9b4e45]">{errorMessage}</p>}
    <FormField label="E-posta" name="email" error={errors.email?.message}><input {...register("email")} id="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} aria-invalid={Boolean(errors.email)} className={inputClass} placeholder="ornek@isletme.com" /></FormField>
    <FormField label="Şifre" name="password" error={errors.password?.message}><input {...register("password")} id="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(errors.password)} className={inputClass} placeholder="Şifreniz" /></FormField>
    <Button type="submit" disabled={isSubmitting} className={submitButtonClass}>{isSubmitting ? <><LoaderCircle size={16} className="animate-spin" /> Giriş yapılıyor…</> : <>Giriş yap <ArrowRight size={16} /></>}</Button>
  </form>;
}

function FormField({ label, name, error, children }: { label: string; name: string; error?: string; children: ReactNode }) {
  const errorId = `${name}-error`;
  return <div><label htmlFor={name} className="block text-xs font-medium text-[#464d44]">{label}</label>{children}{error && <p id={errorId} role="alert" className="mt-1.5 text-[11px] text-[#9b4e45]">{error}</p>}</div>;
}

const inputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm text-[#30352e] outline-none transition placeholder:text-[#a1a69e] focus:border-[#98aa96] focus:ring-2 focus:ring-[#dfe8dd] aria-invalid:border-[#d38b80]";
const submitButtonClass = "mt-1 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#314d38] px-4 text-sm font-semibold text-white hover:bg-[#263e2d] disabled:cursor-wait disabled:opacity-60";

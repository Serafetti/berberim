import Link from "next/link";
import { Scissors } from "lucide-react";
import type { ReactNode } from "react";

export function AuthLayout({ children, title, description }: { children: ReactNode; title: string; description: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfcfa] px-5 py-10">
      <div className="w-full max-w-[460px]">
        <Link href="/" className="mx-auto mb-8 flex w-fit items-center gap-2.5" aria-label="Berberim.com ana sayfa">
          <span className="grid size-9 place-items-center rounded-xl bg-[#eaf0e8] text-[#426047]"><Scissors size={19} aria-hidden="true" /></span>
          <span className="text-[17px] font-semibold tracking-[-0.06em] text-[#20231f]">Berberim<span className="text-[#819080]">.com</span></span>
        </Link>
        <div className="rounded-2xl border border-[#e7e9e3] bg-white p-6 shadow-[0_20px_60px_-42px_rgba(31,44,32,0.28)] sm:p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.045em] text-[#262a25]">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-[#777d74]">{description}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-[#858b82]">Berber, kuaför ve güzellik salonları için işletme yönetimi.</p>
      </div>
    </main>
  );
}

export const authInputClass = "mt-1.5 w-full rounded-lg border border-[#e2e5df] bg-white px-3 py-2.5 text-sm text-[#30352e] outline-none transition focus:border-[#98aa96] focus:ring-2 focus:ring-[#dfe8dd]";
export const authButtonClass = "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#314d38] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#263e2d] disabled:opacity-60";

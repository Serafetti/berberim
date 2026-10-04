import Link from "next/link";
import { CalendarDays, ChevronRight, CircleUserRound, LayoutDashboard, LogOut, Settings2, UsersRound, Scissors } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { requireOrganization } from "@/lib/tenant";

export const dynamic = "force-dynamic";

const links = [
  { href: "/panel", label: "Genel bakış", icon: LayoutDashboard, exact: true },
  { href: "/panel/randevular", label: "Randevular", icon: CalendarDays },
  { href: "/panel/musteriler", label: "Müşteriler", icon: UsersRound },
  { href: "/panel/hizmetler", label: "Hizmetler", icon: Scissors },
  { href: "/panel/personel", label: "Personel", icon: CircleUserRound },
  { href: "/panel/ayarlar", label: "Ayarlar", icon: Settings2 },
];

export default async function DashboardLayout({ children }: LayoutProps<"/panel">) {
  const { organization, user } = await requireOrganization();

  return (
    <div className="min-h-screen bg-[#f8f9f7] text-[#252923] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-[#e9ebe6] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:block lg:px-5 lg:py-6">
          <Link href="/" className="flex items-center gap-2.5"><span className="grid size-9 place-items-center rounded-xl bg-[#eaf0e8] text-[#426047]"><Scissors size={18} /></span><span className="text-[16px] font-semibold tracking-[-0.06em]">Berberim<span className="text-[#819080]">.com</span></span></Link>
          <Link href="/panel/ayarlar" className="hidden max-w-44 items-center gap-2 rounded-lg border border-[#eceee9] px-2.5 py-2 text-left md:flex lg:mt-6 lg:max-w-none"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#eff3ed] text-[10px] font-semibold text-[#557159]">{organization.name.slice(0, 1).toLocaleUpperCase("tr-TR")}</span><span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-[#3d443b]">{organization.name}</span><span className="block text-[9px] text-[#858b82]">{organization.city ?? "İşletme"}</span></span><ChevronRight size={13} className="text-[#92978f]" /></Link>
        </div>
        <nav aria-label="Panel menüsü" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-4">
          {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-medium text-[#667064] transition-colors hover:bg-[#f4f6f2] hover:text-[#314d38] lg:w-full lg:py-2.5 lg:text-xs"><Icon size={15} aria-hidden="true" />{label}</Link>)}
        </nav>
        <div className="p-3 sm:px-5 lg:mt-auto lg:p-4">
          <form action={signOutAction}><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[#747a72] hover:bg-[#f5f6f3]" type="submit"><LogOut size={14} /> Çıkış yap <span className="ml-auto max-w-24 truncate text-[9px]">{user.email}</span></button></form>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-9">{children}</div>
      </div>
    </div>
  );
}

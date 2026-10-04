import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Scissors,
  Sparkles,
  TrendingUp,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck2,
    title: "Online randevu",
    description: "Müşterilerin günün her saati, kendilerine uygun zamanı kolayca seçsin.",
  },
  {
    icon: UsersRound,
    title: "Müşteri yönetimi",
    description: "Müşteri geçmişi, tercihleri ve notları tek bir yerde düzenli kalsın.",
  },
  {
    icon: UserRound,
    title: "Personel yönetimi",
    description: "Ekibinin takvimini, uygunluğunu ve randevularını kolayca takip et.",
  },
  {
    icon: Scissors,
    title: "Hizmet ve fiyatlar",
    description: "Hizmetlerini, sürelerini ve fiyatlarını işletmene göre belirle.",
  },
  {
    icon: Clock3,
    title: "Çalışma saatleri",
    description: "Çalışma günlerini ve saatlerini belirle, takvimini kontrolünde tut.",
  },
  {
    icon: Sparkles,
    title: "Boş saatleri doldurma",
    description: "Uygun saatlerini görünür kıl, müşterilerinin yeniden randevu almasını kolaylaştır.",
  },
];

const appointments = [
  { time: "09:30", name: "Mert Yılmaz", service: "Saç kesimi", staff: "Emre", color: "bg-[#e7ede5] text-[#49604b]" },
  { time: "10:15", name: "Elif Demir", service: "Fön & bakım", staff: "Derya", color: "bg-[#f3eae3] text-[#9a684e]" },
  { time: "11:00", name: "Can Özkan", service: "Sakal tıraşı", staff: "Emre", color: "bg-[#e8edf4] text-[#526a88]" },
];

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a href="#anasayfa" className={`inline-flex items-center gap-2.5 ${inverse ? "text-white" : "text-[#20231f]"}`} aria-label="Berberim.com ana sayfa">
      <span className={`grid size-9 place-items-center rounded-xl ${inverse ? "bg-white/10" : "bg-[#eaf0e8] text-[#426047]"}`}>
        <Scissors aria-hidden="true" size={19} strokeWidth={2.1} />
      </span>
      <span className="text-[17px] font-semibold tracking-[-0.06em]">Berberim<span className={inverse ? "text-white/55" : "text-[#819080]"}>.com</span></span>
    </a>
  );
}

function ButtonLink({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return (
    <a
      href={href}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#557258] ${
        secondary
          ? "border border-[#dedfd9] bg-white text-[#292d28] hover:border-[#c2c9bf] hover:bg-[#fafbf9]"
          : "bg-[#314d38] text-white shadow-sm hover:bg-[#263e2d]"
      }`}
    >
      {children}
    </a>
  );
}

function MiniDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-[590px]">
      <div className="absolute -right-4 -top-5 hidden size-28 rounded-full bg-[#e9eee6] blur-2xl sm:block" />
      <div className="relative overflow-hidden rounded-[22px] border border-[#e7e8e2] bg-white shadow-[0_24px_70px_-36px_rgba(34,48,35,0.32)]">
        <div className="flex items-center justify-between border-b border-[#eff0ec] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-xl bg-[#edf2eb] text-[#49664e]"><Scissors size={17} aria-hidden="true" /></div>
            <div><p className="text-xs font-semibold text-[#252a24]">Makas Studio</p><p className="mt-0.5 text-[10px] text-[#93978f]">İşletme paneli</p></div>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-lg border border-[#eceee9] px-2.5 py-1.5 text-[10px] font-medium text-[#666d64]" aria-label="Bugün görünümü">
            Bugün <ChevronDown size={12} aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2.5 p-4 sm:gap-3 sm:p-5">
          <div className="rounded-xl border border-[#eff0ec] p-3 sm:p-3.5"><p className="text-[10px] text-[#858a82]">Randevular</p><p className="mt-2 text-xl font-semibold tracking-tight text-[#222720]">18</p><p className="mt-1 text-[9px] text-[#628067]">Bugün</p></div>
          <div className="rounded-xl border border-[#eff0ec] p-3 sm:p-3.5"><p className="text-[10px] text-[#858a82]">Günlük gelir</p><p className="mt-2 text-base font-semibold tracking-tight text-[#222720] sm:text-xl">₺8.450</p><p className="mt-1 text-[9px] text-[#628067]">Beklenen</p></div>
          <div className="rounded-xl border border-[#eff0ec] p-3 sm:p-3.5"><p className="text-[10px] text-[#858a82]">Boş saat</p><p className="mt-2 text-xl font-semibold tracking-tight text-[#222720]">3</p><p className="mt-1 text-[9px] text-[#a47746]">Değerlendirilebilir</p></div>
        </div>
        <div className="px-4 pb-2 sm:px-5">
          <div className="flex items-center justify-between pb-3"><h2 className="text-xs font-semibold text-[#292d28]">Yaklaşan randevular</h2><a href="#panel" className="text-[10px] font-medium text-[#526c55]">Tümünü gör <span aria-hidden="true">→</span></a></div>
          <div className="divide-y divide-[#f0f1ed]">
            {appointments.map((appointment) => (
              <div key={appointment.time} className="flex items-center gap-2.5 py-3 sm:gap-3">
                <span className="w-10 text-[10px] font-medium tabular-nums text-[#656b62]">{appointment.time}</span>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${appointment.color}`}>{appointment.name.split(" ").map((part) => part[0]).join("")}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-[#30352e]">{appointment.name}</p><p className="mt-0.5 text-[9px] text-[#888d85]">{appointment.service}</p></div>
                <span className="hidden text-[9px] text-[#888d85] sm:block">{appointment.staff}</span>
                <span className="rounded-full bg-[#eff4ed] px-2 py-1 text-[9px] font-medium text-[#56715a]">Onaylandı</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-4 mb-4 mt-2 flex items-center gap-3 rounded-xl bg-[#f6f8f4] p-3 sm:mx-5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#648069]"><Clock3 size={15} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold text-[#384439]">Bugün 14:30 boş</p><p className="mt-0.5 truncate text-[9px] text-[#81887e]">Müşterilerine uygun saatini hatırlat</p></div>
          <ArrowUpRight size={15} className="text-[#627b65]" aria-hidden="true" />
        </div>
      </div>
      <div className="absolute -bottom-5 -left-3 hidden items-center gap-2.5 rounded-xl border border-[#eaebe6] bg-white px-3.5 py-3 shadow-lg sm:flex">
        <span className="grid size-8 place-items-center rounded-lg bg-[#edf3ec] text-[#56735a]"><TrendingUp size={16} aria-hidden="true" /></span>
        <div><p className="text-[9px] text-[#858a82]">Bu hafta doluluk</p><p className="text-xs font-semibold text-[#2d352d]">%86 <span className="font-normal text-[#718173]">↗ %12</span></p></div>
      </div>
    </div>
  );
}

function ProductDashboard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7e9e3] bg-white shadow-[0_18px_55px_-36px_rgba(30,40,30,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eff0ec] px-5 py-4 sm:px-7">
        <div><p className="text-xs font-semibold text-[#292e28]">Genel bakış</p><p className="mt-1 text-[11px] text-[#898e86]">Pazar, 4 Ekim 2026</p></div>
        <a href="#pricing" className="inline-flex items-center gap-2 rounded-lg border border-[#e7e9e3] px-3 py-2 text-[11px] font-medium text-[#4b534a]">Bugün <ChevronDown size={13} aria-hidden="true" /></a>
      </div>
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#eceee9] p-3.5 sm:p-4"><div className="flex items-center justify-between"><span className="text-[10px] text-[#838980] sm:text-[11px]">Bugünkü randevu</span><CalendarDays size={15} className="text-[#718574]" aria-hidden="true" /></div><p className="mt-3 text-2xl font-semibold tracking-tight text-[#252a24]">18</p><p className="mt-1 text-[10px] text-[#718574]">12 tamamlandı</p></div>
            <div className="rounded-xl border border-[#eceee9] p-3.5 sm:p-4"><div className="flex items-center justify-between"><span className="text-[10px] text-[#838980] sm:text-[11px]">Tahmini gelir</span><Wallet size={15} className="text-[#718574]" aria-hidden="true" /></div><p className="mt-3 text-xl font-semibold tracking-tight text-[#252a24] sm:text-2xl">₺8.450</p><p className="mt-1 text-[10px] text-[#718574]">Gün sonu tahmini</p></div>
            <div className="col-span-2 rounded-xl border border-[#eceee9] p-3.5 sm:col-span-1 sm:p-4"><div className="flex items-center justify-between"><span className="text-[10px] text-[#838980] sm:text-[11px]">Boş saat</span><Clock3 size={15} className="text-[#a37b4f]" aria-hidden="true" /></div><p className="mt-3 text-2xl font-semibold tracking-tight text-[#252a24]">3</p><p className="mt-1 text-[10px] text-[#a37b4f]">Doldurulmayı bekliyor</p></div>
          </div>
          <div className="rounded-xl border border-[#eceee9]">
            <div className="flex items-center justify-between border-b border-[#eff0ec] px-4 py-3"><h3 className="text-[11px] font-semibold text-[#333830]">Yaklaşan müşteriler</h3><a href="#pricing" className="text-[10px] font-medium text-[#59725b]">Tüm randevular <span aria-hidden="true">→</span></a></div>
            <div className="divide-y divide-[#f0f1ed] px-4">
              {appointments.map((appointment) => (
                <div key={appointment.time} className="flex items-center gap-3 py-3">
                  <span className="w-10 text-[10px] font-medium tabular-nums text-[#60665d]">{appointment.time}</span>
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${appointment.color}`}>{appointment.name.split(" ").map((part) => part[0]).join("")}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-[#333830]">{appointment.name}</p><p className="mt-0.5 text-[9px] text-[#858a82]">{appointment.service} · {appointment.staff}</p></div>
                  <span className="rounded-full bg-[#eff4ed] px-2 py-1 text-[9px] font-medium text-[#59735d]">Onaylandı</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-xl border border-[#eceee9] p-4">
            <div className="flex items-center justify-between"><h3 className="text-[11px] font-semibold text-[#333830]">Personel durumu</h3><span className="text-[9px] text-[#888e85]">3 personel</span></div>
            <div className="mt-4 space-y-3">
              {[{ name: "Emre Kaya", role: "Berber", initials: "EK", color: "bg-[#e7ede5] text-[#49604b]", busy: "6 randevu" }, { name: "Derya Şahin", role: "Kuaför", initials: "DŞ", color: "bg-[#f3eae3] text-[#9a684e]", busy: "5 randevu" }, { name: "Selin Aras", role: "Uzman", initials: "SA", color: "bg-[#e8edf4] text-[#526a88]", busy: "4 randevu" }].map((person) => (
                <div key={person.name} className="flex items-center gap-2.5"><span className={`grid size-8 place-items-center rounded-full text-[9px] font-semibold ${person.color}`}>{person.initials}</span><div className="min-w-0 flex-1"><p className="text-[10px] font-medium text-[#3c413a]">{person.name}</p><p className="mt-0.5 text-[9px] text-[#888d85]">{person.role}</p></div><span className="text-[9px] text-[#6f766e]">{person.busy}</span></div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#e7ece4] bg-[#f6f8f4] p-4">
            <div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-[#5c775f]"><Sparkles size={15} aria-hidden="true" /></span><div><p className="text-[11px] font-semibold text-[#39473a]">Boş saatini değerlendir</p><p className="mt-1 text-[10px] leading-5 text-[#737e71]">14:30 için uygun müşterilerine haber ver, takviminde boşluk kalmasın.</p><a href="#farkimiz" className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#4e6a52]">Öneriyi incele <ArrowRight size={12} aria-hidden="true" /></a></div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div id="anasayfa" className="overflow-hidden bg-[#fff] text-[#252923]">
      <header className="sticky top-0 z-30 border-b border-[#eeefeb] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <nav aria-label="Ana menü" className="hidden items-center gap-8 md:flex">
            <a href="#ozellikler" className="text-[13px] font-medium text-[#626860] transition-colors hover:text-[#263e2d]">Özellikler</a>
            <a href="#nasil-calisir" className="text-[13px] font-medium text-[#626860] transition-colors hover:text-[#263e2d]">Nasıl Çalışır?</a>
            <a href="#pricing" className="text-[13px] font-medium text-[#626860] transition-colors hover:text-[#263e2d]">Fiyatlandırma</a>
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <a href="/giris" className="hidden text-[13px] font-medium text-[#555c54] hover:text-[#263e2d] sm:inline-flex">Giriş Yap</a>
            <a href="/kayit" className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#314d38] px-3.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#263e2d] sm:px-4 sm:text-xs">14 Gün Ücretsiz Başla</a>
          </div>
        </div>
      </header>

      <main>
      <section className="relative border-b border-[#f0f1ed] bg-[#fbfcfa]">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:px-10 lg:py-28">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e7ebe4] bg-white px-3 py-1.5 text-[11px] font-medium text-[#586b58]"><span className="size-1.5 rounded-full bg-[#729174]" />Berber, kuaför ve güzellik salonları için</div>
            <h1 className="text-[clamp(2.8rem,6vw,4.65rem)] font-semibold leading-[1.04] tracking-[-0.065em] text-[#222721]">Berberini<br className="hidden sm:block" /> dijitale taşı<span className="text-[#6e886f]">.</span></h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#697067] sm:text-[17px] sm:leading-8">Randevularını, müşterilerini ve ekibini tek bir yerden yönet. Salonuna daha çok zaman, işine daha fazla düzen kazandır.</p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row">
              <ButtonLink href="/kayit">14 Gün Ücretsiz Başla <ArrowRight size={16} aria-hidden="true" /></ButtonLink>
              <ButtonLink href="#nasil-calisir" secondary>Nasıl Çalışır?</ButtonLink>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#777e75]"><span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[#658068]" aria-hidden="true" />Kredi kartı gerekmez</span><span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[#658068]" aria-hidden="true" />14 gün ücretsiz deneme</span></div>
          </div>
          <MiniDashboard />
        </div>
      </section>

      <section id="ozellikler" className="scroll-mt-24 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d866e]">İşletmen için gereken her şey</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#262a25] sm:text-4xl">İyi hizmet, iyi bir sistemle başlar.</h2><p className="mt-4 text-sm leading-6 text-[#747a72] sm:text-base">İster tek koltuklu bir berber ol, ister büyüyen bir salon ekibi. Günlük işlerin tek bir yerde, kontrolün sende.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article key={title} className="group rounded-2xl border border-[#eceee9] bg-white p-5 transition-colors hover:border-[#d8e0d5] sm:p-6">
                <span className={`grid size-11 place-items-center rounded-xl ${index === 5 ? "bg-[#eff4ed] text-[#547158]" : "bg-[#f5f6f3] text-[#5e6b5d]"}`}><Icon size={19} strokeWidth={1.8} aria-hidden="true" /></span>
                <h3 className="mt-5 text-sm font-semibold text-[#2f342e]">{title}</h3><p className="mt-2 text-[13px] leading-6 text-[#777d74]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="farkimiz" className="scroll-mt-24 bg-[#f6f8f5] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-10">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d866e]">Berberim farkı</p><h2 className="mt-4 max-w-lg text-3xl font-semibold leading-tight tracking-[-0.05em] text-[#262a25] sm:text-[40px]">Boş koltuklar gelir kaybetmesin.</h2><p className="mt-5 max-w-lg text-sm leading-7 text-[#6f776d] sm:text-base">Gün içindeki boş saatleri erkenden fark et. Berberim, uygun zamanlarını görünür kılar; sen de müşterilerine geri dönüş için kolay bir fırsat sunarsın.</p><ul className="mt-7 space-y-3.5 text-[13px] text-[#50594f]">{["Takvimindeki boşlukları tek bakışta gör", "Uygun saatleri müşterilerinle kolayca paylaş", "Daha dolu bir gün, daha düzenli bir işletme"].map((item) => <li key={item} className="flex items-start gap-2.5"><span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e5ede3] text-[#56735a]"><Check size={12} aria-hidden="true" /></span>{item}</li>)}</ul></div>
          <div className="rounded-2xl border border-[#e5e9e2] bg-white p-5 shadow-[0_15px_45px_-32px_rgba(37,52,38,0.25)] sm:p-7">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#353b33]">Bugünün uygun saatleri</p><p className="mt-1 text-[10px] text-[#858b82]">Salı · 24 Eylül</p></div><span className="rounded-full bg-[#edf3eb] px-2.5 py-1 text-[9px] font-medium text-[#58715b]">3 boşluk</span></div>
            <div className="mt-5 space-y-2.5">{[{ time: "12:30", duration: "30 dk", service: "Saç kesimi için uygun" }, { time: "14:30", duration: "45 dk", service: "Saç & sakal için uygun" }, { time: "16:00", duration: "60 dk", service: "Bakım hizmetleri için uygun" }].map((slot) => <div key={slot.time} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-[#eef0eb] px-3.5 py-3 sm:flex-nowrap"><span className="w-12 text-xs font-semibold tabular-nums text-[#343a32]">{slot.time}</span><span className="hidden h-7 w-px bg-[#e9ebe6] sm:block" /><div className="min-w-[140px] flex-1"><p className="text-[11px] font-medium text-[#41473f]">{slot.service}</p><p className="mt-0.5 text-[9px] text-[#898e86]">{slot.duration}</p></div><a href="#pricing" className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#557159]">Paylaş <ArrowUpRight size={13} aria-hidden="true" /></a></div>)}</div>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-[#f7f9f6] p-3"><Sparkles size={14} className="mt-0.5 shrink-0 text-[#69846b]" aria-hidden="true" /><p className="text-[10px] leading-5 text-[#737c70]">Uygun saatler, müşterilerinin yeni randevu almasını kolaylaştırmak için hazır.</p></div>
          </div>
        </div>
      </section>

      <section id="nasil-calisir" className="scroll-mt-24 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto mb-12 max-w-xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d866e]">Başlamak çok kolay</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#262a25] sm:text-4xl">Üç adımda düzene geç.</h2></div>
          <div className="grid gap-8 md:grid-cols-3 md:gap-6">{[{ number: "01", title: "İşletmeni oluştur", text: "Salonunun temel bilgilerini ekle, çalışma düzenini belirle." }, { number: "02", title: "Hizmetlerini ekle", text: "Hizmetlerini, fiyatlarını ve ekibindeki personeli tanımla." }, { number: "03", title: "Randevuları almaya başla", text: "Takvimini yönet, müşterilerine daha kolay ulaş." }].map((step, index) => <article key={step.number} className="relative border-t border-[#e8eae5] pt-5"><span className="text-[11px] font-semibold tracking-[0.12em] text-[#789078]">{step.number}</span><h3 className="mt-4 text-base font-semibold tracking-tight text-[#30352e]">{step.title}</h3><p className="mt-2 max-w-sm text-[13px] leading-6 text-[#777d74]">{step.text}</p>{index < 2 && <ArrowRight className="absolute right-1 top-6 hidden text-[#b2b9ae] md:block" size={17} aria-hidden="true" />}</article>)}</div>
        </div>
      </section>

      <section id="panel" className="scroll-mt-24 border-y border-[#eff0ec] bg-[#fbfcfa] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="mb-9 flex flex-col justify-between gap-4 sm:mb-11 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d866e]">İşletmenin kontrol merkezi</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#262a25] sm:text-4xl">Her şey, bir bakışta.</h2></div><p className="max-w-md text-sm leading-6 text-[#747a72]">Günün akışını, yaklaşan randevuları ve ekibinin durumunu sade bir panelden takip et.</p></div><ProductDashboard /></div>
      </section>

      <section id="pricing" className="scroll-mt-24 py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="mx-auto max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d866e]">Sade ve şeffaf</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#262a25] sm:text-4xl">İşine yarayan her şey, tek planda.</h2><p className="mt-4 text-sm leading-6 text-[#747a72]">Denemek ücretsiz. Devam etmek istersen, fiyatımız da net.</p></div>
          <div className="mx-auto mt-10 max-w-[540px] rounded-2xl border border-[#e5e9e2] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(31,44,32,0.28)] sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-[#31372f]">Berberim Planı</p><p className="mt-1.5 text-xs text-[#7b8179]">Salonunun tüm temel ihtiyaçları</p></div><span className="rounded-full bg-[#eef3ec] px-2.5 py-1 text-[10px] font-medium text-[#59725b]">14 gün ücretsiz</span></div>
            <div className="mt-6 flex items-baseline gap-1"><span className="text-4xl font-semibold tracking-[-0.06em] text-[#262b25]">899</span><span className="text-lg font-medium text-[#41473f]">₺</span><span className="ml-1 text-xs text-[#858b82]">/ ay</span></div>
            <p className="mt-2 text-xs text-[#757c73]">Ücretsiz deneme süresince ücret alınmaz.</p>
            <div className="my-6 h-px bg-[#eff0ec]" />
            <ul className="grid gap-3 sm:grid-cols-2">{["Online randevu", "Sınırsız müşteri", "Personel yönetimi", "Hizmet yönetimi", "Randevu yönetimi", "14 gün ücretsiz deneme"].map((item) => <li key={item} className="flex items-center gap-2 text-xs text-[#51584f]"><Check size={14} className="shrink-0 text-[#628067]" aria-hidden="true" />{item}</li>)}</ul>
            <a href="/kayit" className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#314d38] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#263e2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#557258]">14 Gün Ücretsiz Başla <ArrowRight size={16} aria-hidden="true" /></a>
            <p className="mt-3 text-center text-[10px] text-[#858b82]">Kredi kartı gerekmez · İstediğin zaman vazgeç</p>
          </div>
        </div>
      </section>

      <section id="basla" className="scroll-mt-24 px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[22px] bg-[#2f4935] px-6 py-12 text-center text-white sm:px-12 sm:py-16"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bdcbbb]">Daha düzenli bir gün, daha güçlü bir salon</p><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Salonunu bugün dijitale taşı.</h2><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#d3ddd1]">Berberim’i 14 gün ücretsiz dene. İşletmen için iyi bir başlangıç yap.</p><a href="/kayit" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#314d38] transition-colors hover:bg-[#f1f4ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Ücretsiz denemeni başlat <ArrowRight size={16} aria-hidden="true" /></a></div>
      </section>
      </main>

      <footer className="border-t border-[#eeefeb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10"><div><Brand /><p className="mt-3 text-[11px] text-[#858b82]">Salon yönetimi, daha kolay.</p></div><nav aria-label="Alt menü" className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-[#697067]"><a href="#ozellikler" className="hover:text-[#314d38]">Ürün</a><a href="mailto:destek@berberim.com" className="hover:text-[#314d38]">Destek</a><a href="#gizlilik" className="hover:text-[#314d38]">Gizlilik</a><a href="#kullanim-kosullari" className="hover:text-[#314d38]">Kullanım Koşulları</a></nav><p className="text-[10px] text-[#969b93]">© 2026 Berberim.com</p></div>
      </footer>
    </div>
  );
}

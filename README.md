# Berberim.com

Berber, kuaför, güzellik ve unisex salonları için randevu ve işletme yönetim uygulaması.

## Teknoloji

- Next.js 16 App Router, TypeScript ve Tailwind CSS v4
- Supabase Auth, PostgreSQL ve Row Level Security
- Zod ile server-side veri doğrulama
- date-fns ve Lucide

## Yerel kurulum

1. `.env.local.example` dosyasını `.env.local` olarak kopyalayın ve Supabase URL ile publishable key değerlerini girin. İstemci tarafında yalnızca public publishable key kullanılır; service-role key uygulama kodunda kullanılmaz.
2. Supabase CLI ve Docker ile yerel servisi başlatın: `supabase start`.
3. Migration ve demo verisini yükleyin: `supabase db reset`.
4. Next.js’i başlatın: `npm run dev`.
5. Yerel e-posta doğrulama iletilerini Supabase Inbucket arayüzünde `http://localhost:54324` adresinden açın.

Supabase Dashboard’a deploy ederken `supabase/migrations` SQL migration’larını uygulayın, gerekiyorsa `supabase/seed.sql` dosyasını yalnızca test ortamında çalıştırın ve Auth URL Configuration içindeki Site URL ile redirect allow list’e gerçek uygulama origin’inizi ekleyin. `NEXT_PUBLIC_SITE_URL` değerini deployment origin’i olarak ayarlayın.

## Uygulama akışları

- `/kayit` ve `/giris`: Supabase Auth email/şifre akışı
- `/onboarding`: işletme türü, hizmet, personel, çalışma saatleri ve mola kurulumu
- `/panel`: tenant kapsamlı işletme özeti
- `/panel/randevular`, `/panel/musteriler`, `/panel/hizmetler`, `/panel/personel`, `/panel/ayarlar`: yönetim ekranları
- `/berber/[slug]` ve `/berber/[slug]/randevu`: herkese açık işletme profili ve randevu oluşturma

Public booking yalnızca işletmenin açıkça yayımlanan profil/hizmet/personel bilgilerini ve boş saatleri güvenli veritabanı fonksiyonlarıyla sunar. Randevu çakışması PostgreSQL exclusion constraint ve transaction içindeki tekrar kontrolüyle engellenir. Herkese açık endpoint’ler kişisel müşteri veya diğer tenant verilerini döndürmez.

## Komutlar

- `npm run lint`
- `npm run build`
- `npm run dev`

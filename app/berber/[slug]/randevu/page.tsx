import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PublicBooking } from "@/components/public-booking";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublicProfile = { id: string; name: string; slug: string; services: { id: string; name: string; description: string | null; duration_minutes: number; price: number }[]; staff: { id: string; name: string; role: string; service_ids: string[] }[] };

export default async function PublicBookingPage({ params }: PageProps<"/berber/[slug]/randevu">) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("get_public_booking_page", { p_slug: slug });
  const profile = data as unknown as PublicProfile | null;
  if (!profile) notFound();
  return <main className="min-h-screen bg-[#fbfcfa] px-4 py-8 sm:px-6 sm:py-12"><div className="mx-auto max-w-3xl"><Link href={`/berber/${encodeURIComponent(slug)}`} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-[#657060] hover:text-[#314d38]"><ArrowLeft size={14} /> İşletme profiline dön</Link><PublicBooking slug={slug} businessName={profile.name} services={profile.services} staff={profile.staff} /></div></main>;
}

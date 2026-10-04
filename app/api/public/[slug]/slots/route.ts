import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest, context: RouteContext<"/api/public/[slug]/slots">) {
  const { slug } = await context.params;
  const serviceId = request.nextUrl.searchParams.get("serviceId");
  const staffId = request.nextUrl.searchParams.get("staffId");
  const date = request.nextUrl.searchParams.get("date");
  if (!serviceId || !staffId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Hizmet, personel ve tarih seçin." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("get_public_available_slots", {
    p_slug: slug,
    p_service_id: serviceId,
    p_staff_id: staffId,
    p_date: date,
  });
  if (error) return NextResponse.json({ error: "Uygun saatler şu anda yüklenemedi." }, { status: 400 });
  return NextResponse.json({ slots: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

import { NextResponse, type NextRequest } from "next/server";
import { publicAppointmentSchema } from "@/lib/validations";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, context: RouteContext<"/api/public/[slug]/appointments">) {
  const { slug } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "İstek okunamadı." }, { status: 400 });
  }
  const parsed = publicAppointmentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Randevu bilgilerini kontrol edin." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("create_public_appointment", {
    p_slug: slug,
    p_service_id: parsed.data.serviceId,
    p_staff_id: parsed.data.staffId,
    p_start_at: parsed.data.startAt,
    p_customer_name: parsed.data.customerName,
    p_customer_phone: parsed.data.customerPhone,
  });
  if (error || !data) {
    return NextResponse.json({ error: "Bu saat artık uygun değil. Lütfen başka bir saat seçin." }, { status: 409 });
  }
  return NextResponse.json({ appointmentId: data, message: "Randevu talebiniz alındı." }, { status: 201 });
}

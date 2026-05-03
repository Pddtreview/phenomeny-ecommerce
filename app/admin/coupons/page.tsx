import { createServerSupabaseClient } from "@/lib/supabase-server";
import { CouponsPageClient } from "@/components/admin/CouponsPageClient";

async function getCoupons() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("id, code, type, value, used_count, max_uses, expires_at, is_active")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  return <CouponsPageClient coupons={coupons} />;
}

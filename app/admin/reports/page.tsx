import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AdminReportsPage() {
  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Reports</h1>
      <p className="text-sm text-zinc-600">
        Reports and analytics will be available here.
      </p>
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-500">
          Total orders in system: {count ?? 0}
        </p>
      </div>
    </div>
  );
}

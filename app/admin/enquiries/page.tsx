import { createServerSupabaseClient } from "@/lib/supabase-server";

type Row = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
};

async function getSubmissions(): Promise<Row[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id, name, phone, email, subject, message, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("contact_submissions:", error.message);
    return [];
  }

  return (data ?? []) as Row[];
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AdminEnquiriesPage() {
  const rows = await getSubmissions();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Enquiries</h1>
      <p className="text-sm text-zinc-600">
        Contact form submissions, newest first.
      </p>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-600">
                Date
              </th>
              <th className="px-4 py-3 font-medium text-zinc-600">Name</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-600">
                Phone
              </th>
              <th className="px-4 py-3 font-medium text-zinc-600">Email</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium text-zinc-600">
                Subject
              </th>
              <th className="min-w-[200px] px-4 py-3 font-medium text-zinc-600">
                Message
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  No enquiries yet. Run the SQL migration for{" "}
                  <code className="rounded bg-zinc-100 px-1 text-xs">
                    contact_submissions
                  </code>{" "}
                  if the table is missing.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-zinc-100 align-top last:border-0"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                    {formatDate(r.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {r.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                    {r.phone}
                  </td>
                  <td className="max-w-[180px] break-all px-4 py-3 text-zinc-700">
                    {r.email}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                    {r.subject}
                  </td>
                  <td className="max-w-md px-4 py-3 text-zinc-600">
                    <span className="whitespace-pre-wrap">{r.message}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

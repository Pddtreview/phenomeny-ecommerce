import Link from "next/link";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ cert: string }>;
}) {
  const { cert } = await params;
  const code = cert.trim().toUpperCase();

  return (
    <div className="min-h-screen bg-[#FFFFFF] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Certificate Verification
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.02em] text-[#1A1A1A]">
          Certificate #{code}
        </h1>
        <p className="mt-3 text-sm text-[#666666]">
          Share this code with support if you need authenticity confirmation.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          This route is live and ready. If you want, I can connect it to a Supabase
          certificates table in the next step.
        </div>

        <div className="mt-6">
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-[#1A1A1A] px-6 py-3 text-sm font-semibold text-white"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

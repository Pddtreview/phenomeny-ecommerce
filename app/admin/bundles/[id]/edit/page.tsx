import { BundleEditor } from "@/components/admin/BundleEditor";

export default async function AdminEditBundlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BundleEditor bundleId={id} />;
}

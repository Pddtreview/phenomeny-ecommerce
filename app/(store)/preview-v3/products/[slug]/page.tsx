import { redirect } from "next/navigation";

export default async function PreviewV3ProductAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/preview-v2/products/${slug}`);
}

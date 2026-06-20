import { redirect } from "next/navigation";

export default async function OrderConfirmedAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/order-success/${id}`);
}

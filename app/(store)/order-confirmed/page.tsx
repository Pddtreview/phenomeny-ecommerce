import { redirect } from "next/navigation";

export default function OrderConfirmedFallbackPage() {
  redirect("/shop");
}

import { Header } from "@/components/store/Header";
import { StoreFooter } from "@/components/store/StoreFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}

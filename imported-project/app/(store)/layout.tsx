import { Header } from "@/components/store/Header";
import { StoreFooter } from "@/components/store/StoreFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFFFF] text-[#1A1A1A]">
      <Header />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}


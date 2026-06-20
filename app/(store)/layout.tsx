import { Header } from "@/components/store/Header";
import { StoreFooter } from "@/components/store/StoreFooter";
import { FloatingWhatsApp } from "@/components/store/FloatingWhatsApp";
import { MobileBottomNav } from "@/components/store/MobileBottomNav";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFF8F0] text-[#2A1B12]">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <FloatingWhatsApp />
      <MobileBottomNav />
      <StoreFooter />
    </div>
  );
}


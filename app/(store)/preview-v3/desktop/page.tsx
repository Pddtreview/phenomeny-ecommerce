import HomepageV3 from "../_components/HomepageV3";

export const metadata = {
  title: "Homepage V3 Desktop Preview",
  robots: { index: false, follow: false },
};

export default function DesktopPreviewPage() {
  return <HomepageV3 mode="desktop" />;
}

import HomepageV3 from "../_components/HomepageV3";

export const metadata = {
  title: "Homepage V3 Mobile Preview",
  robots: { index: false, follow: false },
};

export default function MobilePreviewPage() {
  return <HomepageV3 mode="mobile" />;
}

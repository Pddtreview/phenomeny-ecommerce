import type { Metadata } from "next";
import { HomepageV6 } from "./preview-v6/home/page";

export const metadata: Metadata = {
  title: "Nauvaraha · Guidance by Karan Chopra",
  description:
    "Trusted Vedic guidance, consultations, and curated spiritual recommendations by Karan Chopra.",
  alternates: { canonical: "https://www.nauvaraha.com/" },
};

export default async function StoreHomePage() {
  return <HomepageV6 />;
}

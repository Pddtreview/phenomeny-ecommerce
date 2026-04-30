import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ContactForm } from "@/components/store/ContactForm";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const GOLD = "#C8860A";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Nauvaraha for order support, returns, and product guidance. We respond within 24 hours.",
  alternates: {
    canonical: "https://www.nauvaraha.com/contact",
  },
};

const helloMail = "hello@nauvaraha.com";

export default function ContactPage() {
  return (
    <div className={`bg-[#FFFFFF] pb-16 pt-16 ${inter.className}`}>
      <div className="mx-auto max-w-3xl px-4 leading-relaxed text-[#1A1A1A]">
        <h1 className="font-cormorant text-4xl text-[#1A1A1A] sm:text-[2.5rem]">
          Contact Us
        </h1>
        <p className="mb-10 mt-3 text-base text-[#6B5E4E]">
          We are here to help. Reach out and we will respond within 24 hours.
        </p>

        <div className="space-y-6">
          <section
            className="rounded-lg border border-[#C8860A]/20 bg-white p-6"
            aria-labelledby="contact-details-heading"
          >
            <h2 id="contact-details-heading" className="font-semibold text-[#C8860A]">
              Contact details
            </h2>
            <ul className="mt-4 space-y-3 text-sm sm:text-base">
              <li>
                <span className="font-medium">Email: </span>
                <a
                  href={`mailto:${helloMail}`}
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: GOLD }}
                >
                  {helloMail}
                </a>
              </li>
              <li>
                <span className="font-medium">Phone: </span>
                <a
                  href="tel:+919115490001"
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: GOLD }}
                >
                  +91 9115490001
                </a>
              </li>
              <li>
                <span className="font-medium">Business hours: </span>
                Monday to Saturday, 10am to 6pm IST
              </li>
              <li>
                <span className="font-medium">Response time: </span>
                Within 24 hours
              </li>
            </ul>
          </section>

          <section
            className="rounded-lg border border-[#C8860A]/20 bg-white p-6"
            aria-labelledby="office-address-heading"
          >
            <h2 id="office-address-heading" className="font-semibold text-[#C8860A]">
              Office address
            </h2>
            <address className="mt-4 not-italic text-sm sm:text-base">
              <p className="font-medium">Nauvaraha</p>
              <p className="mt-2">House No 10, Street No 01, Krishna Nagar</p>
              <p>Jalandhar, Punjab - 144008</p>
              <p>India</p>
              <p className="mt-3">
                <span className="font-medium">GSTIN: </span>
                03BGNPK9576K2ZO
              </p>
            </address>
          </section>

          <section
            className="rounded-lg border border-[#C8860A]/20 bg-white p-6"
            aria-labelledby="order-queries-heading"
          >
            <h2 id="order-queries-heading" className="font-semibold text-[#C8860A]">
              Order-related queries
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm sm:text-base">
              <li>
                <Link
                  href="/track"
                  className="font-medium text-[#C8860A] underline underline-offset-2 hover:no-underline"
                >
                  Track your order
                </Link>
              </li>
              <li>
                <span className="font-medium">Return request: </span>
                email{" "}
                <a
                  href={`mailto:${helloMail}?subject=${encodeURIComponent("Return Request - Order Number")}`}
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: GOLD }}
                >
                  {helloMail}
                </a>{" "}
                with subject &quot;Return Request - Order Number&quot;.
              </li>
              <li>
                <span className="font-medium">Cancellation: </span>
                email{" "}
                <a
                  href={`mailto:${helloMail}?subject=${encodeURIComponent("Cancel - Order Number")}`}
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: GOLD }}
                >
                  {helloMail}
                </a>{" "}
                with subject &quot;Cancel - Order Number&quot;.
              </li>
            </ul>
          </section>
        </div>

        <h2 className="mt-12 font-cormorant text-2xl text-[#C8860A] sm:text-3xl">
          Send Us a Message
        </h2>
        <div className="mt-6">
          <ContactForm />
        </div>

        <p className="mt-10 text-sm italic leading-relaxed text-[#6B5E4E] sm:text-base">
          For crystal guidance, vastu consultation, or product recommendations,
          our team is happy to help you find the right piece for your intentions.
        </p>
      </div>
    </div>
  );
}


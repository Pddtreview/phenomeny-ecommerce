import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import { ContactForm } from "@/components/store/ContactForm";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

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
    <div className={`bg-white pb-16 pt-16 ${inter.className}`}>
      <div className="mx-auto max-w-3xl px-4 leading-relaxed text-gray-700">
        <h1
          className={`${playfair.className} text-4xl text-[#1B3A6B] sm:text-[2.5rem]`}
        >
          Contact Us
        </h1>
        <p className="mb-10 mt-3 text-base text-gray-500">
          We are here to help. Reach out and we will respond within 24 hours.
        </p>

        <div className="space-y-6">
          <section
            className="rounded-lg border border-gray-200 p-6"
            aria-labelledby="contact-details-heading"
          >
            <h2
              id="contact-details-heading"
              className="font-semibold text-[#1B3A6B]"
            >
              📬 Contact details
            </h2>
            <ul className="mt-4 space-y-3 text-sm sm:text-base">
              <li>
                <span className="font-medium text-gray-800">✉️ Email: </span>
                <a
                  href={`mailto:${helloMail}`}
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: GOLD }}
                >
                  {helloMail}
                </a>
              </li>
              <li>
                <span className="font-medium text-gray-800">📞 Phone: </span>
                <a
                  href="tel:+919115490001"
                  className="underline underline-offset-2 hover:no-underline"
                  style={{ color: GOLD }}
                >
                  +91 9115490001
                </a>
              </li>
              <li>
                <span className="font-medium text-gray-800">🕐 Business hours: </span>
                Monday to Saturday, 10am to 6pm IST
              </li>
              <li>
                <span className="font-medium text-gray-800">⏱️ Response time: </span>
                Within 24 hours
              </li>
            </ul>
          </section>

          <section
            className="rounded-lg border border-gray-200 p-6"
            aria-labelledby="office-address-heading"
          >
            <h2
              id="office-address-heading"
              className="font-semibold text-[#1B3A6B]"
            >
              📍 Office address
            </h2>
            <address className="mt-4 not-italic text-sm sm:text-base">
              <p className="font-medium text-gray-800">Nauvaraha</p>
              <p className="mt-2">House No 10, Street No 01, Krishna Nagar</p>
              <p>Jalandhar, Punjab - 144008</p>
              <p>India</p>
              <p className="mt-3">
                <span className="font-medium text-gray-800">GSTIN: </span>
                03BGNPK9576K2ZO
              </p>
            </address>
          </section>

          <section
            className="rounded-lg border border-gray-200 p-6"
            aria-labelledby="order-queries-heading"
          >
            <h2
              id="order-queries-heading"
              className="font-semibold text-[#1B3A6B]"
            >
              📦 Order-related queries
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm sm:text-base">
              <li>
                <Link
                  href="/track"
                  className="font-medium text-[#1B3A6B] underline underline-offset-2 hover:no-underline"
                >
                  Track your order
                </Link>
              </li>
              <li>
                <span className="font-medium text-gray-800">Return request: </span>
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
                <span className="font-medium text-gray-800">Cancellation: </span>
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

        <h2
          className={`${playfair.className} mt-12 text-2xl text-[#1B3A6B] sm:text-3xl`}
        >
          Send Us a Message
        </h2>
        <div className="mt-6">
          <ContactForm />
        </div>

        <p className="mt-10 text-sm italic leading-relaxed text-gray-500 sm:text-base">
          For crystal guidance, vastu consultation, or product recommendations,
          our team is happy to help you find the right piece for your intentions.
        </p>
      </div>
    </div>
  );
}

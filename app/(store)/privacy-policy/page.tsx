import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Nauvaraha by Nauvaraha collects, uses, and protects your personal information.",
  alternates: {
    canonical: "https://www.nauvaraha.com/privacy-policy",
  },
};

const heading = "mt-8 font-semibold text-[#C8860A]";

export default function PrivacyPolicyPage() {
  return (
    <div className={`bg-[#FFFFFF] pb-16 pt-16 ${inter.className}`}>
      <article className="mx-auto max-w-3xl px-4 leading-relaxed text-[#1A1A1A]">
        <h1
          className="font-cormorant text-4xl text-[#1A1A1A] sm:text-[2.5rem]"
        >
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[#6B5E4E]">
          Last updated: April 2026
        </p>

        <p className="mt-6">
          This Privacy Policy describes how{" "}
          <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong> (
          <a
            href="https://www.nauvaraha.com"
            className="text-[#C8860A] underline underline-offset-2 hover:no-underline"
          >
            www.nauvaraha.com
          </a>
          ), operated by <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong>,
          collects, uses, and safeguards your information when you use our
          website and services.
        </p>

        <h2 className={heading}>1. Information We Collect</h2>
        <p className="mt-3">We may collect:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            <strong className="font-medium text-[#1A1A1A]">Account and order details:</strong>{" "}
            name, phone number, email address, and delivery address when you
            place an order or check out.
          </li>
          <li>
            <strong className="font-medium text-[#1A1A1A]">Technical data:</strong>{" "}
            device information, IP address, and browser type when you visit our
            site.
          </li>
          <li>
            <strong className="font-medium text-[#1A1A1A]">Usage data:</strong>{" "}
            order history and browsing behaviour on our website.
          </li>
        </ul>

        <h2 className={heading}>2. How We Use Your Information</h2>
        <p className="mt-3">We use this information to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Process and deliver your orders.</li>
          <li>
            Send order confirmation and shipping updates by SMS and/or email.
          </li>
          <li>Improve our website, products, and customer experience.</li>
          <li>
            Send promotional communications where permitted; you may opt out at
            any time using the unsubscribe link or by contacting us.
          </li>
        </ul>

        <h2 className={heading}>3. Information Sharing</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            We share necessary order and delivery details with{" "}
            <strong className="font-medium text-[#1A1A1A]">Shiprocket</strong>{" "}
            to fulfil shipments.
          </li>
          <li>
            Payment processing is handled by{" "}
            <strong className="font-medium text-[#1A1A1A]">Razorpay</strong>; we
            do not receive or store your full card or UPI credentials on our
            servers.
          </li>
          <li>
            We do <strong className="font-medium text-[#1A1A1A]">not</strong>{" "}
            sell your personal data to third parties.
          </li>
        </ul>

        <h2 className={heading}>4. Cookies</h2>
        <p className="mt-3">
          We use cookies and similar technologies for essential functions such as
          your shopping cart and session, as well as for analytics to understand
          how our site is used. You can disable or restrict cookies through your
          browser settings; some features of the site may not work correctly if
          you do so.
        </p>

        <h2 className={heading}>5. Data Security</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Our website is served over HTTPS with SSL encryption on all pages.
          </li>
          <li>
            Payment data is processed securely by Razorpay; we do not store your
            payment card details.
          </li>
        </ul>

        <h2 className={heading}>6. Your Rights</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>You may request access to the personal data we hold about you.</li>
          <li>You may request correction or deletion of your data, where applicable.</li>
          <li>
            To exercise these rights, contact us at{" "}
            <a
              href="mailto:hello@nauvaraha.com"
              className="text-[#C8860A] underline underline-offset-2 hover:no-underline"
            >
              hello@nauvaraha.com
            </a>
            .
          </li>
        </ul>

        <h2 className={heading}>7. Changes to This Policy</h2>
        <p className="mt-3">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated &quot;Last updated&quot; date. We
          encourage you to review this policy periodically.
        </p>

        <h2 className={heading}>8. Contact Us</h2>
        <div className="mt-3 space-y-2">
          <p>
            <strong className="font-medium text-[#1A1A1A]">
              Nauvaraha
            </strong>
          </p>
          <p>
            <span className="font-medium text-[#1A1A1A]">Website:</span>{" "}
            <a
              href="https://www.nauvaraha.com"
              className="text-[#C8860A] underline underline-offset-2 hover:no-underline"
            >
              https://www.nauvaraha.com
            </a>
          </p>
          <p>
            <span className="font-medium text-[#1A1A1A]">GSTIN:</span>{" "}
            03BGNPK9576K2ZO
          </p>
          <p>
            <span className="font-medium text-[#1A1A1A]">Address:</span>
            <br />
            House No 10, Street No 01, Krishna Nagar,
            <br />
            Jalandhar, Punjab - 144008, India
          </p>
          <p>
            <span className="font-medium text-[#1A1A1A]">Phone:</span>{" "}
            <a
              href="tel:+919115490001"
              className="text-[#C8860A] underline underline-offset-2 hover:no-underline"
            >
              +91 9115490001
            </a>
          </p>
          <p>
            <span className="font-medium text-[#1A1A1A]">Email:</span>{" "}
            <a
              href="mailto:hello@nauvaraha.com"
              className="text-[#C8860A] underline underline-offset-2 hover:no-underline"
            >
              hello@nauvaraha.com
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}





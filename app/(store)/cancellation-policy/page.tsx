import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description:
    "How to cancel Nauvaraha orders before dispatch, refunds on cancellation, and contact information.",
  alternates: {
    canonical: "https://www.nauvaraha.com/cancellation-policy",
  },
};

const heading = "mt-8 font-semibold text-[#1A1A1A]";

const helloMail = "hello@nauvaraha.com";

export default function CancellationPolicyPage() {
  return (
    <div className={`bg-[#FFFFFF] pb-16 pt-16 font-inter ${inter.className}`}>
      <article className="mx-auto max-w-3xl px-4 leading-relaxed text-[#1A1A1A]">
        <h1 className="text-4xl font-bold text-[#1A1A1A] sm:text-[2.5rem]">
          Cancellation Policy
        </h1>
        <p className="mt-4 text-sm text-[#666666]">Last updated: May 2026</p>

        <p className="mt-6">
          This Cancellation Policy applies to orders placed through{" "}
          <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong> at{" "}
          <a
            href="https://www.nauvaraha.com"
            className="text-gradient-accent underline underline-offset-2 hover:no-underline"
          >
            www.nauvaraha.com
          </a>
          . For returns after delivery, see our{" "}
          <Link
            href="/refund-policy"
            className="text-gradient-accent underline underline-offset-2 hover:no-underline"
          >
            Refund &amp; Return Policy
          </Link>
          .
        </p>

        <h2 className={heading}>1. Order Cancellation by Customer</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Orders can be cancelled before dispatch only.</li>
          <li>
            To cancel: email{" "}
            <a
              href={`mailto:${helloMail}?subject=${encodeURIComponent("CANCEL - [Order Number]")}`}
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>{" "}
            immediately with subject{" "}
            <strong className="font-medium text-[#1A1A1A]">
              CANCEL - [Order Number]
            </strong>
            .
          </li>
          <li>
            Or call{" "}
            <a
              href="tel:+919115490001"
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              +91 9115490001
            </a>{" "}
            during business hours.
          </li>
          <li>Once dispatched, cancellation is not possible.</li>
          <li>
            Prepaid cancellations are refunded within 5 business days.
          </li>
          <li>COD orders cancelled before dispatch: no charge.</li>
        </ul>

        <h2 className={heading}>2. Order Cancellation by Nauvaraha</h2>
        <p className="mt-3">We reserve the right to cancel orders due to:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Stock unavailability</li>
          <li>Payment failure</li>
          <li>Incorrect pricing</li>
          <li>Suspicious activity</li>
        </ul>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Full refund issued immediately on cancellation.</li>
          <li>Customer notified via email and phone.</li>
        </ul>

        <h2 className={heading}>3. Refund on Cancellation</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            <strong className="font-medium text-[#1A1A1A]">Prepaid:</strong> refund
            to the original payment method within 5-7 business days.
          </li>
          <li>
            <strong className="font-medium text-[#1A1A1A]">COD:</strong> no payment
            collected, no refund needed.
          </li>
          <li>Bank transfer option available on request.</li>
        </ul>

        <h2 className={heading}>4. How to Request Cancellation</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Email:{" "}
            <a
              href={`mailto:${helloMail}`}
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>
          </li>
          <li>
            Phone:{" "}
            <a
              href="tel:+919115490001"
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              +91 9115490001
            </a>
          </li>
          <li>
            Business hours: Monday to Saturday 10am to 6pm IST
          </li>
          <li>Response within 2 hours during business hours.</li>
        </ul>

        <h2 className={heading}>5. Contact Us</h2>
        <div className="mt-3 space-y-2">
          <p>
            <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong>
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
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              +91 9115490001
            </a>
          </p>
          <p>
            <span className="font-medium text-[#1A1A1A]">Email:</span>{" "}
            <a
              href={`mailto:${helloMail}`}
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}

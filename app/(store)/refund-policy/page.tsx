import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Refund & Return Policy",
  description:
    "Refund and return policy for orders placed at Nauvaraha.",
  alternates: {
    canonical: "https://www.nauvaraha.com/refund-policy",
  },
};

const heading = "font-semibold text-[#1B3A6B] mt-8";

const helloMail = "hello@nauvaraha.com";

export default function RefundPolicyPage() {
  return (
    <div className={`bg-white pb-16 pt-16 ${inter.className}`}>
      <article className="mx-auto max-w-3xl px-4 leading-relaxed text-gray-700">
        <h1
          className={`${playfair.className} text-4xl text-[#1B3A6B] sm:text-[2.5rem]`}
        >
          Refund &amp; Return Policy
        </h1>
        <p className="mt-4 text-sm text-gray-600">
          Last updated: April 2026
        </p>

        <p className="mt-6">
          This Refund &amp; Return Policy applies to purchases made through{" "}
          <strong className="font-medium text-gray-800">Nauvaraha</strong> at{" "}
          <a
            href="https://www.nauvaraha.com"
            className="text-[#1B3A6B] underline underline-offset-2 hover:no-underline"
          >
            www.nauvaraha.com
          </a>
          . It should be read together with our Terms &amp; Conditions.
        </p>

        <h2 className={heading}>1. Return Window</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Returns are accepted within 6 days from the date of delivery.</li>
          <li>
            You must raise a return request within this 6-day period; requests
            received after that cannot be accepted.
          </li>
          <li>
            After 6 days from delivery, we are unable to process returns except
            where required by applicable law.
          </li>
        </ul>

        <h2 className={heading}>2. Eligible Returns</h2>
        <p className="mt-3">We may approve a return where:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>The product was received damaged or broken.</li>
          <li>The wrong product was delivered.</li>
          <li>
            The product is significantly different from the description on our
            website.
          </li>
          <li>The product is unused and in saleable condition.</li>
          <li>
            It is returned in original packaging with all inclusions (tags,
            accessories, inserts) as shipped.
          </li>
        </ul>

        <h2 className={heading}>3. Non-Eligible Returns</h2>
        <p className="mt-3">We cannot accept returns in cases including:</p>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Change of mind after delivery.</li>
          <li>
            Slight natural variations in crystals, stone, or wood—these are
            inherent to natural products and are not considered defects.
          </li>
          <li>Products returned without original packaging.</li>
          <li>Products that show signs of use, wear, or damage after delivery.</li>
        </ul>

        <h2 className={heading}>4. How to Raise a Return Request</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Email{" "}
            <a
              href={`mailto:${helloMail}`}
              className="text-[#1B3A6B] underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>{" "}
            within 6 days of delivery.
          </li>
          <li>
            Use the subject line:{" "}
            <strong className="font-medium text-gray-800">
              Return Request - [Your Order Number]
            </strong>
            .
          </li>
          <li>
            Include your order number, a clear reason for the return, and photos
            of the product (and packaging, if relevant).
          </li>
          <li>Our team responds within 24 hours.</li>
        </ul>

        <h2 className={heading}>5. Refund Process</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            <strong className="font-medium text-gray-800">Prepaid orders:</strong>{" "}
            refund to the original payment method within 7 business days of return
            pickup.
          </li>
          <li>
            <strong className="font-medium text-gray-800">COD orders:</strong>{" "}
            refund via bank transfer within 7 business days; you must share bank
            details as requested.
          </li>
          <li>Shipping charges are non-refundable.</li>
          <li>
            We arrange reverse pickup at no cost to you, where serviceability
            allows.
          </li>
        </ul>

        <h2 className={heading}>6. Cancellations</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Orders may be cancelled only before dispatch from our facility.</li>
          <li>
            Once an order has been dispatched, cancellation is not possible; you
            may follow the return process if eligible.
          </li>
          <li>
            To cancel before dispatch, email{" "}
            <a
              href={`mailto:${helloMail}`}
              className="text-[#1B3A6B] underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>{" "}
            immediately with your order number.
          </li>
          <li>
            For eligible prepaid cancellations, refunds are processed within 5
            business days to the original payment method.
          </li>
        </ul>

        <h2 className={heading}>7. Damaged in Transit</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            If your order arrives damaged, photograph the package and product
            immediately before extensive handling.
          </li>
          <li>
            Email the photos to{" "}
            <a
              href={`mailto:${helloMail}`}
              className="text-[#1B3A6B] underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>{" "}
            within 24 hours of delivery.
          </li>
          <li>
            After verification, we will offer a replacement or refund at no
            charge, as appropriate.
          </li>
        </ul>

        <h2 className={heading}>8. Contact Us</h2>
        <div className="mt-3 space-y-2">
          <p>
            <strong className="font-medium text-gray-800">Nauvaraha</strong>
          </p>
          <p>
            <span className="font-medium text-gray-800">GSTIN:</span>{" "}
            03BGNPK9576K2ZO
          </p>
          <p>
            <span className="font-medium text-gray-800">Address:</span>
            <br />
            House No 10, Street No 01, Krishna Nagar,
            <br />
            Jalandhar, Punjab - 144008, India
          </p>
          <p>
            <span className="font-medium text-gray-800">Phone:</span>{" "}
            <a
              href="tel:+919115490001"
              className="text-[#1B3A6B] underline underline-offset-2 hover:no-underline"
            >
              +91 9115490001
            </a>
          </p>
          <p>
            <span className="font-medium text-gray-800">Email:</span>{" "}
            <a
              href={`mailto:${helloMail}`}
              className="text-[#1B3A6B] underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>
          </p>
        </div>
      </article>
    </div>
  );
}

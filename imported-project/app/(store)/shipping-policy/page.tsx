import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "Shipping, delivery, and tracking information for Nauvaraha orders across India.",
  alternates: {
    canonical: "https://www.nauvaraha.com/shipping-policy",
  },
};

const heading = "mt-8 font-semibold text-[#1A1A1A]";

const helloMail = "hello@nauvaraha.com";

export default function ShippingPolicyPage() {
  return (
    <div className={`bg-[#FFFFFF] pb-16 pt-16 font-inter ${inter.className}`}>
      <article className="mx-auto max-w-3xl px-4 leading-relaxed text-[#1A1A1A]">
        <h1
          className="text-4xl font-bold text-[#1A1A1A] sm:text-[2.5rem]"
        >
          Shipping Policy
        </h1>
        <p className="mt-4 text-sm text-[#666666]">
          Last updated: April 2026
        </p>

        <p className="mt-6">
          This Shipping Policy explains how{" "}
          <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong> ships
          orders placed on{" "}
          <a
            href="https://www.nauvaraha.com"
            className="text-gradient-accent underline underline-offset-2 hover:no-underline"
          >
            www.nauvaraha.com
          </a>
          . It should be read together with our Terms &amp; Conditions and
          Refund &amp; Return Policy.
        </p>

        <h2 className={heading}>1. Shipping Coverage</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>We ship across India.</li>
          <li>We do not offer international shipping at this time.</li>
          <li>All major cities and towns are covered, subject to courier serviceability.</li>
          <li>
            Remote areas may experience longer delivery times than standard
            estimates.
          </li>
        </ul>

        <h2 className={heading}>2. Delivery Timeline</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            <strong className="font-medium text-[#1A1A1A]">Standard delivery:</strong>{" "}
            typically 4-7 business days after dispatch.
          </li>
          <li>
            <strong className="font-medium text-[#1A1A1A]">Metro cities</strong>{" "}
            (Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata): typically
            3-5 business days after dispatch.
          </li>
          <li>
            <strong className="font-medium text-[#1A1A1A]">Remote areas and Northeast India:</strong>{" "}
            typically 7-10 business days after dispatch.
          </li>
          <li>
            Business days exclude Sundays and public holidays.
          </li>
        </ul>

        <h2 className={heading}>3. Shipping Charges</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Free shipping on orders above ₹999.</li>
          <li>Flat ₹79 shipping on orders below ₹999.</li>
          <li>
            Cash on delivery (COD): an additional COD handling charge of ₹49
            applies where COD is available.
          </li>
          <li>No hidden charges beyond what is shown at checkout.</li>
        </ul>

        <h2 className={heading}>4. Order Processing</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Orders are processed within 24 hours of confirmation (subject to
            verification and stock availability).
          </li>
          <li>
            Orders placed after 2:00 PM may be dispatched on the next business day.
          </li>
          <li>
            You will receive tracking details via SMS and email once your order
            is dispatched.
          </li>
        </ul>

        <h2 className={heading}>5. Tracking Your Order</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Track your order at{" "}
            <a
              href="https://www.nauvaraha.com/track"
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              https://www.nauvaraha.com/track
            </a>
            .
          </li>
          <li>Enter your order number and registered phone number to view status.</li>
          <li>
            You may also receive SMS updates at key stages: dispatched, out for
            delivery, and delivered.
          </li>
        </ul>

        <h2 className={heading}>6. Courier Partners</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            We ship through the{" "}
            <strong className="font-medium text-[#1A1A1A]">Shiprocket</strong>{" "}
            network and integrated courier partners.
          </li>
          <li>The courier assigned depends on your delivery pincode and serviceability.</li>
          <li>
            Partners may include Bluedart, Delhivery, Ekart, XpressBees, and
            others, and are subject to change.
          </li>
        </ul>

        <h2 className={heading}>7. Delivery Attempts</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Our courier partner will typically attempt delivery up to 3 times.
          </li>
          <li>
            If the shipment remains undelivered after 3 attempts, it may be
            returned to us.
          </li>
          <li>
            We will contact you to arrange a reattempt or next steps where
            possible.
          </li>
          <li>
            COD orders returned after failed delivery are not eligible for
            refund.
          </li>
        </ul>

        <h2 className={heading}>8. Delays</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Delays may occur during peak seasons, festivals, natural disasters,
            strikes, or similar events beyond our control.
          </li>
          <li>
            We are not liable for delays caused solely by courier partners, though
            we will help you follow up where we can.
          </li>
          <li>
            If you have not received your order within 10 business days of
            dispatch, please contact us at{" "}
            <a
              href={`mailto:${helloMail}`}
              className="text-gradient-accent underline underline-offset-2 hover:no-underline"
            >
              {helloMail}
            </a>
            .
          </li>
        </ul>

        <h2 className={heading}>9. Contact Us</h2>
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





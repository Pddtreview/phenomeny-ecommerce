import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for shopping at Nauvaraha.",
  alternates: {
    canonical: "https://www.nauvaraha.com/terms",
  },
};

const heading = "mt-8 font-semibold text-[#C8860A]";

export default function TermsPage() {
  return (
    <div className={`bg-[#FDFAF5] pb-16 pt-16 ${inter.className}`}>
      <article className="mx-auto max-w-3xl px-4 leading-relaxed text-[#1A1A1A]">
        <h1
          className="font-cormorant text-4xl text-[#1A1A1A] sm:text-[2.5rem]"
        >
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-sm text-[#6B5E4E]">
          Last updated: April 2026
        </p>

        <p className="mt-6">
          These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of{" "}
          <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong> at{" "}
          <a
            href="https://www.nauvaraha.com"
            className="text-[#C8860A] underline underline-offset-2 hover:no-underline"
          >
            www.nauvaraha.com
          </a>
          , operated by{" "}
          <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong>.
          Please read them carefully before placing an order.
        </p>

        <h2 className={heading}>1. Acceptance of Terms</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            By accessing or using nauvaraha.com, you agree to be bound by these
            Terms and our Privacy Policy.
          </li>
          <li>
            If you do not agree with these Terms, please do not use our
            website or services.
          </li>
        </ul>

        <h2 className={heading}>2. Products and Pricing</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>All prices are displayed in Indian Rupees (INR).</li>
          <li>
            Prices, offers, and availability may change without prior notice.
          </li>
          <li>
            Product images are for reference only; slight variations in colour,
            shape, or size are normal for natural crystals and handcrafted
            items.
          </li>
          <li>
            We represent that our products are genuine and ethically sourced.
          </li>
        </ul>

        <h2 className={heading}>3. Orders and Payment</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            An order is confirmed only after successful payment (for prepaid
            orders) or completion of COD OTP verification, as applicable.
          </li>
          <li>
            We accept UPI, cards, and net banking through{" "}
            <strong className="font-medium text-[#1A1A1A]">Razorpay</strong>.
          </li>
          <li>
            Cash on delivery (COD) may be available where offered, subject to
            OTP verification and eligibility.
          </li>
          <li>
            We reserve the right to refuse or cancel any order, including for
            suspected fraud, stock unavailability, or operational reasons, with
            appropriate communication and refund where payment has been
            collected.
          </li>
        </ul>

        <h2 className={heading}>4. Shipping and Delivery</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            We ship across India through delivery partners integrated via{" "}
            <strong className="font-medium text-[#1A1A1A]">Shiprocket</strong>.
          </li>
          <li>
            Estimated delivery is typically within 4Ã¢â‚¬â€œ7 business days after
            dispatch, unless stated otherwise at checkout.
          </li>
          <li>
            Actual delivery timelines may vary based on location, courier
            capacity, weather, or force majeure events.
          </li>
          <li>
            Free shipping applies to orders above Ã¢â€šÂ¹999, where this offer is
            active and displayed on the site.
          </li>
        </ul>

        <h2 className={heading}>5. Returns and Refunds</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            You may request a return within 6 days from the date of delivery,
            subject to our return policy.
          </li>
          <li>
            Products must be unused, in original condition, and in original
            packaging with tags intact, where applicable.
          </li>
          <li>
            Approved refunds are typically processed within 7 business days
            after we receive and inspect the returned item.
          </li>
          <li>
            For COD orders, refunds are processed via bank transfer to the
            account details you provide.
          </li>
          <li>
            For prepaid orders, refunds are credited to the original payment
            method, in line with Razorpay and bank processing times.
          </li>
        </ul>

        <h2 className={heading}>6. Intellectual Property</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            All content on nauvaraha.comÃ¢â‚¬â€including text, graphics, logos,
            images, product descriptions, and layoutÃ¢â‚¬â€is owned by or licensed
            to <strong className="font-medium text-[#1A1A1A]">Nauvaraha</strong>.
          </li>
          <li>
            You may not copy, reproduce, distribute, modify, or create
            derivative works from our content without prior written permission.
          </li>
        </ul>

        <h2 className={heading}>7. Disclaimer</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>
            Crystal, vastu, and related products are offered as complementary
            wellness and lifestyle tools.
          </li>
          <li>
            We do not guarantee specific outcomes, results, or effects from use
            of these products.
          </li>
          <li>
            Individual experiences may vary. Our products are not a substitute
            for professional medical, legal, or financial advice.
          </li>
        </ul>

        <h2 className={heading}>8. Governing Law</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>These Terms are governed by the laws of India.</li>
          <li>
            Subject to applicable law, courts at{" "}
            <strong className="font-medium text-[#1A1A1A]">
              Jalandhar, Punjab, India
            </strong>{" "}
            shall have exclusive jurisdiction over disputes arising from these
            Terms or your use of the website.
          </li>
        </ul>

        <h2 className={heading}>9. Contact Us</h2>
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





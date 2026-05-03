import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <section className="w-full max-w-xl rounded-2xl border border-[#EEEEEE] bg-white p-8 text-center">
        <h1 className="text-3xl font-bold text-[#1A1A1A]">Payment Failed</h1>
        <p className="mt-4 text-base text-[#666666]">
          Your payment could not be processed. Your order has not been placed. Please
          try again or choose Cash on Delivery.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/checkout"
            className="inline-flex rounded-full bg-[linear-gradient(135deg,#FF4500,#E91E8C)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex rounded-full bg-[linear-gradient(135deg,#FF4500,#E91E8C)] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
}

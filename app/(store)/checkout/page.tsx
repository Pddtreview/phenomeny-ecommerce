"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/useCart";
import nauvarahConfig from "@/configs/nauvarah.config";
import { cn } from "@/lib/utils";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";
const FREE_SHIPPING_ABOVE = nauvarahConfig.shipping.freeShippingAbove;
const SHIPPING_CHARGE = nauvarahConfig.shipping.flatShippingCharge;
const COD_CHARGE = nauvarahConfig.shipping.codCharge;
const PREPAID_DISCOUNT = nauvarahConfig.shipping.prepaidDiscount;

const addressSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter 10 digit phone"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter 6 digit pincode"),
});

type AddressForm = z.infer<typeof addressSchema>;

type PaymentMethod = "prepaid" | "cod";

declare global {
  interface Window {
    Razorpay: new (options: {
      key: string;
      order_id: string;
      amount: number;
      currency: string;
      name: string;
      handler: (res: { razorpay_payment_id: string }) => void;
    }) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("prepaid");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = totalPrice();
  const shippingCharge =
    subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_CHARGE;
  const codCharge = paymentMethod === "cod" ? COD_CHARGE : 0;
  const discount = paymentMethod === "prepaid" ? PREPAID_DISCOUNT : 0;
  const total = Math.max(0, subtotal + shippingCharge + codCharge - discount);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  const pincode = watch("pincode");

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/products");
    }
  }, [items.length, router]);

  const onPincodeBlur = async () => {
    const pin = (pincode || "").replace(/\D/g, "");
    if (pin.length !== 6) return;
    setError(null);
    try {
      const res = await fetch("/api/shipping/check-pincode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: pin }),
      });
      const data = await res.json();
      if (data.city) setValue("city", data.city);
      if (data.state) setValue("state", data.state);
    } catch {
      // ignore
    }
  };

  const buildOrderPayload = (data: AddressForm) => {
    const phone = data.phone.replace(/\D/g, "").slice(-10);
    return {
      customer: {
        name: data.name,
        phone: data.phone,
        email: undefined as string | undefined,
      },
      address: {
        line1: data.address_line1,
        line2: data.address_line2 || undefined,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      items: items.map((i) => ({
        variantId: i.variantId,
        name: i.name,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.price,
        totalPrice: i.price * i.quantity,
        itemType: "product" as const,
      })),
      paymentMethod,
      subtotal,
      discount,
      shippingCharge,
      codCharge,
      total,
    };
  };

  const createOrder = async (
    payload: ReturnType<typeof buildOrderPayload>,
    razorpayOrderId?: string,
    razorpayPaymentId?: string
  ) => {
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        razorpayOrderId: razorpayOrderId || undefined,
        razorpayPaymentId: razorpayPaymentId || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Order failed");
    return json as { orderId: string; orderNumber: string };
  };

  const onPlaceOrderPrepaid = async (data: AddressForm) => {
    setLoading(true);
    setError(null);
    try {
      await loadRazorpayScript();
      const createOrderRes = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total * 100,
          receipt: `nv_${Date.now()}`,
        }),
      });
      const razorpayOrder = await createOrderRes.json();
      if (!createOrderRes.ok || !razorpayOrder.orderId) {
        throw new Error(razorpayOrder?.error || "Could not create payment order");
      }

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) throw new Error("Razorpay key not configured");

      const payload = buildOrderPayload(data);

      const razorpay = new window.Razorpay({
        key,
        order_id: razorpayOrder.orderId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "Nauvarah",
        handler: async (res) => {
          try {
            const result = await createOrder(
              payload,
              razorpayOrder.orderId,
              res.razorpay_payment_id
            );
            clearCart();
            router.replace(`/order-success/${result.orderId}`);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Order failed");
            setLoading(false);
          }
          setLoading(false);
        },
      });
      razorpay.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
    setLoading(false);
  };

  const onSendOtp = async () => {
    const phone = watch("phone").replace(/\D/g, "").slice(-10);
    if (phone.length !== 10) {
      setError("Enter a valid 10 digit phone number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Failed to send OTP");
      }
      setOtpSent(true);
      setOtpValue("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    }
    setLoading(false);
  };

  const onVerifyOtpAndPlaceOrder = async (data: AddressForm) => {
    const phone = data.phone.replace(/\D/g, "").slice(-10);
    if (otpValue.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const verifyRes = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpValue }),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyRes.ok || !verifyJson.success) {
        throw new Error(verifyJson?.error || "Invalid OTP");
      }

      const payload = buildOrderPayload(data);
      const result = await createOrder(payload);
      clearCart();
      router.replace(`/order-success/${result.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    }
    setLoading(false);
  };

  const onSubmit = (data: AddressForm) => {
    if (paymentMethod === "prepaid") {
      onPlaceOrderPrepaid(data);
    } else {
      if (!otpSent) {
        onSendOtp();
      } else {
        onVerifyOtpAndPlaceOrder(data);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-900">Checkout</h1>

        {/* Section 1: Order summary - collapsible on mobile */}
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-4 text-left md:cursor-default"
            onClick={() => setSummaryOpen((o) => !o)}
          >
            <span className="font-semibold text-zinc-900">Order summary</span>
            <span className="md:hidden">
              {summaryOpen ? "−" : "+"}
            </span>
          </button>
          <div
            className={cn(
              "border-t border-zinc-100 px-4 pb-4",
              summaryOpen ? "block" : "hidden md:block"
            )}
          >
            <ul className="mt-3 space-y-2">
              {items.map((i) => (
                <li
                  key={i.variantId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-zinc-700">
                    {i.name} × {i.quantity}
                  </span>
                  <span className="font-medium text-zinc-900">
                    ₹{(i.price * i.quantity).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Shipping</span>
                <span>
                  {shippingCharge === 0
                    ? "Free"
                    : `₹${shippingCharge}`}
                </span>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">COD charge</span>
                  <span>₹{COD_CHARGE}</span>
                </div>
              )}
              {paymentMethod === "prepaid" && (
                <div className="flex justify-between text-[#C8860A]">
                  <span>Prepaid discount</span>
                  <span>−₹{PREPAID_DISCOUNT}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold">
                <span>Total</span>
                <span style={{ color: PRIMARY }}>
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Address form */}
        <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-zinc-900">Delivery details</h2>
          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Name
              </label>
              <input
                {...register("name")}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Phone (10 digits)
              </label>
              <input
                {...register("phone")}
                maxLength={10}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Address line 1
              </label>
              <input
                {...register("address_line1")}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              {errors.address_line1 && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.address_line1.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Address line 2 (optional)
              </label>
              <input
                {...register("address_line2")}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Pincode (6 digits)
              </label>
              <input
                {...register("pincode")}
                maxLength={6}
                onBlur={onPincodeBlur}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
              {errors.pincode && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.pincode.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  City
                </label>
                <input
                  {...register("city")}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  State
                </label>
                <input
                  {...register("state")}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                />
                {errors.state && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* Section 3: Payment method */}
        <section className="mt-6">
          <h2 className="mb-3 font-semibold text-zinc-900">Payment method</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPaymentMethod("prepaid")}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition",
                paymentMethod === "prepaid"
                  ? "border-[#1B3A6B] bg-[#1B3A6B]/5"
                  : "border-zinc-200 bg-white"
              )}
            >
              <span className="font-semibold text-zinc-900">Pay Online</span>
              <span
                className="ml-2 rounded px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: GOLD }}
              >
                ₹75 off
              </span>
              <p className="mt-1 text-xs text-zinc-500">Razorpay</p>
              <span className="mt-1 inline-block text-xs font-medium text-[#1B3A6B]">
                Recommended
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition",
                paymentMethod === "cod"
                  ? "border-[#1B3A6B] bg-[#1B3A6B]/5"
                  : "border-zinc-200 bg-white"
              )}
            >
              <span className="font-semibold text-zinc-900">
                Cash on Delivery
              </span>
              <p className="mt-1 text-xs text-zinc-500">₹{COD_CHARGE} COD charge</p>
            </button>
          </div>
        </section>

        {/* OTP step for COD */}
        {paymentMethod === "cod" && otpSent && (
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Enter 6 digit OTP sent to your phone
            </label>
            <input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              placeholder="000000"
            />
          </section>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {/* Section 4: Place Order */}
        <div className="mt-6">
          <button
            type="submit"
            form="checkout-form"
            disabled={loading}
            className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-70"
            style={{ backgroundColor: PRIMARY }}
          >
            {loading
              ? "Processing..."
              : paymentMethod === "cod" && !otpSent
                ? "Send OTP & Continue"
                : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

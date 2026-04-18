"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/useCart";
import nauvarahConfig from "@/configs/nauvarah.config";
import { cn } from "@/lib/utils";

const SKIP_COD_OTP = false;

const COD_ONLY_MODE = process.env.COD_ONLY_MODE === "true";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    COD_ONLY_MODE ? "cod" : "prepaid"
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpAutoFilled, setDevOtpAutoFilled] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    couponId: string;
    discountAmount: number;
  } | null>(null);

  const isDev = process.env.NODE_ENV === "development";

  const subtotal = totalPrice();
  const shippingCharge =
    subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_CHARGE;
  const codCharge = paymentMethod === "cod" ? COD_CHARGE : 0;
  const discount = paymentMethod === "prepaid" ? PREPAID_DISCOUNT : 0;
  const couponDiscount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(
    0,
    subtotal + shippingCharge + codCharge - discount - couponDiscount
  );

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    getValues,
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

  useEffect(() => {
    // Reset COD OTP flow when switching payment method.
    setOtpSent(false);
    setOtp("");
    setOtpVerified(false);
    setResendTimer(0);
    setError(null);
    setDevOtpAutoFilled(false);
  }, [paymentMethod]);

  useEffect(() => {
    if (!otpSent || resendTimer <= 0) return;
    const id = window.setInterval(() => {
      setResendTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [otpSent, resendTimer]);

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

  const applyCoupon = async () => {
    const code = couponCodeInput.trim();
    if (!code) return;
    setCouponMessage(null);
    setCouponApplying(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({
          code: data.code,
          couponId: data.couponId,
          discountAmount: data.discountAmount,
        });
        setCouponMessage({
          type: "success",
          text: `Coupon applied. You save INR ${data.discountAmount.toLocaleString("en-IN")}.`,
        });
      } else {
        setAppliedCoupon(null);
        setCouponMessage({
          type: "error",
          text: data.message || "Invalid coupon",
        });
      }
    } catch {
      setCouponMessage({ type: "error", text: "Could not validate coupon" });
      setAppliedCoupon(null);
    } finally {
      setCouponApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
    setCouponCodeInput("");
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
      items: items.map((i) => {
        const isBundle = i.itemType === "bundle" && i.bundleId;
        if (isBundle) {
          return {
            bundleId: i.bundleId,
            name: i.name,
            sku: i.sku,
            quantity: i.quantity,
            unitPrice: i.price,
            totalPrice: i.price * i.quantity,
            itemType: "bundle" as const,
          };
        }
        return {
          variantId: i.variantId,
          name: i.name,
          sku: i.sku,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
          itemType: "variant" as const,
        };
      }),
      paymentMethod,
      coupon_code: appliedCoupon?.code ?? undefined,
      discount_amount: appliedCoupon?.discountAmount ?? undefined,
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
        throw new Error(
          razorpayOrder?.message ||
            razorpayOrder?.error ||
            "Could not create payment order"
        );
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

  const sendOtp = async (phone: string): Promise<string | null> => {
    const res = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json?.error || "Failed to send OTP");
    }
    return typeof json?.devOtp === "string" ? json.devOtp : null;
  };

  const verifyOtp = async (phone: string, otpToVerify: string) => {
    const verifyRes = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp: otpToVerify }),
    });
    const verifyJson = await verifyRes.json();
    if (!verifyRes.ok || !verifyJson.success) {
      throw new Error("Invalid OTP. Please try again.");
    }
  };

  const onCodPlaceOrderClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const isValid = await trigger();
      if (!isValid) return;

      const phone = getValues("phone").replace(/\D/g, "").slice(-10);
      if (phone.length !== 10) {
        setError("Enter a valid 10 digit phone number");
        return;
      }

      if (SKIP_COD_OTP) {
        const payload = buildOrderPayload(getValues());
        const result = await createOrder(payload);
        clearCart();
        router.replace(`/order-success/${result.orderId}`);
        return;
      }

      const devOtp = await sendOtp(phone);
      setOtpSent(true);
      setOtp(devOtp ?? "");
      setOtpVerified(false);
      setResendTimer(30);
      setDevOtpAutoFilled(Boolean(devOtp));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onCodVerifyAndPlaceOrder = handleSubmit(async (data) => {
    setError(null);
    setLoading(true);
    try {
      const phone = data.phone.replace(/\D/g, "").slice(-10);
      if (!SKIP_COD_OTP && (otp.length < 4 || otp.length > 6)) {
        setError("Enter a valid OTP");
        return;
      }

      if (!SKIP_COD_OTP) {
        await verifyOtp(phone, otp);
        setOtpVerified(true);
      }

      const payload = buildOrderPayload(data);
      const result = await createOrder(payload);
      clearCart();
      router.replace(`/order-success/${result.orderId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  const onResendOtp = async () => {
    if (resendTimer > 0) return;
    setError(null);
    setLoading(true);
    try {
      const isValid = await trigger(["phone"]);
      if (!isValid) return;
      const phone = getValues("phone").replace(/\D/g, "").slice(-10);
      if (phone.length !== 10) {
        setError("Enter a valid 10 digit phone number");
        return;
      }
      const devOtp = await sendOtp(phone);
      if (devOtp) {
        setOtp(devOtp);
        setDevOtpAutoFilled(true);
      }
      setResendTimer(30);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
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
                    <span className="font-inter rupee">₹</span>
                    {(i.price * i.quantity).toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600">Subtotal</span>
                <span>
                  <span className="font-inter rupee">₹</span>
                  {subtotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Shipping</span>
                <span>
                  {shippingCharge === 0
                    ? "Free"
                    : (
                        <>
                          <span className="font-inter rupee">₹</span>
                          {shippingCharge}
                        </>
                      )}
                </span>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">COD charge</span>
                  <span>
                    <span className="font-inter rupee">₹</span>
                    {COD_CHARGE}
                  </span>
                </div>
              )}
              {paymentMethod === "prepaid" && (
                <div className="flex justify-between text-[#C8860A]">
                  <span>Prepaid discount</span>
                  <span>
                    −<span className="font-inter rupee">₹</span>
                    {PREPAID_DISCOUNT}
                  </span>
                </div>
              )}
              {/* Coupon */}
              <div className="border-t border-zinc-100 pt-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponApplying || !couponCodeInput.trim()}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-70"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {couponApplying ? "Apply…" : "Apply"}
                    </button>
                  )}
                </div>
                {couponMessage && (
                  <p
                    className={`mt-2 text-sm ${
                      couponMessage.type === "success"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {couponMessage.text}
                  </p>
                )}
                {appliedCoupon && (
                  <div className="mt-2 flex justify-between text-sm text-emerald-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>
                      −<span className="font-inter rupee">₹</span>
                      {appliedCoupon.discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold">
                <span>Total</span>
                <span style={{ color: PRIMARY }}>
                  <span className="font-inter rupee">₹</span>
                  {total.toLocaleString("en-IN")}
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
          <div
            className={cn(
              "grid gap-4",
              COD_ONLY_MODE ? "grid-cols-1" : "grid-cols-2"
            )}
          >
            {!COD_ONLY_MODE && (
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
                  <span className="font-inter rupee">₹</span>75 off
                </span>
                <p className="mt-1 text-xs text-zinc-500">Razorpay</p>
                <span className="mt-1 inline-block text-xs font-medium text-[#1B3A6B]">
                  Recommended
                </span>
              </button>
            )}
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
              <p className="mt-1 text-xs text-zinc-500">
                <span className="font-inter rupee">₹</span>
                {COD_CHARGE} COD charge
              </p>
            </button>
          </div>
        </section>

        {/* OTP step for COD */}
        {paymentMethod === "cod" && otpSent && (
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Enter OTP sent to your phone
            </label>
            <input
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              placeholder="000000"
            />
            {isDev && devOtpAutoFilled && (
              <p className="mt-2 text-xs text-zinc-500">
                Dev mode: OTP auto-filled
              </p>
            )}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={onCodVerifyAndPlaceOrder}
                disabled={loading || otpVerified}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                style={{ backgroundColor: PRIMARY }}
              >
                {loading ? "Verifying..." : "Verify & Place Order"}
              </button>

              {resendTimer > 0 ? (
                <span className="text-xs text-zinc-500">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResendOtp}
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </section>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        {/* Section 4: Place Order */}
        <div className="mt-6">
          {paymentMethod === "prepaid" ? (
            <button
              type="button"
              onClick={handleSubmit(onPlaceOrderPrepaid)}
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-70"
              style={{ backgroundColor: PRIMARY }}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          ) : !otpSent ? (
            <button
              type="button"
              onClick={onCodPlaceOrderClick}
              disabled={loading}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-70"
              style={{ backgroundColor: PRIMARY }}
            >
              {loading ? "Sending OTP..." : "Place Order"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

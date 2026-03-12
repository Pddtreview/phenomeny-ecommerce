 'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

type AuthMeResponse =
  | { authenticated: false }
  | {
      authenticated: true;
      customer: { id: string; phone: string; name: string | null; email: string | null };
    };

type Step = "phone" | "otp";

export default function AccountPage() {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);

  const normalizedPhone = useMemo(
    () => phone.replace(/\D/g, "").slice(-10),
    [phone]
  );

  const canResend = useMemo(() => {
    if (lastSentAt == null) return false;
    const elapsed = Date.now() - lastSentAt;
    return elapsed >= 30 * 1000;
  }, [lastSentAt]);

  const maskedPhone = useMemo(() => {
    const digits = normalizedPhone;
    if (digits.length < 4) return "";
    const last4 = digits.slice(-4);
    return "OTP sent to ******" + last4;
  }, [normalizedPhone]);

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { method: "GET" });
        const json: AuthMeResponse = await res.json();
        if (!cancelled && json.authenticated) {
          router.replace("/account/dashboard");
          return;
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    }
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (normalizedPhone.length !== 10) {
      setError("Please enter a valid 10 digit phone number.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to send OTP. Please try again.");
        return;
      }
      setLastSentAt(Date.now());
      setStep("otp");
      setOtp("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (normalizedPhone.length !== 10 || otp.trim().length !== 4) {
      setError("Please enter a valid phone and 4 digit OTP.");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone, otp: otp.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Invalid OTP. Please try again.");
        return;
      }
      router.replace("/account/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to resend OTP. Please try again.");
        return;
      }
      setLastSentAt(Date.now());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setError(null);
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-600">
          Checking your account...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            Nauvarah
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Use your phone number to securely access your orders and addresses.
          </p>

          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="mt-6 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Phone number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="10 digit phone"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ outlineColor: PRIMARY }}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-70"
                style={{ backgroundColor: PRIMARY }}
              >
                {sending ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-3">
              {maskedPhone && (
                <p className="text-xs font-medium text-zinc-600">
                  {maskedPhone}
                </p>
              )}
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600">
                  Enter OTP
                </label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4 digit OTP"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ outlineColor: PRIMARY }}
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={verifying}
                className="w-full rounded-lg py-3 text-sm font-semibold text-white disabled:opacity-70"
                style={{ backgroundColor: PRIMARY }}
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  className="text-zinc-600 hover:text-zinc-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || sending}
                  className="text-zinc-600 hover:text-zinc-900 disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}


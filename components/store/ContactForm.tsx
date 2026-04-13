"use client";

import { useState } from "react";

const SUBJECTS = [
  "Order Query",
  "Return Request",
  "Product Question",
  "General Enquiry",
] as const;

const PRIMARY = "#1B3A6B";

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#1B3A6B] focus:ring-offset-0";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !phone.trim() || !email.trim() || !subject || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (message.trim().length < 20) {
      setError("Message must be at least 20 characters.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
      };

      if (!res.ok || !data.success) {
        setError(
          typeof data.error === "string" && data.error
            ? data.error
            : "Something went wrong. Please try again."
        );
        return;
      }

      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-gray-200 bg-white p-6"
    >
      {success && (
        <p
          className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
          role="status"
        >
          Thank you! We will get back to you within 24 hours.
        </p>
      )}
      {error && (
        <p
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="mb-1 block text-sm font-medium text-gray-700">
            Phone number <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-gray-700">
            Email address <span className="text-red-600">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-gray-700">
            Subject <span className="text-red-600">*</span>
          </label>
          <select
            id="contact-subject"
            name="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={inputClass}
          >
            <option value="">Select a subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-gray-700">
            Message <span className="text-red-600">*</span>
            <span className="font-normal text-gray-500"> (min. 20 characters)</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            rows={5}
            minLength={20}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-y min-h-[120px]`}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
        style={{ backgroundColor: PRIMARY }}
      >
        {pending && (
          <svg
            className="h-4 w-4 shrink-0 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        Send Message
      </button>
    </form>
  );
}

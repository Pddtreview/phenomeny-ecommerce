import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const SUBJECT_OPTIONS = [
  "Order Query",
  "Return Request",
  "Product Question",
  "General Enquiry",
] as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim().slice(0, 40) : "";
    const email =
      typeof body.email === "string" ? body.email.trim().slice(0, 320) : "";
    const subject =
      typeof body.subject === "string" ? body.subject.trim() : "";
    const message =
      typeof body.message === "string" ? body.message.trim().slice(0, 8000) : "";

    if (!name || !phone || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!SUBJECT_OPTIONS.includes(subject as (typeof SUBJECT_OPTIONS)[number])) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    if (message.length < 20) {
      return NextResponse.json(
        { error: "Message must be at least 20 characters" },
        { status: 400 }
      );
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceRoleClient();
    const { data: row, error: insertError } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        phone,
        email,
        subject,
        message,
      })
      .select("id, created_at")
      .single();

    if (insertError) {
      console.error("contact insert:", insertError);
      return NextResponse.json(
        { error: "Could not save your message. Please try again." },
        { status: 500 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    if (!resendKey || !from) {
      console.error("contact: RESEND_API_KEY or RESEND_FROM_EMAIL missing");
      return NextResponse.json(
        { error: "Email is not configured. Your message was saved; we will follow up soon." },
        { status: 503 }
      );
    }

    const createdAt = row?.created_at
      ? new Date(row.created_at as string).toISOString()
      : new Date().toISOString();

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <h2 style="color: #1B3A6B;">New enquiry — Nauvaraha</h2>
  <table style="border-collapse: collapse; max-width: 560px;">
    <tr><td style="padding: 6px 12px 6px 0; font-weight: 600;">Name</td><td>${escapeHtml(name)}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; font-weight: 600;">Phone</td><td>${escapeHtml(phone)}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; font-weight: 600;">Email</td><td>${escapeHtml(email)}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; font-weight: 600;">Subject</td><td>${escapeHtml(subject)}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; vertical-align: top; font-weight: 600;">Message</td><td style="white-space: pre-wrap;">${escapeHtml(message)}</td></tr>
    <tr><td style="padding: 6px 12px 6px 0; font-weight: 600;">Time</td><td>${escapeHtml(createdAt)}</td></tr>
  </table>
</body>
</html>`;

    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from,
      to: "hello@nauvaraha.com",
      subject: `[Nauvaraha Enquiry] ${subject} - ${name}`,
      html,
    });

    if (sendError) {
      console.error("contact Resend:", sendError);
      return NextResponse.json(
        { error: sendError.message ?? "Could not send notification email." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("contact POST:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

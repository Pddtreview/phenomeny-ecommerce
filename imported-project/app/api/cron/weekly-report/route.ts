import WeeklyPlReportEmail from "@/emails/WeeklyPlReportEmail";
import { gatherWeeklyPlReport } from "@/lib/weekly-pl-report";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createElement } from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TZ = "Asia/Kolkata";

function subjectDateRange(startIso: string, endIso: string): string {
  const df = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: TZ,
  });
  return `${df.format(new Date(startIso))} – ${df.format(new Date(endIso))}`;
}

function collectRecipients(): string[] {
  const list = [
    "deepak@pddt.in",
    process.env.WEEKLY_REPORT_EMAIL_KARAN?.trim(),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    if (!raw || !raw.includes("@")) continue;
    const norm = raw.toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

/**
 * Vercel Cron: GET /api/cron/weekly-report
 * Secured with Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 }
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const to = collectRecipients();
  if (to.length === 0) {
    return NextResponse.json({ error: "No valid report recipients" }, { status: 503 });
  }

  try {
    if (!process.env.WEEKLY_REPORT_EMAIL_KARAN?.trim()) {
      console.warn(
        "weekly-report: WEEKLY_REPORT_EMAIL_KARAN not set; sending only to deepak@pddt.in"
      );
    }

    const supabase = createSupabaseServiceRoleClient();
    const report = await gatherWeeklyPlReport(supabase);
    const resend = new Resend(resendKey);
    const from =
      process.env.RESEND_FROM_EMAIL || "Nauvaraha <orders@nauvaraha.com>";
    const range = subjectDateRange(
      report.periodStartIso,
      report.periodEndIso
    );

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Nauvaraha weekly P&L — ${range}`,
      react: createElement(WeeklyPlReportEmail, { report }),
    });

    if (error) {
      console.error("weekly-report Resend:", error);
      return NextResponse.json(
        { error: error.message ?? "Resend failed" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: data?.id,
      recipients: to,
    });
  } catch (e) {
    console.error("weekly-report:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

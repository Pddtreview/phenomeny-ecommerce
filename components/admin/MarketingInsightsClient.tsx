"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { MarketingInsightsPayload } from "@/lib/marketing-insights";

const PRIMARY = "#1B3A6B";
const GOLD = "#C8860A";

function parseInsightBlocks(markdown: string): Array<{
  headline: string;
  body: string;
}> {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const chunks = trimmed
    .split(/^## /gm)
    .map((c) => c.trim())
    .filter(Boolean);

  const blocks: Array<{ headline: string; body: string }> = [];
  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const headline = (lines[0] ?? "").replace(/^#+\s*/, "").trim();
    const body = lines.slice(1).join("\n").trim();
    if (headline) blocks.push({ headline, body });
  }

  return blocks.slice(0, 5);
}

export function MarketingInsightsClient() {
  const [metrics, setMetrics] = useState<MarketingInsightsPayload | null>(null);
  const [streamText, setStreamText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const metricsApplied = useRef(false);

  const runAnalysis = useCallback(async () => {
    setError(null);
    setLoading(true);
    setStreamText("");
    metricsApplied.current = false;

    try {
      const res = await fetch("/api/admin/insights/analyze", {
        method: "POST",
      });

      const ct = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        if (ct.includes("application/json")) {
          const j = await res.json();
          throw new Error(j?.error || `Request failed (${res.status})`);
        }
        throw new Error(`Request failed (${res.status})`);
      }

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let raw = "";
      const startMark = "---METRICS---\n";
      const sep = "\n---STREAM---\n";

      while (true) {
        const { done, value } = await reader.read();
        if (value) raw += dec.decode(value, { stream: true });

        if (raw.startsWith(startMark)) {
          const sepIdx = raw.indexOf(sep);
          if (sepIdx !== -1) {
            if (!metricsApplied.current) {
              try {
                const m = JSON.parse(
                  raw.slice(startMark.length, sepIdx)
                ) as MarketingInsightsPayload;
                setMetrics(m);
                metricsApplied.current = true;
              } catch {
                setError("Could not parse metrics from response");
                setLoading(false);
                return;
              }
            }
            setStreamText(raw.slice(sepIdx + sep.length));
          }
        }

        if (done) break;
      }

      setLastRun(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const insightBlocks = useMemo(
    () => parseInsightBlocks(streamText),
    [streamText]
  );

  const maxDayCount = useMemo(() => {
    const rows = metrics?.orders_by_day ?? [];
    return Math.max(1, ...rows.map((r) => r.count));
  }, [metrics]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Marketing insights
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Last 30 days performance and Claude-powered recommendations.
          </p>
          {lastRun && (
            <p className="mt-2 text-xs text-zinc-500">
              Last analysis:{" "}
              {lastRun.toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: PRIMARY }}
        >
          {loading ? "Analyzing…" : "Refresh analysis"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {metrics && (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Key metrics (30 days)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Orders"
                value={String(metrics.order_count)}
                sub="All non-cancelled in window"
              />
              <StatCard
                label="Revenue"
                value={`₹${metrics.revenue_inr.toLocaleString("en-IN")}`}
                sub="Sum of order totals"
              />
              <StatCard
                label="AOV"
                value={`₹${metrics.aov_inr.toLocaleString("en-IN")}`}
                sub="Revenue ÷ orders"
              />
              <StatCard
                label="RTO rate"
                value={`${metrics.rto_rate_percent}%`}
                sub={`${metrics.rto_count} RTO orders`}
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="COD vs prepaid"
                value={`${metrics.cod_percent}% / ${metrics.prepaid_percent}%`}
                sub="Share by order count"
              />
              <StatCard
                label="Repeat customers"
                value={String(metrics.repeat_customer_count)}
                sub={`First-time (1 order): ${metrics.first_time_customer_count}`}
              />
              <StatCard
                label="Coupon orders"
                value={`${metrics.coupon_order_percent}%`}
                sub={`${metrics.orders_with_coupon_count} orders with a code`}
              />
              <StatCard
                label="Period start"
                value={metrics.period_start_iso.slice(0, 10)}
                sub="UTC window"
              />
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">
              Top 5 products (units sold)
            </h2>
            {metrics.top_products.length === 0 ? (
              <p className="text-sm text-zinc-500">No variant line items in period.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {metrics.top_products.map((p, i) => (
                  <li
                    key={p.variant_id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0"
                  >
                    <div>
                      <span className="text-xs font-medium text-zinc-400">
                        #{i + 1}
                      </span>
                      <p className="font-medium text-zinc-900">{p.product_name}</p>
                      <p className="text-xs text-zinc-500">
                        {p.variant_name} · {p.sku}
                      </p>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: GOLD }}
                    >
                      {p.quantity_sold} sold
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">
              Coupon usage
            </h2>
            {metrics.coupon_breakdown.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No coupon codes recorded on orders this period.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500">
                      <th className="py-2 pr-4 font-medium">Code</th>
                      <th className="py-2 font-medium">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.coupon_breakdown.map((r) => (
                      <tr key={r.coupon_code} className="border-b border-zinc-50">
                        <td className="py-2 pr-4 font-medium text-zinc-900">
                          {r.coupon_code}
                        </td>
                        <td className="py-2 text-zinc-600">{r.order_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-zinc-900">
              Orders by day
            </h2>
            <div className="flex h-36 gap-px overflow-x-auto pb-1">
              {metrics.orders_by_day.map((d) => (
                <div
                  key={d.date}
                  className="flex h-full w-2 shrink-0 flex-col justify-end sm:w-2.5"
                  title={`${d.date}: ${d.count} orders`}
                >
                  <div
                    className="w-full min-h-px rounded-t"
                    style={{
                      height: `${(d.count / maxDayCount) * 100}%`,
                      backgroundColor: PRIMARY,
                      opacity: 0.88,
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {metrics.orders_by_day.length} days in window — hover a bar for the date
            </p>
          </section>
        </>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Claude recommendations
        </h2>
        {!metrics && !loading && !streamText && (
          <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
            Click <strong>Refresh analysis</strong> to pull live Supabase metrics
            and generate streaming insights.
          </p>
        )}
        {loading && !streamText && (
          <p className="text-sm text-zinc-500">Connecting to Claude…</p>
        )}
        {streamText && (
          <div className="space-y-4">
            {insightBlocks.length > 0
              ? insightBlocks.map((block, idx) => (
                  <article
                    key={`${idx}-${block.headline}`}
                    className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
                  >
                    <h3 className="text-base font-bold text-zinc-900">
                      {block.headline}
                    </h3>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-600">
                      {block.body}
                    </div>
                  </article>
                ))
              : (
                  <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-700">
                      {streamText}
                    </pre>
                    {loading && (
                      <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-zinc-400" />
                    )}
                  </div>
                )}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-bold text-zinc-900"
        style={{ color: PRIMARY }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{sub}</p>
    </div>
  );
}

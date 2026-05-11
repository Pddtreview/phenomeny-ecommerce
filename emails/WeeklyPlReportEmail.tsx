import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import type { WeeklyPlReport } from "@/lib/weekly-pl-report";

const tz = "Asia/Kolkata";

function inrDigits(n: number): string {
  return Math.round(n).toLocaleString("en-IN");
}

function InrRupee() {
  return (
    <span style={{ fontFamily: "Inter, sans-serif" }} aria-hidden>
      ₹
    </span>
  );
}

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const df = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: tz,
  });
  return `${df.format(start)} → ${df.format(end)}`;
}

type Props = { report: WeeklyPlReport };

export default function WeeklyPlReportEmail({ report }: Props) {
  const {
    periodStartIso,
    periodEndIso,
    totalOrders,
    grossRevenueInr,
    codOrders,
    prepaidOrders,
    rtoCount,
    newCustomers,
    repeatCustomers,
    topProducts,
    couponDiscountInr,
  } = report;

  const rangeLabel = formatRange(periodStartIso, periodEndIso);
  const topLines =
    topProducts.length > 0
      ? topProducts
          .map(
            (p, i) =>
              `${i + 1}. ${p.name} — INR ${inrDigits(p.revenue)}`
          )
          .join("\n")
      : "—";

  return (
    <Html>
      <Head />
      <Preview>
        {`INR ${inrDigits(grossRevenueInr)} revenue · ${totalOrders} orders · ${rangeLabel}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Nauvaraha — Weekly P&amp;L</Heading>
          <Text style={muted}>{rangeLabel} (rolling 7 days, IST dates)</Text>

          <Section style={metrics}>
            <Text style={metricLine}>
              <strong>Gross revenue (paid)</strong>
              <br />
              <InrRupee />
              {inrDigits(grossRevenueInr)}
            </Text>
            <Text style={metricLine}>
              <strong>Total orders</strong>
              <br />
              {totalOrders.toLocaleString("en-IN")}
            </Text>
            <Text style={metricLine}>
              <strong>COD / Prepaid orders</strong>
              <br />
              {codOrders.toLocaleString("en-IN")} /{" "}
              {prepaidOrders.toLocaleString("en-IN")}
            </Text>
            <Text style={metricLine}>
              <strong>RTO (orders placed in period)</strong>
              <br />
              {rtoCount.toLocaleString("en-IN")}
            </Text>
            <Text style={metricLine}>
              <strong>New / repeat customers</strong>
              <br />
              {newCustomers.toLocaleString("en-IN")} /{" "}
              {repeatCustomers.toLocaleString("en-IN")}
            </Text>
            <Text style={metricLine}>
              <strong>Coupon discounts</strong>
              <br />
              <InrRupee />
              {inrDigits(couponDiscountInr)}
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={label}>Top 3 products by revenue (paid orders)</Text>
          <Text style={preBlock}>{topLines}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            Revenue counts orders with payment status paid only. RTO reflects
            orders created in this window that currently have status RTO.
            New vs repeat compares this week&apos;s buyers to any earlier
            non-cancelled order.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "24px 16px 48px",
  maxWidth: "480px",
};

const h1 = {
  color: "#18181b",
  fontSize: "22px",
  fontWeight: "650" as const,
  margin: "0 0 8px",
  lineHeight: "1.3",
};

const muted = {
  color: "#71717a",
  fontSize: "13px",
  margin: "0 0 20px",
  lineHeight: "1.5",
};

const metrics = {
  margin: "0",
};

const metricLine = {
  color: "#27272a",
  fontSize: "15px",
  lineHeight: "1.55",
  margin: "0 0 14px",
};

const hr = {
  borderColor: "#e4e4e7",
  margin: "20px 0",
};

const label = {
  color: "#52525b",
  fontSize: "12px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  margin: "0 0 8px",
};

const preBlock = {
  color: "#27272a",
  fontSize: "14px",
  lineHeight: "1.55",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#a1a1aa",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};

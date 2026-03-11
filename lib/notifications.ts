const MSG91_FLOW_URL = "https://control.msg91.com/api/v5/flow";

function getAuthKey(): string {
  const key = process.env.MSG91_AUTH_KEY;
  if (!key) throw new Error("MSG91_AUTH_KEY is not set");
  return key;
}

function getFlowId(): string {
  return process.env.MSG91_FLOW_ID || "";
}

function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  return `91${digits}`;
}

/**
 * Send SMS via MSG91 Flow API.
 * Requires MSG91_AUTH_KEY and MSG91_FLOW_ID. Flow should have variable VAR1 or "message" for the text.
 */
export async function sendSMS(
  phone: string,
  message: string
): Promise<void> {
  const authkey = getAuthKey();
  const flowId = getFlowId();
  if (!flowId) {
    console.warn("MSG91_FLOW_ID not set; skipping SMS");
    return;
  }
  const res = await fetch(MSG91_FLOW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey,
    },
    body: JSON.stringify({
      flow_id: flowId,
      sender: process.env.MSG91_SENDER_ID || "NAUVAR",
      recipients: [
        {
          mobiles: toE164(phone),
          VAR1: message,
          message,
        },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MSG91 flow failed: ${res.status} ${text}`);
  }
}

export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  total: number
): Promise<void> {
  const message = `Dear customer, your Nauvarah order ${orderNumber} for ₹${total.toLocaleString("en-IN")} has been confirmed. Track at nauvarah.com/track/${orderNumber}. - Team Nauvarah`;
  await sendSMS(phone, message);
}

export async function sendShippingConfirmationSMS(
  phone: string,
  orderNumber: string,
  awb: string,
  courier: string
): Promise<void> {
  const message = `Your Nauvarah order ${orderNumber} has been shipped via ${courier}. AWB: ${awb}. Track at nauvarah.com/track/${orderNumber}`;
  await sendSMS(phone, message);
}

export async function sendDeliveryConfirmationSMS(
  phone: string,
  orderNumber: string
): Promise<void> {
  const message = `Your Nauvarah order ${orderNumber} has been delivered. Thank you for shopping with us! Share your experience.`;
  await sendSMS(phone, message);
}

export async function sendNDRSMS(
  phone: string,
  orderNumber: string
): Promise<void> {
  const message = `Delivery attempt failed for order ${orderNumber}. Please ensure someone is available. We will retry tomorrow.`;
  await sendSMS(phone, message);
}

// --- Email via Resend ---

function getResendKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return key;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Nauvarah <orders@nauvarah.com>";

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  items: { name: string; quantity: number; total_price: number }[],
  total: number,
  address: { line1: string; line2?: string; city: string; state: string; pincode: string }
): Promise<void> {
  if (!to || !to.includes("@")) return;
  const key = getResendKey();
  const itemsList = items
    .map((i) => `${i.name} x ${i.quantity} — ₹${Number(i.total_price).toLocaleString("en-IN")}`)
    .join("\n");
  const addr = [address.line1, address.line2, `${address.city}, ${address.state} ${address.pincode}`]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: `Order ${orderNumber} confirmed — Nauvarah`,
      html: `
        <h2>Order Confirmed</h2>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p><strong>Total: ₹${total.toLocaleString("en-IN")}</strong></p>
        <h3>Items</h3>
        <pre>${itemsList}</pre>
        <h3>Delivery address</h3>
        <pre>${addr}</pre>
        <p>Track your order: <a href="https://nauvarah.com/track/${orderNumber}">nauvarah.com/track/${orderNumber}</a></p>
        <p>— Team Nauvarah</p>
      `,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend failed: ${res.status} ${text}`);
  }
}

export async function sendShippingConfirmationEmail(
  to: string,
  orderNumber: string,
  awb: string,
  courier: string,
  trackingUrl?: string
): Promise<void> {
  if (!to || !to.includes("@")) return;
  const key = getResendKey();
  const trackLink = trackingUrl || `https://nauvarah.com/track/${orderNumber}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject: `Order ${orderNumber} shipped — Nauvarah`,
      html: `
        <h2>Your order has been shipped</h2>
        <p>Order <strong>${orderNumber}</strong> is on its way via <strong>${courier}</strong>.</p>
        <p>AWB: <strong>${awb}</strong></p>
        <p><a href="${trackLink}">Track your order</a></p>
        <p>— Team Nauvarah</p>
      `,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend failed: ${res.status} ${text}`);
  }
}

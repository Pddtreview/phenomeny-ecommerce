import { sendSMS as sendTwilioSMS, sendWhatsApp as sendTwilioWhatsApp } from "@/lib/twilio";

export async function sendSMS(phone: string, message: string): Promise<void> {
  await sendTwilioSMS(phone, message);
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<void> {
  await sendTwilioWhatsApp(phone, message);
}

export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string,
  total: number
): Promise<void> {
  const message = `Dear customer, your Nauvaraha order ${orderNumber} for INR ${total.toLocaleString("en-IN")} has been confirmed. Track at nauvaraha.com/track/${orderNumber}. - Team Nauvaraha`;
  await sendSMS(phone, message);
}

export async function sendOrderConfirmationWhatsApp(
  phone: string,
  orderNumber: string,
  total: number
): Promise<void> {
  const message = `Hi! Your Nauvarah order ${orderNumber} for Rs ${total.toLocaleString("en-IN")} is confirmed. Track: https://nauvarah.com/track/${orderNumber}`;
  await sendWhatsAppMessage(phone, message);
}

export async function sendShippingConfirmationSMS(
  phone: string,
  orderNumber: string,
  awb: string,
  courier: string
): Promise<void> {
  const message = `Your Nauvaraha order ${orderNumber} has been shipped via ${courier}. AWB: ${awb}. Track at nauvaraha.com/track/${orderNumber}`;
  await sendSMS(phone, message);
}

export async function sendShippingConfirmationWhatsApp(
  phone: string,
  orderNumber: string,
  awb: string,
  courier: string,
  trackingUrl?: string
): Promise<void> {
  const trackLink = trackingUrl || `https://nauvarah.com/track/${orderNumber}`;
  const message = `Your Nauvarah order ${orderNumber} has been shipped via ${courier}. AWB: ${awb}. Track here: ${trackLink}`;
  await sendWhatsAppMessage(phone, message);
}

export async function sendDeliveryConfirmationSMS(
  phone: string,
  orderNumber: string
): Promise<void> {
  const message = `Your Nauvaraha order ${orderNumber} has been delivered. Thank you for shopping with us! Share your experience.`;
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

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Nauvaraha <orders@nauvaraha.com>";

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  items: { name: string; quantity: number; total_price: number }[],
  total: number,
  address: { line1: string; line2?: string; city: string; state: string; pincode: string }
): Promise<void> {
  if (!to || !to.includes("@")) return;
  const key = getResendKey();
  const logoUrl =
    "https://res.cloudinary.com/dwhpxdp18/image/upload/v1776068357/Nauvaraha_golden_logo_kmgjir.png";
  const itemsList = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 0;color:#1A1A1A;font-size:14px;line-height:1.6;">${i.name}</td>
          <td style="padding:8px 0;color:#4A3F35;font-size:14px;line-height:1.6;text-align:center;">x${Number(i.quantity)}</td>
          <td style="padding:8px 0;color:#4A3F35;font-size:14px;line-height:1.6;text-align:right;"><span style="font-family:Inter,sans-serif">₹</span>${Number(i.total_price).toLocaleString("en-IN")}</td>
        </tr>`
    )
    .join("\n");
  const addr = [address.line1, address.line2, `${address.city}, ${address.state} ${address.pincode}`]
    .filter(Boolean)
    .join("<br/>");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      from: `Nauvaraha <${process.env.RESEND_FROM_EMAIL}>`,
      to: [to],
      subject: `Order Confirmed - ${orderNumber} | Nauvaraha`,
      html: `
        <div style="margin:0;padding:24px;background:#FFFFFF;font-family:Inter,Arial,sans-serif;color:#1A1A1A;">
          <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #f0ece6;border-radius:12px;padding:24px;">
            <div style="text-align:center;margin-bottom:16px;">
              <img src="${logoUrl}" alt="Nauvaraha" style="width:180px;height:auto;" />
            </div>
            <h2 style="margin:0 0 8px;font-size:28px;line-height:1.2;font-weight:600;color:#1A1A1A;">Thank you for your order!</h2>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4A3F35;">
              Your order has been confirmed. Order number:
              <strong style="color:#C8860A;"> ${orderNumber}</strong>
            </p>

            <h3 style="margin:20px 0 8px;font-size:16px;color:#1A1A1A;">Items Ordered</h3>
            <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee;border-bottom:1px solid #eee;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:10px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6f665c;">Item</th>
                  <th style="text-align:center;padding:10px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6f665c;">Qty</th>
                  <th style="text-align:right;padding:10px 0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6f665c;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <h3 style="margin:20px 0 8px;font-size:16px;color:#1A1A1A;">Delivery Address</h3>
            <p style="margin:0;font-size:14px;line-height:1.7;color:#4A3F35;">${addr}</p>

            <p style="margin:20px 0 0;font-size:16px;line-height:1.4;color:#1A1A1A;">
              <strong>Total Amount: <span style="color:#C8860A;"><span style="font-family:Inter,sans-serif">₹</span>${total.toLocaleString("en-IN")}</span></strong>
            </p>
            <p style="margin:12px 0 0;font-size:14px;line-height:1.7;color:#4A3F35;">
              Expected delivery: <strong>4-7 business days</strong>
            </p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#4A3F35;">
              Track your order at <a href="https://nauvaraha.com/track" style="color:#C8860A;">nauvaraha.com/track</a>
            </p>
            <p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#4A3F35;">
              Need help? Contact us at <a href="mailto:hello@nauvaraha.com" style="color:#C8860A;">hello@nauvaraha.com</a>
            </p>
          </div>
        </div>
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
      subject: `Order ${orderNumber} shipped — Nauvaraha`,
      html: `
        <h2>Your order has been shipped</h2>
        <p>Order <strong>${orderNumber}</strong> is on its way via <strong>${courier}</strong>.</p>
        <p>AWB: <strong>${awb}</strong></p>
        <p><a href="${trackLink}">Track your order</a></p>
        <p>— Team Nauvaraha</p>
      `,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend failed: ${res.status} ${text}`);
  }
}

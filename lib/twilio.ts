import twilio from "twilio";

function getTwilioConfig() {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const smsFrom = (process.env.TWILIO_SMS_FROM || "").trim();
  const whatsappFrom = (process.env.TWILIO_WHATSAPP_FROM || "").trim();

  return { accountSid, authToken, smsFrom, whatsappFrom };
}

function toE164India(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);
  if (!digits) return "";
  return `+91${digits}`;
}

function toWhatsAppAddress(phone: string): string {
  const e164 = toE164India(phone);
  return e164 ? `whatsapp:${e164}` : "";
}

export async function sendSMS(to: string, body: string): Promise<boolean> {
  const { accountSid, authToken, smsFrom } = getTwilioConfig();

  if (!accountSid || !authToken) {
    console.warn("Twilio SMS skipped: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing");
    return false;
  }
  if (!smsFrom) {
    console.warn("Twilio SMS skipped: TWILIO_SMS_FROM missing");
    return false;
  }

  const toPhone = toE164India(to);
  if (!toPhone) {
    console.warn("Twilio SMS skipped: invalid recipient phone", { to });
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      from: smsFrom,
      to: toPhone,
      body,
    });
    console.log("Twilio SMS sent", { sid: message.sid, to: toPhone });
    return true;
  } catch (error) {
    console.error("Twilio SMS failed", { to: toPhone, error });
    return false;
  }
}

export async function sendWhatsApp(to: string, body: string): Promise<boolean> {
  const { accountSid, authToken, whatsappFrom } = getTwilioConfig();

  if (!accountSid || !authToken) {
    console.warn(
      "Twilio WhatsApp skipped: TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN missing"
    );
    return false;
  }
  if (!whatsappFrom) {
    console.warn("Twilio WhatsApp skipped: TWILIO_WHATSAPP_FROM missing");
    return false;
  }

  const toWhatsApp = toWhatsAppAddress(to);
  if (!toWhatsApp) {
    console.warn("Twilio WhatsApp skipped: invalid recipient phone", { to });
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    const message = await client.messages.create({
      from: whatsappFrom,
      to: toWhatsApp,
      body,
    });
    console.log("Twilio WhatsApp sent", { sid: message.sid, to: toWhatsApp });
    return true;
  } catch (error) {
    console.error("Twilio WhatsApp failed", { to: toWhatsApp, error });
    return false;
  }
}

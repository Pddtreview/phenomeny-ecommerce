const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL?.trim();
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD?.trim();
const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

let cachedToken: string | null = null;
let tokenExpiry = 0;
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000; // 9 days

export type ShiprocketOrderItem = {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount: number;
  tax: string;
  hsn: string;
};

export type ShiprocketOrderPayload = {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id: string;
  billing_customer_name: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_country: string;
  billing_pincode: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: ShiprocketOrderItem[];
  payment_method: string;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
};

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
    throw new Error("SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set");
  }
  console.log("Shiprocket auth attempt - email:", SHIPROCKET_EMAIL);
  console.log("Shiprocket auth attempt - password length:", SHIPROCKET_PASSWORD?.length);
  console.log("Shiprocket auth attempt - password:", SHIPROCKET_PASSWORD);
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { token?: string };
  const token = data?.token;
  if (!token) throw new Error("Shiprocket auth: no token in response");
  cachedToken = token;
  tokenExpiry = Date.now() + TOKEN_TTL_MS;
  return token;
}

export async function authenticateShiprocket(): Promise<string> {
  return getToken();
}

export async function createShiprocketOrder(
  order: ShiprocketOrderPayload
): Promise<{ order_id: number; shipment_id: number }> {
  const token = await getToken();
  const payload = {
    ...order,
    billing_pincode: parseInt(order.billing_pincode, 10) || 0,
    billing_phone: parseInt(order.billing_phone.replace(/\D/g, "").slice(-10), 10) || 0,
  };
  const res = await fetch(`${BASE_URL}/orders/create/adhoc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket create order failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    order_id?: number;
    shipment_id?: number;
  };
  if (data.order_id == null || data.shipment_id == null) {
    throw new Error("Shiprocket create order: missing order_id or shipment_id");
  }
  return { order_id: data.order_id, shipment_id: data.shipment_id };
}

export async function assignCourier(
  shipment_id: string
): Promise<{ awb_code: string; courier_name: string }> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/courier/assign/awb`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [shipment_id] }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket assign courier failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    data?: { awb_code?: string; courier_name?: string };
    awb_code?: string;
    courier_name?: string;
  };
  const awb = data?.data?.awb_code ?? data?.awb_code ?? "";
  const courier = data?.data?.courier_name ?? data?.courier_name ?? "";
  return { awb_code: awb, courier_name: courier };
}

export async function generateLabel(
  shipment_id: string
): Promise<{ label_url: string }> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/courier/generate/label`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ shipment_id: [shipment_id] }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket generate label failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { label_url?: string; label_url_pdf?: string };
  const label_url = data?.label_url ?? data?.label_url_pdf ?? "";
  return { label_url };
}

export async function checkServiceability(
  pincode: string
): Promise<{ serviceable: boolean }> {
  const token = await getToken();
  const url = new URL(`${BASE_URL}/courier/serviceability`);
  url.searchParams.set("delivery_postcode", pincode);
  url.searchParams.set("cod", "1");
  url.searchParams.set("weight", "0.5");
  url.searchParams.set("pickup_postcode", "110001");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { serviceable: false };
  const data = (await res.json()) as { data?: { available_courier_companies?: unknown[] }; status?: number };
  const list = data?.data?.available_courier_companies;
  const serviceable = Array.isArray(list) && list.length > 0;
  return { serviceable };
}

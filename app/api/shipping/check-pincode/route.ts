import { NextRequest, NextResponse } from "next/server";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

async function getShiprocketToken(): Promise<string> {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;
  if (!email || !password) {
    throw new Error("SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD must be set");
  }
  const res = await fetch(`${SHIPROCKET_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shiprocket auth failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  const token = data?.token;
  if (!token) throw new Error("Shiprocket auth: no token in response");
  return token;
}

async function checkServiceability(
  token: string,
  pincode: string
): Promise<boolean> {
  const url = new URL(`${SHIPROCKET_BASE}/courier/serviceability/`);
  url.searchParams.set("pickup_postcode", "110001");
  url.searchParams.set("delivery_postcode", pincode);
  url.searchParams.set("weight", "0.5");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return false;
  const data = await res.json();
  const dataList = data?.data;
  const companies = Array.isArray(dataList)
    ? dataList
    : dataList?.available_courier_companies;
  return Array.isArray(companies) && companies.length > 0;
}

async function getCityStateFromPincode(
  pincode: string
): Promise<{ city: string; state: string }> {
  const res = await fetch(
    `https://api.postalpincode.in/pincode/${encodeURIComponent(pincode)}`
  );
  if (!res.ok) return { city: "", state: "" };
  const arr = await res.json();
  const first = arr?.[0];
  if (first?.Status !== "Success" || !first?.PostOffice?.length) {
    return { city: "", state: "" };
  }
  const po = first.PostOffice[0];
  return {
    city: po.District || po.Block || "",
    state: po.State || "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pincode = typeof body?.pincode === "string" ? body.pincode.trim() : "";
    if (!pincode || pincode.length !== 6) {
      return NextResponse.json(
        { serviceable: false, city: "", state: "" },
        { status: 400 }
      );
    }

    const token = await getShiprocketToken();
    const serviceable = await checkServiceability(token, pincode);
    const { city, state } = await getCityStateFromPincode(pincode);

    return NextResponse.json({
      serviceable,
      city,
      state,
    });
  } catch (e) {
    console.error("check-pincode error:", e);
    return NextResponse.json(
      { serviceable: false, city: "", state: "" },
      { status: 500 }
    );
  }
}

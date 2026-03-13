import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase-server";

type TrackOrderItem = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

type TrackOrderAddress = {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
};

type TrackOrder = {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string | null;
  total: number;
  awb_number: string | null;
  courier_name: string | null;
  tracking_url: string | null;
  address: TrackOrderAddress | null;
  items: TrackOrderItem[];
};

type TrackResponse =
  | {
      success: true;
      type: "order" | "phone";
      orders: TrackOrder[];
    }
  | {
      success: false;
      error: string;
    };

async function buildOrderPayload(orderRow: any) {
  const supabase = await createSupabaseServiceRoleClient();

  const { data: address } = await supabase
    .from("addresses")
    .select("name, phone, line1, line2, city, state, pincode")
    .eq("id", orderRow.address_id)
    .maybeSingle();

  const { data: items } = await supabase
    .from("order_items")
    .select("id, name, sku, quantity, unit_price, total_price")
    .eq("order_id", orderRow.id);

  const order: TrackOrder = {
    id: orderRow.id,
    order_number: orderRow.order_number,
    created_at: orderRow.created_at,
    order_status: orderRow.order_status,
    total: Number(orderRow.total ?? 0),
    awb_number: orderRow.awb_number ?? null,
    courier_name: orderRow.courier_name ?? null,
    tracking_url: orderRow.tracking_url ?? null,
    address: address
      ? {
          name: address.name,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2 ?? null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
        }
      : null,
    items: (items || []).map((it: any) => ({
      id: it.id,
      name: it.name,
      sku: it.sku ?? null,
      quantity: Number(it.quantity ?? 0),
      unit_price: Number(it.unit_price ?? 0),
      total_price: Number(it.total_price ?? 0),
    })),
  };

  return order;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderNumberRaw =
      typeof body?.orderNumber === "string" ? body.orderNumber.trim() : "";
    const phoneRaw =
      typeof body?.phone === "string" ? body.phone.replace(/\D/g, "") : "";

    if (!orderNumberRaw && !phoneRaw) {
      const res: TrackResponse = {
        success: false,
        error: "Provide orderNumber or phone",
      };
      return NextResponse.json(res, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();

    if (orderNumberRaw) {
      const { data: orderRow, error } = await supabase
        .from("orders")
        .select(
          "id, order_number, created_at, order_status, total, awb_number, courier_name, tracking_url, address_id"
        )
        .eq("order_number", orderNumberRaw)
        .maybeSingle();

      if (error || !orderRow) {
        const res: TrackResponse = {
          success: false,
          error: "Order not found",
        };
        return NextResponse.json(res, { status: 404 });
      }

      const order = await buildOrderPayload(orderRow);
      const res: TrackResponse = {
        success: true,
        type: "order",
        orders: [order],
      };
      return NextResponse.json(res, { status: 200 });
    }

    const normalized = phoneRaw.slice(-10);
    if (normalized.length !== 10) {
      const res: TrackResponse = {
        success: false,
        error: "Enter a valid 10 digit phone",
      };
      return NextResponse.json(res, { status: 400 });
    }

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    if (!customer) {
      const res: TrackResponse = {
        success: true,
        type: "phone",
        orders: [],
      };
      return NextResponse.json(res, { status: 200 });
    }

    const { data: orderRows, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, created_at, order_status, total, awb_number, courier_name, tracking_url, address_id"
      )
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("track orders by phone error:", error.message);
      const res: TrackResponse = {
        success: false,
        error: "Failed to load orders",
      };
      return NextResponse.json(res, { status: 500 });
    }

    const orders = await Promise.all(
      (orderRows || []).map((row: any) => buildOrderPayload(row))
    );

    const res: TrackResponse = {
      success: true,
      type: "phone",
      orders,
    };
    return NextResponse.json(res, { status: 200 });
  } catch (e) {
    console.error("track route error:", e);
    const res: TrackResponse = {
      success: false,
      error: "Server error",
    };
    return NextResponse.json(res, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: NextRequest) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const amount = Number(body?.amount);
    const receipt = typeof body?.receipt === "string" ? body.receipt : "";

    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await instance.orders.create({
      amount: Math.round(amount),
      currency: "INR",
      receipt: receipt || undefined,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency || "INR",
    });
  } catch (e) {
    console.error("Razorpay create-order error:", e);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

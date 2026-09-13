import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/configs/db";
import { UserSubscription } from "@/configs/schema";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email } = await req.json();

    if (!process.env.RAZORPAY_KEY_SECRET) {
       // Mock verification if keys are not configured
       if (razorpay_order_id === "mock_order_id") {
          await db.insert(UserSubscription).values({
             email: email,
             razorpayPaymentId: razorpay_payment_id,
             razorpayOrderId: razorpay_order_id,
             active: true,
             createdAt: new Date().toISOString(),
          });
          return NextResponse.json({ success: true });
       }
       return new NextResponse("Invalid Signature", { status: 400 });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      await db.insert(UserSubscription).values({
        email: email,
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        active: true,
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return new NextResponse("Invalid Signature", { status: 400 });
    }
  } catch (error) {
    console.error("[RAZORPAY_VERIFY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

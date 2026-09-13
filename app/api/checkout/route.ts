import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
       // Mock flow if keys are missing
       return NextResponse.json({ mock: true, url: "/dashboard?success=true" });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: 5000, // amount in the smallest currency unit (₹50.00 = 5000 paise)
      currency: "INR",
      receipt: `rcptid_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order });
  } catch (error) {
    console.log("[RAZORPAY_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

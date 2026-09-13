import { NextResponse } from "next/server";

export async function POST() {
  return new NextResponse("Stripe has been replaced with Razorpay.", { status: 400 });
}

import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import Subscriber from "@/models/Subscriber";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = subscribeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid email address", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    await connectDB();

    const existingSubscriber = await Subscriber.findOne({ email }).lean();
    if (existingSubscriber) {
      return NextResponse.json(
        { message: "Email already subscribed" },
        { status: 409 }
      );
    }

    await Subscriber.create({ email });

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}

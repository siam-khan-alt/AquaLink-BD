import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { getToken } from "next-auth/jwt";
import Subscriber from "@/models/Subscriber";
import { pusherServer } from "@/shared/lib/pusher";
import { z } from "zod";

const broadcastSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validationResult = broadcastSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid message", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { message } = validationResult.data;

    await connectDB();

    const subscribers = await Subscriber.find().lean();
    const subscriberEmails = subscribers.map((s) => s.email);

    if (subscriberEmails.length === 0) {
      return NextResponse.json(
        { message: "No subscribers to broadcast to" },
        { status: 200 }
      );
    }

    await pusherServer.trigger(
      "newsletter-broadcast",
      "new-broadcast",
      {
        message,
        recipientCount: subscriberEmails.length,
        recipients: subscriberEmails,
        sentAt: new Date().toISOString(),
      }
    );

    return NextResponse.json(
      {
        message: "Broadcast sent successfully",
        recipientCount: subscriberEmails.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error broadcasting message:", error);
    return NextResponse.json(
      { error: "Failed to broadcast message" },
      { status: 500 }
    );
  }
}

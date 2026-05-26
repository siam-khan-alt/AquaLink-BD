import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Transaction } from "@/models/Transaction";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { pusherServer } from "@/shared/lib/pusher";
import { Types } from "mongoose";
import { NotificationType, NotificationPriority, UserRole } from "@/models/Notification";
import { createNotification } from "@/shared/lib/notificationHelpers";

interface PaymentCallbackBody {
  tran_id: string;
  status: string;
}

async function sendConsultationNotification(farmerId: string, doctorId: string, farmerName: string, doctorName: string, specialization: string) {
  try {
    // Check if chat already exists between farmer and doctor
    let chat = await Chat.findOne({
      isGroup: false,
      isAdminSupport: false,
      participants: { $all: [farmerId, doctorId], $size: 2 },
    });

    // Create chat if it doesn't exist
    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        participants: [new Types.ObjectId(farmerId), new Types.ObjectId(doctorId)],
        isAdminSupport: false,
      });
    }

    // Send system message to doctor
    const messageText = `নতুন কনসালটেশন রিকোয়েস্ট: ${farmerName} আপনার সাথে ${specialization} বিষয়ে পরামর্শ নিতে চান। পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।`;
    
    const message = await Message.create({
      chatId: chat._id,
      sender: new Types.ObjectId(farmerId),
      text: messageText,
    });

    const messageData = {
      _id: (message._id as Types.ObjectId).toString(),
      chatId: message.chatId.toString(),
      sender: message.sender.toString(),
      text: message.text,
      createdAt: message.createdAt || new Date(),
    };

    await pusherServer.trigger(
      `chat-${chat._id.toString()}`,
      "new-message",
      messageData
    );

    console.log("Consultation notification sent successfully");
  } catch (error) {
    console.error("Error sending consultation notification:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      console.error("Unauthorized payment callback attempt: No session");
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=unauthorized", req.url)
      );
    }

    await connectDB();
    const body = await req.json() as PaymentCallbackBody;

    const { tran_id, status } = body;

    if (!tran_id || !status) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=invalid_response", req.url)
      );
    }

    const transaction = await Transaction.findOne({ transactionId: tran_id });

    if (!transaction) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=transaction_not_found", req.url)
      );
    }

    // IDOR Fix: Verify the authenticated user owns this transaction
    if (transaction.userId.toString() !== session.user.id) {
      console.error(`IDOR attempt: User ${session.user.id} tried to access transaction ${transaction._id} owned by ${transaction.userId}`);
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=unauthorized", req.url)
      );
    }

    if (status === "VALID" || status === "VALIDATED") {
      transaction.status = "paid";
      await transaction.save();

      // Send notification to doctor via Chat module
      if (transaction.doctorId && transaction.metadata) {
        const farmerName = (transaction.metadata.farmerName as string) || (session.user.name as string) || "চাষি";
        const doctorName = (transaction.metadata.doctorName as string) || "ডাক্তার";
        const doctorSpecialization = (transaction.metadata.doctorSpecialization as string) || "মৎস্য চাষ";
        
        await sendConsultationNotification(
          transaction.userId,
          transaction.doctorId,
          farmerName,
          doctorName,
          doctorSpecialization
        );

        // Create notification for doctor
        await createNotification({
          userId: transaction.doctorId.toString(),
          type: NotificationType.CONSULTATION_REQUEST,
          priority: NotificationPriority.HIGH,
          title: "নতুন কনসালটেশন রিকোয়েস্ট",
          message: `${farmerName} আপনার সাথে ${doctorSpecialization} বিষয়ে পরামর্শ নিতে চান। পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।`,
          link: "/dashboard/doctor/consultations",
          metadata: {
            farmerId: transaction.userId.toString(),
            farmerName,
            doctorId: transaction.doctorId.toString(),
            doctorName,
            specialization: doctorSpecialization,
            transactionId: transaction.transactionId,
          },
        });
      }

      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?success=true", req.url)
      );
    } else {
      transaction.status = "failed";
      await transaction.save();

      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=payment_failed", req.url)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error processing payment callback:", message);
    return NextResponse.redirect(
      new URL("/dashboard/farmer/experts?error=server_error", req.url)
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      console.error("Unauthorized payment callback attempt: No session");
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=unauthorized", req.url)
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const tran_id = searchParams.get("tran_id");
    const status = searchParams.get("status");

    if (!tran_id || !status) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=invalid_response", req.url)
      );
    }

    await connectDB();
    const transaction = await Transaction.findOne({ transactionId: tran_id });

    if (!transaction) {
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=transaction_not_found", req.url)
      );
    }

    // IDOR Fix: Verify the authenticated user owns this transaction
    if (transaction.userId.toString() !== session.user.id) {
      console.error(`IDOR attempt: User ${session.user.id} tried to access transaction ${transaction._id} owned by ${transaction.userId}`);
      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=unauthorized", req.url)
      );
    }

    if (status === "VALID" || status === "VALIDATED") {
      transaction.status = "paid";
      await transaction.save();

      // Send notification to doctor via Chat module
      if (transaction.doctorId && transaction.metadata) {
        const farmerName = (transaction.metadata.farmerName as string) || (session.user.name as string) || "চাষি";
        const doctorName = (transaction.metadata.doctorName as string) || "ডাক্তার";
        const doctorSpecialization = (transaction.metadata.doctorSpecialization as string) || "মৎস্য চাষ";
        
        await sendConsultationNotification(
          transaction.userId,
          transaction.doctorId,
          farmerName,
          doctorName,
          doctorSpecialization
        );

        // Create notification for doctor
        await createNotification({
          userId: transaction.doctorId.toString(),
          type: NotificationType.CONSULTATION_REQUEST,
          priority: NotificationPriority.HIGH,
          title: "নতুন কনসালটেশন রিকোয়েস্ট",
          message: `${farmerName} আপনার সাথে ${doctorSpecialization} বিষয়ে পরামর্শ নিতে চান। পেমেন্ট সফলভাবে সম্পন্ন হয়েছে।`,
          link: "/dashboard/doctor/consultations",
          metadata: {
            farmerId: transaction.userId.toString(),
            farmerName,
            doctorId: transaction.doctorId.toString(),
            doctorName,
            specialization: doctorSpecialization,
            transactionId: transaction.transactionId,
          },
        });
      }

      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?success=true", req.url)
      );
    } else {
      transaction.status = "failed";
      await transaction.save();

      return NextResponse.redirect(
        new URL("/dashboard/farmer/experts?error=payment_failed", req.url)
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error processing payment callback:", message);
    return NextResponse.redirect(
      new URL("/dashboard/farmer/experts?error=server_error", req.url)
    );
  }
}

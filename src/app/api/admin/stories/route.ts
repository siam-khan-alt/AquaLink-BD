import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { FarmerStory } from "@/models/FarmerStory";
import { z } from "zod";
import { logAuditEvent } from "@/shared/lib/audit-logger";

const createStorySchema = z.object({
  farmerName: z.string().min(2, "চাষির নাম অবশ্যই দিতে হবে"),
  location: z.string().min(2, "অবস্থান অবশ্যই দিতে হবে"),
  title: z.string().min(5, "শিরোনাম অবশ্যই দিতে হবে"),
  description: z.string().min(20, "বিবরণ কমপক্ষে ২০ অক্ষর হতে হবে"),
  thumbnail: z.string().optional(),
  achievement: z.string().min(2, "অর্জন অবশ্যই দিতে হবে"),
  
  contentType: z.string().refine((val): val is "video" | "text" => val === "video" || val === "text", {
    message: "ক্যাটাগরি সিলেক্ট করুন",
  }),

  videoUrl: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const stories = await FarmerStory.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, stories }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const parsedData = createStorySchema.parse(body);

    if (parsedData.isFeatured) {
      const activeFeaturedCount = await FarmerStory.countDocuments({
        isFeatured: true,
        contentType: parsedData.contentType
      });

      if (parsedData.contentType === "video" && activeFeaturedCount >= 4) {
        return NextResponse.json({ error: "হোম পেজের জন্য ইতিমধ্যে ৪টি ভিডিও সিলেক্ট করা আছে! যেকোনো একটি আন-ফিচারড করুন।" }, { status: 400 });
      }
      if (parsedData.contentType === "text" && activeFeaturedCount >= 2) {
        return NextResponse.json({ error: "হোম পেজের জন্য ইতিমধ্যে ২টি টেক্সট স্টোরি সিলেক্ট করা আছে! যেকোনো একটি আন-ফিচারড করুন।" }, { status: 400 });
      }
    }

    let finalVideoUrl = parsedData.videoUrl || "";
    if (parsedData.contentType === "video" && finalVideoUrl) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = finalVideoUrl.match(regExp);
      if (match && match[2].length === 11) {
        finalVideoUrl = match[2]; 
      }
    }

    const newStory = await FarmerStory.create({
      ...parsedData,
      videoUrl: finalVideoUrl,
      thumbnail: parsedData.thumbnail || (parsedData.contentType === "video" ? `https://img.youtube.com/vi/${finalVideoUrl}/maxresdefault.jpg` : "/images/stories/default.jpg"),
    });

    // Log audit event for story creation
    await logAuditEvent({
      userId: session.user.id as string,
      userRole: session.user.role as string,
      action: 'create_story',
      resource: 'farmer_story',
      resourceId: newStory._id.toString(),
      method: 'POST',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: { contentType: parsedData.contentType, isFeatured: parsedData.isFeatured },
    });

    return NextResponse.json({ success: true, story: newStory }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error creating story:", message);
    
    // Log failed audit event
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      await logAuditEvent({
        userId: session.user.id as string,
        userRole: session.user.role as string,
        action: 'create_story',
        resource: 'farmer_story',
        method: 'POST',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: message,
      });
    }

    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}
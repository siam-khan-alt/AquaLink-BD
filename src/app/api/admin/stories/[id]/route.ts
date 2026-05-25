import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { FarmerStory } from "@/models/FarmerStory";
import { z } from "zod";

const updateStorySchema = z.object({
  farmerName: z.string().min(2, "চাষির নাম অবশ্যই দিতে হবে"),
  location: z.string().min(2, "অবস্থান অবশ্যই দিতে হবে"),
  title: z.string().min(5, "শিরোনাম অবশ্যই দিতে হবে"),
  description: z.string().min(20, "বিবরণ কমপক্ষে ২০ অক্ষর হতে হবে"),
  thumbnail: z.string().optional().or(z.literal("")),
  achievement: z.string().min(2, "অর্জন অবশ্যই দিতে হবে"),
  contentType: z.string().refine((val): val is "video" | "text" => val === "video" || val === "text", {
    message: "ক্যাটাগরি সিলেক্ট করুন",
  }),
  videoUrl: z.string().optional().or(z.literal("")),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "আইডি পাওয়া যায়নি" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const parsedData = updateStorySchema.parse(body);

    const existingStory = await FarmerStory.findById(id);
    if (!existingStory) {
      return NextResponse.json({ error: "গল্পটি খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    if (parsedData.isFeatured && (!existingStory.isFeatured || existingStory.contentType !== parsedData.contentType)) {
      const activeFeaturedCount = await FarmerStory.countDocuments({
        _id: { $ne: id },
        isFeatured: true,
        contentType: parsedData.contentType,
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

    let finalThumbnail = parsedData.thumbnail || existingStory.thumbnail;
    if (!parsedData.thumbnail && parsedData.contentType === "video" && finalVideoUrl) {
      finalThumbnail = `https://img.youtube.com/vi/${finalVideoUrl}/maxresdefault.jpg`;
    }

    const updatedStory = await FarmerStory.findByIdAndUpdate(
      id,
      {
        ...parsedData,
        videoUrl: finalVideoUrl,
        thumbnail: finalThumbnail,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, story: updatedStory }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown Error";
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const deletedStory = await FarmerStory.findByIdAndDelete(id);
    if (!deletedStory) {
      return NextResponse.json({ error: "গল্পটি খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "গল্পটি সফলভাবে ডিলিট করা হয়েছে" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}
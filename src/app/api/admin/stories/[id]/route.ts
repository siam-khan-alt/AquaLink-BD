import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { FarmerStory } from "@/models/FarmerStory";
import { z } from "zod";
import { logAuditEvent } from "@/shared/lib/audit-logger";
import { requirePermission, forbiddenResponse } from "@/shared/lib/require-permission";

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
  const { id } = await params;
  
  try {
    // Permission check using requirePermission
    const permissionCheck = await requirePermission(req, 'stories:write');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    if (!id) {
      return NextResponse.json({ error: "আইডি পাওয়া যায়নি" }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    const parsedData = updateStorySchema.parse(body);

    const existingStory = await FarmerStory.findById(id).lean();
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

    // Log audit event for story update
    await logAuditEvent({
      userId: permissionCheck.user!.id,
      userRole: permissionCheck.user!.role,
      action: 'update_story',
      resource: 'farmer_story',
      resourceId: id,
      method: 'PATCH',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: {
        title: parsedData.title,
        isPublished: parsedData.isPublished,
        isFeatured: parsedData.isFeatured,
      },
    });

    return NextResponse.json({ success: true, story: updatedStory }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unknown Error";
    
    // Log failed audit event
    const permissionCheck = await requirePermission(req, 'stories:write');
    if (permissionCheck.success && permissionCheck.user?.id) {
      await logAuditEvent({
        userId: permissionCheck.user.id,
        userRole: permissionCheck.user.role,
        action: 'update_story',
        resource: 'farmer_story',
        resourceId: id,
        method: 'PATCH',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: message,
      });
    }
    
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    // Permission check using requirePermission
    const permissionCheck = await requirePermission(req, 'stories:delete');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    await connectDB();

    const deletedStory = await FarmerStory.findByIdAndDelete(id);
    if (!deletedStory) {
      return NextResponse.json({ error: "গল্পটি খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    // Log audit event for story deletion
    await logAuditEvent({
      userId: permissionCheck.user!.id,
      userRole: permissionCheck.user!.role,
      action: 'delete_story',
      resource: 'farmer_story',
      resourceId: id,
      method: 'DELETE',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
      metadata: {
        storyTitle: deletedStory.title,
        contentType: deletedStory.contentType,
      },
    });

    return NextResponse.json({ success: true, message: "গল্পটি সফলভাবে ডিলিট করা হয়েছে" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    
    // Log failed audit event
    const permissionCheck = await requirePermission(req, 'stories:delete');
    if (permissionCheck.success && permissionCheck.user?.id) {
      await logAuditEvent({
        userId: permissionCheck.user.id,
        userRole: permissionCheck.user.role,
        action: 'delete_story',
        resource: 'farmer_story',
        resourceId: id,
        method: 'DELETE',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage: message,
      });
    }
    
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}
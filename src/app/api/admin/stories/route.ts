import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { FarmerStory } from "@/models/FarmerStory";
import { z } from "zod";

const createStorySchema = z.object({
  farmerName: z.string().min(2, "চাষির নাম অবশ্যই দিতে হবে"),
  location: z.string().min(2, "অবস্থান অবশ্যই দিতে হবে"),
  title: z.string().min(5, "শিরোনাম অবশ্যই দিতে হবে"),
  description: z.string().min(20, "বিবরণ অবশ্যই দিতে হবে"),
  thumbnail: z.string().optional(),
  achievement: z.string().min(2, "অর্জন অবশ্যই দিতে হবে"),
  isPublished: z.boolean().default(true),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();

    const stories = await FarmerStory.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { success: true, stories },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching stories:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const parsedData = createStorySchema.parse(body);

    const newStory = await FarmerStory.create({
      farmerName: parsedData.farmerName,
      location: parsedData.location,
      title: parsedData.title,
      description: parsedData.description,
      thumbnail: parsedData.thumbnail || "/images/stories/default.jpg",
      achievement: parsedData.achievement,
      isPublished: parsedData.isPublished,
    });

    return NextResponse.json(
      { success: true, story: newStory },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error creating story:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { Course } from "@/models/Course";
import Enrollment from "@/models/Enrollment";
import { Types } from "mongoose";
import { z } from "zod";

const createCourseSchema = z.object({
  title: z.string().min(1, "কোর্সের শিরোনাম অবশ্যই দিতে হবে"),
  description: z.string().min(1, "কোর্সের বিবরণ অবশ্যই দিতে হবে"),
  videoUrl: z.string().url("সঠিক ভিডিও URL প্রদান করুন"),
  price: z.number().min(0, "মূল্য ০ এর চেয়ে বেশি হতে হবে"),
  category: z.string().min(1, "ক্যাটাগরি অবশ্যই দিতে হবে"),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();

    const courses = await Course.find().sort({ createdAt: -1 });

    let coursesWithEnrollmentStatus = courses.map((course) => ({
      ...course.toObject(),
      isEnrolled: false,
    }));

    if (session && session.user?.id) {
      const userId = session.user.id as string;
      const enrollments = await Enrollment.find({
        userId: new Types.ObjectId(userId),
        paymentStatus: "paid",
      });

      const enrolledCourseIds = new Set(
        enrollments.map((e: { courseId: Types.ObjectId }) => e.courseId.toString())
      );

      coursesWithEnrollmentStatus = courses.map((course) => ({
        ...course.toObject(),
        isEnrolled: enrolledCourseIds.has(course._id.toString()),
      }));
    }

    return NextResponse.json(
      { success: true, courses: coursesWithEnrollmentStatus },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching courses:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const parsedData = createCourseSchema.parse(body);

    const newCourse = await Course.create({
      title: parsedData.title,
      description: parsedData.description,
      videoUrl: parsedData.videoUrl,
      price: parsedData.price,
      category: parsedData.category,
    });

    return NextResponse.json(
      { success: true, course: newCourse },
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
    console.error("Error creating course:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

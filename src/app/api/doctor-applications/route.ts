import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { DoctorApplication } from "@/models/DoctorApplication";
import { z } from "zod";

const applicationSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  email: z.string().email("সঠিক ইমেইল দিন"),
  phone: z.string().min(11, "সঠিক ফোন নম্বর দিন"),
  degree: z.string().min(2, "ডিগ্রি দিন"),
  specialization: z.string().min(2, "বিশেষীকরণ দিন"),
  licenseNumber: z.string().min(5, "লাইসেন্স নম্বর দিন"),
  experience: z.number().min(0, "অভিজ্ঞতা দিন"),
  consultationFee: z.number().min(0, "কনসালটেশন ফি দিন"),
  bio: z.string().min(10, "বায়োগ্রাফি কমপক্ষে ১০ অক্ষরের হতে হবে").max(1000, "বায়োগ্রাফি ১০০০ অক্ষরের বেশি হতে পারবে না"),
  district: z.string().optional(),
  division: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = applicationSchema.parse(body);

    await connectDB();

    // Check if application already exists with this email
    const existingApplication = await DoctorApplication.findOne({ email: validatedData.email });
    if (existingApplication) {
      return NextResponse.json(
        { error: "এই ইমেইল দিয়ে ইতিমধ্যে আবেদন করা হয়েছে" },
        { status: 400 }
      );
    }

    // Check if license number already exists
    const existingLicense = await DoctorApplication.findOne({ licenseNumber: validatedData.licenseNumber });
    if (existingLicense) {
      return NextResponse.json(
        { error: "এই লাইসেন্স নম্বর দিয়ে ইতিমধ্যে আবেদন করা হয়েছে" },
        { status: 400 }
      );
    }

    // Create new application
    const application = await DoctorApplication.create({
      ...validatedData,
      status: "pending",
    });

    return NextResponse.json(
      { 
        message: "আবেদন সফলভাবে জমা হয়েছে",
        applicationId: application._id 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating doctor application:", error);
    return NextResponse.json(
      { error: "আবেদন জমা দিতে ব্যর্থ হয়েছে" },
      { status: 500 }
    );
  }
}

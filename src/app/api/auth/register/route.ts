import { z } from "zod";
import { connectDB } from "@/shared/lib/db";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষরের হতে হবে"),
  phone: z.string().regex(/^01[3-9]\d{8}$/, "সঠিক বাংলাদেশী নাম্বার দিন").optional(),
  email: z.string().email("সঠিক ইমেইল দিন").optional(),
  password: z.string().min(6, "পাসওয়ার্ড কমপক্ষে ৬ ডিজিটের হতে হবে"),
  image: z.string().url("সঠিক ইমেজ URL দিন").optional(),
}).refine((data) => data.phone || data.email, {
  message: "ফোন বা ইমেইল অন্তত একটি প্রয়োজন",
  path: ["phone"],
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parsedData = registerSchema.parse(body);

    // Build query conditions
    const queryConditions: any[] = [];
    if (parsedData.phone) {
      queryConditions.push({ phone: parsedData.phone });
    }
    if (parsedData.email) {
      queryConditions.push({ email: parsedData.email });
    }

    // Check if user already exists with phone or email
    const existingUser = queryConditions.length > 0
      ? await User.findOne({ $or: queryConditions })
      : null;

    if (existingUser) {
      if (existingUser.phone === parsedData.phone) {
        return NextResponse.json(
          { error: "এই নাম্বারটি ইতিমধ্যে ব্যবহার করা হয়েছে" },
          { status: 400 }
        );
      }
      if (existingUser.email === parsedData.email) {
        return NextResponse.json(
          { error: "এই ইমেইলটি ইতিমধ্যে ব্যবহার করা হয়েছে" },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(parsedData.password, 12);
    
    await User.create({
      name: parsedData.name,
      phone: parsedData.phone,
      email: parsedData.email,
      password: hashedPassword,
      image: parsedData.image,
      role: "farmer",
      isVerified: true,
    });

    return NextResponse.json(
      { message: "অ্যাকাউন্ট তৈরি সফল" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json(
      { error: "সার্ভারে সমস্যা হচ্ছে: " + message },
      { status: 500 }
    );
  }
}
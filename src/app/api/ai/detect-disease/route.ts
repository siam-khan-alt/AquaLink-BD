import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `তুমি 'মৎস্য বন্ধু' এআই রোগ বিশেষজ্ঞ। তোমার কাজ চাষির পাঠানো মাছের ছবি বিশ্লেষণ করে রোগের নাম, সম্ভাব্য কারণ, চিকিৎসা এবং উপযুক্ত ওষুধের নাম ২-৩ লাইনের সহজ বাংলায় প্রদান করা। সবশেষে বাধ্যতামূলকভাবে এই লাইনটি যোগ করবে: 'বিশেষজ্ঞ বা অভিজ্ঞ মৎস্য কর্মকর্তার পরামর্শ নিয়ে ওষুধ প্রয়োগ করুন।'`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { image, prompt } = body;

    if (!image) {
      return NextResponse.json(
        { error: "ছবি প্রদান করতে হবে" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const imageData = image.startsWith("data:")
      ? image
      : `data:image/jpeg;base64,${image}`;

    const imagePart = {
      inlineData: {
        data: imageData.split(",")[1],
        mimeType: "image/jpeg",
      },
    };

    const userPrompt = prompt || "এই মাছের ছবি বিশ্লেষণ করে রোগ নির্ণয় করুন।";

    const result = await model.generateContent([userPrompt, imagePart]);
    const response = await result.response;
    const diagnosis = response.text();

    if (!diagnosis) {
      return NextResponse.json(
        { error: "বিশ্লেষণ করতে ব্যর্থ হয়েছে" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, diagnosis },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error in disease detection:", message);

    if (message.includes("429") || message.includes("quota")) {
      return NextResponse.json(
        { error: "API quota exhausted. পরে আবার চেষ্টা করুন।" },
        { status: 429 }
      );
    }

    if (message.includes("timeout") || message.includes("ETIME")) {
      return NextResponse.json(
        { error: "সময় শেষ হয়েছে। আবার চেষ্টা করুন।" },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "বিশ্লেষণ করতে ব্যর্থ হয়েছে: " + message },
      { status: 500 }
    );
  }
}

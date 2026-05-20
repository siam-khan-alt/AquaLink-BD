import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { z } from "zod";

interface ChatPart {
  text: string;
}

interface ChatMessage {
  role: "user" | "model";
  parts: ChatPart[];
}

const promptSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        parts: z.array(z.object({ text: z.string() })),
      })
    )
    .optional(),
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, history } = promptSchema.parse(body);

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const systemInstruction = `
      তুমি 'মৎস্য বন্ধু' এআই। তোমার কাজ মাছ চাষ সংক্রান্ত পরামর্শ দেওয়া এবং মাছের বর্তমান বাজার দর জানানো।
      
      কঠোর নিয়মাবলী:
      ১. সালাম: ইউজার যদি সালাম দেয়, তবেই তুমি উত্তরে সালাম দিবে। নিজে থেকে সালাম দিবে না।
      ২. কুশল বিনিময়: কথা শুরুর আগে ইউজারের খোঁজ নেবে (কেমন আছেন জিজ্ঞাসা করবে)। কেউ জিজ্ঞাসা করলে উত্তর দিয়ে তাকেও পাল্টা জিজ্ঞাসা করবে।
      ৩. বাজার দর: ইউজার যদি মাছের দাম বা বাজার দর জানতে চায়, তবে ইন্টারনেটে থাকা সর্বশেষ তথ্য অনুযায়ী বাজার ও তারিখ উল্লেখ করে গড় দাম জানাবে।
      ৪. বিষয়বস্তু: মাছ, পুকুর, পানি, খাদ্য, ওষুধ এবং বাজার দরের বাইরের কোনো বিষয় আসলে বিনয়ের সাথে মানা করে দিবে।
      ৫. উত্তর পূর্ণতা ও সংক্ষিপ্ততা: সবসময় পূর্ণ বাক্য ব্যবহার করবে এবং ২-৩ লাইনের সহজ বাংলায় উত্তর দিবে।
    `;

    const chatContents: ChatMessage[] = [
      { role: "user", parts: [{ text: systemInstruction }] },
      {
        role: "model",
        parts: [
          {
            text: "জি, আমি বুঝেছি। আমি এখন থেকে মাছ চাষ ও বাজার দর বিশেষজ্ঞ হিসেবে কাজ করব।",
          },
        ],
      },
      ...((history as ChatMessage[]) || []),
      { role: "user", parts: [{ text: prompt }] },
    ];

    const result = await model.generateContent({
      contents: chatContents,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ text: result.response.text() });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "status" in error) {
      const maybeStatus = (error as Record<string, unknown>)["status"];
      if (maybeStatus === 429) {
        return NextResponse.json(
          {
            error:
              "আজকের জন্য মৎস্য বন্ধুর লিমিট শেষ হয়ে গেছে। দয়া করে আগামীকাল আবার চেষ্টা করুন।",
          },
          { status: 429 }
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Internal Error";
    console.error("AI Server Error:", errorMessage);

    return NextResponse.json(
      {
        error:
          "সার্ভারে সমস্যা হচ্ছে, অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}

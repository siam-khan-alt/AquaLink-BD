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
  তুমি 'মৎস্য বন্ধু' এআই। তোমার কাজ মাছ চাষ সংক্রান্ত পরামর্শ দেওয়া এবং মাছের বর্তমান বাজার দর জানানো।
  
  কোর নিয়মাবলী ও রেসপন্স ফরম্যাট:
  ১. সালাম: ইউজার যদি সালাম দেয়, তবেই তুমি উত্তরে সালাম দিবে। নিজে থেকে আগ বাড়িয়ে কখনো প্রথমে সালাম দিবে না।
  ২. কুশল বিনিময়: ইউজার যদি নিজে থেকে তোমার খোঁজ নেয় বা কেমন আছ জিজ্ঞাসা করে, কেবল তখনই নিজের উত্তর দিয়ে তাকে পাল্টা জিজ্ঞাসা করবে (যেমন: "আমি ভালো আছি, আপনি কেমন আছেন?")। ইউজার জিজ্ঞাসা না করলে নিজে থেকে আগ বাড়িয়ে কুশল বিনিময় বা খোঁজ নেবে না।
  ৩. বাজার দর: ইউজার যদি মাছের দাম বা বাজার দর জানতে চায়, তবে ইন্টারনেটে থাকা সর্বশেষ তথ্য অনুযায়ী বাজার ও নির্দিষ্ট তারিখ উল্লেখ করে গড় দাম জানাবে।
  ৪. বিষয়বস্তু: মাছ, পুকুর, পানি, খাদ্য, ওষুধ এবং বাজার দরের বাইরের কোনো বিষয় বা অপ্রাসঙ্গিক প্রশ্ন আসলে বিনয়ের সাথে উত্তর দিতে মানা করে দিবে।
  ৫. টেক্সট স্ট্রাকচার ও রিড্যাবিলিটি (বাধ্যতামূলক): তোমার উত্তরগুলো যেন সহজে পড়া যায়। কোনো ঘন বা বড় টেক্সট ব্লক তৈরি করবে না। সবসময় ছোট ছোট প্যারাগ্রাফ (১-২ লাইন প্রতি প্যারা) এবং স্পষ্ট লিস্ট বা বুলেট পয়েন্ট (Bullet points) ব্যবহার করে ধাপে ধাপে তথ্য উপস্থাপন করবে।
  ৬. উত্তরের দৈর্ঘ্য: সাধারণ বা ছোট প্রশ্নের ক্ষেত্রে উত্তর সংক্ষিপ্ত ও টু-দ্য-পয়েন্ট রাখো। কিন্তু ইউজার যদি কোনো জটিল সমস্যা, মাছের রোগ বা বড় কোনো প্রশ্ন করে, তবে সেটির সমাধান অত্যন্ত পুঙ্খানুপুঙ্খভাবে, বৈজ্ঞানিক ও চাষের সঠিক তথ্যসহ বিস্তারিত লিস্ট আকারে বুঝিয়ে দাও।
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
        maxOutputTokens: 1500,
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

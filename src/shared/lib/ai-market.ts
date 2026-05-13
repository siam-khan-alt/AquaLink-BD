import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedFishData } from "@/shared/types/market";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function fetchMarketDataWithAI(): Promise<ScrapedFishData[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

 const targetFishes = [
    "রুই (১ কেজি)", "কাতলা (১ কেজি)", "মৃগেল (১ কেজি)", "সিলভার কার্প (১ কেজি)", 
    "পাঙাশ (১ কেজি)", "শিং (১ কেজি)", "মাগুর (১ কেজি)", "আইড় (১ কেজি)", 
    "বোয়াল (১ কেজি)", "পাবদা (১ কেজি)", "গুলশা (১ কেজি)", "গলদা চিংড়ি (১ কেজি)", 
    "বাগদা চিংড়ি (১ কেজি)", "তেলাপিয়া (১ কেজি)", "ইলিশ (৫০০-৭০০ গ্রাম সাইজ - প্রতি কেজি)", 
    "ইলিশ (১ কেজি+ সাইজ - প্রতি কেজি)", "রূপচাঁদা (১ কেজি)", "বাইম (১ কেজি)", 
    "শোল (১ কেজি)", "টেংরা (১ কেজি)", "পুঁটি (১ কেজি)", "মলা (১ কেজি)"
  ];

  const prompt = `
    তুমি একজন অভিজ্ঞ মৎস্য বাজার বিশ্লেষক। বর্তমানে বাংলাদেশের (বিশেষ করে ঢাকা ও কারওয়ান বাজার) পাইকারি বাজারের মাছের দামের একটি নির্ভুল JSON ডাটা তৈরি করো।
    
    নির্দেশনা:
    - সব মাছের দাম অবশ্যই প্রতি ১ কেজি (1 KG) হিসেবে হতে হবে।
    - মাছের নামগুলো হুবহু নিচের তালিকা অনুযায়ী হতে হবে:
      ${targetFishes.join(", ")}
    - ক্যাটাগরি অবশ্যই 'carp', 'catfish', 'prawn', 'others' এর মধ্যে হতে হবে।
    - শুধুমাত্র JSON অ্যারে প্রদান করো (কোনো অতিরিক্ত টেক্সট ছাড়া)।

    JSON ফরম্যাট: 
    [
      {"fishName": "রুই (১ কেজি)", "price": 350, "location": "Dhaka Wholesale Market", "category": "carp"},
      ...
    ]
  `;
  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      console.error("No JSON match found in AI response");
      return [];
    }

    const data: ScrapedFishData[] = JSON.parse(jsonMatch[0]);
    return data;
  } catch (error) {
    console.error("AI Market Fetch Error:", error);
    return [];
  }
}
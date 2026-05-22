import { NextResponse } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { FarmerStory } from "@/models/FarmerStory";

const SEED_DATA = [
  {
    farmerName: "আব্দুল করিম",
    location: "যশোর",
    title: "রুই মাছ চাষে সাফল্যের গল্প",
    description: "৫ বিঘা পুকুরে আধুনিক পদ্ধতিতে রুই মাছ চাষ করে বছরে ১৫ লাখ টাকা লাভ করেছেন আব্দুল করিম।",
    thumbnail: "/images/stories/story-1.jpg",
    achievement: "১৫ লাখ টাকা লাভ"
  },
  {
    farmerName: "রহিমা বেগম",
    location: "মুন্সিগঞ্জ",
    title: "গলদা চিংড়ি চাষে নারী উদ্যোক্তা",
    description: "রহিমা বেগম গলদা চিংড়ি চাষ করে এলাকার অন্যতম সফল নারী উদ্যোক্তা হিসেবে পরিচিতি পেয়েছেন।",
    thumbnail: "/images/stories/story-2.jpg",
    achievement: "২০ লাখ টাকা বার্ষিক আয়"
  },
  {
    farmerName: "মোহাম্মদ আলী",
    location: "কুমিল্লা",
    title: "পাঙাশ চাষে বিপ্লব",
    description: "আধুনিক প্রযুক্তি ব্যবহার করে পাঙাশ চাষে নতুন দিগন্ত সৃষ্টি করেছেন মোহাম্মদ আলী।",
    thumbnail: "/images/stories/story-3.jpg",
    achievement: "২৫ লাখ টাকা লাভ"
  },
  {
    farmerName: "ফাতেমা খাতুন",
    location: "পাবনা",
    title: "মিশ্র মাছ চাষের সাফল্য",
    description: "ফাতেমা খাতুন মিশ্র মাছ চাষ করে ঝুঁকি কমিয়ে লাভবান হচ্ছেন।",
    thumbnail: "/images/stories/story-4.jpg",
    achievement: "১৮ লাখ টাকা আয়"
  },
  {
    farmerName: "হাসান মাহমুদ",
    location: "বগুড়া",
    title: "কার্প মাছের উন্নত জাত",
    description: "উন্নত জাতের কার্প মাছ চাষ করে হাসান মাহমুদ এলাকায় আদর্শ হয়ে উঠেছেন।",
    thumbnail: "/images/stories/story-5.jpg",
    achievement: "২২ লাখ টাকা লাভ"
  },
  {
    farmerName: "জাহানারা বেগম",
    location: "নওগাঁ",
    title: "তেলাপিয়া চাষে নারী নেতৃত্ব",
    description: "জাহানারা বেগম তেলাপিয়া চাষ করে নারীদের জন্য অনুপ্রেরণা হয়ে উঠেছেন।",
    thumbnail: "/images/stories/story-6.jpg",
    achievement: "১২ লাখ টাকা আয়"
  }
];

export async function GET() {
  try {
    await connectDB();
    
    const count = await FarmerStory.countDocuments();
    
    if (count === 0) {
      await FarmerStory.insertMany(SEED_DATA);
    }
    
    const stories = await FarmerStory.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

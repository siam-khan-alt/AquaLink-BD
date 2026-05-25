import React from "react";
import { PublicCoursesClient } from "./PublicCoursesClient";

export const metadata = {
  title: "অনলাইন মৎস্য চাষ বুটক্যাম্প ও কোর্সসমূহ | মৎস্য বন্ধু",
  description: "বিশেষজ্ঞদের থেকে মাছ চাষের আধুনিক বৈজ্ঞানিক কৌশল এবং সঠিক পুষ্টি ব্যবস্থাপনা শিখুন। লাইভ বুটক্যাম্পে অংশ নিয়ে নিজের খামারকে লাভজনক করুন।",
  keywords: ["মাছ চাষ কোর্স", "মৎস্য চাষ প্রশিক্ষণ", "মাছের রোগ বালাই", "পুকুর ব্যবস্থাপনা", "কৃষি বুটক্যাম্প"],
};

export default function PublicCoursesPage() {
  return <PublicCoursesClient />;
}
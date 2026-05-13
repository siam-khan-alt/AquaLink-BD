import { IDisease } from "@/shared/types/disease";

export const DISEASES: IDisease[] = [
  {
    _id: "1",
    name: "ক্ষত রোগ (EUS)",
    fishType: "শোল, টাকি, পুঁটি, রুই, মৃগেল",
    imageUrl: "/images/diseases/eus.png", 
    description: "মাছের শরীরে লাল দাগ ও গভীর ক্ষত সৃষ্টি হয়। এটি মূলত শীতকালে পানি দূষণ ও ছত্রাকের কারণে বেশি দেখা দেয়।",
    causes: ["এপানোমাইসিস ছত্রাক", "পানির ক্ষারীয়তা কমে যাওয়া", "অপরিচ্ছন্ন পরিবেশ"],
    prevention: ["পুকুরে প্রতি শতাংশে ১ কেজি চুন প্রয়োগ", "শীতের শুরুতে পানি পরিষ্কার রাখা"],
    solution: ["পটাশিয়াম পারম্যাঙ্গানেট (০.৫ মি.গ্রা./লিটার) দিয়ে গোসল", "লবণ পানি ব্যবহার (৩-৫%)"],
    medicines: ["CI-Antibiotic", "Lime (চুন)", "Potassium Permanganate"],
    riskLevel: "high"
  },
  {
    _id: "2",
    name: "ফুলকা পচা রোগ",
    fishType: "রুই, কাতলা, মৃগেল",
    imageUrl: "/images/diseases/gill-rot.png",
    description: "মাছের ফুলকা ফ্যাকাশে বা কালো হয়ে যায় এবং শ্বাস নিতে কষ্ট হওয়ায় মাছ উপরে ভেসে ওঠে।",
    causes: ["অ্যামোনিয়া গ্যাস বৃদ্ধি", "অক্সিজেনের অভাব", "ব্যাকটেরিয়াল সংক্রমণ"],
    prevention: ["পানির স্তর ঠিক রাখা", "অ্যারোটর চালানো", "গ্যাস মুক্ত করার জন্য হররা টানা"],
    solution: ["দ্রুত পানি পরিবর্তন করা", "ফুলকা পরিষ্কার রাখা", "খাবার সাময়িক বন্ধ রাখা"],
    medicines: ["Gas-free Tablet", "BKC 80%", "Micro-Nid"],
    riskLevel: "medium"
  },
  {
    _id: "3",
    name: "লেজ ও পাখনা পচা",
    fishType: "পাঙ্গাস, তেলাপিয়া, রুই",
    imageUrl: "/images/diseases/tail-rot.png",
    description: "পাখনা ও লেজের অংশ পচে যায় এবং ছিঁড়ে পড়ে। মাছের চলাচলে সমস্যা হয় এবং দ্রুত দুর্বল হয়ে যায়।",
    causes: ["অ্যারোমোনাস ব্যাকটেরিয়া", "মাছের শরীরে আঘাত পাওয়া", "অতিরিক্ত ঘনত্ব"],
    prevention: ["মাছ ধরার সময় সতর্কতা", "পুকুরে পর্যাপ্ত জায়গা রাখা", "নিয়মিত চুন ও লবণ ব্যবহার"],
    solution: ["১% কপার সালফেট দ্রবণে গোসল", "পুকুরের পানি শোধন করা"],
    medicines: ["Oxytetracycline", "Renamycin", "Aquakleen"],
    riskLevel: "medium"
  },
  {
    _id: "4",
    name: "সাদা দাগ রোগ (White Spot)",
    fishType: "কার্প জাতীয় মাছ, একুরিয়াম মাছ",
    imageUrl: "/images/diseases/white-spot.png",
    description: "মাছের সারা শরীরে ছোট ছোট সাদা তিলের মতো দাগ দেখা দেয়। মাছ শরীর পাথরের সাথে ঘষতে থাকে।",
    causes: ["ইকথিওফথিরিয়াস পরজীবী", "পানির তাপমাত্রার হঠাৎ পরিবর্তন"],
    prevention: ["নতুন মাছ ছাড়ার আগে শোধন", "পুকুরের সরঞ্জাম পরিষ্কার রাখা"],
    solution: ["পানির তাপমাত্রা বৃদ্ধি করা (সম্ভব হলে)", "লবণ পানিতে শোধন"],
    medicines: ["Formalin", "Malachite Green", "Aquacure"],
    riskLevel: "medium"
  },
  {
    _id: "5",
    name: "পেট ফোলা রোগ (Dropsy)",
    fishType: "রুই, কাতলা, পাঙ্গাস",
    imageUrl: "/images/diseases/dropsy.png",
    description: "মাছের পেট অস্বাভাবিক ফুলে যায় এবং আঁইশ খাড়া হয়ে যায়। মাছ ভারসাম্য হারিয়ে ফেলে।",
    causes: ["ব্যাকটেরিয়াল সংক্রমণ", "কিডনি বা লিভারের সমস্যা", "অত্যধিক পচা খাবার"],
    prevention: ["উন্নত মানের ফিড ব্যবহার", "অ্যামোনিয়া গ্যাস নিয়ন্ত্রণ"],
    solution: ["এপসম লবণ (Epsom Salt) ব্যবহার", "অ্যান্টিবায়োটিক ফিড"],
    medicines: ["Oxysentin 20%", "Epsom Salt", "Terramycin"],
    riskLevel: "high"
  },
  {
    _id: "6",
    name: "উকুন রোগ (Argulus)",
    fishType: "রুই, কাতলা, কার্প",
    imageUrl: "/images/diseases/fish-lice.png",
    description: "মাছের শরীরে উকুন লেপ্টে থাকে এবং রক্ত চুষে খায়। মাছ অস্থির হয়ে ছোটাছুটি করে।",
    causes: ["আর্গুলুস নামক পরজীবী", "পুকুরে অতিরিক্ত আগাছা"],
    prevention: ["পুকুর শুকানো", "আগাছা পরিষ্কার রাখা", "পাখি তাড়ানো"],
    solution: ["জৈব সার নিয়ন্ত্রণ", "বাঁশের কঞ্চি বা ডাল পুঁতে দেওয়া (মাছ ঘষা দেওয়ার জন্য)"],
    medicines: ["Argulex", "Diptrex", "Ivermectin"],
    riskLevel: "medium"
  },
  {
    _id: "7",
    name: "লাল মুখ রোগ (Red Mouth)",
    fishType: "রুই, পাঙ্গাস, কার্প",
    imageUrl: "/images/diseases/red-mouth.png",
    description: "মাছের মুখের চারপাশে এবং পাখনা গোড়ায় রক্ত জমে লাল হয়ে যায়। মাছ খাবার খাওয়া বন্ধ করে দেয়।",
    causes: ["ইয়ারসিনিয়া রুকারি ব্যাকটেরিয়া", "পানির উচ্চ জৈব চাপ"],
    prevention: ["পুকুরে জিয়োলাইট ব্যবহার", "মাছের মজুদ ঘনত্ব কমানো"],
    solution: ["অ্যান্টিবায়োটিক থেরাপি", "পানির পিএইচ (pH) নিয়ন্ত্রণ"],
    medicines: ["Sultrim", "Chloramphenicol", "Aqua-Nid"],
    riskLevel: "high"
  },
  {
    _id: "8",
    name: "কালো দাগ রোগ (Black Spot)",
    fishType: "রুই, মৃগেল, সিলভার কার্প",
    imageUrl: "/images/diseases/black-spot.png",
    description: "মাছের ত্বকে বা পাখনায় ছোট ছোট কালো দাগ দেখা দেয়। এটি সাধারণত শামুক থেকে ছড়ায়।",
    causes: ["ডিপ্লোস্টোমাম পরজীবী", "পুকুরে অতিরিক্ত শামুকের উপস্থিতি"],
    prevention: ["শামুক নির্মূল করা", "পুকুর পাড়ের ঘাস পরিষ্কার রাখা"],
    solution: ["শামুক নাশক ব্যবহার", "তুঁতে (Copper Sulphate) প্রয়োগ"],
    medicines: ["Snail Kill", "Copper Sulphate", "Limestone"],
    riskLevel: "low"
  },
  {
    _id: "9",
    name: "সাপলেগনিয়াল ছত্রাক (Saprolegnia)",
    fishType: "মাগুর, শিং, পাঙ্গাস",
    imageUrl: "/images/diseases/saprolegnia.png",
    description: "মাছের শরীরে তুলার মতো সাদা বা ধূসর ছত্রাক জন্মে। ক্ষত স্থানে দ্রুত ছড়িয়ে পড়ে।",
    causes: ["সাপলেগনিয়া ছত্রাক", "মাছের গায়ে আঘাত লাগা"],
    prevention: ["মাছ নাড়াচাড়ায় সতর্কতা", "পানির তাপমাত্রা স্থিতিশীল রাখা"],
    solution: ["লবণ ও মেলাকাইট গ্রিন মিশ্রণ", "পটাশ স্নান"],
    medicines: ["Fungisid", "Malachite Green", "Salt"],
    riskLevel: "medium"
  },
  {
    _id: "10",
    name: "আঁইশ খসা রোগ",
    fishType: "রুই, কাতলা, মৃগেল",
    imageUrl: "/images/diseases/scale-loss.png",
    description: "মাছের আঁইশ ঢিলে হয়ে যায় এবং সহজেই পড়ে যায়। শরীরের পিচ্ছিল ভাব কমে যায়।",
    causes: ["ব্যাকটেরিয়াল ইনফেকশন", "পানির ক্ষারীয়তা বৃদ্ধি"],
    prevention: ["নিয়মিত চুন প্রয়োগ", "পানির স্বচ্ছতা বজায় রাখা"],
    solution: ["পুকুরে পটাশ প্রয়োগ", "ভিটামিন-সি যুক্ত খাবার প্রদান"],
    medicines: ["C-Vit", "Oxy-A", "Potash"],
    riskLevel: "medium"
  }
];
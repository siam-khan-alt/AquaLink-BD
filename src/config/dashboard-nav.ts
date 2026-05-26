import { LayoutDashboard, Users, FileText, UserCheck, AlertTriangle, BookOpen, MessageSquare, DollarSign, Calculator, Calendar, Stethoscope, UserCircle, Waves } from "lucide-react";

export const DASHBOARD_NAV = {
  farmer: [
    { label: "ওভারভিউ", href: "/dashboard/farmer", icon: LayoutDashboard },
    { label: "পুকুর ও পানির গুণমান", href: "/dashboard/farmer/ponds", icon: Waves },
    { label: "খরচ ট্র্যাকার", href: "/dashboard/farmer/expenses", icon: DollarSign },
    { label: "স্মার্ট ফিড ক্যালকুলেটর", href: "/dashboard/farmer/feed-calculator", icon: Calculator },
    { label: "মাছ চাষের পাঠশালা", href: "/dashboard/farmer/courses", icon: BookOpen },
    { label: "মেসেজ", href: "/dashboard/chat", icon: MessageSquare },
  ],
  admin: [
    { label: "সিস্টেম ওভারভিউ", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "চাষি তালিকা", href: "/dashboard/admin/users", icon: Users },
    { label: "চাষি গল্প ব্যবস্থাপনা", href: "/dashboard/admin/stories", icon: FileText },
    { label: "বিশেষজ্ঞ ব্যবস্থাপনা", href: "/dashboard/admin/experts", icon: UserCheck },
    { label: "জরুরি সতর্কতা", href: "/dashboard/admin/alerts", icon: AlertTriangle },
    { label: "বুটক্যাম্প ব্যবস্থাপনা", href: "/dashboard/admin/courses", icon: BookOpen },
    { label: "সাপোর্ট ইনবক্স", href: "/dashboard/chat", icon: MessageSquare },
  ],
  doctor: [
    { label: "ওভারভিউ", href: "/dashboard/doctor", icon: LayoutDashboard },
    { label: "কনসালটেশন রিকোয়েস্ট", href: "/dashboard/doctor/consultations", icon: Stethoscope },
    { label: "রোগী ইতিহাস", href: "/dashboard/doctor/patients", icon: Users },
    { label: "সময়সূচি", href: "/dashboard/doctor/schedule", icon: Calendar },
    { label: "মেসেজ", href: "/dashboard/chat", icon: MessageSquare },
  ]
};
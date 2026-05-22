"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Waves, Mail, Phone, Share2, Globe, MessageCircle } from "lucide-react";

interface FooterSection {
  title: string;
  links: { label: string; href: string; requiresAuth?: boolean }[];
}

const footerSections: FooterSection[] = [
  {
    title: "মৎস্য বন্ধু",
    links: [
      { label: "হোম", href: "/" },
      { label: "বাজার দর", href: "/market-prices" },
      { label: "মাছের রোগ", href: "/fish-diseases" },
      { label: "সম্পর্কে", href: "/about" },
    ],
  },
  {
    title: "ড্যাশবোর্ড লিঙ্ক",
    links: [
      { label: "ওভারভিউ", href: "/dashboard/farmer", requiresAuth: true },
      { label: "পুকুর ব্যবস্থাপনা", href: "/dashboard/farmer/ponds", requiresAuth: true },
      { label: "খরচ ট্র্যাকার", href: "/dashboard/farmer/expenses", requiresAuth: true },
      { label: "লার্নিং হাব", href: "/dashboard/farmer/courses", requiresAuth: true },
    ],
  },
  {
    title: "যোগাযোগ ও সহায়তা",
    links: [
      { label: "সাহায্য কেন্দ্র", href: "/help" },
      { label: "প্রাইভেসি পলিসি", href: "/privacy" },
      { label: "শর্তাবলী", href: "/terms" },
      { label: "যোগাযোগ করুন", href: "/contact" },
    ],
  },
];

export default function Footer() {
  const { data: session } = useSession();

  return (
    <footer className="bg-[var(--background)] border-t border-[var(--border)] mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)] rounded-xl flex items-center justify-center">
                <Waves className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-[var(--text)] font-hind">
                মৎস্য বন্ধু
              </span>
            </Link>
            <p className="text-sm text-[var(--text)]/60 font-hind">
              আধুনিক মাছ চাষের ডিজিটাল প্ল্যাটফর্ম। বাংলাদেশের মাছ চাষিদের জন্য সেরা সমাধান।
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              >
                <Share2 size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              >
                <Globe size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text)] font-hind">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => {
                  if (link.requiresAuth && !session) {
                    return null;
                  }
                  return (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--text)]/60 hover:text-[var(--primary)] transition-colors font-hind"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--primary)]">
              <Mail size={18} />
            </div>
            <div>
              <p className="text-xs text-[var(--text)]/60 font-hind">ইমেইল</p>
              <p className="text-sm text-[var(--text)] font-semibold font-hind">
                support@aqualinkbd.com
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--primary)]">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-xs text-[var(--text)]/60 font-hind">ফোন</p>
              <p className="text-sm text-[var(--text)] font-semibold font-hind">
                +৮৮০ ১৭০০-০০০০০০
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[var(--border)] text-center">
          <p className="text-xs text-[var(--text)]/60 font-hind">
            ২০২৬ মৎস্য বন্ধু (AquaLink BD)। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
}

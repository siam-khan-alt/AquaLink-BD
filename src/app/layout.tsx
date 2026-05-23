import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/shared/components/providers/ThemeProvider";
import ChatModule from "@/modules/ai-assistant/ChatModule";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066cc" },
    { media: "(prefers-color-scheme: dark)", color: "#38bdf8" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aqualinkbd.vercel.app'),
  title: {
    default: "মৎস্য বন্ধু - আধুনিক মাছ চাষের ডিজিটাল প্ল্যাটফর্ম",
    template: "%s | মৎস্য বন্ধু",
  },
  description:
    "মৎস্য বন্ধু - আধুনিক মাছ চাষের ডিজিটাল প্ল্যাটফর্ম। মাছের বাজার দর জানুন, পুকুর ব্যবস্থাপনা করুন এবং মাছের রোগের সঠিক সমাধান পান দ্রুত। বাংলাদেশের মাছ চাষিদের জন্য সেরা ডিজিটাল সমাধান।",
  keywords: [
    "মৎস্য বন্ধু",
    "AquaLink BD",
    "মাছ চাষ পদ্ধতি",
    "মাছের বাজার দর",
    "মাছের রোগ সমাধান",
    "Fish Farming Solution",
    "পুকুর ব্যবস্থাপনা",
    "মাছ চাষ টিপস",
    "বাংলাদেশ মাছ চাষ",
    "ডিজিটাল কৃষি",
  ],
  authors: [{ name: "AquaLink BD" }],
  creator: "AquaLink BD",
  publisher: "AquaLink BD",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "মৎস্য বন্ধু - আধুনিক মাছ চাষের ডিজিটাল প্ল্যাটফর্ম",
    description:
      "আধুনিক প্রযুক্তিতে মাছ চাষ করুন লাভজনকভাবে। বাংলাদেশের মাছ চাষিদের জন্য সেরা ডিজিটাল সমাধান। আজই যুক্ত হোন মৎস্য বন্ধু প্ল্যাটফর্মে।",
    url: "https://aqualink-bd-production.up.railway.app",
    siteName: "মৎস্য বন্ধু",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "মৎস্য বন্ধু - মাছ চাষের ডিজিটাল প্ল্যাটফর্ম",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "মৎস্য বন্ধু - আধুনিক মাছ চাষের ডিজিটাল প্ল্যাটফর্ম",
    description:
      "আধুনিক প্রযুক্তিতে মাছ চাষ করুন লাভজনকভাবে। বাংলাদেশের মাছ চাষিদের জন্য সেরা ডিজিটাল সমাধান।",
    images: ["/logo.png"],
    creator: "@AquaLinkBD",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text)]">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            richColors
            theme="dark"
            toastOptions={{
              className:
                "border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-xl shadow-2xl",
              style: {
                background: "var(--surface)",
                color: "var(--text)",
              },
              actionButtonStyle: {
                background: "var(--primary)",
                color: "#fff",
              },
              cancelButtonStyle: {
                background: "var(--background)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              },
            }}
          />
          <ChatModule />
        </Providers>
      </body>
    </html>
  );
}

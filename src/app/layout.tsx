import type { Metadata, Viewport } from "next";
import { Geist, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Providers from "@/shared/components/providers/ThemeProvider";
import Navbar from "@/shared/components/navigation/Navbar";
import ChatModule from "@/modules/ai-assistant/ChatModule";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0066cc" },
    { media: "(prefers-color-scheme: dark)", color: "#38bdf8" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "মৎস্য বন্ধু (AquaLink BD) - মাছ চাষিদের ডিজিটাল সাথী",
    template: "%s | মৎস্য বন্ধু",
  },
  description:
    "AquaLink BD - মৎস্য বন্ধু অ্যাপের মাধ্যমে মাছের বাজার দর জানুন, পুকুর ব্যবস্থাপনা করুন এবং মাছের রোগের সঠিক সমাধান পান দ্রুত।",
  keywords: [
    "মৎস্য বন্ধু",
    "AquaLink BD",
    "মাছ চাষ পদ্ধতি",
    "মাছের বাজার দর",
    "মাছের রোগ সমাধান",
    "Fish Farming Solution",
  ],
  openGraph: {
    title: "মৎস্য বন্ধু - আপনার মাছ চাষের ডিজিটাল সহকারী",
    description:
      "আধুনিক প্রযুক্তিতে মাছ চাষ করুন লাভজনকভাবে। আজই যুক্ত হোন মৎস্য বন্ধু (AquaLink BD) প্ল্যাটফর্মে।",
    url: "https://aqualinkbd.vercel.app",
    siteName: "মৎস্য বন্ধু",
    locale: "bn_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${hindSiliguri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text)]">
        <Providers>
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-grow pt-16">
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
          </main>
        </Providers>
      </body>
    </html>
  );
}

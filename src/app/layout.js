import { Hind_Siliguri, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata = {
  title: {
    default: "AquaLink BD | মৎস্য চাষের আধুনিক সমাধান | Modern Fishery Marketplace",
    template: "%s | AquaLink BD"
  },
  description: "AquaLink BD (আকুয়ালিংক বিডি) - Connecting Bangladesh's fisheries with technology. মাছের পোনা, সরঞ্জাম, পুকুর ভাড়া এবং বিশেষজ্ঞ পরামর্শের ডিজিটাল প্ল্যাটফর্ম।",
  keywords: [
    "AquaLink BD", "আকুয়ালিংক বিডি", "মাছের পোনা", "পুকুর ভাড়া", "মৎস্য চাষ", 
    "Fish Fry Market BD", "Pond Rental Bangladesh", "Fishery Expert Advice"
  ],
  metadataBase: new URL('https://aqualinkbd.vercel.app'),
  openGraph: {
    title: "AquaLink BD | Modern Fishery Ecosystem",
    description: "চাষি, বিশেষজ্ঞ এবং বাজারের ডিজিটাল সেতুবন্ধন।",
    siteName: "AquaLink BD",
    locale: "bn_BD",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="bn" 
      suppressHydrationWarning 
      className={`${inter.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300">
        <Providers>
          <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}

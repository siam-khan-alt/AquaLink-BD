"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { MessageSquare, Sparkles, MoveRight } from "lucide-react";
import { useAIStore } from "@/shared/store/useUIStore";
import { Button } from "@/components/ui/Button";

export default function Hero(): React.JSX.Element {
  const { toggleChat } = useAIStore();

  const heroStyles = useMemo(
    () => ({
      background: `linear-gradient(to bottom right, var(--hero-bg-start), var(--hero-bg-mid), var(--hero-bg-end))`,
    }),
    []
  );

  const primaryBg = useMemo(() => ({ backgroundColor: "var(--primary)" }), []);
  const primaryText = useMemo(() => ({ color: "var(--primary)" }), []);

  return (
    <section
      style={heroStyles}
      className="relative min-h-[70vh] flex items-center overflow-hidden pt-18 pb-10 transition-all duration-700"
      aria-labelledby="hero-heading"
    >
      {/* Decorative Layer */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          style={primaryBg}
          className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-15 rounded-full blur-[100px] animate-pulse"
        />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[300px] bg-white opacity-5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 grid lg:grid-cols-5 gap-6 items-center">
        {/* Left Content  */}
        <article className="space-y-10 animate-in fade-in slide-in-from-left duration-1000 col-span-3">
          <header className="space-y-6">
            <div
              style={{ ...primaryText, borderColor: "rgba(255,255,255,0.2)" }}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 border text-sm font-semibold tracking-wide backdrop-blur-md shadow-sm"
            >
              <Sparkles
                size={18}
                className="animate-pulse"
                aria-hidden="true"
              />
              <span>বাংলাদেশের চাষির গর্ব — মৎস্য বন্ধু © ২০২৬</span>
            </div>

            <h1
              id="hero-heading"
              className="text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter"
            >
              মাছ চাষে আনুন <span> </span>
              <span style={primaryText} className="relative inline-block">
                ডিজিটাল বিপ্লব
              </span>
            </h1>
          </header>

          <p className="text-xl text-white/70 max-w-xl leading-relaxed font-medium">
            <strong className="text-white font-extrabold">AquaLink-BD:</strong>{" "}
            আপনার পুকুরের সাথী। এখন AI প্রযুক্তিতে পুকুর ব্যবস্থাপনা, রোগের
            সমাধান এবং লাইভ বাজার দর এক ক্লিকেই।
          </p>

          {/* CTA */}
          <nav className="flex flex-wrap gap-5 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => toggleChat()}
              style={primaryBg}
              className="group"
            >
              <MessageSquare
                size={26}
                className="group-hover:rotate-12 transition-transform"
              />
              মৎস্য বন্ধুর সাথে চ্যাট করুন
              <MoveRight
                size={20}
                className="ml-2 group-hover:translate-x-2 transition-transform"
              />
            </Button>

            <Button variant="outline" size="lg" className="hover:bg-white/5">
              বিস্তারিত জানুন
            </Button>
          </nav>
        </article>

        {/* Right Side */}
        <aside
          className="relative hidden lg:flex justify-center items-center col-span-2 h-[470px]"
          aria-hidden="true"
        >
          <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
            {/* Animation Rings */}
            <div
              style={{ borderColor: "var(--primary)" }}
              className="absolute inset-0 border-2 border-dashed opacity-10 rounded-full animate-[spin_60s_linear_infinite]"
            />
            <div
              style={{ borderColor: "var(--primary)" }}
              className="absolute inset-12 border opacity-20 rounded-full animate-pulse"
            />
            <div
              style={{ borderColor: "var(--primary)", borderStyle: "dotted" }}
              className="absolute inset-24 border-4 opacity-30 rounded-full animate-[spin_20s_linear_infinite_reverse]"
            />

            <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
              <div
                style={primaryBg}
                className="w-4 h-4 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_15px_var(--primary)]"
              />
            </div>

            {/* Main Logo */}
            <div className="relative w-[300px] h-[300px] group">
              <div
                style={primaryBg}
                className="absolute inset-0 opacity-20 rounded-full blur-[80px] group-hover:opacity-40 transition-opacity duration-500"
              />

              <Image
                src="/logo.png"
                alt="AquaLink-BD - Bangladesh's First AI Fish Farming Assistant"
                fill
                className="object-contain transition-all duration-700 group-hover:scale-110 drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

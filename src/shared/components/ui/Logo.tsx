"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  showText?: boolean;
  className?: string;
}

export const Logo = ({ showText = true, className = "" }: LogoProps) => {
  return (
    <Link href="/" className={`flex items-center gap-2 group outline-none ${className}`}>
      <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
        <Image
          src="/logo.png" 
          alt="AquaLink BD Logo"
          fill
          sizes="40px"
          className="object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-lg sm:text-xl text-[var(--primary)] font-bold leading-tight tracking-tighter">
            মৎস্য বন্ধু
          </span>
          <span className="text-[10px] opacity-60 font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
            AquaLink BD
          </span>
        </div>
      )}
    </Link>
  );
};
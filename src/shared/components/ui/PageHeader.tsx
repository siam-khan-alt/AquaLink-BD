"use client";
import { motion } from "framer-motion";

interface PageHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
}

export const PageHeader = ({ badge, title, subtitle }: PageHeaderProps) => {
  return (
    <div className="text-center mb-16 space-y-4">
      {badge && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-black uppercase tracking-widest font-hind"
        >
          {badge}
        </motion.div>
      )}

      <motion.h1 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-6xl font-bold  tracking-tighter font-hind"
      >
        <span className=" text-[var(--primary)] bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[#5aeea9] bg-clip-text text-transparent ">
          {title}
        </span>
      </motion.h1>

      {subtitle && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm md:text-base text-[var(--text)]/60 max-w-xl mx-auto font-hind leading-relaxed"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
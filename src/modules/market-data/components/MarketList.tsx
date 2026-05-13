"use client";

import { IMarketPrice } from "@/shared/types/market";
import { Search, ChevronRight, LayoutGrid } from "lucide-react";
import { SortOption } from "./MarketUI";
import { Button } from "@/shared/components/ui/Button"; 
import { Input } from "@/shared/components/ui/Input";   
import { motion } from "framer-motion";
interface Props {
  data: IMarketPrice[];
  selectedId: string;
  currentSort: SortOption;
  onSelect: (id: string) => void;
  onSearch: (query: string) => void;
  onSort: (sort: SortOption) => void;
}

export default function MarketList({ data, selectedId, onSelect, onSearch, onSort, currentSort }: Props) {
  
  const sortButtons: { label: string; value: SortOption }[] = [
    { label: "সর্বশেষ", value: "latest" },
    { label: "নামানুসারে", value: "name" },
    { label: "সর্বোচ্চ দর", value: "price-high" },
    { label: "সর্বনিম্ন দর", value: "price-low" },
  ];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="px-1">
        <Input 
          label="পছন্দের মাছ খুঁজুন" 
          placeholder="যেমন: ইলিশ, রুই..."
          icon={<Search size={20} />}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Sorting */}
      <div className="space-y-3 px-1">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 flex items-center gap-2">
          <LayoutGrid size={12} /> দর যাচাই করুন
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {sortButtons.map((opt) => (
            <Button
              key={opt.value}
              variant={currentSort === opt.value ? "primary" : "ghost"}
              size="sm"
              onClick={() => onSort(opt.value)}
              className={`whitespace-nowrap border ${
                currentSort === opt.value 
                ? "border-[var(--primary)]" 
                : "border-[var(--border)] opacity-60"
              }`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Market List  */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
        {data.length > 0 ? (
          data.map((item) => (
            <motion.div 
              layout
              key={item._id}
              onClick={() => onSelect(item._id)}
              className={`group p-5 rounded-2xl border cursor-pointer transition-all flex justify-between items-center ${
                selectedId === item._id 
                ? "bg-[var(--primary)]/10 border-[var(--primary)] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)]" 
                : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--primary)]/40"
              }`}
            >
              <div className="flex items-center gap-4">
                 <div className={`w-1.5 h-8 rounded-full transition-all duration-300 ${
                   selectedId === item._id ? 'bg-[var(--primary)]' : 'bg-[var(--border)] group-hover:bg-[var(--primary)]/20'
                 }`} />
                 
                 <div>
                    <h4 className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {item.fishName}
                    </h4>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-tighter">
                      {item.category}
                    </p>
                 </div>
              </div>

              <div className="text-right">
                 <p className="font-black text-lg text-[var(--primary)] tracking-tighter italic">
                   ৳{item.currentPrice}
                 </p>
                 <div className={`flex justify-end transition-all duration-300 ${
                   selectedId === item._id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'
                 }`}>
                    <ChevronRight size={16} className="text-[var(--primary)]" />
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-10 text-center opacity-30 font-bold">
            এই নামে কোনো মাছ পাওয়া যায়নি
          </div>
        )}
      </div>
    </div>
  );
}


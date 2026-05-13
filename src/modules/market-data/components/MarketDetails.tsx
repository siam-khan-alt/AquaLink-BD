"use client";

import { IMarketPrice } from "@/shared/types/market";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info, Activity } from "lucide-react";

export default function MarketDetails({ fish }: { fish: IMarketPrice }) {
  const chartData = fish.history.map((h) => ({
    date: new Date(h.date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' }),
    price: h.price
  }));

  const isUp = fish.trend === 'up';

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-[var(--surface)] p-6 md:p-10 rounded-2xl border border-[var(--border)] shadow-xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-50" />

      <div className="flex justify-between items-center mb-10">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--text)] tracking-tighter uppercase">{fish.fishName}</h2>
          <p className="text-[10px] font-black text-[var(--primary)] tracking-[0.3em] uppercase opacity-60 flex items-center gap-2">
            <Activity size={12} /> Real-time Market Pulse
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold opacity-40 uppercase mb-1">সর্বশেষ মূল্য</p>
          <div className="text-4xl font-black text-[var(--primary)] tracking-tighter">৳{fish.currentPrice}</div>
        </div>
      </div>

      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.1} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'var(--text)', opacity: 0.3, fontSize: 12}} dy={15} />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              cursor={{ stroke: 'var(--primary)', strokeWidth: 1 }}
              content={({ active, payload }) => (
                active && payload ? (
                  <div className="bg-[var(--surface)] border border-[var(--primary)]/40 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
                    <p className="text-[10px] font-bold opacity-50 mb-1">{payload[0].payload.date}</p>
                    <p className="text-lg font-black text-[var(--primary)]">৳{payload[0].value}</p>
                  </div>
                ) : null
              )}
            />
            <Area type="stepAfter" dataKey="price" stroke="none" fill="url(#glowGradient)" animationDuration={2000} />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="var(--primary)" 
              strokeWidth={5} 
              fill="none"
              animationDuration={1500}
              activeDot={{ r: 8, fill: "var(--primary)", stroke: "white", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-center">
          <div className="p-3 bg-[var(--primary)]/10 rounded-2xl text-[var(--primary)]"><Info size={20} /></div>
          <div>
            <p className="text-[10px] font-black opacity-40 uppercase">পরামর্শ</p>
            <p className="text-sm font-bold leading-tight">বাজার বর্তমানে {isUp ? 'উর্ধ্বমুখী' : 'স্থিতিশীল'}। সঠিক সিদ্ধান্ত নিতে বাজার পর্যবেক্ষণ করুন।</p>
          </div>
        </div>
        <div className={`p-5 rounded-2xl border flex gap-4 items-center ${isUp ? 'border-red-500/20 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
          <div className={`p-3 rounded-2xl ${isUp ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>
            {isUp ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <div>
            <p className="text-[10px] font-black opacity-40 uppercase">ট্রেন্ড</p>
            <p className="text-sm font-bold leading-tight">{isUp ? 'বিক্রি করার জন্য ভালো সময় হতে পারে' : 'ক্রয় করার সুযোগ তৈরি হতে পারে'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
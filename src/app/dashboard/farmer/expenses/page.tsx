"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  DollarSign,
  Plus,
  Filter,
  X,
  Loader2,
  Calendar,
  TrendingDown,
  Trash2,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const expenseTypes = ["Feed", "Seed/Pona", "Medicine", "Fertilizer", "Other"] as const;

const expenseSchema = z.object({
  pondId: z.string().min(1, "পুকুর নির্বাচন করতে হবে"),
  type: z.string().refine((val) => expenseTypes.includes(val as any), {
    message: "সঠিক খরচের ধরন নির্বাচন করুন",
  }),
  amount: z.number().min(0.01, "পরিমাণ ০ এর চেয়ে বেশি হতে হবে"),
  date: z.string().min(1, "তারিখ প্রদান করতে হবে"),
  note: z.string().optional(),
});

interface IExpense {
  _id: string;
  pondId: string;
  pondName: string;
  type: string;
  amount: number;
  date: string;
  note?: string;
}

interface IPond {
  _id: string;
  name: string;
}

interface IExpensesResponse {
  expenses: IExpense[];
}

interface IPondsResponse {
  ponds: IPond[];
}

const formatBDT = (val: number): string => {
  return "৳ " + new Intl.NumberFormat("bn-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ExpensesPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPond, setFilterPond] = useState<string>("all");

  const [formData, setFormData] = useState({
    pondId: "",
    type: "Feed" as const,
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: expensesData, isLoading: isExpensesLoading } = useQuery<IExpensesResponse>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await fetch("/api/ponds/expenses");
      if (!res.ok) throw new Error("খরচের তথ্য লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const { data: pondsData, isLoading: isPondsLoading } = useQuery<IPondsResponse>({
    queryKey: ["ponds-list"],
    queryFn: async () => {
      const res = await fetch("/api/ponds");
      if (!res.ok) throw new Error("পুকুরের তথ্য লোড করতে ব্যর্থ হয়েছে");
      return res.json();
    },
    enabled: status === "authenticated",
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (newExpenseData: {
      pondId: string;
      type: string;
      amount: number;
      date: string;
      note?: string;
    }) => {
      const res = await fetch("/api/ponds/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpenseData),
      });
      if (!res.ok) {
        const errorData = await res.json() as { error?: string };
        throw new Error(errorData.error || "খরচ যোগ করতে ব্যর্থ হয়েছে");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("নতুন খরচ সফলভাবে যোগ করা হয়েছে!");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsModalOpen(false);
      setFormData({
        pondId: "",
        type: "Feed",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      setFormErrors({});
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.pondId) {
      errors.pondId = "পুকুর নির্বাচন করতে হবে";
    }
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      errors.amount = "সঠিক ইতিবাচক পরিমাণ লিখুন";
    }
    if (!formData.date) {
      errors.date = "তারিখ প্রদান করতে হবে";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    addExpenseMutation.mutate({
      pondId: formData.pondId,
      type: formData.type,
      amount: amountNum,
      date: formData.date,
      note: formData.note || undefined,
    });
  };

  const filteredExpenses = expensesData?.expenses?.filter((expense) => {
    if (filterType !== "all" && expense.type !== filterType) return false;
    if (filterPond !== "all" && expense.pondId !== filterPond) return false;
    return true;
  }) || [];

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      "Feed": "খাদ্য",
      "Seed/Pona": "পোনা/বীজ",
      "Medicine": "ওষুধ",
      "Fertilizer": "সার",
      "Other": "অন্যান্য",
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      "Feed": "bg-blue-100 text-blue-800 border-blue-200",
      "Seed/Pona": "bg-green-100 text-green-800 border-green-200",
      "Medicine": "bg-red-100 text-red-800 border-red-200",
      "Fertilizer": "bg-purple-100 text-purple-800 border-purple-200",
      "Other": "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text)] tracking-tight font-hind">
              খরচ ট্র্যাকার
            </h1>
            <p className="text-[var(--text)]/60 text-sm font-medium mt-1 font-hind">
              আপনার খামারের সকল বিনিয়োগের হিসাব
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="sm:w-auto h-12 flex items-center justify-center gap-2 font-hind text-sm font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus size={18} />
            নতুন খরচ যোগ করুন
          </Button>
        </div>

        {/* Component A: Total Summary Banner */}
        <Card className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white border-0 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <TrendingDown size={32} />
              </div>
              <div>
                <p className="text-white/80 text-sm font-semibold font-hind">মোট বিনিয়োগ</p>
                <h2 className="text-4xl font-black mt-1 font-hind tracking-tight">
                  {isExpensesLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    formatBDT(totalExpenses)
                  )}
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs font-semibold font-hind">
                {filteredExpenses.length}টি এন্ট্রি
              </p>
              <p className="text-white/60 text-xs font-hind mt-1">
                ফিল্টার অনুযায়ী
              </p>
            </div>
          </div>
        </Card>

        {/* Component B: Filterable Expense Datatable */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-4 mb-6">
            <h2 className="text-xl font-extrabold text-[var(--text)] font-hind flex items-center gap-2">
              <DollarSign size={24} className="text-[var(--primary)]" />
              খরচের তালিকা
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[var(--text)]/60" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="all">সকল ধরন</option>
                  {expenseTypes.map((type) => (
                    <option key={type} value={type}>
                      {getTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterPond}
                  onChange={(e) => setFilterPond(e.target.value)}
                  className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="all">সকল পুকুর</option>
                  {pondsData?.ponds?.map((pond) => (
                    <option key={pond._id} value={pond._id}>
                      {pond.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isExpensesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-[var(--primary)]/10 rounded-full mb-4">
                <DollarSign size={48} className="text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text)] font-hind">কোনো খরচ পাওয়া যায়নি</h3>
              <p className="text-sm text-[var(--text)]/60 mt-1 max-w-md font-hind">
                আপনার খামারের খরচের হিসাব রাখতে নতুন খরচ যোগ করুন
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                      তারিখ
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                      পুকুর
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                      ধরন
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                      পরিমাণ
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-[var(--text)]/70 font-hind">
                      নোট
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="border-b border-[var(--border)]/50 hover:bg-[var(--surface)] transition-colors">
                      <td className="py-3 px-4 text-sm text-[var(--text)] font-hind flex items-center gap-2">
                        <Calendar size={14} className="text-[var(--text)]/50" />
                        {formatDate(expense.date)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-[var(--text)] font-hind">
                        {expense.pondName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border font-hind ${getTypeColor(expense.type)}`}>
                          {getTypeLabel(expense.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm font-black text-[var(--text)] font-hind">
                        {formatBDT(expense.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-[var(--text)]/60 font-hind">
                        {expense.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Component C: Expense Logging Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="bg-[var(--surface)] w-full max-w-md border border-[var(--border)] relative shadow-2xl p-6 rounded-2xl animate-in slide-in-from-bottom-12 duration-400">
              
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
                <h3 className="text-xl font-bold text-[var(--text)] font-hind flex items-center gap-2">
                  <DollarSign className="text-[var(--primary)]" size={20} />
                  নতুন খরচ যোগ করুন
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-[var(--border)] text-[var(--text)]/60 hover:text-[var(--text)] rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    পুকুর নির্বাচন করুন
                  </label>
                  <select
                    value={formData.pondId}
                    onChange={(e) => setFormData({ ...formData, pondId: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">পুকুর নির্বাচন করুন</option>
                    {pondsData?.ponds?.map((pond) => (
                      <option key={pond._id} value={pond._id}>
                        {pond.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.pondId && (
                    <p className="text-xs text-red-500 mt-1 font-hind">{formErrors.pondId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    খরচের ধরন
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    {expenseTypes.map((type) => (
                      <option key={type} value={type}>
                        {getTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="পরিমাণ (টাকা)"
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  placeholder="যেমন: ১৫০০"
                  className="font-hind"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  error={formErrors.amount}
                />

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    তারিখ
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-500 mt-1 font-hind">{formErrors.date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text)] mb-2 font-hind">
                    নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="অতিরিক্ত তথ্য লিখুন..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] font-hind focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-[var(--border)] mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    isLoading={addExpenseMutation.isPending}
                    className="flex-1 font-hind text-sm h-11"
                  >
                    যোগ করুন
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

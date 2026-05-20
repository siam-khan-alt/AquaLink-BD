'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/shared/components/ui/Input";
import { Button } from "@/shared/components/ui/Button";

const contactSchema = z.object({
  name: z.string().min(2, 'নাম অন্তত ২ অক্ষরের হতে হবে'),
  email: z.string().email('সঠিক ইমেইল ঠিকানা দিন'),
  phone: z.string().regex(/^(?:\+880|0)?1[3-9]\d{8}$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন'),
  subject: z.string().min(5, 'বিষয় অন্তত ৫ অক্ষরের হতে হবে'),
  message: z.string().min(10, 'বার্তা অন্তত ১০ অক্ষরের হতে হবে').max(1000, 'বার্তা ১০০০ অক্ষরের বেশি হতে পারবে না'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" }
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'বার্তা পাঠাতে ব্যর্থ হয়েছে');
      }

      toast.success('বার্তা সফলভাবে পাঠানো হয়েছে!', {
        description: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
      });
      setIsSubmitted(true);
      reset();
    } catch (error) {
      toast.error('বার্তা পাঠাতে ব্যর্থ হয়েছে', {
        description: error instanceof Error ? error.message : 'অনুগ্রহ করে পুনরায় চেষ্টা করুন।',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] py-16 flex items-center">
      <div className="container mx-auto px-4 container">
        
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-black uppercase tracking-widest font-hind">
            যোগাযোগ মাধ্যম
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text)] font-hind">
            আমাদের সাথে <span className="text-[var(--primary)]">যোগাযোগ করুন</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--text)]/60 max-w-md mx-auto font-hind">
            আপনার যেকোনো প্রশ্ন, মতামত বা পরামর্শ আমাদের জানাতে পারেন। আমরা দ্রুত সাড়া দিতে বদ্ধপরিকর।
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* বাম পাশ: তথ্য কার্ড */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-[var(--primary)]/5 rounded-full blur-3xl transition-all group-hover:scale-150 duration-700" />
            
            <div className="space-y-8">
              <h2 className="text-2xl font-black text-[var(--text)] font-hind tracking-tight">
                যোগাযোগের তথ্য
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--background)]/50 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider font-hind">ইমেইল ঠিকানা</p>
                    <p className="text-sm font-bold text-[var(--text)] truncate">support@aqualink-bd.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--background)]/50 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider font-hind">হটলাইন নম্বর</p>
                    <p className="text-sm font-bold text-[var(--text)]">+880 1234-567890</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--background)]/50 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                  <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl border border-[var(--primary)]/20">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider font-hind">প্রধান কার্যালয়</p>
                    <p className="text-sm font-bold text-[var(--text)] font-hind">ঢাকা, বাংলাদেশ</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/10">
              <h3 className="font-black text-xs text-[var(--primary)] uppercase tracking-wider font-hind mb-1">
                কার্যালয়ের সময়সূচী
              </h3>
              <p className="text-xs text-[var(--text)]/70 font-hind leading-relaxed">
                রবিবার - শুক্রবার: সকাল ৯টা থেকে সন্ধ্যা ৬টা পর্যন্ত (সাপ্তাহিক ছুটি: শনিবার)
              </p>
            </div>
          </div>

          {/* ডান পাশ: যোগাযোগ ফর্ম */}
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col justify-center">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="h-16 w-16 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto shadow-xl">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-[var(--text)] font-hind">বার্তা সফল হয়েছে!</h3>
                <p className="text-sm text-[var(--text)]/60 max-w-sm mx-auto font-hind">
                  আপনার বার্তাটি আমাদের সিস্টেমে জমা হয়েছে। আমাদের প্রতিনিধি দল খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।
                </p>
                <div className="pt-4">
                  <Button onClick={() => setIsSubmitted(false)} className="px-6 font-hind">
                    নতুন বার্তা লিখুন
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h2 className="text-2xl font-black text-[var(--text)] font-hind tracking-tight mb-2">
                  সরাসরি বার্তা পাঠান
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Input 
                      label="আপনার নাম" 
                      placeholder="নাম লিখুন" 
                      {...register('name')}
                      value={watch('name')}
                      onChange={(e) => setValue('name', e.target.value, { shouldValidate: true })}
                    />
                    {errors.name && (
                      <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1 font-hind font-bold">
                        <AlertCircle size={12} /> {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input 
                      label="ইমেইল ঠিকানা" 
                      placeholder="example@mail.com" 
                      type="email"
                      {...register('email')}
                      value={watch('email')}
                      onChange={(e) => setValue('email', e.target.value, { shouldValidate: true })}
                    />
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1 font-hind font-bold">
                        <AlertCircle size={12} /> {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Input 
                      label="মোবাইল নম্বর" 
                      placeholder="01XXXXXXXXX" 
                      type="tel"
                      maxLength={11}
                      {...register('phone')}
                      value={watch('phone')}
                      onChange={(e) => setValue('phone', e.target.value.replace(/\D/g, ""), { shouldValidate: true })}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1 font-hind font-bold">
                        <AlertCircle size={12} /> {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input 
                      label="বিষয়" 
                      placeholder="যোগাযোগের কারণ" 
                      {...register('subject')}
                      value={watch('subject')}
                      onChange={(e) => setValue('subject', e.target.value, { shouldValidate: true })}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-[11px] text-red-400 flex items-center gap-1 font-hind font-bold">
                        <AlertCircle size={12} /> {errors.subject.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text)]/60 mb-2 font-hind">
                    বার্তা
                  </label>
                  <textarea
                    placeholder="আপনার বার্তাটি এখানে বিস্তারিত লিখুন..."
                    rows={4}
                    {...register('message')}
                    className="w-full px-4 py-3 bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--text)]/30 border border-[var(--border)] rounded-2xl focus:outline-none focus:border-[var(--primary)]/50 transition-all duration-300 resize-none text-sm font-medium"
                  />
                  {errors.message && (
                    <p className="mt-0.5 text-[11px] text-red-400 flex items-center gap-1 font-hind font-bold">
                      <AlertCircle size={12} /> {errors.message.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full font-hind h-12 mt-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" /> পাঠানো হচ্ছে...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send size={16} /> বার্তা পাঠান
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
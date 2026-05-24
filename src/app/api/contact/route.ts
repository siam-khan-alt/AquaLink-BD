import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import { connectDB } from '@/shared/lib/db';
import { ContactMessage } from '@/models/ContactMessage';
const contactSchema = z.object({
  name: z.string().min(2, "নাম কমপক্ষে ২ অক্ষর হতে হবে"),
  email: z.string().email("সঠিক ইমেইল ঠিকানা দিন"),
  subject: z.string().min(5, "বিষয় কমপক্ষে ৫ অক্ষর হতে হবে"),
  message: z.string().min(10, "বার্তা কমপক্ষে ১০ অক্ষর হতে হবে").max(2000, "বার্তা ২০০০ অক্ষরের বেশি হতে পারবে না"),
});

type ContactData = z.infer<typeof contactSchema>;

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: '@upstash/ratelimit/contact',
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    if (ratelimit) {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      
      if (!success) {
        return NextResponse.json(
          { 
            error: 'অতিরিক্ত অনুরোধ। অনুগ্রহ করে ১ ঘণ্টা পর আবার চেষ্টা করুন।',
            limit,
            reset,
            remaining 
          },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'অবৈধ ডেটা',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const data: ContactData = validationResult.data;

    await connectDB();
    await ContactMessage.create({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    return NextResponse.json(
      { 
        message: 'বার্তা সফলভাবে পাঠানো হয়েছে',
        data: {
          name: data.name,
          email: data.email,
          subject: data.subject,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { 
        error: 'সার্ভার ত্রুটি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Contact API endpoint' },
    { status: 200 }
  );
}

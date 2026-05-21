import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/shared/lib/db";
import { MarketPrice } from "@/models/MarketPrice";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const priceSchema = z.object({
  fishType: z.string().min(1, "মাছের নাম বাধ্যতামূলক"),
  wholesalePrice: z.number().min(0, "পাইকারি দর ০ এর চেয়ে বেশি হতে হবে"),
  retailPrice: z.number().min(0, "খুচরা দর ০ এর চেয়ে বেশি হতে হবে"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const validatedData = priceSchema.parse(body);

    const updatedPrice = await MarketPrice.findOneAndUpdate(
      { fishType: validatedData.fishType },
      {
        wholesalePrice: validatedData.wholesalePrice,
        retailPrice: validatedData.retailPrice,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Trigger On-Demand ISR Revalidation for SEO pages
    revalidatePath(`/market-prices/${validatedData.fishType}`);
    revalidatePath("/market-prices");

    return NextResponse.json({ success: true, data: updatedPrice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

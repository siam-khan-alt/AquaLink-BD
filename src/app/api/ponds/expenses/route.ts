import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/shared/lib/db";
import { Pond } from "@/models/Pond";
import { getToken } from "next-auth/jwt";
import { Types } from "mongoose";
import { z } from "zod";

const expenseTypes = ["Feed", "Seed/Pona", "Medicine", "Fertilizer", "Other"] as const;

const createExpenseSchema = z.object({
  pondId: z.string().min(1, "পুকুর আইডি প্রদান করতে হবে"),
  type: z.string().refine((val) => expenseTypes.includes(val as any), {
    message: "সঠিক খরচের ধরন নির্বাচন করুন",
  }),
  amount: z.number().min(0.01, "পরিমাণ ০ এর চেয়ে বেশি হতে হবে"),
  date: z.string().or(z.date()).optional(),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "farmer") {
      return NextResponse.json(
        { error: "Unauthorized. Farmer access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const farmerId = token.id as string;

    const ponds = await Pond.find({ owner: new Types.ObjectId(farmerId) }).sort({ createdAt: -1 });

    const allExpenses: Array<{
      _id: string;
      pondId: string;
      pondName: string;
      type: string;
      amount: number;
      date: Date;
      note?: string;
    }> = [];

    ponds.forEach((pond) => {
      if (pond.expenses && pond.expenses.length > 0) {
        pond.expenses.forEach((expense: any) => {
          allExpenses.push({
            _id: expense._id?.toString() || `${pond._id}-${expense.date?.getTime() || Date.now()}`,
            pondId: pond._id.toString(),
            pondName: pond.name,
            type: expense.type,
            amount: expense.amount,
            date: expense.date,
            note: expense.note,
          });
        });
      }
    });

    allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, expenses: allExpenses }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error fetching expenses:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== "farmer") {
      return NextResponse.json(
        { error: "Unauthorized. Farmer access only." },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const parsedData = createExpenseSchema.parse(body);

    const farmerId = token.id as string;

    const pond = await Pond.findOne({
      _id: new Types.ObjectId(parsedData.pondId),
      owner: new Types.ObjectId(farmerId),
    });

    if (!pond) {
      return NextResponse.json(
        { error: "পুকুর পাওয়া যায়নি অথবা আপনার অনুমতি নেই" },
        { status: 404 }
      );
    }

    const newExpense = {
      type: parsedData.type,
      amount: parsedData.amount,
      date: parsedData.date ? new Date(parsedData.date) : new Date(),
      note: parsedData.note,
    };

    pond.expenses.push(newExpense);
    await pond.save();

    return NextResponse.json({ success: true, expense: newExpense }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown Error";
    console.error("Error creating expense:", message);
    return NextResponse.json(
      { error: "Internal server error: " + message },
      { status: 500 }
    );
  }
}

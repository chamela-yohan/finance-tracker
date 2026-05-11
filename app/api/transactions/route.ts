import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";

const createTransactionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

// GET /api/transactions
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Parse filter params from URL
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // INCOME | EXPENSE
    const categoryId = searchParams.get("categoryId");
    const from = searchParams.get("from"); // date range start
    const to = searchParams.get("to"); // date range end

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        ...(type && { type: type as "INCOME" | "EXPENSE" }),
        ...(categoryId && { categoryId }),
        ...(from &&
          to && {
            date: {
              gte: new Date(from),
              lte: new Date(to),
            },
          }),
      },
      include: {
        category: true, // category name and color
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (err) {
    console.error("[TRANSACTIONS_GET]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/transactions
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const validation = createTransactionSchema.safeParse(body);

    if (!validation.success)
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );

    const { title, amount, type, categoryId, date, note } = validation.data;

    // Verify category belongs to this user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category)
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount,
        type,
        categoryId,
        date: new Date(date),
        note,
        userId,
      },
      include: { category: true },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("[TRANSACTIONS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

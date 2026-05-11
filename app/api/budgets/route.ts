import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createBudgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be positive"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});

// GET /api/budgets
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    // Fetch budgets with their categories
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        ...(month && { month: parseInt(month) }),
        ...(year && { year: parseInt(year) }),
      },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });

    // For each budget, calculate how much was actually spent
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            date: {
              gte: new Date(budget.year, budget.month - 1, 1), // First date 1
              lte: new Date(budget.year, budget.month, 0), // Last date 31 or 30
            },
          },
          _sum: { amount: true }, // SUM()
        });

        return {
          ...budget,
          spent: Number(spending._sum.amount ?? 0),
        };
      }),
    );

    return NextResponse.json(budgetsWithSpending);
  } catch (error) {
    console.error("[BUDGETS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/budgets
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createBudgetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const { categoryId, amount, month, year } = validation.data;

    // Verify category belongs to this user and is EXPENSE type
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, type: "EXPENSE" },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Expense category not found" },
        { status: 404 },
      );
    }

    const budget = await prisma.budget.create({
      data: { categoryId, amount, month, year, userId },
      include: { category: true },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Budget already exists for this category and month" },
        { status: 409 },
      );
    }
    console.error("[BUDGETS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

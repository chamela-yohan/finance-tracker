import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    

    const { searchParams } = new URL(req.url);
    const month = parseInt(
      searchParams.get("month") ?? String(new Date().getMonth() + 1),
    );
    const year = parseInt(
      searchParams.get("year") ?? String(new Date().getFullYear()),
    );

    // Date range for selected month
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    // Run ALL queries in parallel (for performance)
    const [
      totalIncomeResult,
      totalExpenseResult,
      categoryExpenses,
      monthlyTrend,
      budgets,
      recentTransactions,
    ] = await Promise.all([
      // Total income this month
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // Total expenses this month
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
      }),

      // Expenses grouped by category (for pie chart)
      prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: monthStart, lte: monthEnd },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),

      // Monthly income vs expense for last 6 months (for bar chart)
      prisma.$queryRaw<
        Array<{ month: number; year: number; type: string; total: number }>
      >`
        SELECT 
          EXTRACT(MONTH FROM date)::int AS month,
          EXTRACT(YEAR FROM date)::int AS year,
          type,
          SUM(amount)::float AS total
        FROM "Transaction"
        WHERE "userId" = ${userId}
          AND date >= ${new Date(year, month - 7, 1)}
          AND date <= ${monthEnd}
        GROUP BY month, year, type
        ORDER BY year ASC, month ASC
      `,

      // 5. Budgets with spending for this month
      prisma.budget.findMany({
        where: { userId, month, year },
        include: { category: true },
      }),

      // 6. Recent 5 transactions
      prisma.transaction.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      }),
    ]);

    // Attach category info to categoryExpenses
    const categoryIds = categoryExpenses.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    // Format category expenses for pie chart
    const expenseByCategory = categoryExpenses.map((c) => ({
      name: categoryMap[c.categoryId]?.name ?? "Unknown",
      value: Number(c._sum.amount ?? 0),
      color: categoryMap[c.categoryId]?.color ?? "#gray",
    }));

    // Format monthly trend for bar chart
    // Build last 6 months array with income + expense for each
    const trendMap: Record<
      string,
      { month: string; income: number; expense: number }
    > = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = d.toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      trendMap[key] = { month: label, income: 0, expense: 0 };
    }

    for (const row of monthlyTrend) {
      const key = `${row.year}-${row.month}`;
      if (trendMap[key]) {
        if (row.type === "INCOME") trendMap[key].income = row.total;
        else trendMap[key].expense = row.total;
      }
    }

    const monthlyTrendFormatted = Object.values(trendMap);

    // Calculate budget vs actual for chart
    const budgetVsActual = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            type: "EXPENSE",
            date: { gte: monthStart, lte: monthEnd },
          },
          _sum: { amount: true },
        });

        return {
          name: budget.category.name,
          budget: Number(budget.amount),
          actual: Number(spending._sum.amount ?? 0),
          color: budget.category.color,
        };
      }),
    );

    const totalIncome = Number(totalIncomeResult._sum.amount ?? 0);
    const totalExpense = Number(totalExpenseResult._sum.amount ?? 0);

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        budgetUsage:
          budgets.length > 0
            ? Math.round(
                (budgetVsActual.reduce((s, b) => s + b.actual, 0) /
                  budgetVsActual.reduce((s, b) => s + b.budget, 0)) *
                  100,
              )
            : 0,
      },
      expenseByCategory,
      monthlyTrend: monthlyTrendFormatted,
      budgetVsActual,
      recentTransactions,
    });
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

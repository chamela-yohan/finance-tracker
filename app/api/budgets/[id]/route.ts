import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { z } from "zod";

const updateBudgetSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

// PUT /api/budgets/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validation = updateBudgetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: { amount: validation.data.amount },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[BUDGETS_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/budgets/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BUDGETS_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
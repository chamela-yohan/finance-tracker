import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTransactionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  categoryId: z.string().optional(),
  date: z.string().optional(),
  note: z.string().optional(),
});

// PUT /api/transactions/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const validation = updateTransactionSchema.safeParse(body);

    if (!validation.success)
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 },
      );

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );

    const { date, ...rest } = validation.data;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        ...rest,
        ...(date && { date: new Date(date) }),
      },
      include: { category: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[TRANSACTIONS_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/transactions/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing)
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );

    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRANSACTIONS_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

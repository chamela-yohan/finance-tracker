import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { seedDefaultCategories } from "@/lib/seed-categories";

export async function POST() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await seedDefaultCategories(userId);
  
  return NextResponse.json({ success: true });
}
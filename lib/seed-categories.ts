import { prisma } from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  // Income
  {
    name: "Salary",
    type: "INCOME" as const,
    color: "#16a34a",
    icon: "briefcase",
  },
  {
    name: "Freelance",
    type: "INCOME" as const,
    color: "#15803d",
    icon: "laptop",
  },
  {
    name: "Investments",
    type: "INCOME" as const,
    color: "#4ade80",
    icon: "trending-up",
  },
  // Expenses
  {
    name: "Food",
    type: "EXPENSE" as const,
    color: "#f59e0b",
    icon: "utensils",
  },
  {
    name: "Transport",
    type: "EXPENSE" as const,
    color: "#3b82f6",
    icon: "car",
  },
  { name: "Rent", type: "EXPENSE" as const, color: "#ef4444", icon: "home" },
  {
    name: "Entertainment",
    type: "EXPENSE" as const,
    color: "#8b5cf6",
    icon: "tv",
  },
  {
    name: "Healthcare",
    type: "EXPENSE" as const,
    color: "#ec4899",
    icon: "heart",
  },
];

export async function seedDefaultCategories(userId: string) {
  console.log("DEFAULT CATEGORY CREATED");
  // Only seed if user has no categories yet
  const existing = await prisma.category.count({ where: { userId } });
  if (existing > 0) return;

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({ ...cat, userId })),
    skipDuplicates: true,
  });
}

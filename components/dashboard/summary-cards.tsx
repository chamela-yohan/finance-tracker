import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  budgetUsage: number;
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  balance,
  budgetUsage,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Income",
      value: `$${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: `$${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      valueColor: "text-red-500",
    },
    {
      title: "Current Balance",
      value: `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      iconBg: balance >= 0 ? "bg-green-100" : "bg-red-100",
      iconColor: balance >= 0 ? "text-green-600" : "text-red-500",
      valueColor: balance >= 0 ? "text-green-600" : "text-red-500",
    },
    {
      title: "Budget Usage",
      value: `${budgetUsage}%`,
      icon: PiggyBank,
      iconBg: budgetUsage >= 100
        ? "bg-red-100"
        : budgetUsage >= 80
        ? "bg-yellow-100"
        : "bg-green-100",
      iconColor: budgetUsage >= 100
        ? "text-red-500"
        : budgetUsage >= 80
        ? "text-yellow-600"
        : "text-green-600",
      valueColor: budgetUsage >= 100
        ? "text-red-500"
        : budgetUsage >= 80
        ? "text-yellow-600"
        : "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{card.title}</p>
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", card.iconBg)}>
                <Icon className={cn("w-4 h-4", card.iconColor)} />
              </div>
            </div>
            <p className={cn("text-2xl font-bold", card.valueColor)}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
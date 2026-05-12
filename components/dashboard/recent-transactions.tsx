import { format } from "date-fns";
import { TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface RecentTransaction {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  category: {
    name: string;
    color: string;
  };
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {transactions.map((t) => {
        const isIncome = t.type === "INCOME";
        return (
          <div
            key={t.id}
            className="flex items-center justify-between py-2.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${t.category.color}20` }}
              >
                {isIncome ? (
                  <TrendingUp
                    className="w-3.5 h-3.5"
                    style={{ color: t.category.color }}
                  />
                ) : (
                  <TrendingDown
                    className="w-3.5 h-3.5"
                    style={{ color: t.category.color }}
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t.title}</p>
                <p className="text-xs text-gray-400">
                  {t.category.name} · {format(new Date(t.date), "MMM dd")}
                </p>
              </div>
            </div>

            {/* Right */}
            <span
              className={`text-sm font-semibold ${
                isIncome ? "text-green-600" : "text-red-500"
              }`}
            >
              {isIncome ? "+" : "-"}$
              {Number(t.amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        );
      })}

      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
          asChild
        >
          <Link href="/transactions">View all transactions →</Link>
        </Button>
      </div>
    </div>
  );
}
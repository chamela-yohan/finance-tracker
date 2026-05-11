"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Budget } from "@/hooks/use-budgets";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const percentage = Math.min(
    Math.round((budget.spent / budget.amount) * 100),
    100
  );

  const remaining = budget.amount - budget.spent;
  const isOverBudget = budget.spent > budget.amount;
  const isWarning = percentage >= 80 && !isOverBudget;

  // Color changes based on spending level
  const progressColor = isOverBudget
    ? "bg-red-500"
    : isWarning
    ? "bg-yellow-500"
    : "bg-green-500";

  return (
    <div
      className={cn(
        "bg-white rounded-xl border p-5 transition-all",
        isOverBudget
          ? "border-red-200 bg-red-50/30"
          : isWarning
          ? "border-yellow-200 bg-yellow-50/30"
          : "border-gray-100"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${budget.category.color}20` }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: budget.category.color }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {budget.category.name}
            </p>
            <p className="text-xs text-gray-400">Monthly Budget</p>
          </div>
        </div>

        {/* Warning icon + Actions */}
        <div className="flex items-center gap-1">
          {(isOverBudget || isWarning) && (
            <AlertTriangle
              className={cn(
                "w-4 h-4 mr-1",
                isOverBudget ? "text-red-500" : "text-yellow-500"
              )}
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-gray-600"
            onClick={() => onEdit(budget)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-red-600"
            onClick={() => onDelete(budget.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress
          value={percentage}
          className="h-2"
          // Override progress bar color dynamically
          style={
            {
              "--progress-color": isOverBudget
                ? "#ef4444"
                : isWarning
                ? "#eab308"
                : budget.category.color,
            } as React.CSSProperties
          }
        />

        {/* Amounts */}
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">
            Spent:{" "}
            <span
              className={cn(
                "font-medium",
                isOverBudget ? "text-red-600" : "text-gray-700"
              )}
            >
              ${budget.spent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </span>
          <span className="text-gray-500">
            Budget:{" "}
            <span className="font-medium text-gray-700">
              ${Number(budget.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </span>
        </div>
      </div>

      {/* Status message */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        {isOverBudget ? (
          <p className="text-xs text-red-600 font-medium">
            ⚠️ Over budget by $
            {Math.abs(remaining).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            <span
              className={cn(
                "font-medium",
                isWarning ? "text-yellow-600" : "text-green-600"
              )}
            >
              ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })} remaining
            </span>
            {" "}· {percentage}% used
          </p>
        )}
      </div>
    </div>
  );
}
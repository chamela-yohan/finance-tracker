"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/use-categories";
import { TransactionFilters } from "@/hooks/use-transactions";
import { X } from "lucide-react";

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function TransactionFilterBar({
  filters,
  onChange,
}: TransactionFiltersProps) {
  const { data: categories } = useCategories();
  const hasFilters = filters.type || filters.categoryId;

  return (
    <div className="flex flex-row gap-2 items-center flex-wrap">
      {/* Type filter */}
      <Select
        value={filters.type ?? "ALL"}
        onValueChange={(val) =>
          onChange({
            ...filters,
            type: val === "ALL" ? undefined : (val as "INCOME" | "EXPENSE"),
            categoryId: undefined,
          })
        }
      >
        <SelectTrigger className="flex-1 min-w-30 h-9 text-sm">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="INCOME">💰 Income</SelectItem>
          <SelectItem value="EXPENSE">💸 Expense</SelectItem>
        </SelectContent>
      </Select>

      {/* Category filter */}
      <Select
        value={filters.categoryId ?? "ALL"}
        onValueChange={(val) =>
          onChange({
            ...filters,
            categoryId: val === "ALL" ? undefined : val,
          })
        }
      >
        <SelectTrigger className="flex-1 min-w-32.5 h-9 text-sm">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          {categories
            ?.filter((c) => !filters.type || c.type === filters.type)
            .map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange({})}
          className="h-9 w-9 shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
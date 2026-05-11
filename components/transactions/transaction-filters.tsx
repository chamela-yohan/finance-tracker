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
    <div className="flex flex-wrap gap-2 items-center">
      {/* Type filter */}
      <Select
        value={filters.type ?? "ALL"}
        onValueChange={(val) =>
          onChange({
            ...filters,
            type: val === "ALL" ? undefined : (val as "INCOME" | "EXPENSE"),
            categoryId: undefined, // reset category when type changes
          })
        }
      >
        <SelectTrigger className="w-36 h-9 text-sm">
          <SelectValue placeholder="All types" />
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
        <SelectTrigger className="w-44 h-9 text-sm">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          {categories
            ?.filter((c) => !filters.type || c.type === filters.type)
            .map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
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
          size="sm"
          onClick={() => onChange({})}
          className="h-9 text-gray-500 hover:text-gray-700"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
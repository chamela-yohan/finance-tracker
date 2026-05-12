"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  useTransactions,
  useDeleteTransaction,
  Transaction,
  TransactionFilters,
} from "@/hooks/use-transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionFilterBar } from "@/components/transactions/transaction-filters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: transactions, isLoading } = useTransactions(filters);
  const deleteTransaction = useDeleteTransaction();

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTransaction(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteTransaction.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  // Calculate totals from filtered results
  const totals = transactions?.reduce(
    (acc, t) => {
      if (t.type === "INCOME") acc.income += Number(t.amount);
      else acc.expense += Number(t.amount);
      return acc;
    },
    { income: 0, expense: 0 },
  ) ?? { income: 0, expense: 0 };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500 mt-1">Manage your income and expenses</p>
        </div>
        <Button
          onClick={() => setFormOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            +$
            {totals.income.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-xl font-bold text-red-500 mt-1">
            -$
            {totals.expense.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Balance</p>
          <p
            className={`text-xl font-bold mt-1 ${
              totals.income - totals.expense >= 0
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            $
            {(totals.income - totals.expense).toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <TransactionFilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No transactions found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setFormOpen(true)}
            >
              Add your first transaction
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onEdit={handleEdit}
                onDelete={setDeletingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <TransactionForm
        open={formOpen}
        onClose={handleCloseForm}
        transaction={editingTransaction}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Transaction Row Component
function TransactionRow({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${transaction.category.color}20` }}
      >
        {isIncome ? (
          <TrendingUp
            className="w-4 h-4"
            style={{ color: transaction.category.color }}
          />
        ) : (
          <TrendingDown
            className="w-4 h-4"
            style={{ color: transaction.category.color }}
          />
        )}
      </div>

      {/* Info — takes all remaining space */}
      <div className="flex-1 min-w-0">
        {/* Title — truncate if too long */}
        <p className="text-sm font-medium text-gray-900 truncate">
          {transaction.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {/* Category badge */}
          <span
            className="text-xs px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              backgroundColor: `${transaction.category.color}20`,
              color: transaction.category.color,
            }}
          >
            {transaction.category.name}
          </span>

          {/* Date */}
          <span className="text-xs text-gray-400 shrink-0">
            {format(new Date(transaction.date), "MMM dd, yyyy")}
          </span>

          {/* Note — only show on larger screens */}
          {transaction.note && (
            <span className="text-xs text-gray-400 truncate hidden sm:block max-w-25">
              · {transaction.note}
            </span>
          )}
        </div>
      </div>

      {/* Amount + Actions — always on right, never wrap */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-sm font-semibold tabular-nums ${
            isIncome ? "text-green-600" : "text-red-500"
          }`}
        >
          {isIncome ? "+" : "-"}$
          {Number(transaction.amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(transaction)}>
              <Pencil className="w-3.5 h-3.5 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(transaction.id)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

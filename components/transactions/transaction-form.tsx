"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateTransaction,
  useUpdateTransaction,
  Transaction,
} from "@/hooks/use-transactions";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  date: z.date({ error: "Date is required" }),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function TransactionForm({
  open,
  onClose,
  transaction,
}: TransactionFormProps) {
  const isEditing = !!transaction;
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: 0,
      type: "EXPENSE",
      categoryId: "",
      date: new Date(),
      note: "",
    },
  });

  const selectedType = form.watch("type");

  // Filter categories by selected type
  const filteredCategories =
    categories?.filter((c) => c.type === selectedType) ?? [];

  useEffect(() => {
    if (transaction) {
      form.reset({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        categoryId: transaction.categoryId,
        date: new Date(transaction.date),
        note: transaction.note ?? "",
      });
    } else {
      form.reset({
        title: "",
        amount: 0,
        type: "EXPENSE",
        categoryId: "",
        date: new Date(),
        note: "",
      });
    }
  }, [transaction, form]);

  // Reset categoryId when type changes
  useEffect(() => {
    form.setValue("categoryId", "");
  }, [selectedType, form]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      date: values.date.toISOString(),
    };

    if (isEditing) {
      await updateTransaction.mutateAsync({ id: transaction.id, ...payload });
    } else {
      await createTransaction.mutateAsync(payload);
    }
    onClose();
  };

  const isPending = createTransaction.isPending || updateTransaction.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Type Toggle */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {(["INCOME", "EXPENSE"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => field.onChange(t)}
                        disabled={isEditing}
                        className={cn(
                          "py-2 rounded-lg text-sm font-medium border transition-all",
                          field.value === t && t === "INCOME"
                            ? "bg-green-50 border-green-500 text-green-700"
                            : field.value === t && t === "EXPENSE"
                              ? "bg-red-50 border-red-400 text-red-700"
                              : "border-gray-200 text-gray-500 hover:bg-gray-50",
                        )}
                      >
                        {t === "INCOME" ? "💰 Income" : "💸 Expense"}
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Monthly Salary" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-7"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditing}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.length === 0 ? (
                        <p className="text-sm text-gray-400 px-2 py-4 text-center">
                          No {selectedType.toLowerCase()} categories found
                        </p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add a note..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {isPending
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  note?: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
    type: string;
  };
};

export type TransactionFilters = {
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  from?: string;
  to?: string;
};

export function useTransactions(filters?: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.set("type", filters.type);
      if (filters?.categoryId) params.set("categoryId", filters.categoryId);
      if (filters?.from) params.set("from", filters.from);
      if (filters?.to) params.set("to", filters.to);

      const { data } = await axios.get<Transaction[]>(
        `/api/transactions?${params.toString()}`
      );
      return data;
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Transaction, "id" | "category">) => {
      const res = await axios.post("/api/transactions", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error ?? "Failed to add transaction");
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: Partial<Transaction> & { id: string }) => {
      const res = await axios.put(`/api/transactions/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error ?? "Failed to update transaction"
      );
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/transactions/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.error ?? "Failed to delete transaction"
      );
    },
  });
}
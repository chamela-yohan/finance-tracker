import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  spent: number; // calculated by API
  category: {
    id: string;
    name: string;
    color: string;
  };
};

export function useBudgets(month?: number, year?: number) {
  return useQuery({
    queryKey: ["budgets", month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.set("month", month.toString());
      if (year) params.set("year", year.toString());

      const { data } = await axios.get<Budget[]>(
        `/api/budgets?${params.toString()}`
      );
      return data;
    },
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Budget, "id" | "spent" | "category">) => {
      const res = await axios.post("/api/budgets", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error ?? "Failed to create budget");
    },
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const res = await axios.put(`/api/budgets/${id}`, { amount });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error ?? "Failed to update budget");
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/budgets/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error ?? "Failed to delete budget");
    },
  });
}
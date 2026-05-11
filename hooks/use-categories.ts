import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

export type Category = {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon?: string;
};

// Fetch categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await axios.get<Category[]>("/api/categories");
      return data;
    },
  });
}

// Create category
export function useCreateCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Category, "id">) => {
      const res = await axios.post("/api/categories", data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error ?? "Failed to create category");
    },
  });
}

// Update category
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Category> & { id: string }) => {
      const res = await axios.put(`/api/categories/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error ?? "Faild to update category");
    },
  });
}

// Delete category
export function useDeleteCategory() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error ?? "Failed to delete category");
    },
  });
}
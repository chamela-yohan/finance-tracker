import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export type DashboardData = {
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    budgetUsage: number;
  };
  expenseByCategory: {
    name: string;
    value: number;
    color: string;
  }[];
  monthlyTrend: {
    month: string;
    income: number;
    expense: number;
  }[];
  budgetVsActual: {
    name: string;
    budget: number;
    actual: number;
    color: string;
  }[];
  recentTransactions: {
    id: string;
    title: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    category: {
      name: string;
      color: string;
    };
  }[];
};

export function useDashboard(month: number, year: number) {
  return useQuery({
    queryKey: ["dashboard", month, year],
    queryFn: async () => {
      const { data } = await axios.get<DashboardData>(
        `/api/dashboard?month=${month}&year=${year}`
      );
      return data;
    },
  });
}
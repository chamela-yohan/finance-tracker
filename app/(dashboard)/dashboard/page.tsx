"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/use-dashboard";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { ExpensePieChart } from "@/components/dashboard/expense-pie-chart";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { BudgetVsActualChart } from "@/components/dashboard/budget-vs-actual-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};


const MONTHS = [
  "January","February","March","April",
  "May","June","July","August",
  "September","October","November","December",
];

export default function DashboardPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  const { data, isLoading } = useDashboard(selectedMonth, selectedYear);

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const currentYear = today.getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header + Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your financial overview</p>
        </div>

        {/* Month navigator */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg px-2 py-1">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-7 w-7">
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Select
            value={selectedMonth.toString()}
            onValueChange={(val) => setSelectedMonth(parseInt(val))}
          >
            <SelectTrigger className="w-32 h-7 text-sm border-0 shadow-none font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear.toString()}
            onValueChange={(val) => setSelectedYear(parseInt(val))}
          >
            <SelectTrigger className="w-20 h-7 text-sm border-0 shadow-none font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-7 w-7">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards {...data.summary} />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Expense Distribution
          </h2>
          <ExpensePieChart data={data.expenseByCategory} />
        </div>

        {/* Monthly Income vs Expense */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Income vs Expenses (Last 6 Months)
          </h2>
          <MonthlyTrendChart data={data.monthlyTrend} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Budget vs Actual */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Budget vs Actual Spending
          </h2>
          <BudgetVsActualChart data={data.budgetVsActual} />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Recent Transactions
          </h2>
          <RecentTransactions transactions={data.recentTransactions} />
        </div>
      </div>
    </div>
  );
}
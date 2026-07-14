"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp, TrendingDown, Target, Wallet } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

export default function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-data"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-destructive">Failed to load analytics data.</div>;
  }

  const { balance, income, expense, chartData, categoryData, healthScore } = data;

  const totalSavings = income - expense;
  const savingsRate = income > 0 ? (totalSavings / income) * 100 : 0;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSavings * 100)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              For the last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Percentage of income saved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Health Status</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthScore.status}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Score: {healthScore.score} / 100
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow History</CardTitle>
            <CardDescription>Income vs Expense trend over the past 30 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="date" tickFormatter={(tick) => format(new Date(tick), "MMM d")} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value) * 100)} labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")} />
                  <Legend />
                  <Area type="monotone" name="Income" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Area type="monotone" name="Expense" dataKey="expense" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No cash flow data available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Expenses</CardTitle>
            <CardDescription>Distribution of expenses by categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pt-4">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value) * 100)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No category breakdown data available.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Expenses grouped by category with percentages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryData.map((cat: any, i: number) => {
              const percentage = expense > 0 ? (cat.value / expense) * 100 : 0;
              return (
                <div key={cat.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.name.charAt(0) + cat.name.slice(1).toLowerCase()}</span>
                    <div className="space-x-2">
                      <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                      <span className="font-semibold">{formatCurrency(cat.value * 100)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: COLORS[i % COLORS.length],
                        width: `${percentage}%`
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {categoryData.length === 0 && (
              <div className="text-muted-foreground text-sm text-center py-4">No expense breakdown available. Add some expenses first.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

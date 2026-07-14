"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Target, TrendingUp, AlertCircle, CheckCircle2, PlusCircle, RefreshCw, Trash2, UserPlus, Settings, Download } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

function getActivityUI(activity: any) {
  const action = activity.action;
  const iconClass = "h-4 w-4";

  switch (action) {
    case "TRANSACTION_CREATED":
      return {
        title: "Added Transaction",
        icon: <PlusCircle className={`${iconClass} text-emerald-500`} />,
        bg: "bg-emerald-50 dark:bg-emerald-950/20"
      };
    case "TRANSACTION_UPDATED":
      return {
        title: "Updated Transaction",
        icon: <RefreshCw className={`${iconClass} text-blue-500`} />,
        bg: "bg-blue-50 dark:bg-blue-950/20"
      };
    case "TRANSACTION_DELETED":
      return {
        title: "Deleted Transaction",
        icon: <Trash2 className={`${iconClass} text-rose-500`} />,
        bg: "bg-rose-50 dark:bg-rose-950/20"
      };
    case "USER_REGISTERED":
      return {
        title: "Account Registered",
        icon: <UserPlus className={`${iconClass} text-violet-500`} />,
        bg: "bg-violet-50 dark:bg-violet-950/20"
      };
    case "SETTINGS_UPDATED":
      return {
        title: "Settings Updated",
        icon: <Settings className={`${iconClass} text-zinc-500`} />,
        bg: "bg-zinc-50 dark:bg-zinc-950/20"
      };
    case "DATA_EXPORTED":
      return {
        title: "Exported Data",
        icon: <Download className={`${iconClass} text-amber-500`} />,
        bg: "bg-amber-50 dark:bg-amber-950/20"
      };
    default:
      return {
        title: action.split("_").map((w: string) => w.charAt(0) + w.slice(1).toLowerCase()).join(" "),
        icon: <Activity className={`${iconClass} text-zinc-500`} />,
        bg: "bg-zinc-50 dark:bg-zinc-950/20"
      };
  }
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
          <Skeleton className="col-span-1 lg:col-span-4 h-[400px]" />
          <Skeleton className="col-span-1 lg:col-span-3 h-[400px]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-destructive">Failed to load dashboard data.</div>;
  }

  const { balance, income, expense, chartData, categoryData, healthScore, insights, recentActivity } = data;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(balance * 100)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+{formatCurrency(income * 100)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">-{formatCurrency(expense * 100)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{healthScore.score}</span>
              <span className="text-sm text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Status: {healthScore.status}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
            <CardDescription>Income vs Expense over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <XAxis dataKey="date" tickFormatter={(tick) => format(new Date(tick), "MMM d")} />
                  <YAxis />
                  <Tooltip labelFormatter={(label) => format(new Date(label), "MMM d, yyyy")} />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="expense" stackId="2" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No chart data available.</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Where your money went.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value) * 100)} />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No category data available.</div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Smart Insights</CardTitle>
            <CardDescription>AI-generated insights based on your spending.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {healthScore.recommendations.map((rec: string, i: number) => (
                <li key={`rec-${i}`} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
              {insights.map((insight: string, i: number) => (
                <li key={`ins-${i}`} className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                {recentActivity.map((activity: any) => {
                  const ui = getActivityUI(activity);
                  return (
                    <div key={activity.id} className="flex items-center gap-3 border-b pb-4 last:border-0 last:pb-0">
                      <div className={`p-2 rounded-full ${ui.bg} shrink-0`}>
                        {ui.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{ui.title}</p>
                        {activity.details && (
                          <p className="text-xs text-muted-foreground truncate">{activity.details}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0 ml-2">
                        {format(new Date(activity.createdAt), "MMM d, h:mm a")}
                      </div>
                    </div>
                  );
                })}
                {recentActivity.length === 0 && (
                  <div className="text-sm text-muted-foreground">No recent activity.</div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

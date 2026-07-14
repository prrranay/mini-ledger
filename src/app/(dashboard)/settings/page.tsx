"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [notifyIncome, setNotifyIncome] = useState(false);
  const [notifyExpense, setNotifyExpense] = useState(false);
  const [currency, setCurrency] = useState("INR");

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (data) {
      setEmail(data.email || "");
      setNotifyIncome(data.notifyIncome || false);
      setNotifyExpense(data.notifyExpense || false);
      setCurrency(data.currency || "INR");
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, notifyIncome, notifyExpense, currency }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      // Invalidate dashboard and transactions queries so currency changes take effect immediately
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: () => {
      toast.error("Failed to save settings");
    }
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-64 w-full" /></div>;
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Preferences</CardTitle>
          <CardDescription>Manage your alerts, preferred currency, and account preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="items-start">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
            />
            <p className="text-sm text-muted-foreground">Where we should send your notifications.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="items-start">Default Currency</Label>
            <Select value={currency} onValueChange={(val) => setCurrency(val || "INR")}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="JPY">JPY (¥)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Choose the default currency for your balance, income/expense reports, and trends.</p>
          </div>

          <div className="flex items-start justify-between space-x-2 pt-2 border-t">
            <Label htmlFor="notifyIncome" className="flex flex-col items-start space-y-1">
              <span className="font-medium">Income Alerts</span>
              <span className="font-normal text-sm text-muted-foreground">Receive an email when new income is recorded.</span>
            </Label>
            <Switch id="notifyIncome" checked={notifyIncome} onCheckedChange={setNotifyIncome} />
          </div>

          <div className="flex items-start justify-between space-x-2 pt-2 border-t">
            <Label htmlFor="notifyExpense" className="flex flex-col items-start space-y-1">
              <span className="font-medium">Expense Alerts</span>
              <span className="font-normal text-sm text-muted-foreground">Receive an email when a new expense is recorded.</span>
            </Label>
            <Switch id="notifyExpense" checked={notifyExpense} onCheckedChange={setNotifyExpense} />
          </div>

          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="mt-4">
            {mutation.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => toast.error("Not implemented for demo.")}>
            Delete All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

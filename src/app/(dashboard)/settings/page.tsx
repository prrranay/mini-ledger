"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [notifyIncome, setNotifyIncome] = useState(false);
  const [notifyExpense, setNotifyExpense] = useState(false);

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
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, notifyIncome, notifyExpense }),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Settings saved successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
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
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive alerts for your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
            />
            <p className="text-sm text-muted-foreground">Where we should send your notifications.</p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notifyIncome" className="flex flex-col space-y-1">
              <span>Income Alerts</span>
              <span className="font-normal text-sm text-muted-foreground">Receive an email when new income is recorded.</span>
            </Label>
            <Switch id="notifyIncome" checked={notifyIncome} onCheckedChange={setNotifyIncome} />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notifyExpense" className="flex flex-col space-y-1">
              <span>Expense Alerts</span>
              <span className="font-normal text-sm text-muted-foreground">Receive an email when a new expense is recorded.</span>
            </Label>
            <Switch id="notifyExpense" checked={notifyExpense} onCheckedChange={setNotifyExpense} />
          </div>

          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
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

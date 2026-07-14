"use client";

import { usePwa } from "@/providers/pwa-provider";
import { Sparkles, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PwaInstallBanner() {
  const { showBanner, installApp, dismissBanner } = usePwa();

  if (!showBanner) return null;

  return (
    <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-violet-500/10 via-primary/5 to-emerald-500/10 p-5 shadow-sm backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0 mt-0.5 sm:mt-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-1.5">
              Install Mini Ledger App
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Add Mini Ledger to your home screen for quick offline access, push alerts, and a fast native experience.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          <Button size="sm" variant="ghost" onClick={dismissBanner} className="text-muted-foreground hover:text-foreground">
            Later
          </Button>
          <Button size="sm" onClick={installApp} className="gap-1.5 shadow-md">
            <Download className="h-4 w-4" /> Install App
          </Button>
        </div>
      </div>
      <button 
        onClick={dismissBanner} 
        className="absolute top-3 right-3 text-muted-foreground/60 hover:text-foreground transition-colors p-1"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300 ease-in-out sm:translate-x-0 sm:flex",
      open ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex h-14 items-center border-b px-6 font-semibold tracking-tight">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">M</span>
          </div>
          <span>Mini Ledger</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="grid gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setOpen?.(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto border-t p-4">
        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-1 text-sm font-medium">Pro Tip</h4>
          <p className="text-xs text-muted-foreground">
            Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">CTRL K</kbd> to open the command menu.
          </p>
        </div>
      </div>
    </aside>
  );
}

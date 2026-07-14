"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { CommandPalette } from "./command-palette";

export default function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50/50 dark:bg-gray-950">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full min-w-0">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8 min-w-0">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

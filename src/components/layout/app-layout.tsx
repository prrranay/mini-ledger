"use client";

import { ReactNode } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { CommandPalette } from "./command-palette";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50/50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <Header />
        <main className="flex-1 items-start p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}

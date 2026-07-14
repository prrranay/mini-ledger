"use client";

import { Search, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { data: session } = useSession();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <Button size="icon" variant="outline" className="sm:hidden" onClick={onMenuToggle}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
        <div className="relative ml-auto flex-1 md:grow-0 hidden sm:block">
          {/* We'll use the Command Palette for search, but keep a visual cue here */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search (Ctrl+K)..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              readOnly
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {'key': 'k', 'ctrlKey': true}))}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <Button size="sm" className="hidden sm:flex gap-1" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Add Transaction</span>
          </Button>

          {/* Mobile version of the plus button */}
          <Button size="icon" className="sm:hidden rounded-full h-8 w-8" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="ghost" size="icon" className="rounded-full" />
            }>
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user?.image || ""} alt="Avatar" />
                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = "/settings"}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AddTransactionModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </>
  );
}

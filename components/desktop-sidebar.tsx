"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Users, Camera, Plus, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChequeNotifications } from "@/components/cheque-notifications";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/ledger", label: "Cheque Ledger", icon: BookOpen },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/scan", label: "Scan Ledger", icon: Camera },
];

export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Receipt className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-xl font-semibold text-sidebar-foreground">
          Ledgerly
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Add Cheque Button and Notifications */}
      <div className="border-t border-sidebar-border p-4 space-y-4">
        <Button
          asChild
          className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
        >
          <Link href="/add-cheque">
            <Plus className="mr-2 h-4 w-4" />
            Add New Cheque
          </Link>
        </Button>

        {/* Cheque Notifications Section */}
        <ChequeNotifications />
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Users,
  FileText,
  Plus,
  Receipt,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NotificationBadge,
  NotificationsPanel,
} from "@/components/notifications-panel";
import { notificationsStore } from "@/lib/notifications-store";
import { settingsStore } from "@/lib/settings-store";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/ledger", label: "Cheque Ledger", icon: BookOpen },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/reports", label: "Daily Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [brandName, setBrandName] = useState("Ledgerly");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    // Load settings on mount and subscribe for updates
    settingsStore.loadSettings();
    const currentSettings = settingsStore.getSettings();
    setBrandName(currentSettings.brandName);
    setLogoUrl(currentSettings.logoUrl);

    const handleSettingsChange = (newSettings: {
      brandName: string;
      logoUrl: string;
    }) => {
      setBrandName(newSettings.brandName);
      setLogoUrl(newSettings.logoUrl);
    };

    const unsubscribe = settingsStore.subscribe(handleSettingsChange);
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setBrandName("Ledgerly");
    setLogoUrl("");
    router.push("/login");
  };

  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadCount(notificationsStore.getUnreadCount());
    };

    updateUnreadCount();
    // Update count when panel opens/closes
    const interval = setInterval(updateUnreadCount, 1000);
    return () => clearInterval(interval);
  }, [isNotificationsOpen]);

  return (
    <>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          {logoUrl ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary overflow-hidden">
              <img
                src={logoUrl}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Receipt className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
          )}
          <span className="text-xl font-semibold text-sidebar-foreground">
            {brandName}
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
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Notifications Button */}
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <div className="flex items-center gap-2">
              <NotificationBadge unreadCount={unreadCount} />
              <span>Notifications</span>
            </div>
          </Button>
        </div>

        {/* Add Cheque Button */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <Button
            asChild
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
          >
            <Link href="/add-cheque">
              <Plus className="mr-2 h-4 w-4" />
              Add New Cheque
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={handleSignOut}
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </div>
          </Button>
        </div>
      </aside>

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}

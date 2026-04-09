"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Home, BookOpen, Users, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  NotificationBadge,
  NotificationsPanel,
} from "@/components/notifications-panel";
import { notificationsStore } from "@/lib/notifications-store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/ledger", label: "Ledger", icon: BookOpen },
  { href: "/suppliers", label: "Suppliers", icon: Users },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadCount(notificationsStore.getUnreadCount());
    };

    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 1000);
    return () => clearInterval(interval);
  }, [isNotificationsOpen]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card md:hidden safe-area-inset-bottom">
        <div className="mx-auto flex w-full max-w-md items-center justify-around py-1 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 px-3 py-2.5 text-xs font-medium transition-colors min-h-[56px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground active:text-foreground",
                )}
              >
                <item.icon
                  className={cn("h-6 w-6", isActive && "text-primary")}
                />
                <span className="text-[11px] whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-1 flex-col items-center justify-center gap-1 px-3 py-2.5 text-xs font-medium min-h-[56px] h-auto"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <NotificationBadge unreadCount={unreadCount} />
            <span className="text-[11px] whitespace-nowrap">
              Notifications
            </span>
          </Button>
        </div>
      </nav>
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}

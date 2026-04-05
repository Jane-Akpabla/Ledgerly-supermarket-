"use client";

import { MobileNav } from "./mobile-nav";
import { DesktopSidebar } from "./desktop-sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <main className="pb-20 md:pb-0 md:pl-64">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}

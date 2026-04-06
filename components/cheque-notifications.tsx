"use client";

import { Bell, Check, XCircle, PauseCircle, TrendingDown } from "lucide-react";
import { useCheques } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChequeNotification {
  id: string;
  type: "cleared" | "bounced" | "stopped" | "added";
  chequeNo: string;
  supplier: string;
  amount: number;
  timestamp: Date;
}

export function ChequeNotifications() {
  const { cheques } = useCheques();

  // Generate mock notifications from cheques for demo purposes
  const notifications: ChequeNotification[] = cheques
    .slice(0, 5)
    .map((cheque, index) => {
      const types: Array<"cleared" | "bounced" | "stopped" | "added"> = [
        "cleared",
        "bounced",
        "stopped",
        "added",
      ];
      const type = types[index % types.length];

      return {
        id: cheque.id,
        type,
        chequeNo: cheque.chequeNo,
        supplier: cheque.supplier,
        amount: cheque.amount,
        timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      };
    });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "cleared":
        return <Check className="h-4 w-4 text-success" />;
      case "bounced":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "stopped":
        return <PauseCircle className="h-4 w-4 text-warning" />;
      case "added":
        return <TrendingDown className="h-4 w-4 text-primary" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case "cleared":
        return "Cheque Cleared";
      case "bounced":
        return "Cheque Bounced";
      case "stopped":
        return "Cheque Stopped";
      case "added":
        return "Cheque Added";
      default:
        return "Update";
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex flex-col gap-3 border-t border-sidebar-border pt-4">
      <div className="flex items-center gap-2 px-3">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-sidebar-foreground/70">
          Recent Updates
        </h3>
      </div>
      <ScrollArea className="h-48">
        <div className="space-y-2 px-3">
          {notifications.length === 0 ? (
            <p className="text-xs text-sidebar-foreground/50 py-4">
              No recent updates
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-2.5 text-xs hover:bg-sidebar-accent/50 transition-colors"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sidebar-foreground truncate">
                    {getNotificationLabel(notification.type)}
                  </p>
                  <p className="text-sidebar-foreground/60 truncate">
                    {notification.chequeNo} - {notification.supplier}
                  </p>
                  <p className="text-sidebar-foreground/50 text-xs mt-1">
                    {formatTime(notification.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

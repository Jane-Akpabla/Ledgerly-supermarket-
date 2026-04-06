"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, X, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notificationsStore, Notification } from "@/lib/notifications-store";
import { formatDate } from "@/lib/data";

interface NotificationBadgeProps {
  unreadCount: number;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationBadge({ unreadCount }: NotificationBadgeProps) {
  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}

export function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoading(true);
      await notificationsStore.initialize();
      setNotifications(notificationsStore.getNotifications());
      setIsLoading(false);
    };

    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    await notificationsStore.markAsRead(id);
    setNotifications(notificationsStore.getNotifications());
  };

  const handleMarkAllAsRead = async () => {
    await notificationsStore.markAllAsRead();
    setNotifications(notificationsStore.getNotifications());
  };

  const handleRemove = async (id: string) => {
    await notificationsStore.removeNotification(id);
    setNotifications(notificationsStore.getNotifications());
  };

  const handleClearAll = async () => {
    await notificationsStore.clearAll();
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "supplier_added":
      case "cheque_added":
        return <AlertCircle className="h-4 w-4 text-success" />;
      case "supplier_updated":
      case "cheque_cleared":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "cheque_bounced":
      case "cheque_stopped":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "supplier_deleted":
        return <Trash2 className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "supplier_added":
      case "cheque_added":
        return "bg-success/10 border-success/20";
      case "supplier_updated":
      case "cheque_cleared":
        return "bg-success/10 border-success/20";
      case "cheque_bounced":
      case "cheque_stopped":
        return "bg-destructive/10 border-destructive/20";
      case "supplier_deleted":
        return "bg-warning/10 border-warning/20";
      default:
        return "bg-secondary/10 border-secondary/20";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-background shadow-lg md:max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-bold">Notifications</h2>
            {notifications.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {notifications.filter((n) => !n.read).length} unread
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex gap-2 border-b border-border p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex-1 text-xs"
            >
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="flex-1 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 140px)" }}
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 rounded-lg border p-3 transition-all ${
                    notification.read
                      ? "border-border/50 bg-muted/30"
                      : getNotificationColor(notification.type)
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

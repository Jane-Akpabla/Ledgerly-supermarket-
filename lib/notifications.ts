import { create } from "zustand";

export interface Notification {
  id: string;
  type:
    | "supplier_added"
    | "supplier_updated"
    | "supplier_deleted"
    | "cheque_added"
    | "cheque_cleared"
    | "cheque_bounced"
    | "cheque_stopped";
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotifications = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      notifications: [
        {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, 50), // Keep latest 50 notifications
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        read: true,
      })),
    }));
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notif) => notif.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  getUnreadCount: () => {
    return get().notifications.filter((notif) => !notif.read).length;
  },
}));

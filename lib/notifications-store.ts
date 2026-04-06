import { supabase, type NotificationRow } from "./supabase";

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
}

let notifications: Notification[] = [];
let isInitialized = false;

// Convert database row to Notification
function convertRowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: new Date(row.timestamp),
    read: row.read,
  };
}

// Initialize notifications from database
async function initializeNotifications() {
  if (isInitialized || !supabase) return;

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching notifications:", error);
      return;
    }

    notifications = (data as NotificationRow[]).map(convertRowToNotification);
    isInitialized = true;
  } catch (err) {
    console.error("Error initializing notifications:", err);
  }
}

export const notificationsStore = {
  getNotifications: () => [...notifications],

  addNotification: async (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => {
    if (!supabase) {
      console.error("Supabase not initialized");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            type: notification.type,
            title: notification.title,
            description: notification.description,
            timestamp: new Date().toISOString(),
            read: false,
          },
        ])
        .select();

      if (error) {
        console.error("Error adding notification:", error);
        return null;
      }

      const newNotification = data?.[0]
        ? convertRowToNotification(data[0] as NotificationRow)
        : null;

      if (newNotification) {
        notifications = [newNotification, ...notifications].slice(0, 50);
      }

      return newNotification;
    } catch (err) {
      console.error("Error in addNotification:", err);
      return null;
    }
  },

  markAsRead: async (id: string) => {
    if (!supabase) {
      console.error("Supabase not initialized");
      return;
    }

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) {
        console.error("Error marking notification as read:", error);
        return;
      }

      notifications = notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      );
    } catch (err) {
      console.error("Error in markAsRead:", err);
    }
  },

  markAllAsRead: async () => {
    if (!supabase) {
      console.error("Supabase not initialized");
      return;
    }

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false);

      if (error) {
        console.error("Error marking all as read:", error);
        return;
      }

      notifications = notifications.map((notif) => ({ ...notif, read: true }));
    } catch (err) {
      console.error("Error in markAllAsRead:", err);
    }
  },

  removeNotification: async (id: string) => {
    if (!supabase) {
      console.error("Supabase not initialized");
      return;
    }

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error removing notification:", error);
        return;
      }

      notifications = notifications.filter((notif) => notif.id !== id);
    } catch (err) {
      console.error("Error in removeNotification:", err);
    }
  },

  clearAll: async () => {
    if (!supabase) {
      console.error("Supabase not initialized");
      return;
    }

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .gt("id", "");

      if (error) {
        console.error("Error clearing notifications:", error);
        return;
      }

      notifications = [];
    } catch (err) {
      console.error("Error in clearAll:", err);
    }
  },

  getUnreadCount: () => {
    return notifications.filter((notif) => !notif.read).length;
  },

  initialize: initializeNotifications,
};

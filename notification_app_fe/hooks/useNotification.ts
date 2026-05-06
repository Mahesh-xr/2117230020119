import { useState, useEffect } from "react";
import { Log } from "../utils/logger";
import { Notification } from "../utils/priorityScore";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN;

interface FetchParams {
  page?: number;
  limit?: number;
  notification_type?: string;
}

export function useNotifications(params: FetchParams = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch_notifications() {
      try {
        await Log("frontend", "info", "hook", "Fetching notifications from API");
        setLoading(true);

        // build query string from params
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.notification_type) query.append("notification_type", params.notification_type);

        const res = await fetch(`${API_URL}/notifications?${query.toString()}`, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        if (!res.ok) {
          await Log("frontend", "error", "hook", `API responded with status ${res.status}`);
          setError(`Failed to fetch notifications: ${res.status}`);
          return;
        }

        const data = await res.json();

        if (!data.notifications || data.notifications.length === 0) {
          await Log("frontend", "warn", "hook", "API returned empty notifications list");
          setNotifications([]);
          return;
        }

        await Log("frontend", "info", "hook", `Loaded ${data.notifications.length} notifications`);
        setNotifications(data.notifications);

      } catch (err) {
        await Log("frontend", "fatal", "hook", `Unexpected error fetching notifications: ${err}`);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetch_notifications();
  }, [params.page, params.limit, params.notification_type]);

  return { notifications, loading, error };
}
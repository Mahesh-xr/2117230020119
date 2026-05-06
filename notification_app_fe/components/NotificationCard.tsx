"use client";

import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import { Notification } from "../utils/priorityScore";
import { Log } from "../utils/logger";

// color per notification type so user can distinguish at a glance
const TYPE_COLOR: Record<string, "success" | "warning" | "info"> = {
  Placement: "success",
  Result: "warning",
  Event: "info",
};

interface Props {
  notification: Notification;
  isRead: boolean;
  onRead: (id: string) => void;
}

export default function NotificationCard({ notification, isRead, onRead }: Props) {
  const handleClick = async () => {
    if (!isRead) {
      await Log("frontend", "info", "component", `Notification ${notification.ID} marked as read`);
      onRead(notification.ID);
    }
  };

  return (
    <Card
      onClick={handleClick}
      sx={{
        mb: 1.5,
        cursor: "pointer",
        // unread notifications have a left border highlight
        borderLeft: isRead ? "4px solid transparent" : "4px solid #1976d2",
        backgroundColor: isRead ? "#fafafa" : "#fff",
        opacity: isRead ? 0.75 : 1,
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
          <Chip
            label={notification.Type}
            color={TYPE_COLOR[notification.Type]}
            size="small"
          />
          {/* show unread dot if not yet read */}
          {!isRead && (
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#1976d2" }} />
          )}
        </Box>
        <Typography variant="body1" sx={{ fontWeight: isRead ? 400 : 600, mt: 0.5 }}>
          {notification.Message}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(notification.Timestamp).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
"use client";

import { useState, useEffect } from "react";
import {
  Container, Typography, Box, Select, MenuItem,
  FormControl, InputLabel, Pagination, CircularProgress, Alert
} from "@mui/material";

import Navbar from "../components/Navbar";
import NotificationCard from "../components/NotificationCard";
import { useNotifications } from "../hooks/useNotification";
import { Log } from "../utils/logger";

export default function AllNotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  // tracking read IDs in localStorage so it persists across page navigations
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const { notifications, loading, error } = useNotifications({
    page,
    limit: 10,
    notification_type: typeFilter || undefined,
  });

  // load read IDs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("readNotifications");
    if (stored) setReadIds(new Set(JSON.parse(stored)));
    Log("frontend", "info", "page", "All notifications page mounted");
  }, []);

  const markAsRead = async (id: string) => {
    const updated = new Set(readIds).add(id);
    setReadIds(updated);
    localStorage.setItem("readNotifications", JSON.stringify([...updated]));
  };

  const handleFilterChange = async (value: string) => {
    await Log("frontend", "info", "page", `Filter changed to: ${value || "all"}`);
    setTypeFilter(value);
    setPage(1);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, flex: 1, minWidth: "150px" }}>
            All Notifications
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={typeFilter}
              label="Filter by Type"
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && notifications.map(n => (
          <NotificationCard
            key={n.ID}
            notification={n}
            isRead={readIds.has(n.ID)}
            onRead={markAsRead}
          />
        ))}

        {!loading && !error && notifications.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={Math.ceil((notifications.length + 990) / 10)}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
            />
          </Box>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info">No notifications found</Alert>
        )}
      </Container>
    </>
  );
}
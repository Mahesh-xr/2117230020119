"use client";

import { useState, useEffect } from "react";
import {
  Container, Typography, Box, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Slider
} from "@mui/material";
import Navbar from "../../components/Navbar";
import NotificationCard from "../../components/NotificationCard";
import { useNotifications } from "../../hooks/useNotification";
import { getTopN } from "../../utils/priorityScore";
import { Log } from "../../utils/logger";

export default function PriorityPage() {
  const [topN, setTopN] = useState(10);
  const [typeFilter, setTypeFilter] = useState("");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // fetch all so we can rank client side
  const { notifications, loading, error } = useNotifications({
    notification_type: typeFilter || undefined,
  });

  useEffect(() => {
    const stored = localStorage.getItem("readNotifications");
    if (stored) setReadIds(new Set(JSON.parse(stored)));
    Log("frontend", "info", "page", "Priority inbox page mounted");
  }, []);

  const prioritized = getTopN(notifications, topN);

  const markAsRead = async (id: string) => {
    const updated = new Set(readIds).add(id);
    setReadIds(updated);
    localStorage.setItem("readNotifications", JSON.stringify([...updated]));
  };

  const handleTopNChange = async (_: Event, value: number | number[]) => {
    const n = value as number;
    await Log("frontend", "info", "page", `Top-N changed to ${n}`);
    setTopN(n);
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Priority Inbox
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3, alignItems: "center" }}>
          {/* slider to pick how many top notifications to show */}
          <Box sx={{ width: 250 }}>
            <Typography variant="body2" gutterBottom>
              Show top {topN} notifications
            </Typography>
            <Slider
              value={topN}
              min={5}
              max={20}
              step={5}
              marks
              onChange={handleTopNChange}
              valueLabelDisplay="auto"
            />
          </Box>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={typeFilter}
              label="Filter by Type"
              onChange={(e) => {
                Log("frontend", "info", "page", `Priority filter changed to ${e.target.value || "all"}`);
                setTypeFilter(e.target.value);
              }}
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

        {!loading && !error && prioritized.map(n => (
          <NotificationCard
            key={n.ID}
            notification={n}
            isRead={readIds.has(n.ID)}
            onRead={markAsRead}
          />
        ))}
      </Container>
    </>
  );
}
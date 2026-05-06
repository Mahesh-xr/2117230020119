"use client";

import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { Log } from "../utils/logger";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = async (path: string, label: string) => {
    await Log("frontend", "info", "component", `User navigated to ${label} page`);
    router.push(path);
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Campus Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate("/", "All Notifications")}
            sx={{ fontWeight: pathname === "/" ? 700 : 400 }}
          >
            All
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate("/priority", "Priority Inbox")}
            sx={{ fontWeight: pathname === "/priority" ? 700 : 400 }}
          >
            Priority
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
// app/Sidebar.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MapIcon from "@mui/icons-material/Map";

export default function Sidebar() {
  const router = useRouter();

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "background.default",
        borderRight: "1px solid",
        borderColor: "divider",
        p: 2,
        position: "fixed",
        height: "100vh",
      }}
    >
      <Typography variant="h6" gutterBottom>
        MyWeather
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Real-time forecasts
      </Typography>

      <Divider sx={{ my: 2 }} />

      <List>
        <ListItemButton onClick={() => router.push("/")}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => router.push("/map")}>
          <ListItemIcon>
            <MapIcon />
          </ListItemIcon>
          <ListItemText primary="Map" />
        </ListItemButton>
      </List>
    </Box>
  );
}

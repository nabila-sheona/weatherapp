// app/NavBar.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { ThemeModeContext } from "./theme";

export default function NavBar() {
  const router = useRouter();
  const { toggleColorMode, mode } = React.useContext(ThemeModeContext);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?city=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleGeolocation = () => {
    if (typeof window === "undefined") return; // Add window check

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        router.push(`/search?lat=${latitude}&lon=${longitude}`);
      },
      (error) => {
        alert(`Geolocation error: ${error.message}`);
      }
    );
  };

  return (
    <AppBar
      position="static"
      sx={{ bgcolor: "background.paper", color: "text.primary", mb: 4 }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ mr: 2 }}>
          MyWeather
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          flexGrow={1}
          maxWidth={600}
          mx={2}
        >
          <TextField
            label="Search city"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            sx={{ mr: 1 }}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <IconButton onClick={handleSearch}>
            <SearchIcon />
          </IconButton>
          <IconButton onClick={handleGeolocation}>
            <MyLocationIcon />
          </IconButton>
        </Box>

        <IconButton onClick={toggleColorMode}>
          {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

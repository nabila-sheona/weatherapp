// Example: app/components/ThemeToggleButton.tsx
"use client";

import React, { useContext } from "react";
import { ThemeModeContext } from "../theme";
import { IconButton } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function ThemeToggleButton() {
  const { toggleColorMode, mode } = useContext(ThemeModeContext);

  return (
    <IconButton onClick={toggleColorMode}>
      {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
    </IconButton>
  );
}

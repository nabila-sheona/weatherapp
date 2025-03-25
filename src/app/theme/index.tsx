// app/theme/index.tsx
"use client";

import React, { createContext, useState, useMemo, ReactNode } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  PaletteMode,
} from "@mui/material";
import { lightPalette, darkPalette } from "./palette";

// Define the context type
interface ThemeModeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

// Create the context
export const ThemeModeContext = createContext<ThemeModeContextType>({
  toggleColorMode: () => {},
  mode: "light",
});

// Create the custom theme provider
export default function CustomThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mode, setMode] = useState<PaletteMode>("light");

  // Toggle theme mode
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
      mode,
    }),
    [mode]
  );

  // Create MUI theme based on the mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: mode === "light" ? lightPalette : darkPalette,
        typography: { fontFamily: "Roboto, sans-serif" },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

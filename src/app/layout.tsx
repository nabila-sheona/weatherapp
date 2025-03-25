// app/layout.tsx
import "./globals.css";
import { Metadata } from "next";
import CustomThemeProvider from "./theme";
import NavBar from "./NavBar";
import Sidebar from "./Sidebar";
import { Box } from "@mui/material";

export const metadata: Metadata = {
  title: "MyWeather",
  description: "A playful weather app powered by Open-Meteo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CustomThemeProvider>
          <NavBar />
          <Box display="flex">
            <Sidebar />
            <Box
              component="main"
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "background.default",
                marginLeft: "240px",
                minHeight: "100vh",
              }}
            >
              {children}
            </Box>
          </Box>
        </CustomThemeProvider>
      </body>
    </html>
  );
}

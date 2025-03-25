// app/weather/WeeklyForecastCard.tsx
"use client";

import React from "react";
import { Card, CardContent, Typography, Grid, Box, Paper } from "@mui/material";
import { format } from "date-fns";

const weatherDescriptions: { [key: number]: string } = {
  0: "☀️ Sunny",
  1: "🌤️ Mostly Sunny",
  2: "⛅ Partly Cloudy",
  3: "☁️ Cloudy",
  45: "🌫️ Fog",
  48: "🌫️ Freezing Fog",
  51: "🌦️ Light Drizzle",
  53: "🌦️ Drizzle",
  55: "🌧️ Heavy Drizzle",
  56: "🌧️ Freezing Drizzle",
  57: "❄️ Heavy Freezing Drizzle",
  61: "🌧️ Light Rain",
  63: "🌧️ Rain",
  65: "🌧️ Heavy Rain",
  71: "❄️ Light Snow",
  73: "❄️ Snow",
  75: "❄️ Heavy Snow",
  77: "❄️ Snow Grains",
  80: "🌧️ Light Showers",
  81: "🌧️ Showers",
  82: "🌧️ Heavy Showers",
  85: "❄️ Snow Showers",
  86: "❄️ Heavy Snow Showers",
  95: "⛈️ Thunderstorm",
  96: "⛈️ Hail Storm",
  99: "⛈️ Heavy Hail Storm",
};

interface DailyForecast {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
  precipitation_sum: number[];
}

export default function WeeklyForecastCard({
  daily,
}: {
  daily: DailyForecast;
}) {
  if (!daily || daily.time.length === 0) return null;

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        7-Day Forecast
      </Typography>
      <Grid container spacing={2}>
        {daily.time.slice(0, 7).map((date, index) => (
          <Grid item xs={12} sm={6} md={4} lg={12 / 7} key={date}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="subtitle1">
                  {format(new Date(date), "EEEE")}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2">
                    {weatherDescriptions[daily.weathercode[index]] || "N/A"}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  ▲ {Math.round(daily.temperature_2m_max[index])}°C
                </Typography>
                <Typography variant="body2">
                  ▼ {Math.round(daily.temperature_2m_min[index])}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  💧 {daily.precipitation_sum[index]}mm
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

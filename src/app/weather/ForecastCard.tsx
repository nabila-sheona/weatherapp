// app/weather/ForecastCard.tsx
"use client";

import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { format } from "date-fns";

interface ForecastWeather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

type ForecastCardProps = {
  dateTime: number; // in seconds
  temp: number;
  weather: ForecastWeather;
  isHourly: boolean;
  compact?: boolean; // Add compact prop
};

export default function ForecastCard({
  dateTime,
  temp,
  weather,
  isHourly,
  compact = false, // Destructure compact prop
}: ForecastCardProps) {
  const date = new Date(dateTime * 1000);
  const displayDate = isHourly
    ? format(date, "HH:mm")
    : format(date, "EEE, MMM d");
  const roundedTemp = Math.round(temp);

  return (
    <Card
      sx={{
        p: compact ? 1 : 2,
        minWidth: compact ? 100 : 120,
        textAlign: "center",
      }}
    >
      <CardContent>
        <Typography variant={compact ? "body2" : "h6"}>
          {displayDate}
        </Typography>
        <Typography variant={compact ? "h6" : "h4"} sx={{ my: 1 }}>
          {roundedTemp}°C
        </Typography>
        <Typography variant={compact ? "caption" : "body2"}>
          {weather.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

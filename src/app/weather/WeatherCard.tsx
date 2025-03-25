// app/weather/WeatherCard.tsx
"use client";

import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
}
interface WeatherData {
  current_weather?: CurrentWeather;
  location?: { name?: string; country?: string };
  hourly?: {
    temperature_2m?: number[];
    relativehumidity_2m?: number[];
    weathercode?: number[];
    time?: string[];
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
}

const weatherDescriptions: { [key: number]: string } = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export default function WeatherCard({ weather }: { weather: WeatherData }) {
  if (!weather.current_weather || !weather.location) {
    return (
      <Card>
        <CardContent>
          <Typography>No current weather data.</Typography>
        </CardContent>
      </Card>
    );
  }

  const { temperature, weathercode, windspeed, time } = weather.current_weather;
  const desc = weatherDescriptions[weathercode] || "Unknown";
  const tempRounded = Math.round(temperature);

  const currentDate = new Date(time);
  const formattedDate = currentDate
    .toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/,/g, "")
    .toUpperCase();

  const hourlyIndex = weather.hourly?.time?.indexOf(time) ?? 0;
  const humidity = weather.hourly?.relativehumidity_2m?.[hourlyIndex] ?? "N/A";

  const dailyIndex =
    weather.daily?.time?.findIndex((d) =>
      d.startsWith(currentDate.toISOString().split("T")[0])
    ) ?? 0;
  const maxTemp = weather.daily?.temperature_2m_max?.[dailyIndex] ?? "N/A";
  const minTemp = weather.daily?.temperature_2m_min?.[dailyIndex] ?? "N/A";

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {weather.location.name}, {weather.location.country}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {formattedDate}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h2">{tempRounded}°C</Typography>
            <Typography variant="body1" color="text.secondary">
              {desc}
            </Typography>
          </Box>

          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              Wind: {windspeed} km/h
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Humidity: {humidity}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              H: {maxTemp}° L: {minTemp}°
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

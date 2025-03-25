/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";

import "leaflet/dist/leaflet.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import WeeklyForecastCard from "./weather/WeeklyForecastCard";
//import WeatherCard from "./weather/WeatherCard";
import ForecastCard from "./weather/ForecastCard";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamically import Leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  time: string;
}

interface WeatherData {
  hourly: {
    temperature_2m: number[];
    time: string[];
    weathercode: number[];
    relativehumidity_2m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
    precipitation_sum: number[];
  };
  current_weather: CurrentWeather;
  latitude: number;
  longitude: number;
  location: {
    name: string;
    country: string;
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

export default function Home() {
  const [mainWeatherData, setMainWeatherData] = useState<WeatherData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMainLocationWeather = async () => {
      try {
        setLoading(true);
        setError("");
        if (typeof window === "undefined") return;

        // Try to get current location first
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        // Reverse geocode to get location name
        const reverseGeoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&count=1`
        );
        const reverseGeoJson = await reverseGeoRes.json();

        let locationName = "Your Location";
        let countryName = "";
        if (reverseGeoJson.results?.length) {
          locationName = reverseGeoJson.results[0].name;
          countryName = reverseGeoJson.results[0].country;
        }

        // Fetch weather data
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current_weather=true&hourly=weathercode,temperature_2m,relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        if (!weatherRes.ok) throw new Error("Weather fetch failed");
        const weatherJson = await weatherRes.json();

        setMainWeatherData({
          ...weatherJson,
          location: {
            name: locationName,
            country: countryName,
          },
        });
      } catch (err: any) {
        console.error("Using default location due to error:", err);
        // Fallback to Dhaka
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=Dhaka&count=1`
        );
        const geoJson = await geoRes.json();
        const { latitude, longitude, name, country } = geoJson.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=weathercode,temperature_2m,relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        const weatherJson = await weatherRes.json();
        setMainWeatherData({
          ...weatherJson,
          location: { name, country },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMainLocationWeather();
  }, []);
  // Safe map rendering function
  const renderMap = () => {
    if (typeof window === "undefined" || !mainWeatherData) return null;

    return (
      <MapContainer
        center={[mainWeatherData.latitude, mainWeatherData.longitude]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker
          position={[mainWeatherData.latitude, mainWeatherData.longitude]}
        >
          <Popup>{mainWeatherData.location.name}</Popup>
        </Marker>
      </MapContainer>
    );
  };

  // Safe array access helper
  const getArrayValue = <T,>(arr: T[], index: number): T | undefined => {
    if (!arr || index < 0 || index >= arr.length) return undefined;
    return arr[index];
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {mainWeatherData?.location.name
          ? `${mainWeatherData.location.name}, ${mainWeatherData.location.country} Weather`
          : "Weather Dashboard"}
      </Typography>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}
      {error && <Typography color="error">{error}</Typography>}

      {mainWeatherData && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ height: 300, mb: 2 }}>{renderMap()}</Paper>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6">Humidity</Typography>
              <Typography>
                {getArrayValue(mainWeatherData.hourly.relativehumidity_2m, 0) ??
                  "N/A"}
                %
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                24-Hour Forecast
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mb: 4, overflowX: "auto" }}>
                {mainWeatherData.hourly.time
                  .map((time, index) => ({ time, index }))
                  .filter(({ time }) => {
                    const current = new Date(
                      mainWeatherData.current_weather.time
                    );
                    const forecastTime = new Date(time);
                    return (
                      forecastTime.getDate() === current.getDate() &&
                      forecastTime >= current
                    );
                  })
                  .slice(0, 3)
                  .map(({ time, index }) => (
                    <Box key={time} sx={{ minWidth: 120 }}>
                      <ForecastCard
                        dateTime={new Date(time).getTime() / 1000}
                        temp={mainWeatherData.hourly.temperature_2m[index]}
                        weather={{
                          id: mainWeatherData.hourly.weathercode[index],
                          main: "Unknown",
                          description:
                            weatherDescriptions[
                              mainWeatherData.hourly.weathercode[index]
                            ] || "Unknown",
                          icon: "",
                        }}
                        isHourly
                        compact={false}
                      />
                    </Box>
                  ))}
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Temperature Trend (Next 12 Hours)
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={mainWeatherData.hourly.time
                      .map((time, index) => ({
                        time: new Date(time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        temp: mainWeatherData.hourly.temperature_2m[index],
                      }))
                      .filter((_, index) => index >= 3)
                      .slice(0, 12)}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ fill: "#8884d8" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {mainWeatherData?.daily && (
                <WeeklyForecastCard daily={mainWeatherData.daily} />
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ height: 300, mb: 2 }}>
              {mainWeatherData && (
                <MapContainer
                  center={[mainWeatherData.latitude, mainWeatherData.longitude]}
                  zoom={6}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker
                    position={[
                      mainWeatherData.latitude,
                      mainWeatherData.longitude,
                    ]}
                  >
                    <Popup>{mainWeatherData.location.name}</Popup>
                  </Marker>
                </MapContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

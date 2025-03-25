// app/MapDashboard.tsx
"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngTuple } from "leaflet";
import { Box, Typography, Paper, CircularProgress, Grid } from "@mui/material";

interface WeatherData {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
  hourly: {
    temperature_2m: number[];
    time: string[];
    weathercode: number[];
    relativehumidity_2m: number[];
  };
  latitude: number;
  longitude: number;
}

export default function MapDashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        try {
          setLoading(true);
          setError("");
          const { lat, lng } = e.latlng;

          // Get location name
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${lat},${lng}&count=1`
          );
          const geoJson = await geoRes.json();
          const name = geoJson.results?.[0]?.name || "Selected Location";
          setLocationName(name);

          // Get weather data
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=weathercode,temperature_2m,relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
          );

          if (!weatherRes.ok) throw new Error("Weather data not available");
          const weatherJson = await weatherRes.json();

          setWeatherData({
            ...weatherJson,
            latitude: lat,
            longitude: lng,
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch data");
        } finally {
          setLoading(false);
        }
      },
    });
    return null;
  };

  return (
    <Box sx={{ p: 2, ml: 30 }}>
      <Typography variant="h4" gutterBottom>
        Interactive Weather Map
      </Typography>

      <Paper sx={{ height: 500, mb: 2 }}>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler />

          {weatherData && (
            <Marker
              position={
                [weatherData.latitude, weatherData.longitude] as LatLngTuple
              }
            >
              <Popup>{locationName}</Popup>
            </Marker>
          )}
        </MapContainer>
      </Paper>

      {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}
      {error && <Typography color="error">{error}</Typography>}

      {weatherData && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {locationName}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>Temperature</Typography>
                  <Typography variant="h4">
                    {weatherData.current_weather.temperature}°C
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>Wind Speed</Typography>
                  <Typography variant="h4">
                    {weatherData.current_weather.windspeed} km/h
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                3-Hour Forecast
              </Typography>
              <Grid container spacing={2}>
                {weatherData.hourly.time.slice(0, 3).map((time, i) => (
                  <Grid item xs={4} key={time}>
                    <Typography variant="body2">
                      {new Date(time).toLocaleTimeString([], {
                        hour: "2-digit",
                      })}
                    </Typography>
                    <Typography variant="h6">
                      {weatherData.hourly.temperature_2m[i]}°C
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Humidity
              </Typography>
              <Typography variant="h3">
                {weatherData.hourly.relativehumidity_2m[0]}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

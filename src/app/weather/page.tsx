/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, ChangeEvent } from "react";
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Grid,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { ThemeModeContext } from "../theme";
import WeatherCard from "./WeatherCard";
import ForecastCard from "./ForecastCard";

export default function WeatherPage() {
  const { toggleColorMode, mode } = React.useContext(ThemeModeContext);

  const [city, setCity] = useState<string>("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Handle city input
  const handleCityChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCity(e.target.value);
  };

  // Fetch weather by city name using Open-Meteo
  const fetchWeatherByCity = async (cityName: string) => {
    try {
      setLoading(true);
      setError("");
      setWeatherData(null);

      // 1. Get coordinates via the Open-Meteo Geocoding API
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1`
      );
      if (!geoRes.ok) throw new Error("Geocoding failed");
      const geoJson = await geoRes.json();
      if (!geoJson.results || geoJson.results.length === 0) {
        throw new Error("City not found");
      }
      const { latitude, longitude, name, country } = geoJson.results[0];

      // 2. Fetch forecast & current weather from Open-Meteo API
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&timezone=auto`
      );
      if (!weatherRes.ok) throw new Error("Weather data not available");
      const weatherJson = await weatherRes.json();

      // Add location info to the weather data
      weatherJson.location = { name, country, latitude, longitude };

      setWeatherData(weatherJson);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search by city
  const handleSearch = () => {
    if (city.trim() !== "") {
      fetchWeatherByCity(city);
    }
  };

  // Handle geolocation using Open-Meteo directly
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoading(true);
          setError("");
          setWeatherData(null);

          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset&timezone=auto`
          );
          if (!weatherRes.ok)
            throw new Error("Failed to get weather by geolocation");

          const weatherJson = await weatherRes.json();
          // Attach basic location info (lat & lon) to the response
          weatherJson.location = { latitude, longitude };

          setWeatherData(weatherJson);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Geolocation error: " + err.message);
      }
    );
  };

  return (
    <Box p={2}>
      {/* Top bar: location input, geolocation button, theme toggle */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="Enter city"
            variant="outlined"
            value={city}
            onChange={handleCityChange}
            size="small"
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
      </Box>

      {/* Loading/Error */}
      {loading && (
        <Box textAlign="center" mt={2}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Box textAlign="center" mt={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Weather Results */}
      {weatherData && !loading && (
        <Box mt={4}>
          {/* Current Weather Card: Adjust WeatherCard to accept Open-Meteo data */}
          <WeatherCard weather={weatherData} />

          {/* Hourly Forecast */}
          <Typography variant="h6" mt={4} mb={2}>
            Next 12 Hours Forecast
          </Typography>
          <Grid container spacing={2}>
            {weatherData.hourly &&
              weatherData.hourly.time
                .slice(0, 12)
                .map((time: string, index: number) => {
                  // Create a forecast item similar to OpenWeather's structure
                  const forecastItem = {
                    dt: new Date(time).getTime() / 1000,
                    main: { temp: weatherData.hourly.temperature_2m[index] },
                    weather: [
                      {
                        id: weatherData.hourly.weathercode[index],
                        main: "Weather",
                        description: "",
                        icon: "",
                      },
                    ],
                  };
                  return (
                    <Grid item xs={6} sm={3} md={2} key={index}>
                      <ForecastCard
                        dateTime={forecastItem.dt}
                        temp={forecastItem.main.temp}
                        weather={forecastItem.weather[0]}
                        isHourly
                      />
                    </Grid>
                  );
                })}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

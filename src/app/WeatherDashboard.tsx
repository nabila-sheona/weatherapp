/* eslint-disable @typescript-eslint/no-explicit-any */
// app/WeatherDashboard.tsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import WeatherCard from "./weather/WeatherCard";
import ForecastCard from "./weather/ForecastCard";
import WeeklyForecastCard from "./weather/WeeklyForecastCard";

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

interface WeatherDashboardProps {
  searchCity?: string | null;
  coordinates?: { latitude: number; longitude: number };
}

export default function WeatherDashboard({
  searchCity,
  coordinates,
}: WeatherDashboardProps) {
  const [mainWeatherData, setMainWeatherData] = useState<WeatherData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pinnedLocations, setPinnedLocations] = useState<WeatherData[]>([]);

  const otherCities = [
    { name: "New York", country: "USA" },
    { name: "London", country: "UK" },
  ];
  const [otherWeather, setOtherWeather] = useState<WeatherData[]>([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError("");

        const fetchData = async (
          lat: number,
          lon: number,
          name: string,
          country: string
        ) => {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=weathercode,temperature_2m,relativehumidity_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
          );
          if (!weatherRes.ok) throw new Error("Weather fetch failed");
          const weatherJson = await weatherRes.json();
          return { ...weatherJson, location: { name, country } };
        };

        if (searchCity) {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
              searchCity
            )}&count=1`
          );
          const geoJson = await geoRes.json();
          const { latitude, longitude, name, country } = geoJson.results[0];
          const weatherData = await fetchData(
            latitude,
            longitude,
            name,
            country
          );
          setMainWeatherData(weatherData);
        } else if (coordinates) {
          const weatherData = await fetchData(
            coordinates.latitude,
            coordinates.longitude,
            "Your Location",
            ""
          );
          setMainWeatherData(weatherData);
        } else {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=Dhaka&count=1`
          );
          const geoJson = await geoRes.json();
          const { latitude, longitude, name, country } = geoJson.results[0];
          const weatherData = await fetchData(
            latitude,
            longitude,
            name,
            country
          );
          setMainWeatherData(weatherData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [searchCity, coordinates]);

  useEffect(() => {
    const fetchOtherCities = async () => {
      const promises = otherCities.map(async (city) => {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            city.name
          )}&count=1`
        );
        const geoJson = await geoRes.json();
        const { latitude, longitude, name, country } = geoJson.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=weathercode,temperature_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );
        const weatherJson = await weatherRes.json();
        return { ...weatherJson, location: { name, country } };
      });

      try {
        const results = await Promise.all(promises);
        setOtherWeather(results);
      } catch (err) {
        console.error("Failed fetching other cities:", err);
      }
    };

    fetchOtherCities();
  }, []);

  const handlePinLocation = () => {
    if (
      mainWeatherData &&
      !pinnedLocations.some(
        (loc) => loc.location.name === mainWeatherData.location.name
      )
    ) {
      setPinnedLocations([...pinnedLocations, mainWeatherData]);
    }
  };

  const handleUnpinLocation = (locationName: string) => {
    setPinnedLocations(
      pinnedLocations.filter((loc) => loc.location.name !== locationName)
    );
  };

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
          <Popup>
            {mainWeatherData.location.name}, {mainWeatherData.location.country}
          </Popup>
        </Marker>
      </MapContainer>
    );
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
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6" gutterBottom>
                  {mainWeatherData.location.name},{" "}
                  {mainWeatherData.location.country}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handlePinLocation}
                  disabled={pinnedLocations.some(
                    (loc) => loc.location.name === mainWeatherData.location.name
                  )}
                >
                  📌 Pin Location
                </Button>
              </Box>
              <WeatherCard weather={mainWeatherData} />
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                24-Hour Forecast for {mainWeatherData.location.name}
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
            </Paper>

            {mainWeatherData.daily && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  7-Day Forecast for {mainWeatherData.location.name}
                </Typography>
                <WeeklyForecastCard daily={mainWeatherData.daily} />
              </Paper>
            )}
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ height: 300, mb: 2 }}>{renderMap()}</Paper>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Current Humidity in {mainWeatherData.location.name}
              </Typography>
              <Typography variant="h4">
                {mainWeatherData.hourly.relativehumidity_2m[0]}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Saved Locations
      </Typography>
      <Grid container spacing={2}>
        {pinnedLocations.map((city, i) => (
          <Grid item xs={12} sm={6} md={3} key={`pinned-${i}`}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" gutterBottom>
                    {city.location.name}, {city.location.country}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleUnpinLocation(city.location.name)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                <WeatherCard weather={city} />
              </CardContent>
            </Card>
          </Grid>
        ))}

        {otherWeather.map((city, i) => (
          <Grid item xs={12} sm={6} md={3} key={`static-${i}`}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {city.location.name}, {city.location.country}
                </Typography>
                <WeatherCard weather={city} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

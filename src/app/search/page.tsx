// app/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import WeatherDashboard from "../WeatherDashboard";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  return (
    <WeatherDashboard
      searchCity={city}
      coordinates={
        lat && lon
          ? { latitude: parseFloat(lat), longitude: parseFloat(lon) }
          : undefined
      }
    />
  );
}

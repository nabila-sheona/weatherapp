// app/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import WeatherDashboard from "../WeatherDashboard";
import { useEffect, useState } from "react";

// Add this to disable static generation
export const dynamic = "force-dynamic";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

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

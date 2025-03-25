// app/map/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// 1. Fix the import path
const MapDashboard = dynamic(() => import("@/app/MapDashboard"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      Loading map...
    </div>
  ),
});

// 2. Move ErrorBoundary to a separate component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = () => setHasError(true);
    window.addEventListener("error", errorHandler);
    return () => window.removeEventListener("error", errorHandler);
  }, []);

  return hasError ? (
    <div style={{ padding: 20 }}>
      <h2>Map Loading Failed</h2>
      <p>Please check your internet connection and try again.</p>
    </div>
  ) : (
    <>{children}</>
  );
}

export default function MapPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <ErrorBoundary>
      <MapDashboard />
    </ErrorBoundary>
  );
}

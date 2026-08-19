/*
 * Centralized API Base URL Configuration
 * PrepQuarters Frontend
 * Automatically selects local backend when running locally,
 * or production Render backend when deployed.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10."))
    ? "http://localhost:5000"
    : "https://prepquarters-backend.onrender.com");

export function getApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

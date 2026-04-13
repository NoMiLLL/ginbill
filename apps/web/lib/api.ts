import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers: HeadersInit = {
    ...options.headers,
  };

  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ensure URL is absolute or prepended with base URL
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.warn("Sesión expirada detectada (401)");
      localStorage.removeItem("token");
      if (typeof window !== "undefined" && !fullUrl.includes("/auth/")) {
        window.location.href = "/login?expired=true";
      }
      return response;
    }

    return response;
  } catch (error) {
    console.error(`Fetch error for ${fullUrl}:`, error);
    // Return a fake "offline" response to allow components to handle it gracefully
    return {
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
      json: async () => ({ message: "No se pudo conectar con el servidor. Verifica que el backend esté corriendo." }),
    } as Response;
  }
}

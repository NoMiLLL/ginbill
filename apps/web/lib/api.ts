import { jwtDecode } from "jwt-decode";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  // Headers por defecto, asegurando que enviamos JSON
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Si hay token, lo agregamos al Authorization header
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Ejecutamos la petición original
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Si el backend nos responde 401 (No autorizado) significa que el token expiró o es inválido
  if (response.status === 401) {
    console.warn("Sesión expirada detectada por el servidor (401)");
    localStorage.removeItem("token");
    window.location.href = "/?expired=true";
    return response;
  }

  return response;
}

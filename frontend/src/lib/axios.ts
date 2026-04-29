import axios, { AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      if (config.headers instanceof AxiosHeaders) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        const existing = (config.headers ?? {}) as Record<string, string>;
        const headers = new AxiosHeaders(existing as any);
        headers.set("Authorization", `Bearer ${token}`);
        config.headers = headers;
      }
    }
  }

  return config;
});

export default api;
// Central axios client with JWT + auto-refresh. Works for Vite or CRA.
import axios from "axios";

export const baseURL = process.env.REACT_APP_API_URL;

const api = axios.create({ baseURL });

// Attach Authorization
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Try refresh on 401
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshing) {
          const refresh = sessionStorage.getItem("refresh");
          if (!refresh) throw new Error("no refresh");
          refreshing = axios.post(`${baseURL}/auth/refresh/`, { refresh });
        }
        const { data } = await refreshing;
        refreshing = null;
        sessionStorage.setItem("access", data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        refreshing = null;
        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }
    throw error;
  }
);

export default api;

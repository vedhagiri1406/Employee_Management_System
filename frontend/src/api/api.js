import axios from "axios";

export const baseURL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const api = axios.create({ baseURL });

let isRefreshing = false;
let queue = [];

// attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    isRefreshing = true;
    try {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) throw new Error("No refresh token");
      const { data } = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
      localStorage.setItem("access", data.access);
      queue.forEach((p) => p.resolve(data.access));
      queue = [];
      original.headers.Authorization = `Bearer ${data.access}`;
      return api(original);
    } catch (e) {
      queue.forEach((p) => p.reject(e));
      queue = [];
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

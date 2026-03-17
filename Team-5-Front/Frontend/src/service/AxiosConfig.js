// /src/service/AxiosConfig.js
import axios from "axios";
import {
  getToken,
  clearToken,
  clearRole,
  clearUser,
  clearImgProfile,
} from "./AuthService";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // ajusta si aplica
  withCredentials: false, // true solo si tu backend usa cookies
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      clearRole();
      clearUser();
      clearImgProfile?.();

      if (typeof window !== "undefined") window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;

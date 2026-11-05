import axios from "axios";
import { SERVER_URL } from "@/shared/constants/config.constants";
import { tokenStorage } from "@/shared/utils/token.utils";

export const axiosInstance = axios.create({ baseURL: SERVER_URL });

// Always send the latest token (no per-call header boilerplate).
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = token;
  return config;
});

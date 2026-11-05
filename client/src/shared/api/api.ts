import type { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axios";

/** Thin typed wrapper: every method resolves with the response BODY. */
export const api = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => (await axiosInstance.get<T>(url, config)).data,
  post: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    (await axiosInstance.post<T>(url, body, config)).data,
};

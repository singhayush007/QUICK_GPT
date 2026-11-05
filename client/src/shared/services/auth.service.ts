import { api } from "@/shared/api/api";
import { API_PATHS } from "@/shared/constants/apiPaths.constants";
import type { AuthCredentials, AuthTokenResponse, CurrentUserResponse, RegisterPayload } from "@/shared/types/auth.types";

export const authService = {
  login: (payload: AuthCredentials) => api.post<AuthTokenResponse>(API_PATHS.user.login, payload),
  register: (payload: RegisterPayload) => api.post<AuthTokenResponse>(API_PATHS.user.register, payload),
  currentUser: () => api.get<CurrentUserResponse>(API_PATHS.user.data),
};

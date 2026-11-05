import type { ApiResponse, User } from "@/shared/types";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export type AuthTokenResponse = ApiResponse<{ token: string }>;
export type CurrentUserResponse = ApiResponse<{ user: User }>;

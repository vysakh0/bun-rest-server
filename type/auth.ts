import type { UserResponse } from './users';

export interface SignupRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginRequest {
  email?: string;
  password?: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
}

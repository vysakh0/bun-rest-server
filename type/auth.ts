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

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

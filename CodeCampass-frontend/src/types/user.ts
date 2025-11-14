export interface User {
  id: number;
  name: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginParams {
  name: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  password: string;
  repassword: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: User;
  };
}


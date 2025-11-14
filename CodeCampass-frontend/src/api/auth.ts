import api from './index';
import type { LoginParams, RegisterParams, User } from '@/types/user';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  token?: string;
}

export const authApi = {
  // 用户登录
  login: (params: LoginParams): Promise<ApiResponse<User & { token?: string }>> =>
    api.post('/user/userLogin', null, { params }),

  // 用户注册
  register: (params: RegisterParams): Promise<ApiResponse<User>> =>
    api.post('/user/createUser', null, { params }),

  // 用户登出
  logout: (): Promise<ApiResponse> =>
    api.post('/user/userLogout'),

  // 获取用户信息
  getUserInfo: (): Promise<ApiResponse<User>> =>
    api.get('/user/getUserInfo'),

  // 获取用户列表
  getUserList: (): Promise<ApiResponse<User[]>> =>
    api.get('/user/getUserList'),
};


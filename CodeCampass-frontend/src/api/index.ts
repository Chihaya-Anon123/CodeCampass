import axios from 'axios';

// 生产环境使用相对路径，由 Nginx 代理
// 开发环境使用环境变量配置的地址
const baseURL = import.meta.env.PROD 
  ? '' // 生产环境使用相对路径
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081');

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 如果响应数据中直接包含 data，直接返回 data
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


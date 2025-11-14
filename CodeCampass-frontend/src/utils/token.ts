export const tokenUtils = {
  // 保存 token
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  // 获取 token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // 删除 token
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // 保存用户信息
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // 获取用户信息
  getUser: (): any | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 删除用户信息
  removeUser: () => {
    localStorage.removeItem('user');
  },
};


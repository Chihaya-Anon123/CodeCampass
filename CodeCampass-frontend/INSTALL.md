# 安装指南

## 前置要求

- Node.js 18+ 
- npm 或 yarn

## 安装步骤

### 1. 安装 Node.js（如果未安装）

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装项目依赖

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend
npm install
```

### 3. 配置环境变量

创建 `.env` 文件（如果不存在）：

```env
VITE_API_BASE_URL=http://localhost:8081
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173

### 5. 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录中。

## 常见问题

### 1. 依赖安装失败

如果使用 npm 安装依赖失败，可以尝试：

```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或者使用 yarn
npm install -g yarn
yarn install
```

### 2. 端口被占用

如果 5173 端口被占用，可以修改 `vite.config.ts` 中的端口配置。

### 3. API 连接失败

确保后端服务运行在 `http://localhost:8081`，或者修改 `.env` 文件中的 `VITE_API_BASE_URL`。

## 开发工具推荐

- **VS Code** - 代码编辑器
- **React Developer Tools** - React 调试工具
- **Redux DevTools** - 状态管理调试工具

## 下一步

1. 启动后端服务
2. 启动前端开发服务器
3. 访问 http://localhost:5173
4. 注册/登录账号
5. 开始使用 CodeCampass


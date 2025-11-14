# CodeCampass Frontend

CodeCampass 前端项目 - 基于 React + TypeScript + Vite

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型系统
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Zustand** - 状态管理
- **React Query** - 数据获取和缓存
- **Ant Design** - UI 组件库
- **React Syntax Highlighter** - 代码高亮
- **React Markdown** - Markdown 渲染
- **Tailwind CSS** - CSS 框架

## 功能特性

- ✅ 用户登录/注册
- ✅ 项目管理（创建、编辑、删除）
- ✅ 项目列表展示
- ✅ 项目详情页
- ✅ 代码文件树浏览
- ✅ 代码高亮显示
- ✅ AI 问答功能
- ✅ 仓库同步
- ✅ 响应式设计

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── api/              # API 接口
├── components/       # 公共组件
│   ├── Layout/      # 布局组件
│   └── ProjectDetail/ # 项目详情组件
├── pages/           # 页面组件
├── router/          # 路由配置
├── store/           # 状态管理
├── types/           # TypeScript 类型
├── utils/           # 工具函数
├── App.tsx          # 根组件
└── main.tsx         # 入口文件
```

## 环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8081
```

## 开发说明

### API 接口

所有 API 接口定义在 `src/api/` 目录下：
- `auth.ts` - 认证相关 API
- `project.ts` - 项目相关 API

### 状态管理

使用 Zustand 进行状态管理：
- `authStore.ts` - 认证状态
- `projectStore.ts` - 项目状态

### 路由配置

路由配置在 `src/router/index.tsx` 中定义。

### 组件说明

- **Layout** - 主布局组件，包含侧边栏和顶部栏
- **ProjectSidebar** - 项目侧边栏，显示项目列表
- **ProjectToolbar** - 项目工具栏，包含配置和同步功能
- **CodeViewer** - 代码查看器，显示文件树和代码内容
- **ChatPanel** - AI 问答面板

## 待完成功能

- [ ] 文件内容获取接口（后端）
- [ ] 文件树获取接口（后端）
- [ ] 代码编辑功能
- [ ] 文件搜索功能
- [ ] 项目设置页面
- [ ] 用户个人信息页面

## 注意事项

1. 确保后端服务运行在 `http://localhost:8081`
2. 需要先登录才能访问项目功能
3. 代码文件查看功能需要后端提供文件树和文件内容接口
4. AI 问答功能需要配置 OpenAI API Key

## License

MIT


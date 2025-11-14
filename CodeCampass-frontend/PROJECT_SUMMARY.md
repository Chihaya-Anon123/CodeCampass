# CodeCampass 前端项目总结

## 项目概述

这是一个基于 React + TypeScript + Vite 的前端项目，用于代码项目管理平台。提供了用户认证、项目管理、代码浏览和 AI 问答等功能。

## 已完成的功能

### 1. 用户认证
- ✅ 用户登录页面
- ✅ 用户注册页面
- ✅ JWT Token 管理
- ✅ 路由守卫（未登录自动跳转）
- ✅ 用户信息获取

### 2. 项目管理
- ✅ 项目列表展示（侧边栏）
- ✅ 创建项目
- ✅ 编辑项目
- ✅ 删除项目
- ✅ 项目详情页
- ✅ 项目配置（名称、描述、仓库地址）

### 3. 项目详情页
- ✅ 工具栏（项目配置、仓库同步、刷新）
- ✅ 代码查看器（文件树 + 代码高亮）
- ✅ AI 问答面板（右侧）
- ✅ 左右分割面板（可拖拽调整）

### 4. 代码浏览
- ✅ 文件树展示（左侧）
- ✅ 代码高亮显示
- ✅ 多语言支持（JavaScript、TypeScript、Python、Go 等）
- ✅ 代码行号显示

### 5. AI 问答
- ✅ 对话式界面
- ✅ Markdown 渲染
- ✅ 代码块高亮
- ✅ 消息历史记录

### 6. UI/UX
- ✅ 响应式设计
- ✅ Ant Design 组件库
- ✅ Tailwind CSS 样式
- ✅ 中文界面

## 项目结构

```
src/
├── api/                    # API 接口
│   ├── index.ts           # Axios 配置
│   ├── auth.ts            # 认证 API
│   └── project.ts         # 项目 API
├── components/            # 组件
│   ├── Layout/           # 布局组件
│   │   ├── index.tsx     # 主布局
│   │   ├── ProjectSidebar.tsx  # 项目侧边栏
│   │   └── TopBar.tsx    # 顶部栏
│   └── ProjectDetail/    # 项目详情组件
│       ├── ProjectToolbar.tsx  # 工具栏
│       ├── CodeViewer.tsx      # 代码查看器
│       └── ChatPanel.tsx       # 问答面板
├── pages/                 # 页面
│   ├── Login.tsx         # 登录页
│   ├── Register.tsx      # 注册页
│   ├── Dashboard.tsx     # 项目列表页
│   └── ProjectDetail.tsx # 项目详情页
├── router/               # 路由配置
│   └── index.tsx
├── store/                # 状态管理
│   ├── authStore.ts      # 认证状态
│   └── projectStore.ts   # 项目状态
├── types/                # TypeScript 类型
│   ├── user.ts
│   └── project.ts
├── utils/                # 工具函数
│   └── token.ts          # Token 管理
├── main.tsx              # 入口文件
└── index.css             # 全局样式
```

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

## API 接口

### 认证接口
- `POST /user/userLogin` - 用户登录
- `POST /user/createUser` - 用户注册
- `POST /user/userLogout` - 用户登出
- `GET /user/getUserInfo` - 获取用户信息

### 项目接口
- `GET /api/listProjects` - 获取项目列表
- `POST /api/createProject` - 创建项目
- `GET /api/getProjectInfo` - 获取项目信息
- `PUT /api/updateProject` - 更新项目
- `DELETE /api/deleteProject` - 删除项目
- `POST /api/importProjectRepo` - 同步仓库
- `POST /api/askProject` - AI 问答

## 待完成功能

### 后端接口
- [ ] 文件树获取接口（`GET /api/getProjectFiles`）
- [ ] 文件内容获取接口（`GET /api/getFileContent`）
- [ ] 文件搜索接口

### 前端功能
- [ ] 文件搜索功能
- [ ] 代码编辑功能（只读模式）
- [ ] 文件上传功能
- [ ] 项目设置页面
- [ ] 用户个人信息页面
- [ ] 项目分享功能
- [ ] 代码片段收藏

## 使用说明

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:8081
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173

### 4. 构建生产版本

```bash
npm run build
```

## 注意事项

1. **后端服务**: 确保后端服务运行在 `http://localhost:8081`
2. **登录**: 需要先登录才能访问项目功能
3. **文件树**: 目前文件树功能需要后端提供接口支持
4. **AI 问答**: 需要配置 OpenAI API Key（后端环境变量）
5. **代码高亮**: 支持多种编程语言的语法高亮

## 开发建议

1. **代码规范**: 使用 ESLint 和 Prettier 保持代码风格一致
2. **类型安全**: 充分利用 TypeScript 的类型系统
3. **错误处理**: 统一处理 API 错误响应
4. **性能优化**: 使用 React Query 缓存数据，减少不必要的请求
5. **用户体验**: 添加加载状态和错误提示

## 问题排查

### 1. API 连接失败
- 检查后端服务是否运行
- 检查 `.env` 文件中的 API 地址
- 检查网络连接

### 2. 登录失败
- 检查用户名和密码是否正确
- 检查后端服务是否正常
- 查看浏览器控制台错误信息

### 3. 项目列表为空
- 检查是否已登录
- 检查后端 API 是否正常返回数据
- 查看网络请求响应

### 4. 代码高亮不显示
- 检查文件扩展名是否支持
- 检查代码内容是否正确
- 查看浏览器控制台错误信息

## 后续开发计划

1. **完善文件树功能**: 实现后端接口，支持文件树展示
2. **添加文件搜索**: 实现文件内容搜索功能
3. **优化代码查看器**: 支持代码折叠、行号跳转等功能
4. **增强 AI 问答**: 支持代码上下文、历史对话等功能
5. **添加项目设置**: 实现项目配置、成员管理等功能

## 联系支持

如有问题或建议，请联系开发团队。


# 前端错误修复说明

## 错误信息

```
TypeError: Cannot read properties of undefined (reading 'toString')
```

## 问题原因

在 `ProjectSidebar.tsx` 组件中，当项目数据中 `id` 字段为 `undefined` 时，调用 `project.id.toString()` 会导致运行时错误。

## 修复内容

### 1. ProjectSidebar.tsx

修复了以下问题：
- ✅ 在 `handleMenuClick` 中添加了 `id` 存在性检查
- ✅ 在 `menuItems` 的 map 中添加了过滤，只处理有 `id` 的项目
- ✅ 在 `selectedKeys` 中添加了 `id` 存在性检查
- ✅ 添加了项目名称的默认值处理

### 2. project.ts API

修复了以下问题：
- ✅ 在 `listProjects` 中添加了数据验证和默认值
- ✅ 确保每个项目都有必需的字段（id, name, owner_id, created_at, updated_at）

### 3. Dashboard.tsx

修复了以下问题：
- ✅ 过滤掉没有 `id` 的项目
- ✅ 添加了项目名称的默认值
- ✅ 添加了创建时间的空值检查

## 修复的代码

### ProjectSidebar.tsx

```typescript
// 修复前
const project = projectsData?.find((p) => p.id.toString() === key);
...(projectsData?.map((project) => ({
  key: project.id.toString(),
  ...
})) || []),

// 修复后
const project = projectsData?.find((p) => p.id && p.id.toString() === key);
...(projectsData?.filter(project => project.id != null).map((project) => ({
  key: project.id!.toString(),
  ...
})) || []),
```

### project.ts

```typescript
// 修复前
listProjects: (): Promise<{ projects: Project[] }> =>
  api.get('/api/listProjects').then((response: any) => {
    return { projects: response.projects || [] };
  }),

// 修复后
listProjects: (): Promise<{ projects: Project[] }> =>
  api.get('/api/listProjects').then((response: any) => {
    const projects = response.projects || [];
    return { 
      projects: projects.map((p: any) => ({
        ...p,
        id: p.id || 0,
        name: p.name || '',
        owner_id: p.owner_id || 0,
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.updated_at || new Date().toISOString(),
      }))
    };
  }),
```

## 测试

访问 http://10.129.83.147 应该不再出现错误。

## 注意事项

1. 后端 API 返回的数据应该确保包含 `id` 字段
2. 如果后端返回的项目没有 `id`，前端会使用默认值 0
3. 建议后端也确保返回的项目数据完整性


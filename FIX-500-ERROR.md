# 500 错误修复说明

## 问题分析

前端显示 `Request failed with status code 500` 错误，从后端日志看到：

1. **`importProjectRepo` API 返回 500 错误**
   - 原因：`BuildProjectEmbedding` 函数检查 `OPENAI_API_KEY` 环境变量时发现未设置
   - 错误信息：`请先设置 OPENAI_API_KEY 环境变量`

2. **仓库路径问题**
   - 原路径：`E:/Repos/` (Windows 路径)
   - 修复为：`/home/ubuntu/Repos/` (Linux 路径)

## 修复内容

### 1. git_clone.go

#### 修复仓库路径
```go
// 修复前
baseDir := fmt.Sprintf("E:/Repos/%d/%d", proj.OwnerId, proj.ID)

// 修复后
baseDir := fmt.Sprintf("/home/ubuntu/Repos/%d/%d", proj.OwnerId, proj.ID)
```

#### 修复错误处理
```go
// 修复前
err := BuildProjectEmbedding(utils.DB, proj.ID, baseDir)
if err != nil {
    c.JSON(http.StatusInternalServerError, gin.H{
        "error": err,
    })
}

// 修复后
err := BuildProjectEmbedding(utils.DB, proj.ID, baseDir)
if err != nil {
    // embedding 构建失败不影响整体导入，记录警告即可
    fmt.Printf("警告: 构建 embedding 失败: %v\n", err)
}
```

#### 修复 BuildProjectEmbedding 错误
```go
// 修复前
if apiKey == "" {
    fmt.Println("请先设置 OPENAI_API_KEY 环境变量")
    return exec.ErrNotFound
}

// 修复后
if apiKey == "" {
    fmt.Println("警告: 未设置 OPENAI_API_KEY 环境变量，跳过 embedding 构建")
    return fmt.Errorf("OPENAI_API_KEY 未设置")
}
```

## 修复效果

- ✅ **仓库同步成功**：即使没有设置 `OPENAI_API_KEY`，仓库导入也能成功
- ✅ **路径正确**：仓库保存到 `/home/ubuntu/Repos/` 目录
- ✅ **错误处理**：embedding 构建失败不会导致整个导入失败

## 可选：设置 OPENAI_API_KEY

如果需要 AI 问答功能，可以设置环境变量：

```bash
# 临时设置（当前会话有效）
export OPENAI_API_KEY="your-api-key-here"

# 永久设置（添加到 ~/.bashrc 或 ~/.profile）
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc

# 重启后端服务
pkill -f "go run main.go"
cd /home/ubuntu/CodeCampass/CodeCampass-backend
nohup go run main.go > /tmp/codecampass-backend.log 2>&1 &
```

## 验证修复

1. **检查仓库目录**
   ```bash
   ls -la /home/ubuntu/Repos/
   ```

2. **测试同步仓库**
   - 在前端点击"同步仓库"按钮
   - 应该不再出现 500 错误
   - 仓库应该成功克隆到 `/home/ubuntu/Repos/` 目录

3. **检查后端日志**
   ```bash
   tail -f /tmp/codecampass-backend.log
   ```

## 注意事项

1. **AI 问答功能**：如果未设置 `OPENAI_API_KEY`，AI 问答功能将不可用
2. **Embedding 构建**：只有在设置了 `OPENAI_API_KEY` 后才会构建 embedding
3. **仓库路径**：确保 `/home/ubuntu/Repos/` 目录有足够的磁盘空间

## 当前状态

- ✅ 后端服务：已修复并重启
- ✅ 仓库路径：已修复为 Linux 路径
- ✅ 错误处理：已优化，embedding 失败不影响导入
- ⚠️ OPENAI_API_KEY：未设置（可选，不影响基本功能）

现在可以正常使用仓库同步功能了！





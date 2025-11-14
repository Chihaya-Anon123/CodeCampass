# CodeCampass 部署成功

## 部署状态

✅ **前端访问**: 正常
✅ **后端服务**: 运行中
✅ **Nginx 配置**: 正常
✅ **Swagger 文档**: 可访问

## 访问地址

- **前端**: http://10.129.83.147
- **Swagger 文档**: http://10.129.83.147/swagger/index.html

## 问题修复

### 问题
前端无法访问，出现 500 错误。

### 原因
- `/home/ubuntu` 目录权限为 `drwxr-x---`，其他用户无法访问
- Nginx 运行在 `www-data` 用户下，无法访问 `/home/ubuntu/CodeCampass/CodeCampass-frontend/dist` 目录

### 解决方案
将前端文件复制到标准的 Web 服务器目录 `/var/www/codecampass`：

```bash
# 1. 创建 Web 目录
sudo mkdir -p /var/www/codecampass

# 2. 复制前端文件
sudo cp -r /home/ubuntu/CodeCampass/CodeCampass-frontend/dist/* /var/www/codecampass/

# 3. 设置权限
sudo chown -R www-data:www-data /var/www/codecampass
sudo chmod -R 755 /var/www/codecampass

# 4. 更新 Nginx 配置
sudo cp /home/ubuntu/CodeCampass/nginx-config.conf /etc/nginx/sites-available/codecampass
sudo nginx -t
sudo systemctl restart nginx
```

## 文件结构

```
/var/www/codecampass/          # 前端静态文件目录
├── index.html                 # 前端入口文件
└── assets/                    # 前端资源文件
    ├── index-BGVRGpOs.css    # CSS 文件
    └── index-BneZSdNE.js     # JavaScript 文件
```

## 配置信息

### Nginx 配置

- **配置文件**: `/etc/nginx/sites-available/codecampass`
- **前端目录**: `/var/www/codecampass`
- **后端代理**: `http://localhost:8081`
- **端口**: 80

### 后端服务

- **端口**: 8081
- **数据库**: MySQL (localhost:3306)
- **缓存**: Redis (localhost:6379)

## 更新前端

如果修改了前端代码，运行：

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend
npm run build
sudo ./update-frontend.sh
```

或者手动更新：

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend
npm run build
sudo cp -r dist/* /var/www/codecampass/
sudo chown -R www-data:www-data /var/www/codecampass
sudo systemctl reload nginx
```

## 服务管理

### 启动服务

```bash
# 启动后端
cd /home/ubuntu/CodeCampass/CodeCampass-backend
./start.sh

# 启动 Nginx
sudo systemctl start nginx
```

### 查看服务状态

```bash
# 后端服务
ps aux | grep "go run main.go"

# Nginx 服务
sudo systemctl status nginx
```

### 查看日志

```bash
# 后端日志
tail -f /tmp/codecampass-backend.log

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 重启服务

```bash
# 重启后端
cd /home/ubuntu/CodeCampass/CodeCampass-backend
./start.sh

# 重启 Nginx
sudo systemctl restart nginx
```

## 测试

### 测试前端

```bash
curl http://localhost/
```

应该返回 HTML 内容。

### 测试后端 API

```bash
curl http://localhost/api/listProjects
```

需要先登录获取 token。

### 测试 Swagger

访问: http://10.129.83.147/swagger/index.html

## 注意事项

1. **前端更新**: 每次修改前端代码后，需要重新构建并复制文件
2. **权限设置**: 确保 `/var/www/codecampass` 目录权限正确
3. **Nginx 配置**: 如果修改了 Nginx 配置，需要重启 Nginx
4. **后端服务**: 确保后端服务运行在 `localhost:8081`
5. **数据库**: 确保 MySQL 和 Redis 服务正常运行

## 故障排查

### 前端无法访问

1. 检查 Nginx 服务: `sudo systemctl status nginx`
2. 检查文件权限: `ls -la /var/www/codecampass`
3. 检查 Nginx 配置: `sudo nginx -t`
4. 查看 Nginx 日志: `sudo tail -f /var/log/nginx/error.log`

### API 请求失败

1. 检查后端服务: `ps aux | grep "go run main.go"`
2. 检查后端日志: `tail -f /tmp/codecampass-backend.log`
3. 检查 Nginx 代理配置
4. 检查后端端口: `netstat -tlnp | grep 8081`

### 数据库连接失败

1. 检查 MySQL 服务: `sudo systemctl status mysql`
2. 检查数据库配置: `cat CodeCampass-backend/config/website.yml`
3. 检查数据库是否创建: `mysql -u root -p771009 -e "USE codecampass;"`

## 下一步

1. ✅ 前端可以正常访问
2. ✅ 后端服务运行正常
3. ✅ Swagger 文档可以访问
4. ⬜ 配置域名（可选）
5. ⬜ 配置 SSL 证书（可选）
6. ⬜ 配置 HTTPS（可选）

## 联系支持

如有问题，请查看日志文件或联系开发团队。


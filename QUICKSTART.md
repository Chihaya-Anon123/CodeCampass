# CodeCampass 快速部署指南

## 一键部署（推荐）

```bash
cd /home/ubuntu/CodeCampass
sudo ./quick-deploy.sh
```

## 手动部署步骤

### 1. 确保后端服务运行

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-backend

# 如果没有安装依赖，先安装
./install.sh

# 启动后端服务
./start.sh
```

### 2. 构建前端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend

# 安装 Node.js（如果未安装）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装依赖
npm install

# 构建前端
npm run build
```

### 3. 安装和配置 Nginx

```bash
# 安装 Nginx
sudo apt update
sudo apt install -y nginx

# 复制配置文件
sudo cp /home/ubuntu/CodeCampass/nginx-config.conf /etc/nginx/sites-available/codecampass

# 启用配置
sudo ln -s /etc/nginx/sites-available/codecampass /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

### 4. 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 检查防火墙状态
sudo ufw status
```

### 5. 访问网站

- 前端: http://10.129.83.147
- Swagger: http://10.129.83.147/swagger/index.html

## 重要提示

### 1. 云主机安全组配置

如果要从外网访问，需要在云主机安全组中开放 80 端口：

1. 登录云主机控制台
2. 找到安全组配置
3. 添加入站规则：允许 HTTP（80 端口）

### 2. 内网IP配置

当前配置的内网IP是 `10.129.83.147`，如果您的内网IP不同，请修改：

1. 修改 `nginx-config.conf` 中的 `server_name`
2. 修改 `quick-deploy.sh` 中的 IP 获取逻辑

### 3. 后端服务

确保后端服务运行在 `localhost:8081`：

```bash
# 检查后端服务
ps aux | grep "go run main.go"

# 如果未运行，启动后端服务
cd /home/ubuntu/CodeCampass/CodeCampass-backend
./start.sh
```

### 4. 数据库和 Redis

确保 MySQL 和 Redis 服务正常运行：

```bash
# 检查 MySQL
sudo systemctl status mysql

# 检查 Redis
sudo systemctl status redis-server
```

## 故障排查

### 无法访问网站

1. **检查 Nginx 服务**
   ```bash
   sudo systemctl status nginx
   ```

2. **检查后端服务**
   ```bash
   ps aux | grep "go run main.go"
   ```

3. **检查防火墙**
   ```bash
   sudo ufw status
   ```

4. **检查云主机安全组**
   - 确保 80 端口已开放

5. **查看 Nginx 错误日志**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### API 请求失败

1. **检查后端服务**
   ```bash
   tail -f /tmp/codecampass-backend.log
   ```

2. **检查 Nginx 代理配置**
   ```bash
   sudo nginx -t
   ```

3. **检查后端端口**
   ```bash
   netstat -tlnp | grep 8081
   ```

### 前端页面空白

1. **检查前端构建**
   ```bash
   ls -la /home/ubuntu/CodeCampass/CodeCampass-frontend/dist
   ```

2. **检查 Nginx 配置**
   ```bash
   sudo nginx -t
   ```

3. **查看浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签

## 服务管理

### 启动所有服务

```bash
cd /home/ubuntu/CodeCampass
./start-all.sh
```

### 重启服务

```bash
# 重启后端
cd /home/ubuntu/CodeCampass/CodeCampass-backend
./start.sh

# 重启 Nginx
sudo systemctl restart nginx
```

### 查看日志

```bash
# 后端日志
tail -f /tmp/codecampass-backend.log

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 更新部署

### 更新前端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend
npm install
npm run build
sudo systemctl reload nginx
```

### 更新后端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-backend
go mod download
./start.sh
```

## 联系支持

如有问题，请查看日志文件或联系开发团队。


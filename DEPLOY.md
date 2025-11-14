# CodeCampass 部署指南

## 部署环境

- Ubuntu 24.04 LTS
- 内网IP: 10.129.83.147（请根据实际情况修改）

## 快速部署

### 1. 一键部署

```bash
cd /home/ubuntu/CodeCampass
sudo ./deploy.sh
```

### 2. 手动部署

#### 步骤 1: 安装 Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
```

#### 步骤 2: 构建前端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend

# 安装 Node.js (如果未安装)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装依赖
npm install

# 构建前端
npm run build
```

#### 步骤 3: 配置 Nginx

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/codecampass
```

添加以下配置（替换 IP 地址为你的内网IP）：

```nginx
server {
    listen 80;
    server_name 10.129.83.147 localhost;

    # 前端静态文件
    location / {
        root /home/ubuntu/CodeCampass/CodeCampass-frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 用户 API 代理
    location /user/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Swagger 文档
    location /swagger/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/codecampass /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 步骤 4: 配置防火墙

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

#### 步骤 5: 启动后端服务

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-backend
./start.sh
```

或者使用 systemd 服务：

```bash
sudo cp CodeCampass-backend/service/systemd/codecampass.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable codecampass
sudo systemctl start codecampass
```

## 访问网站

### 内网访问

- 前端: http://10.129.83.147
- Swagger: http://10.129.83.147/swagger/index.html

### 外网访问（需要配置）

1. **配置云主机安全组**
   - 开放 80 端口（HTTP）
   - 开放 443 端口（HTTPS，如果配置了 SSL）

2. **配置域名（可选）**
   - 修改 Nginx 配置中的 `server_name`
   - 配置 DNS 解析

3. **配置 SSL 证书（可选）**
   - 使用 Let's Encrypt 免费证书
   - 配置 HTTPS

## 服务管理

### 启动所有服务

```bash
./start-all.sh
```

### 查看服务状态

```bash
# 后端服务
ps aux | grep "go run main.go"
# 或
systemctl status codecampass

# Nginx 服务
systemctl status nginx
```

### 查看日志

```bash
# 后端日志
tail -f /tmp/codecampass-backend.log
# 或
journalctl -u codecampass -f

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

### 停止服务

```bash
# 停止后端
pkill -f "go run main.go"

# 停止 Nginx
sudo systemctl stop nginx
```

## 更新部署

### 更新前端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend
git pull  # 如果有 Git
npm install
npm run build
sudo systemctl reload nginx
```

### 更新后端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-backend
git pull  # 如果有 Git
go mod download
sudo systemctl restart codecampass
```

## 故障排查

### 1. 无法访问网站

- 检查 Nginx 是否运行: `sudo systemctl status nginx`
- 检查后端是否运行: `ps aux | grep "go run main.go"`
- 检查防火墙: `sudo ufw status`
- 检查云主机安全组是否开放 80 端口
- 检查 Nginx 配置: `sudo nginx -t`
- 查看 Nginx 错误日志: `sudo tail -f /var/log/nginx/error.log`

### 2. API 请求失败

- 检查后端服务是否运行
- 检查后端日志: `tail -f /tmp/codecampass-backend.log`
- 检查 Nginx 代理配置
- 检查后端服务端口: `netstat -tlnp | grep 8081`

### 3. 前端页面空白

- 检查前端构建是否成功: `ls -la CodeCampass-frontend/dist`
- 检查 Nginx 配置中的 root 路径
- 查看浏览器控制台错误
- 检查前端 API 地址配置

### 4. 数据库连接失败

- 检查 MySQL 服务: `sudo systemctl status mysql`
- 检查数据库配置: `cat CodeCampass-backend/config/website.yml`
- 检查数据库是否创建: `mysql -u root -p771009 -e "USE codecampass;"`

### 5. Redis 连接失败

- 检查 Redis 服务: `sudo systemctl status redis-server`
- 测试 Redis 连接: `redis-cli ping`

## 性能优化

### 1. 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
```

### 2. 配置缓存

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 启用 HTTP/2

```nginx
listen 80 http2;
```

## 安全建议

1. **配置 HTTPS**: 使用 Let's Encrypt 免费证书
2. **配置防火墙**: 只开放必要的端口
3. **定期更新**: 保持系统和软件更新
4. **配置日志**: 定期检查日志文件
5. **备份数据**: 定期备份数据库

## 注意事项

1. 确保后端服务运行在 `localhost:8081`
2. 确保 MySQL 和 Redis 服务正常运行
3. 确保前端构建成功
4. 确保 Nginx 配置正确
5. 确保防火墙和安全组配置正确

## 联系支持

如有问题，请查看日志文件或联系开发团队。


# CodeCampass 部署说明

## 快速开始

### 一键部署（推荐）

```bash
cd /home/ubuntu/CodeCampass
sudo ./quick-deploy.sh
```

### 手动部署

#### 1. 部署后端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-backend
./install.sh  # 安装依赖
./start.sh    # 启动后端服务
```

#### 2. 部署前端

```bash
cd /home/ubuntu/CodeCampass/CodeCampass-frontend
npm install
npm run build
```

#### 3. 配置 Nginx

```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/codecampass
sudo ln -s /etc/nginx/sites-available/codecampass /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. 配置防火墙

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## 访问网站

### 内网访问

- 前端: http://10.129.83.147
- Swagger: http://10.129.83.147/swagger/index.html

### 外网访问

1. **配置云主机安全组**
   - 开放 80 端口（HTTP）
   - 开放 443 端口（HTTPS，如果配置了 SSL）

2. **配置域名（可选）**
   - 修改 Nginx 配置中的 `server_name`
   - 配置 DNS 解析

## 服务管理

### 启动所有服务

```bash
./start-all.sh
```

### 查看服务状态

```bash
# 后端服务
ps aux | grep "go run main.go"

# Nginx 服务
systemctl status nginx
```

### 查看日志

```bash
# 后端日志
tail -f /tmp/codecampass-backend.log

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
```

### 重启服务

```bash
# 重启后端
cd /home/ubuntu/CodeCampass/CodeCampass-backend
./start.sh

# 重启 Nginx
sudo systemctl restart nginx
```

## 故障排查

### 无法访问网站

1. 检查 Nginx 是否运行: `sudo systemctl status nginx`
2. 检查后端是否运行: `ps aux | grep "go run main.go"`
3. 检查防火墙: `sudo ufw status`
4. 检查云主机安全组是否开放 80 端口
5. 检查 Nginx 配置: `sudo nginx -t`
6. 查看 Nginx 错误日志: `sudo tail -f /var/log/nginx/error.log`

### API 请求失败

1. 检查后端服务是否运行
2. 检查后端日志: `tail -f /tmp/codecampass-backend.log`
3. 检查 Nginx 代理配置
4. 检查后端服务端口: `netstat -tlnp | grep 8081`

### 前端页面空白

1. 检查前端构建是否成功: `ls -la CodeCampass-frontend/dist`
2. 检查 Nginx 配置中的 root 路径
3. 查看浏览器控制台错误
4. 检查前端 API 地址配置

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
sudo systemctl restart codecampass  # 如果使用 systemd
# 或
./start.sh
```

## 注意事项

1. 确保后端服务运行在 `localhost:8081`
2. 确保 MySQL 和 Redis 服务正常运行
3. 确保前端构建成功
4. 确保 Nginx 配置正确
5. 确保防火墙和安全组配置正确
6. 确保内网IP正确（当前为 10.129.83.147）

## 联系支持

如有问题，请查看日志文件或联系开发团队。


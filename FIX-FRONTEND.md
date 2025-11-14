# 前端访问问题修复说明

## 问题原因

前端无法访问的原因是权限问题：
- `/home/ubuntu` 目录的权限是 `drwxr-x---`，其他用户（包括 www-data）无法访问
- Nginx 运行在 `www-data` 用户下，无法访问 `/home/ubuntu/CodeCampass/CodeCampass-frontend/dist` 目录

## 解决方案

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

## 已更新的配置

### Nginx 配置

已更新 `nginx-config.conf`，将前端文件路径改为：
```nginx
root /var/www/codecampass;
```

### 部署脚本

已更新 `quick-deploy.sh` 和 `deploy.sh`，自动：
1. 复制前端文件到 `/var/www/codecampass`
2. 设置正确的权限
3. 配置 Nginx

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

## 验证

访问 http://10.129.83.147 应该可以正常显示前端页面。

## 注意事项

1. 每次更新前端后，都需要重新构建并复制文件
2. 确保 `/var/www/codecampass` 目录权限正确
3. 确保 Nginx 配置正确
4. 如果修改了 Nginx 配置，需要重启 Nginx


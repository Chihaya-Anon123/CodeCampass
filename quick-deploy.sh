#!/bin/bash

# CodeCampass 快速部署脚本
# 简化版部署脚本

set -e

echo "=========================================="
echo "CodeCampass 快速部署"
echo "=========================================="

# 获取内网IP
INTERNAL_IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}' | cut -d'/' -f1)
echo "检测到内网IP: $INTERNAL_IP"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 1. 安装 Nginx
echo ""
echo "1. 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    apt update
    apt install -y nginx
    systemctl enable nginx
fi

# 2. 安装 Node.js (如果需要)
echo ""
echo "2. 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

# 3. 构建前端
echo ""
echo "3. 构建前端..."
cd /home/ubuntu/CodeCampass/CodeCampass-frontend

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

echo "构建前端项目..."
npm run build

# 4. 复制前端文件到 Web 目录
echo ""
echo "4. 复制前端文件到 Web 目录..."
sudo mkdir -p /var/www/codecampass
sudo cp -r /home/ubuntu/CodeCampass/CodeCampass-frontend/dist/* /var/www/codecampass/
sudo chown -R www-data:www-data /var/www/codecampass
sudo chmod -R 755 /var/www/codecampass
echo "✓ 前端文件已复制到 /var/www/codecampass"

# 5. 配置 Nginx
echo ""
echo "5. 配置 Nginx..."
cat > /etc/nginx/sites-available/codecampass <<EOF
server {
    listen 80;
    server_name $INTERNAL_IP localhost;

    # 前端静态文件
    location / {
        root /var/www/codecampass;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 用户 API 代理
    location /user/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Swagger 文档
    location /swagger/ {
        proxy_pass http://localhost:8081;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用配置
ln -sf /etc/nginx/sites-available/codecampass /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 6. 配置防火墙
echo ""
echo "6. 配置防火墙..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
fi

# 7. 检查后端服务
echo ""
echo "7. 检查后端服务..."
cd /home/ubuntu/CodeCampass/CodeCampass-backend

if ! pgrep -f "go run main.go" > /dev/null && ! pgrep -f "codecampass" > /dev/null; then
    echo "⚠ 后端服务未运行"
    echo "请手动启动后端服务:"
    echo "  cd /home/ubuntu/CodeCampass/CodeCampass-backend"
    echo "  ./start.sh"
fi

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  前端: http://$INTERNAL_IP"
echo "  Swagger: http://$INTERNAL_IP/swagger/index.html"
echo ""
echo "如果无法访问，请检查："
echo "1. 后端服务是否运行: cd /home/ubuntu/CodeCampass/CodeCampass-backend && ./start.sh"
echo "2. Nginx 服务是否运行: systemctl status nginx"
echo "3. 防火墙是否允许 80 端口: ufw status"
echo "4. 云主机安全组是否开放 80 端口"
echo ""


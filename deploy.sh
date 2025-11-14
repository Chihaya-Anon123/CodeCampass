#!/bin/bash

# CodeCampass 部署脚本
# 用于 Ubuntu 24.04 LTS 云主机

set -e

echo "=========================================="
echo "CodeCampass 部署脚本"
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
echo "=========================================="
echo "1. 安装 Nginx"
echo "=========================================="
if ! command -v nginx &> /dev/null; then
    apt update
    apt install -y nginx
    systemctl enable nginx
    echo "✓ Nginx 安装完成"
else
    echo "✓ Nginx 已安装"
fi

# 2. 构建前端项目
echo ""
echo "=========================================="
echo "2. 构建前端项目"
echo "=========================================="
cd /home/ubuntu/CodeCampass/CodeCampass-frontend

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "Node.js 未安装，正在安装..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

echo "✓ Node.js 版本: $(node --version)"
echo "✓ npm 版本: $(npm --version)"

# 安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
else
    echo "✓ 前端依赖已安装"
fi

# 构建前端
echo "正在构建前端项目..."
npm run build

if [ -d "dist" ]; then
    echo "✓ 前端构建完成"
else
    echo "✗ 前端构建失败"
    exit 1
fi

# 3. 复制前端文件到 Web 目录
echo ""
echo "=========================================="
echo "3. 复制前端文件到 Web 目录"
echo "=========================================="

mkdir -p /var/www/codecampass
cp -r /home/ubuntu/CodeCampass/CodeCampass-frontend/dist/* /var/www/codecampass/
chown -R www-data:www-data /var/www/codecampass
chmod -R 755 /var/www/codecampass
echo "✓ 前端文件已复制到 /var/www/codecampass"

# 4. 配置 Nginx
echo ""
echo "=========================================="
echo "4. 配置 Nginx"
echo "=========================================="

# 创建 Nginx 配置
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

# 创建软链接
if [ ! -L /etc/nginx/sites-enabled/codecampass ]; then
    ln -s /etc/nginx/sites-available/codecampass /etc/nginx/sites-enabled/
    # 移除默认配置
    rm -f /etc/nginx/sites-enabled/default
fi

# 测试 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx
echo "✓ Nginx 配置完成"

# 5. 配置防火墙
echo ""
echo "=========================================="
echo "5. 配置防火墙"
echo "=========================================="

# 检查 ufw 是否安装
if command -v ufw &> /dev/null; then
    # 允许 HTTP 和 HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✓ 防火墙规则已添加"
else
    echo "⚠ ufw 未安装，跳过防火墙配置"
fi

# 6. 检查后端服务
echo ""
echo "=========================================="
echo "6. 检查后端服务"
echo "=========================================="

cd /home/ubuntu/CodeCampass/CodeCampass-backend

# 检查后端是否运行
if pgrep -f "go run main.go" > /dev/null || pgrep -f "codecampass" > /dev/null; then
    echo "✓ 后端服务正在运行"
else
    echo "⚠ 后端服务未运行，请手动启动："
    echo "  cd /home/ubuntu/CodeCampass/CodeCampass-backend"
    echo "  ./start.sh"
    echo "  或"
    echo "  go run main.go"
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


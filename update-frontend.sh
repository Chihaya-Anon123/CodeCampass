#!/bin/bash

# CodeCampass 前端更新脚本
# 用于更新前端文件到 Web 目录

set -e

echo "=========================================="
echo "CodeCampass 前端更新脚本"
echo "=========================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 1. 构建前端
echo ""
echo "1. 构建前端..."
cd /home/ubuntu/CodeCampass/CodeCampass-frontend

if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

echo "构建前端项目..."
npm run build

# 2. 复制前端文件到 Web 目录
echo ""
echo "2. 复制前端文件到 Web 目录..."
mkdir -p /var/www/codecampass
cp -r /home/ubuntu/CodeCampass/CodeCampass-frontend/dist/* /var/www/codecampass/
chown -R www-data:www-data /var/www/codecampass
chmod -R 755 /var/www/codecampass

# 3. 重启 Nginx
echo ""
echo "3. 重启 Nginx..."
systemctl reload nginx

echo ""
echo "=========================================="
echo "前端更新完成！"
echo "=========================================="
echo ""


#!/bin/bash

# CodeCampass 重启所有服务脚本

set -e

echo "=========================================="
echo "CodeCampass 服务重启脚本"
echo "=========================================="

# 1. 停止现有服务
echo ""
echo "1. 停止现有服务..."

# 停止后端
if pgrep -f "go run main.go" > /dev/null; then
    echo "停止后端服务..."
    pkill -f "go run main.go"
    sleep 2
fi

# 停止 Nginx
if systemctl is-active --quiet nginx; then
    echo "停止 Nginx 服务..."
    sudo systemctl stop nginx
fi

# 2. 启动后端服务
echo ""
echo "2. 启动后端服务..."
cd /home/ubuntu/CodeCampass/CodeCampass-backend

# 检查依赖
if ! command -v go &> /dev/null; then
    echo "错误: Go 未安装"
    exit 1
fi

nohup go run main.go > /tmp/codecampass-backend.log 2>&1 &
echo "✓ 后端服务已启动 (PID: $!)"

# 3. 启动 Nginx
echo ""
echo "3. 启动 Nginx 服务..."
sudo systemctl start nginx
echo "✓ Nginx 服务已启动"

# 4. 验证服务
echo ""
echo "4. 验证服务..."

sleep 3

# 检查后端
if pgrep -f "go run main.go" > /dev/null; then
    echo "✓ 后端服务运行中"
else
    echo "✗ 后端服务启动失败，查看日志: tail -f /tmp/codecampass-backend.log"
fi

# 检查 Nginx
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx 服务运行中"
else
    echo "✗ Nginx 服务启动失败"
fi

# 获取内网IP
INTERNAL_IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}' | cut -d'/' -f1)

echo ""
echo "=========================================="
echo "服务重启完成！"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  前端: http://$INTERNAL_IP"
echo "  Swagger: http://$INTERNAL_IP/swagger/index.html"
echo ""
echo "查看日志:"
echo "  后端: tail -f /tmp/codecampass-backend.log"
echo "  Nginx: sudo tail -f /var/log/nginx/error.log"
echo ""


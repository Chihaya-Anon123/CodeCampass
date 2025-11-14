#!/bin/bash

# CodeCampass 启动脚本
# 启动前后端服务

set -e

echo "=========================================="
echo "CodeCampass 启动脚本"
echo "=========================================="

# 检查后端服务
echo "检查后端服务..."
cd /home/ubuntu/CodeCampass/CodeCampass-backend

if pgrep -f "go run main.go" > /dev/null || pgrep -f "codecampass" > /dev/null; then
    echo "✓ 后端服务已在运行"
else
    echo "启动后端服务..."
    nohup go run main.go > /tmp/codecampass-backend.log 2>&1 &
    echo "✓ 后端服务已启动 (PID: $!)"
    echo "日志文件: /tmp/codecampass-backend.log"
fi

# 检查 Nginx 服务
echo ""
echo "检查 Nginx 服务..."
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx 服务正在运行"
else
    echo "启动 Nginx 服务..."
    sudo systemctl start nginx
    echo "✓ Nginx 服务已启动"
fi

# 获取内网IP
INTERNAL_IP=$(ip addr show | grep "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}' | cut -d'/' -f1)

echo ""
echo "=========================================="
echo "服务启动完成！"
echo "=========================================="
echo ""
echo "访问地址:"
echo "  前端: http://$INTERNAL_IP"
echo "  Swagger: http://$INTERNAL_IP/swagger/index.html"
echo ""
echo "查看后端日志: tail -f /tmp/codecampass-backend.log"
echo "查看 Nginx 日志: sudo tail -f /var/log/nginx/error.log"
echo ""


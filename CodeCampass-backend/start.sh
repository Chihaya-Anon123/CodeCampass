#!/bin/bash

# CodeCampass 启动脚本
# 用于 Ubuntu 24.04.3 LTS

set -e

echo "=========================================="
echo "CodeCampass 启动脚本"
echo "=========================================="

# 检查 Go 是否安装
if ! command -v go &> /dev/null; then
    echo "错误: Go 未安装"
    echo "请运行: sudo snap install go --classic"
    exit 1
fi

echo "✓ Go 已安装: $(go version)"

# 检查 MySQL 是否运行
if ! systemctl is-active --quiet mysql; then
    echo "警告: MySQL 服务未运行，正在启动..."
    sudo systemctl start mysql
fi
echo "✓ MySQL 服务运行中"

# 检查 Redis 是否运行
if ! systemctl is-active --quiet redis-server; then
    echo "警告: Redis 服务未运行，正在启动..."
    sudo systemctl start redis-server
fi
echo "✓ Redis 服务运行中"

# 检查数据库是否存在
if ! mysql -u root -p771009 -e "USE codecampass;" 2>/dev/null; then
    echo "警告: 数据库 codecampass 不存在，正在创建..."
    mysql -u root -p771009 -e "CREATE DATABASE codecampass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
fi
echo "✓ 数据库已就绪"

# 检查配置文件
if [ ! -f "config/website.yml" ]; then
    echo "错误: 配置文件 config/website.yml 不存在"
    exit 1
fi
echo "✓ 配置文件存在"

# 安装依赖
echo "正在安装 Go 依赖..."
go mod download

# 启动服务
echo ""
echo "=========================================="
echo "正在启动 CodeCampass 服务..."
echo "服务地址: http://localhost:8081"
echo "Swagger 文档: http://localhost:8081/swagger/index.html"
echo "按 Ctrl+C 停止服务"
echo "=========================================="
echo ""

go run main.go


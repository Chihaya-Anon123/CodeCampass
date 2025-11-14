#!/bin/bash

# CodeCampass 依赖安装脚本
# 用于 Ubuntu 24.04.3 LTS

set -e

echo "=========================================="
echo "CodeCampass 依赖安装脚本"
echo "=========================================="

# 更新包列表
echo "正在更新包列表..."
sudo apt update

# 安装 Go
if ! command -v go &> /dev/null; then
    echo ""
    echo "正在安装 Go..."
    sudo snap install go --classic
else
    echo "✓ Go 已安装: $(go version)"
fi

# 安装 MySQL
if ! command -v mysql &> /dev/null; then
    echo ""
    echo "正在安装 MySQL..."
    sudo apt install mysql-server -y
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    echo ""
    echo "配置 MySQL root 密码..."
    echo "请手动设置 root 密码为 771009:"
    echo "运行: sudo mysql_secure_installation"
    echo "或者:"
    echo "  sudo mysql"
    echo "  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '771009';"
    echo "  FLUSH PRIVILEGES;"
else
    echo "✓ MySQL 已安装"
fi

# 创建数据库
echo ""
echo "正在创建数据库..."
if mysql -u root -p771009 -e "USE codecampass;" 2>/dev/null; then
    echo "✓ 数据库 codecampass 已存在"
else
    mysql -u root -p771009 -e "CREATE DATABASE codecampass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
        echo "警告: 无法自动创建数据库，请手动创建："
        echo "  mysql -u root -p771009"
        echo "  CREATE DATABASE codecampass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    }
fi

# 安装 Redis
if ! command -v redis-cli &> /dev/null; then
    echo ""
    echo "正在安装 Redis..."
    sudo apt install redis-server -y
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
else
    echo "✓ Redis 已安装"
fi

# 验证 Redis
echo ""
echo "正在验证 Redis..."
if redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✓ Redis 运行正常"
else
    echo "警告: Redis 无法连接，请检查服务状态"
fi

# 安装 Go 依赖
echo ""
echo "正在安装 Go 依赖..."
cd /home/ubuntu/CodeCampass
go env -w GOPROXY=https://mirrors.aliyun.com/goproxy/,direct
go env GOPROXY
go clean -modcache
go mod download
go mod tidy


echo ""
echo "=========================================="
echo "安装完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 确保 MySQL root 密码为 771009"
echo "2. 确保数据库 codecampass 已创建"
echo "3. 运行启动脚本: ./start.sh"
echo "   或直接运行: go run main.go"
echo ""


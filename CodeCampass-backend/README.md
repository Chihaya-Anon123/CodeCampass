# CodeCampass 启动指南

## 系统要求

- Ubuntu 24.04.3 LTS
- Go 1.23+ 
- MySQL 8.0+
- Redis 7.0+

## 安装步骤

### 1. 安装 Go

```bash
# 使用 snap 安装最新版本的 Go（推荐）
sudo snap install go --classic

# 或者使用 apt 安装（版本可能较旧）
# sudo apt update
# sudo apt install golang-go
```

验证安装：
```bash
go version
```

### 2. 安装 MySQL

```bash
# 更新包列表
sudo apt update

# 安装 MySQL
sudo apt install mysql-server -y

# 启动 MySQL 服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置（设置 root 密码为 771009）
sudo mysql_secure_installation
```

或者在 MySQL 中手动设置：
```bash
sudo mysql
```

然后在 MySQL 中执行：
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '771009';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 创建数据库

```bash
# 登录 MySQL
mysql -u root -p771009

# 创建数据库
CREATE DATABASE codecampass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. 安装 Redis

```bash
# 安装 Redis
sudo apt install redis-server -y

# 启动 Redis 服务
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 验证 Redis 是否运行
redis-cli ping
# 应该返回 PONG
```

### 5. 配置项目

编辑 `config/website.yml`，确保数据库连接信息正确：

```yaml
mysql:
  dns: root:771009@tcp(localhost:3306)/codecampass?charset=utf8mb4&parseTime=True&loc=Local
redis:
  addr: "localhost:6379"
  password: ""
  DB: 0
  poolSize: 30
  minIdleConn: 30
```

### 6. 安装 Go 依赖

```bash
cd /home/ubuntu/CodeCampass
go mod download
```

### 7. 初始化数据库表

数据库表会在程序启动时通过 GORM 自动迁移创建，或者您可以手动运行 SQL 脚本：

```bash
mysql -u root -p771009 codecampass < sql/init_codecampass.sql
```

### 8. 生成 Swagger 文档（如果需要）

```bash
# 安装 swag
go install github.com/swaggo/swag/cmd/swag@latest

# 生成 Swagger 文档
swag init
```

### 9. 启动项目

```bash
cd /home/ubuntu/CodeCampass
go run main.go
```

或者编译后运行：

```bash
go build -o codecampass main.go
./codecampass
```

### 10. 验证服务

- API 服务：http://localhost:8081
- Swagger 文档：http://localhost:8081/swagger/index.html

## 常见问题

### MySQL 连接失败
- 检查 MySQL 服务是否运行：`sudo systemctl status mysql`
- 确认 root 密码是否正确
- 确认数据库 `codecampass` 已创建

### Redis 连接失败
- 检查 Redis 服务是否运行：`sudo systemctl status redis-server`
- 测试连接：`redis-cli ping`

### Go 模块下载失败
- 设置 Go 代理（如果在中国）：
  ```bash
  go env -w GOPROXY=https://goproxy.cn,direct
  ```

## API 端点

### 用户模块
- POST `/user/createUser` - 用户注册
- POST `/user/userLogin` - 用户登录
- POST `/user/userLogout` - 用户登出（需认证）
- GET `/user/getUserInfo` - 获取用户信息（需认证）
- GET `/user/getUserList` - 获取用户列表

### 项目模块（需认证）
- POST `/api/createProject` - 创建项目
- GET `/api/listProjects` - 列出所有项目
- GET `/api/getProjectInfo` - 获取项目信息
- PUT `/api/updateProject` - 更新项目
- DELETE `/api/deleteProject` - 删除项目
- POST `/api/importProjectRepo` - 导入项目仓库
- POST `/api/askProject` - 项目问答（AI）


package middleware

import (
	"net/http"
	"strings"

	"CodeCampass/utils" //

	"github.com/gin-gonic/gin"
)

// AuthMiddleware 验证JWT的中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从header里取token
		token := c.GetHeader("Authorization")
		if token == "" || !strings.HasPrefix(token, "Bearer ") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "请先登录"})
			c.Abort()
			return
		}

		token = strings.TrimPrefix(token, "Bearer ")
		claims, err := utils.ParseToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的Token"})
			c.Abort()
			return
		}

		// 将用户信息放入上下文，后续处理器可读取
		c.Set("userID", claims.UserID)
		c.Next()
	}
}

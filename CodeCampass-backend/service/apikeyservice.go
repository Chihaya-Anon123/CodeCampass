package service

import (
	"CodeCampass/utils"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// GetOpenAIKey
// @Summary 获取 OpenAI API Key
// @Tags 项目模块
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Router /api/getOpenAIKey [get]
func GetOpenAIKey(c *gin.Context) {
	// 从中间件中取出当前登录用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}

	// 从 Redis 获取用户的 API Key
	key := utils.Red.Get(utils.Red.Context(), fmt.Sprintf("openai_key:%d", userID)).Val()

	// 如果 Redis 中没有，从环境变量获取（向后兼容）
	if key == "" {
		key = os.Getenv("OPENAI_API_KEY")
	}

	// 返回（如果设置了，只返回前4位和后4位，中间用*代替）
	if key != "" && len(key) > 8 {
		maskedKey := key[:4] + "****" + key[len(key)-4:]
		c.JSON(200, gin.H{
			"code":    0,
			"message": "获取成功",
			"data": map[string]interface{}{
				"key":       maskedKey,
				"is_set":    true,
				"full_key":  false, // 不返回完整 key
			},
		})
	} else {
		c.JSON(200, gin.H{
			"code":    0,
			"message": "未设置 API Key",
			"data": map[string]interface{}{
				"key":      "",
				"is_set":   false,
				"full_key": false,
			},
		})
	}
}

// SetOpenAIKey
// @Summary 设置 OpenAI API Key
// @Tags 项目模块
// @Security Bearer
// @Param key query string true "OpenAI API Key"
// @Success 200 {object} map[string]interface{}
// @Router /api/setOpenAIKey [post]
func SetOpenAIKey(c *gin.Context) {
	// 从中间件中取出当前登录用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}

	key := c.Query("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    -1,
			"message": "API Key 不能为空",
		})
		return
	}

	// 保存到 Redis（按用户存储）
	err := utils.Red.Set(utils.Red.Context(), fmt.Sprintf("openai_key:%d", userID), key, 0).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "保存失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "API Key 设置成功",
	})
}

// DeleteOpenAIKey
// @Summary 删除 OpenAI API Key
// @Tags 项目模块
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Router /api/deleteOpenAIKey [delete]
func DeleteOpenAIKey(c *gin.Context) {
	// 从中间件中取出当前登录用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}

	// 从 Redis 删除
	err := utils.Red.Del(utils.Red.Context(), fmt.Sprintf("openai_key:%d", userID)).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "删除失败",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"message": "API Key 已删除",
	})
}

// getOpenAIKey 获取用户的 OpenAI API Key（内部函数）
func getOpenAIKey(userID interface{}) string {
	if userID == nil {
		return ""
	}

	// 先从 Redis 获取
	key := utils.Red.Get(utils.Red.Context(), fmt.Sprintf("openai_key:%d", userID)).Val()
	
	// 如果 Redis 中没有，从环境变量获取（向后兼容）
	if key == "" {
		key = os.Getenv("OPENAI_API_KEY")
	}

	return key
}


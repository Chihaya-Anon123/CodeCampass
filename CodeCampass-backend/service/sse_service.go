package service

import (
	"CodeCampass/models"
	"CodeCampass/utils"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// SSEEvent 表示一个SSE事件
type SSEEvent struct {
	Event string      `json:"event"`
	Data  interface{} `json:"data"`
}

// SSEManager 管理SSE连接
type SSEManager struct {
	clients map[uint]map[chan SSEEvent]bool // projectID -> clients
	mu      sync.RWMutex
}

var sseManager = &SSEManager{
	clients: make(map[uint]map[chan SSEEvent]bool),
}

// Subscribe 订阅项目的SSE事件
func (m *SSEManager) Subscribe(projectID uint) chan SSEEvent {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.clients[projectID] == nil {
		m.clients[projectID] = make(map[chan SSEEvent]bool)
	}

	ch := make(chan SSEEvent, 10)
	m.clients[projectID][ch] = true

	return ch
}

// Unsubscribe 取消订阅
func (m *SSEManager) Unsubscribe(projectID uint, ch chan SSEEvent) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if clients, ok := m.clients[projectID]; ok {
		delete(clients, ch)
		close(ch)
		if len(clients) == 0 {
			delete(m.clients, projectID)
		}
	}
}

// Publish 发布事件到指定项目
func (m *SSEManager) Publish(projectID uint, event SSEEvent) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	if clients, ok := m.clients[projectID]; ok {
		for ch := range clients {
			select {
			case ch <- event:
			default:
				// 如果通道已满，跳过（避免阻塞）
			}
		}
	}
}

// GetSSEManager 获取SSE管理器实例
func GetSSEManager() *SSEManager {
	return sseManager
}

// SubscribeProjectEvents
// @Summary 订阅项目事件（SSE）
// @Tags 项目模块
// @Security Bearer
// @Param project_id query int true "项目ID"
// @Param token query string false "认证Token（EventSource不支持header，通过URL参数传递）"
// @Success 200
// @Router /api/subscribeProjectEvents [get]
func SubscribeProjectEvents(c *gin.Context) {
	projectIDStr := c.Query("project_id")
	if projectIDStr == "" {
		c.JSON(400, gin.H{"error": "project_id 参数必填"})
		return
	}

	var projectID uint
	if _, err := fmt.Sscanf(projectIDStr, "%d", &projectID); err != nil {
		c.JSON(400, gin.H{"error": "无效的 project_id"})
		return
	}

	// 验证用户权限 - 支持从URL参数或Header获取token
	var userID uint
	var exists bool
	
	// 先尝试从中间件获取（如果通过中间件）
	if uid, ok := c.Get("userID"); ok {
		userID = uid.(uint)
		exists = true
	}
	
	// 如果中间件没有设置，尝试从URL参数获取token并验证
	if !exists {
		token := c.Query("token")
		if token == "" {
			// 尝试从Header获取
			authHeader := c.GetHeader("Authorization")
			if authHeader != "" && len(authHeader) > 7 {
				token = authHeader[7:] // 移除 "Bearer " 前缀
			}
		}
		
		if token != "" {
			// 验证token
			claims, err := utils.ParseToken(token)
			if err == nil && claims != nil {
				userID = claims.UserID
				exists = true
			}
		}
	}
	
	if !exists {
		c.JSON(401, gin.H{"error": "用户未登录"})
		return
	}

	// 验证项目所有权
	var proj models.Project
	if err := utils.DB.Where("id = ? and owner_id = ?", projectID, userID).First(&proj).Error; err != nil {
		c.JSON(404, gin.H{"error": "项目不存在或无权限"})
		return
	}

	// 设置SSE响应头
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no") // 禁用Nginx缓冲

	// 订阅事件
	ch := GetSSEManager().Subscribe(projectID)
	defer GetSSEManager().Unsubscribe(projectID, ch)

	// 发送初始连接消息
	c.SSEvent("connected", gin.H{
		"message": "已连接到项目事件流",
		"project_id": projectID,
	})
	c.Writer.Flush()

	// 保持连接并发送事件
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case event := <-ch:
			// 发送事件
			data, _ := json.Marshal(event.Data)
			fmt.Fprintf(c.Writer, "event: %s\n", event.Event)
			fmt.Fprintf(c.Writer, "data: %s\n\n", string(data))
			c.Writer.Flush()

		case <-ticker.C:
			// 发送心跳保持连接
			c.SSEvent("ping", gin.H{"timestamp": time.Now().Unix()})
			c.Writer.Flush()

		case <-c.Request.Context().Done():
			// 客户端断开连接
			return
		}
	}
}


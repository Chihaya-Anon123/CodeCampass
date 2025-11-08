package service

import (
	"CodeCampass/models"
	"CodeCampass/utils"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sashabaranov/go-openai"
	"gorm.io/gorm"
)

// ImportProjectRepo
// @Summary 导入项目仓库
// @Tags 项目模块
// @Security Bearer
// @Param name query string true "项目名"
// @Success 200 {object} map[string]interface{}
// @Router /api/importProjectRepo [post]
func ImportProjectRepo(c *gin.Context) {
	name := c.Query("name")

	// 从中间件中取出当前登录用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "用户未登录",
		})
		return
	}

	// 查找项目
	var proj models.Project
	if err := utils.DB.Where("owner_id = ? and name = ?", userID, name).First(&proj).Error; err != nil {
		c.JSON(404, gin.H{"error": "项目不存在"})
		return
	}

	// 目标路径：云主机上存储的仓库目录
	baseDir := fmt.Sprintf("E:/Repos/%d/%d", proj.OwnerId, proj.ID)
	os.MkdirAll(baseDir, 0755)

	// 如果之前存在仓库则先删除（可选）
	os.RemoveAll(baseDir)

	// git clone
	cmd := exec.Command("git", "clone", "--depth", "1", proj.RepoUrl, baseDir)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("git clone 失败: %v", err)})
		return
	}

	// 清空旧索引
	utils.DB.Where("project_id = ?", proj.ID).Delete(&models.Repo{})

	// 遍历文件并建立索引
	filepath.Walk(baseDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}

		relPath, _ := filepath.Rel(baseDir, path)
		ext := strings.TrimPrefix(filepath.Ext(path), ".")

		isText := true
		if info.Size() > 5*1024*1024 {
			isText = false // 超大文件可能是二进制
		}

		utils.DB.Create(&models.Repo{
			ProjectID:    proj.ID,
			FilePath:     relPath,
			FileType:     ext,
			Size:         info.Size(),
			LastModified: info.ModTime(),
			IsText:       isText,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		})
		return nil
	})

	err := BuildProjectEmbedding(utils.DB, proj.ID, baseDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err,
		})
	}

	c.JSON(200, gin.H{
		"message": "导入完成，仓库已保存至云主机",
		"path":    baseDir,
	})
}

func BuildProjectEmbedding(db *gorm.DB, projectID uint, basePath string) error {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		fmt.Println("请先设置 OPENAI_API_KEY 环境变量")
		return exec.ErrNotFound
	}

	// 使用 Config 配置 BaseURL
	cfg := openai.DefaultConfig(apiKey)
	//cfg.BaseURL = "https://api.chatanywhere.tech" // 国内首选
	cfg.BaseURL = "https://api.chatanywhere.org" // 国外使用
	client := openai.NewClientWithConfig(cfg)

	return filepath.Walk(basePath, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if strings.HasSuffix(path, ".png") || strings.HasSuffix(path, ".exe") {
			return nil // 跳过二进制文件
		}

		contentBytes, err := os.ReadFile(path)
		if err != nil {
			fmt.Println("读取文件失败:", path, err)
			return nil
		}
		content := string(contentBytes)
		if len(content) > 3000 {
			content = content[:3000] // 简化：只取前3k
		}

		// 调用 ChatAnywhere embedding 接口
		embResp, err := client.CreateEmbeddings(context.Background(), openai.EmbeddingRequest{
			Model: openai.SmallEmbedding3,
			Input: []string{content},
		})
		if err != nil {
			fmt.Println("embedding error:", err)
			return nil
		}

		emb := embResp.Data[0].Embedding

		// JSON 化 embedding
		embJSON, err := json.Marshal(emb)
		if err != nil {
			fmt.Println("embedding JSON marshal error:", err)
			return nil
		}

		// 存入数据库
		db.Create(&models.ProjectEmbedding{
			ProjectID: projectID,
			FilePath:  path,
			Content:   content,
			Embedding: string(embJSON), // Embedding 字段数据库类型 TEXT / LONGTEXT
		})

		return nil
	})
}
